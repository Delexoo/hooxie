import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { AdapterRegistry, clipboardAdapter, companionAdapter, cursorSdkAdapter, loadRealCursorSdk } from "./adapters.ts";
import type { AdapterContext, ClipboardPort, CursorSdkClient } from "./adapters.ts";
import { IDE_CATALOG, ideDownloadUrl } from "./catalog.ts";
import { CompanionHub } from "./companion.ts";
import { DeliveryService } from "./delivery.ts";
import { resolveProjectTarget } from "./prompt.ts";
import { accountConnected, openIdeDownload, openLoginUrl, openOnboardingHelp, openStripeCheckout, openTokenPage, publicConnectError } from "./cursor-account.ts";
import { readDeviceId, readStoredLicense, saveLicense } from "./license.ts";
import { describeSetup, onboardingStep } from "./setup.ts";
import { CONNECTION_IDS, checkConnection, tokenPage } from "./connections.ts";
import { readCursorUsage } from "./cursor-usage.ts";
import { readCursorReady } from "./cursor-ready.ts";
import { detectInstallations } from "./detect.ts";
import type { DetectDeps } from "./detect.ts";
import { validateHello, validateResult } from "../extensions/z-agent-bridge/protocol.js";
import type { IdeId, Installation, SubmitInput } from "./types.ts";
import { DeliveryError, IDE_IDS } from "./types.ts";
import { checkoutIsComplete, createCheckoutSession, findPaidDeviceCheckout, readDotEnv, validEmail, type BillingConfig } from "./billing.ts";
import type { WidgetControl } from "./widget.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(rootDir, "public");
const siteDir = path.join(rootDir, "site");
const BUTTON_COLORS = ["#ffffff", "#4d9fff", "#3ddc97", "#ff8a3d", "#ff5d8f", "#b07bff", "#ffe14a", "#ff4d4d", "#3ee0d2"];
const CHIMES = new Set(["blushing", "xtreme-bass", "undertaker", "ekh", "cat-choke", "alert", "pluck-off", "notification", "new-notification", "menu-open", "holographic-open", "off", "custom"]);
const SOUND_FILES = new Set([
  "blushing-sound.mp3",
  "xtreme-bass-effect.mp3",
  "undertaker-cloche.mp3",
  "ekh.mp3",
  "cat-choke.mp3",
  "notification-alert.mp3",
  "notification-pluck-off.mp3",
  "notification-2.mp3",
  "new-notification.mp3",
  "menu-open.mp3",
  "menu-open-holographic.mp3",
]);
const LANGUAGES = new Set(["en", "es", "fr", "de", "pt", "ja", "zh"]);
const SITE_FILES: Record<string, string> = {
  "/home": "index.html",
  "/dashboard": "dashboard.html",
  "/terms": "terms.html",
  "/privacy": "privacy.html",
  "/refund": "refund.html",
  "/releases": "releases.html",
  "/releases.json": "releases.json",
  "/help": "help.html",
  "/contact": "contact.html",
  "/license": "license.html",
  "/site.css": "site.css",
  "/dash.css": "dash.css",
  "/site.js": "site.js",
  "/menu.js": "menu.js",
  "/demo.js": "demo.js",
  "/docs": "docs.html",
  "/intro": "intro.html",
  "/intro.js": "intro.js",
  "/wallpaper.svg": "wallpaper.svg",
  "/favicon.ico": "favicon.ico",
  "/icon.png": "icon.png",
  "/apple-touch-icon.png": "apple-touch-icon.png",
  "/site.webmanifest": "site.webmanifest",
  "/fonts.css": "fonts.css",
  "/robots.txt": "robots.txt",
  "/sitemap.xml": "sitemap.xml",
  "/llms.txt": "llms.txt",
  "/404.html": "404.html",
  "/fonts/manrope-latin.woff2": "fonts/manrope-latin.woff2",
  "/fonts/manrope-latin-ext.woff2": "fonts/manrope-latin-ext.woff2",
  "/fonts/manrope-cyrillic.woff2": "fonts/manrope-cyrillic.woff2",
  "/fonts/manrope-cyrillic-ext.woff2": "fonts/manrope-cyrillic-ext.woff2",
  "/fonts/manrope-greek.woff2": "fonts/manrope-greek.woff2",
  "/fonts/manrope-vietnamese.woff2": "fonts/manrope-vietnamese.woff2",
  "/download/hooxie-windows.ps1": "download/hooxie-windows.ps1",
};

export interface BridgeOptions {
  port?: number;
  host?: string;
  configDir?: string;
  clipboard?: ClipboardPort;
  sdk?: CursorSdkClient;
  sdkReady?: boolean;
  detect?: DetectDeps;
  sessionTtlMs?: number;
  companionTimeoutMs?: number;
  opener?: (executable: string, projectPath: string) => void;
  installations?: Installation[];
  apiKey?: string;
  widget?: WidgetControl;
  openUrl?: (url: string) => void;
  deviceId?: string;
  licenseSecret?: string;
  exitProcess?: boolean;
}

export interface BridgeHandle {
  baseUrl: string;
  port: number;
  pageToken: string;
  bridgeToken: string;
  inputDevice: string;
  outputDevice: string;
  registry: AdapterRegistry;
  service: DeliveryService;
  close(): Promise<void>;
}

export async function startBridge(options: BridgeOptions = {}): Promise<BridgeHandle> {
  const host = options.host ?? "127.0.0.1";
  if (host !== "127.0.0.1") throw new Error("Hooxie only binds to 127.0.0.1.");
  const configDir = options.configDir ?? defaultConfigDir();
  await fs.mkdir(configDir, { recursive: true });
  const pageToken = crypto.randomBytes(24).toString("hex");
  const bridgeToken = crypto.randomBytes(24).toString("hex");
  const hub = new CompanionHub(options.sessionTtlMs ?? 5000, options.companionTimeoutMs ?? 20000);
  const registry = new AdapterRegistry();
  registry.register(cursorSdkAdapter());
  registry.register(companionAdapter());
  registry.register(clipboardAdapter());

  let apiKey = options.apiKey ?? (await readOptional(path.join(configDir, "cursor-api-key")));
  const serviceKeys = new Map<string, string>();
  const rememberedServices = new Set<string>();
  await loadServiceKeys(configDir, serviceKeys, rememberedServices);
  let sdkAccount = false;
  const accountReady = apiKey ? Promise.resolve() : import("@cursor/sdk").then(async (sdk) => {
    const cursor = sdk as { Cursor: { auth: { status(): Promise<{ status?: string }> } } };
    const status = await cursor.Cursor.auth.status();
    sdkAccount = status.status === "logged-in";
  }).catch(() => {
    sdkAccount = false;
  });
  let connectTask: Promise<void> | null = null;
  const storeDir = path.join(configDir, "agent-store");
  let sdk = options.sdk;
  let sdkReady = options.sdkReady ?? Boolean(sdk);
  const sdkReadyTask = sdk || options.sdkReady === false ? Promise.resolve() : loadRealCursorSdk(storeDir).then((loaded) => {
    sdk = loaded;
    sdkReady = Boolean(loaded);
  }).catch(() => {
    sdkReady = false;
  });
  const clipboard = options.clipboard ?? createUnavailableClipboard();
  let installations: Installation[] = options.installations ?? [];
  const detectReady = options.installations ? Promise.resolve() : detectInstallations(options.detect).then((found) => {
    installations = found;
  }).catch(() => {
    installations = [];
  });

  const fileEnv = await readOptional(path.join(rootDir, ".env"));
  const userEnv = await readOptional(path.join(defaultConfigDir(), "billing.env"));
  const mergedEnv: NodeJS.ProcessEnv = { ...process.env };
  for (const [key, value] of Object.entries(userEnv ? readDotEnv(userEnv) : {})) {
    if (!mergedEnv[key] && value) mergedEnv[key] = value;
  }
  for (const [key, value] of Object.entries(fileEnv ? readDotEnv(fileEnv) : {})) {
    if (value) mergedEnv[key] = value;
  }
  const billing: BillingConfig = {
    secretKey: mergedEnv.STRIPE_SECRET_KEY || "",
    priceId: mergedEnv.STRIPE_PRICE_ID || "",
    promoCode: mergedEnv.HOOXIE_PROMO_CODE || "",
    promoId: mergedEnv.STRIPE_PROMO_ID || "",
  };
  const licenseSecret = options.licenseSecret || billing.secretKey;
  const billingOrigin = (mergedEnv.HOOXIE_BILLING_ORIGIN || "https://hooxie.com").replace(/\/$/, "");
  let deviceId = options.deviceId || "";
  if (!deviceId) {
    try {
      deviceId = await readDeviceId();
    } catch {
      deviceId = "";
    }
  }
  let settings = await loadSettings(configDir);

  const service = new DeliveryService(registry, (input) => {
    const ctx: AdapterContext = {
      ide: input.ide,
      projectPath: input.projectPath,
      apiKey,
      sdkAccount,
      sdkReady,
      allowUnsandboxed: input.allowUnsandboxed,
      experimentalSubmit: input.experimentalSubmit,
      hub,
      clipboard,
      sdk,
      storeDir,
      installations,
    };
    return ctx;
  });

  const indexHtml = (await fs.readFile(path.join(publicDir, "index.html"), "utf8")).replaceAll("__Z_TOKEN__", pageToken);

  function settingsBody() {
    return { ...settings, cursorConnected: accountConnected(apiKey, sdkAccount) };
  }

  async function applyAudioDevices(): Promise<void> {
    if (!options.widget) return;
    try {
      await options.widget.setAudioDevices(settings.inputDevice, settings.outputDevice);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Audio devices could not be changed.";
      console.log(message);
    }
  }

  let licenseLookupAt = 0;
  let hostedLicense: { at: number; active: boolean } | null = null;
  async function licensedForDevice(): Promise<boolean> {
    if (!deviceId) return false;
    if (licenseSecret && await readStoredLicense(configDir, licenseSecret, deviceId)) return true;
    if (billing.secretKey) {
      if (!licenseSecret || Date.now() - licenseLookupAt < 8000) return false;
      licenseLookupAt = Date.now();
      const found = await findPaidDeviceCheckout(billing.secretKey, deviceId);
      if (!found) return false;
      await saveLicense(configDir, licenseSecret, deviceId, found.sessionId, found.email);
      return true;
    }
    if (hostedLicense && Date.now() - hostedLicense.at < 8000) return hostedLicense.active;
    try {
      const payload = await hostedBilling("/api/license", { device: deviceId });
      hostedLicense = { at: Date.now(), active: payload.active === true };
    } catch {
      hostedLicense = { at: Date.now(), active: false };
    }
    return hostedLicense.active;
  }

  async function localLicense(): Promise<boolean> {
    if (!deviceId) return false;
    if (licenseSecret && await readStoredLicense(configDir, licenseSecret, deviceId)) return true;
    return hostedLicense?.active === true;
  }

  async function confirmCheckout(sessionId: string | undefined): Promise<{ active: boolean; email: string }> {
    if (!sessionId || !deviceId) throw new DeliveryError(400, "Checkout could not be confirmed.");
    if (!billing.secretKey) {
      const payload = await hostedBilling("/api/license", { device: deviceId, sessionId });
      const active = payload.active === true;
      if (active) hostedLicense = { at: Date.now(), active: true };
      return { active, email: typeof payload.email === "string" ? payload.email : "" };
    }
    if (!licenseSecret) throw new DeliveryError(400, "Checkout could not be confirmed.");
    const result = await checkoutIsComplete(billing.secretKey, sessionId);
    if (result.active && result.device !== deviceId) {
      throw new DeliveryError(403, "This payment belongs to a different computer.");
    }
    if (result.active) await saveLicense(configDir, licenseSecret, deviceId, sessionId, result.email);
    return { active: result.active, email: result.email };
  }

  async function hostedBilling(path: string, body: Record<string, string>): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await fetch(`${billingOrigin}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      throw new DeliveryError(502, "Billing could not be reached.");
    }
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      const message = typeof payload.error === "string" ? payload.error : "Billing could not start.";
      throw new DeliveryError(response.status >= 400 && response.status < 500 ? 400 : 502, message.slice(0, 180));
    }
    return payload;
  }

  async function hostedCheckoutUrl(body: Record<string, string>): Promise<string> {
    const probe = await fetch(`${billingOrigin}/api/license`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ device: body.device }),
    }).catch(() => null);
    if (!probe || probe.status === 404) throw new DeliveryError(400, "Billing is not configured yet.");
    const payload = await hostedBilling("/api/checkout", body);
    const checkoutUrl = payload.url;
    if (typeof checkoutUrl !== "string" || !checkoutUrl.startsWith("https://")) {
      throw new DeliveryError(502, "Billing could not start.");
    }
    return checkoutUrl;
  }

  async function presentCheckout(checkoutUrl: string, present: string | undefined): Promise<void> {
    if (present !== "widget" && present !== "dashboard") return;
    try {
      if (options.openUrl) options.openUrl(checkoutUrl);
      else openStripeCheckout(checkoutUrl);
    } catch {
      throw new DeliveryError(502, "Checkout could not be opened.");
    }
  }

  async function setupPayload() {
    return describeSetup({
      installations,
      connectedIde: settings.connectedIde,
      cursorConnected: accountConnected(apiKey, sdkAccount),
      licensed: await licensedForDevice(),
      onboardingStep: onboardingStep(settings.onboardingStep),
    });
  }

  async function reloadInstallations(): Promise<void> {
    if (options.installations) return;
    try {
      installations = await detectInstallations(options.detect);
    } catch {
      /* Keep the installations found at startup. */
    }
  }

  async function beginCursorLogin(signal: AbortSignal): Promise<void> {
    if (accountConnected(apiKey, sdkAccount)) return;
    if (!connectTask) {
      connectTask = (async () => {
        const sdk = await import("@cursor/sdk") as {
          Cursor: {
            auth: {
              login(options: {
                apiKeyName?: string;
                openBrowser?: (url: string) => void;
                onLoginUrl?: (url: string) => void;
                signal?: AbortSignal;
              }): Promise<{ apiKey?: string }>;
            };
          };
        };
        const result = await sdk.Cursor.auth.login({
          apiKeyName: "Hooxie",
          openBrowser: (url) => { openLoginUrl(url); },
          onLoginUrl: () => {},
          signal,
        });
        const key = typeof result.apiKey === "string" ? result.apiKey.trim() : "";
        if (key.length < 8) throw new Error("incomplete");
        apiKey = key;
        sdkAccount = true;
        await fs.writeFile(path.join(configDir, "cursor-api-key"), apiKey, { mode: 0o600 });
      })().finally(() => {
        connectTask = null;
      });
    }
    await connectTask;
  }

  function warmCursor() {
    const project = settings.project.trim();
    if (!project || !sdk || !accountConnected(apiKey, sdkAccount)) return;
    if (settings.connectedIde && settings.connectedIde !== "cursor") return;
    void service.routes("cursor", project, { allowUnsandboxed: settings.unsandboxed }).catch(() => undefined);
  }
  const server = http.createServer(async (req, res) => {
    try {
      await route(req, res);
    } catch (error) {
      const status = error instanceof DeliveryError ? error.statusCode : 500;
      const message = error instanceof Error ? error.message : "Request failed.";
      sendJson(res, status, { error: status === 500 ? "Something went wrong on this computer. Try again, or email support@delexo.store." : message });
    }
  });

  await new Promise<void>((resolve) => server.listen(options.port ?? 47321, host, resolve));
  void Promise.all([accountReady, sdkReadyTask, detectReady]).then(() => warmCursor());
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await writeBridgeFile(configDir, port, bridgeToken);

  let lastWidgetFrame = "";

  async function route(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    if (!isLocal(req)) {
      sendJson(res, 403, { error: "Hooxie only accepts local connections." });
      return;
    }
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith("/api/bridge/")) {
      if (!authorized(req, bridgeToken)) {
        sendJson(res, 401, { error: "Unauthorized extension." });
        return;
      }
      await bridgeRoute(req, res, url);
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      if (!authorized(req, pageToken)) {
        sendJson(res, 401, { error: "Unauthorized." });
        return;
      }
      await uiRoute(req, res, url);
      return;
    }
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      res.end(indexHtml);
      return;
    }
    if (req.method === "GET" && (url.pathname === "/app.js" || url.pathname === "/app.css")) {
      const file = path.join(publicDir, path.basename(url.pathname));
      const body = await fs.readFile(file);
      const type = url.pathname.endsWith(".css") ? "text/css" : "text/javascript";
      res.writeHead(200, { "content-type": `${type}; charset=utf-8`, "cache-control": "no-store" });
      res.end(body);
      return;
    }
    if (req.method === "GET" && url.pathname.startsWith("/sounds/")) {
      const name = path.basename(url.pathname);
      if (!SOUND_FILES.has(name)) {
        sendJson(res, 404, { error: "Not found." });
        return;
      }
      const body = await fs.readFile(path.join(publicDir, "sounds", name));
      const total = body.length;
      const common = {
        "content-type": "audio/mpeg",
        "accept-ranges": "bytes",
        "cache-control": "public, max-age=86400",
      };
      const range = typeof req.headers.range === "string" ? req.headers.range : "";
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (match) {
        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2] ? Number(match[2]) : total - 1;
        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= total || end < start) {
          res.writeHead(416, { "content-range": `bytes */${total}` });
          res.end();
          return;
        }
        const last = Math.min(end, total - 1);
        const slice = body.subarray(start, last + 1);
        res.writeHead(206, {
          ...common,
          "content-range": `bytes ${start}-${last}/${total}`,
          "content-length": slice.length,
        });
        res.end(slice);
        return;
      }
      res.writeHead(200, { ...common, "content-length": total });
      res.end(body);
      return;
    }
    if (req.method === "GET" && url.pathname === "/dashboard" && !desktopRequest(req)) {
      const billingState = url.searchParams.get("billing");
      const sessionId = url.searchParams.get("session_id") || "";
      let message = "The dashboard opens in the Hooxie app.";
      if (billingState === "success" && /^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
        try {
          const confirmed = await confirmCheckout(sessionId);
          message = confirmed.active
            ? "Payment is recorded for this computer. You can close this window and return to Hooxie."
            : "Checkout is not complete yet. Return to Hooxie and try again.";
        } catch {
          message = "Checkout could not be confirmed. Return to Hooxie and try again.";
        }
      } else if (billingState === "cancel") {
        message = "Checkout was canceled. You can close this window and return to Hooxie.";
      }
      sendHtml(res, browserDashboardPage(message));
      return;
    }
    if (req.method === "GET" && SITE_FILES[url.pathname]) {
      await serveSite(res, url.pathname, pageToken);
      return;
    }
    sendJson(res, 404, { error: "Not found." });
  }

  async function uiRoute(req: http.IncomingMessage, res: http.ServerResponse, url: URL): Promise<void> {
    if (req.method === "GET" && url.pathname === "/api/cursor/ready") {
      await reloadInstallations();
      const cursor = installations.find((item) => item.ide === "cursor");
      sendJson(res, 200, await readCursorReady({ executable: cursor?.executable }));
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/setup") {
      await reloadInstallations();
      sendJson(res, 200, await setupPayload());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/ide/connect") {
      const body = asRecord(await readJson(req, 4000));
      const ide = stringField(body, "ide");
      if (!isIde(ide)) throw new DeliveryError(400, "Unknown IDE.");
      await reloadInstallations();
      const found = installations.find((item) => item.ide === ide);
      if (!found) throw new DeliveryError(409, "That IDE is not installed on this computer.");
      if (ide === "cursor" && !accountConnected(apiKey, sdkAccount)) {
        throw new DeliveryError(409, "Sign in to Cursor, then connect it.");
      }
      settings = normalizeSettings({
        ...settings,
        connectedIde: ide,
        ide,
        installationId: found.id,
        deliveryReady: true,
        onboardingStep: "",
        revision: settings.revision + 1,
      });
      await saveSettings(configDir, settings);
      sendJson(res, 200, await setupPayload());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/connections/check") {
      const body = asRecord(await readJson(req, 2000));
      const service = stringField(body, "service") || "";
      const ref = (stringField(body, "ref") || "").slice(0, 200);
      sendJson(res, 200, await checkConnection(service, ref));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/ide/disconnect") {
      const body = asRecord(await readJson(req, 4000));
      const ide = stringField(body, "ide");
      if (!isIde(ide)) throw new DeliveryError(400, "Unknown IDE.");
      if (settings.connectedIde === ide) {
        settings = normalizeSettings({
          ...settings,
          connectedIde: "",
          onboardingStep: "connect",
          revision: settings.revision + 1,
        });
        await saveSettings(configDir, settings);
      }
      sendJson(res, 200, await setupPayload());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/onboarding/restart") {
      settings = normalizeSettings({
        ...settings,
        onboardingStep: "download",
        connectedIde: "",
        revision: settings.revision + 1,
      });
      await saveSettings(configDir, settings);
      sendJson(res, 200, await setupPayload());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/onboarding/advance") {
      await reloadInstallations();
      if (settings.onboardingStep === "download" && installations.length > 0) {
        settings = normalizeSettings({
          ...settings,
          onboardingStep: "connect",
          revision: settings.revision + 1,
        });
        await saveSettings(configDir, settings);
      }
      sendJson(res, 200, await setupPayload());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/setup/help") {
      openOnboardingHelp(port);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/ides/open") {
      const body = asRecord(await readJson(req, 4000));
      const ide = stringField(body, "ide");
      const listed = ide ? ideDownloadUrl(ide) : "";
      if (!listed) throw new DeliveryError(400, ide ? "Unknown IDE." : "Choose an IDE.");
      if (options.openUrl) options.openUrl(listed);
      else openIdeDownload(listed);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/cursor/usage") {
      const usage = await readCursorUsage();
      sendJson(res, 200, {
        percent: usage.percent,
        credits: usage.credits
          ? {
              remainingCents: usage.credits.remainingCents,
              totalCents: usage.credits.totalCents,
              expiresAtMs: usage.credits.expiresAtMs,
            }
          : null,
        details: {
          planName: usage.details.planName,
          price: usage.details.price,
          includedCents: usage.details.includedCents,
          limitCents: usage.details.limitCents,
          bonusCents: usage.details.bonusCents,
          autoPercent: usage.details.autoPercent,
          apiPercent: usage.details.apiPercent,
          resetsAtMs: usage.details.resetsAtMs,
        },
      });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/state") {
      sendJson(res, 200, {
        ides: IDE_CATALOG,
        installations,
        sessions: hub.list().map((session) => ({
          id: session.id,
          ide: session.ide,
          appName: session.appName,
          workspaces: session.workspaces,
        })),
        cursorKeyConfigured: accountConnected(apiKey, sdkAccount),
        sdkReady,
      });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/routes") {
      const ide = url.searchParams.get("ide");
      const projectPath = url.searchParams.get("projectPath") ?? "";
      const allowUnsandboxed = url.searchParams.get("allowUnsandboxed") === "1";
      if (!isIde(ide)) throw new DeliveryError(400, "Unknown IDE.");
      sendJson(res, 200, { routes: await service.routes(ide, projectPath, { allowUnsandboxed }) });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/key") {
      const body = await readJson(req, 20_000);
      if (!body || typeof body !== "object") throw new DeliveryError(400, "Invalid key payload.");
      const record = body as { apiKey?: unknown; remember?: unknown; service?: unknown; forget?: unknown };
      const key = record.apiKey;
      const remember = record.remember === true;
      const service = typeof record.service === "string" && record.service ? record.service : "cursor";
      if (!KEY_TARGETS.has(service)) throw new DeliveryError(400, "That service is not supported.");
      if (record.forget === true) {
        if (service !== "cursor") {
          serviceKeys.delete(service);
          rememberedServices.delete(service);
          await saveServiceKeys(configDir, serviceKeys, rememberedServices);
        }
        sendJson(res, 200, { saved: false, remembered: false, service });
        return;
      }
      if (typeof key !== "string" || key.trim().length < 8 || key.length > 400 || /[\r\n]/.test(key)) {
        throw new DeliveryError(400, service === "cursor" ? "Enter a Cursor API key." : "Enter an API key.");
      }
      const trimmed = key.trim();
      if (service === "cursor") {
        apiKey = trimmed;
        if (remember) await fs.writeFile(path.join(configDir, "cursor-api-key"), apiKey, { mode: 0o600 });
        sendJson(res, 200, { cursorKeyConfigured: true, remembered: remember, service });
        return;
      }
      serviceKeys.set(service, trimmed);
      if (remember) rememberedServices.add(service);
      else rememberedServices.delete(service);
      await saveServiceKeys(configDir, serviceKeys, rememberedServices);
      sendJson(res, 200, { saved: true, remembered: remember, service });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/keys") {
      sendJson(res, 200, { services: [...serviceKeys.keys()] });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/connections/open") {
      const body = asRecord(await readJson(req, 4_000));
      const service = stringField(body, "service") ?? "";
      const page = tokenPage(service);
      if (!page) throw new DeliveryError(400, "Browser sign-in is not available. Paste an API key.");
      try {
        openTokenPage(page);
      } catch {
        throw new DeliveryError(400, "The browser could not open. Paste an API key.");
      }
      sendJson(res, 200, { opened: true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/cursor/connect") {
      if (accountConnected(apiKey, sdkAccount)) {
        sendJson(res, 200, { connected: true });
        return;
      }
      const abort = new AbortController();
      const stop = () => {
        if (!res.writableEnded) abort.abort();
      };
      res.on("close", stop);
      try {
        await beginCursorLogin(abort.signal);
        sendJson(res, 200, { connected: true });
      } catch (error) {
        throw new DeliveryError(400, publicConnectError(error));
      } finally {
        res.removeListener("close", stop);
      }
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/conversation/reset") {
      const body = asRecord(await readJson(req, 4000));
      const projectPath = stringField(body, "projectPath") ?? "";
      if (!projectPath || !path.isAbsolute(projectPath)) {
        throw new DeliveryError(400, "Choose an absolute project path.");
      }
      const cursor = registry.get("cursor-sdk");
      if (cursor?.resetConversation) await cursor.resetConversation(projectPath);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/deliveries") {
      if (!(await licensedForDevice())) throw new DeliveryError(402, "Buy Hooxie for this computer before sending.");
      const input = parseSubmit(await readJson(req, 8_000_000));
      sendJson(res, 200, await service.submit(input));
      return;
    }
    const deliveryMatch = url.pathname.match(/^\/api\/deliveries\/([A-Za-z0-9]+)$/);
    if (deliveryMatch && req.method === "GET") {
      sendJson(res, 200, service.get(deliveryMatch[1]));
      return;
    }
    const cancelMatch = url.pathname.match(/^\/api\/deliveries\/([A-Za-z0-9]+)\/cancel$/);
    if (cancelMatch && req.method === "POST") {
      sendJson(res, 200, await service.cancel(cancelMatch[1]));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/frame") {
      const body = asRecord(await readJson(req, 4000));
      const width = finiteNumber(body.width, "width");
      const height = finiteNumber(body.height, "height");
      if (width < 160 || width > 2000 || height < 48 || height > 4000) {
        throw new DeliveryError(400, "Widget size is out of range.");
      }
      const frameKey = `${width}x${height}`;
      if (frameKey !== lastWidgetFrame) {
        lastWidgetFrame = frameKey;
        await options.widget?.resize(width, height, body.instant === true);
      }
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/move") {
      const body = asRecord(await readJson(req, 4000));
      const dx = finiteNumber(body.dx, "dx");
      const dy = finiteNumber(body.dy, "dy");
      if (Math.abs(dx) > 4000 || Math.abs(dy) > 4000) throw new DeliveryError(400, "Move is out of range.");
      await options.widget?.move(dx, dy);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/focus") {
      sendJson(res, 200, { active: options.widget ? await options.widget.focused() : true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/yield") {
      await options.widget?.yieldFocus();
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/voice") {
      if (!options.widget) throw new DeliveryError(400, "Voice prompting is available in the desktop widget.");
      const body = asRecord(await readJson(req, 4000));
      const action = stringField(body, "action");
      if (action !== "start" && action !== "stop" && action !== "poll" && action !== "wake") {
        throw new DeliveryError(400, "Unknown voice action.");
      }
      sendJson(res, 200, await options.widget.voice(action));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/screen") {
      if (!options.widget) throw new DeliveryError(400, "Screen capture is available in the desktop widget.");
      sendJson(res, 200, await options.widget.capture());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/exit") {
      sendJson(res, 200, { ok: true });
      setImmediate(() => {
        void (async () => {
          try {
            await options.widget?.quit();
          } catch {
            /* The window may already be closed. */
          }
          if (options.exitProcess) process.exit(0);
        })();
      });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/visible") {
      if (!options.widget) throw new DeliveryError(400, "Hiding Hooxie is available in the desktop widget.");
      const body = asRecord(await readJson(req, 4000));
      const shown = await options.widget.setShown(body.shown !== false);
      sendJson(res, 200, { ok: true, shown });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/follow") {
      if (!options.widget) throw new DeliveryError(400, "Moving Hooxie is available in the desktop widget.");
      await options.widget.follow();
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/home") {
      if (!options.widget) throw new DeliveryError(400, "Recentering Hooxie is available in the desktop widget.");
      await options.widget.home();
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/arrows") {
      if (!options.widget) throw new DeliveryError(400, "Arrow keys are available in the desktop widget.");
      const body = asRecord(await readJson(req, 4000));
      const enabled = await options.widget.setMoveKeys(body.enabled === true);
      sendJson(res, 200, { ok: true, enabled });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/undetectable") {
      if (!options.widget) throw new DeliveryError(400, "Undetectable mode is available in the desktop widget.");
      const body = asRecord(await readJson(req, 4000));
      const enabled = await options.widget.setUndetectable(body.enabled === true);
      settings = normalizeSettings({ ...settings, detectable: !enabled, session: enabled, revision: settings.revision + 1 });
      await saveSettings(configDir, settings);
      sendJson(res, 200, { ok: true, enabled });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/settings") {
      sendJson(res, 200, { ...settingsBody(), licensed: await localLicense() });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/settings") {
      const body = asRecord(await readJson(req, 80_000));
      const next = normalizeSettings({ ...settings, ...body, revision: settings.revision + 1, version: settings.version });
      if (options.widget && next.detectable !== settings.detectable) {
        const enabled = await options.widget.setUndetectable(!next.detectable);
        next.detectable = !enabled;
        next.session = enabled;
      }
      const arrowsChanged = next.arrows !== settings.arrows;
      settings = next;
      if (options.widget && arrowsChanged) await options.widget.setMoveKeys(next.arrows);
      await saveSettings(configDir, settings);
      await applyAudioDevices();
      warmCursor();
      sendJson(res, 200, settingsBody());
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/audio/devices") {
      if (!options.widget) {
        sendJson(res, 200, { inputs: [], outputs: [] });
        return;
      }
      sendJson(res, 200, await options.widget.audioDevices());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/widget/play") {
      if (!options.widget) throw new DeliveryError(400, "Sound plays through the desktop widget.");
      const body = asRecord(await readJson(req, 4000));
      const sound = stringField(body, "file");
      const file = body.custom === true ? await customChimePath(configDir) : sound ? soundFilePath(sound) : undefined;
      if (!file) throw new DeliveryError(404, "That sound is not available.");
      try {
        await fs.access(file);
      } catch {
        throw new DeliveryError(404, "That sound is not available.");
      }
      await options.widget.play(file);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/chime") {
      const custom = await readCustomChime(configDir);
      if (!custom) {
        sendJson(res, 404, { error: "No uploaded sound yet." });
        return;
      }
      res.writeHead(200, { "content-type": custom.mime, "cache-control": "no-store" });
      res.end(custom.body);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/chime") {
      const body = await readRaw(req, 8_000_000);
      const mime = soundMime(req.headers["content-type"], body);
      if (!mime) throw new DeliveryError(400, "Use an audio file such as mp3, wav, or ogg.");
      if (body.length < 32) throw new DeliveryError(400, "That sound file is empty.");
      await writeCustomChime(configDir, body, mime);
      settings = normalizeSettings({ ...settings, chime: "custom", chimeCustom: true, revision: settings.revision + 1 });
      await saveSettings(configDir, settings);
      sendJson(res, 200, settingsBody());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/dashboard/open") {
      if (!options.widget) throw new DeliveryError(400, "The dashboard opens inside Hooxie.");
      const open = await options.widget.toggleDashboard();
      sendJson(res, 200, { ok: true, open });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/billing/checkout") {
      const body = asRecord(await readJson(req, 8000));
      const email = validEmail(stringField(body, "email"));
      const promo = stringField(body, "promo");
      if (await licensedForDevice()) {
        sendJson(res, 200, { paid: true });
        return;
      }
      const origin = `http://127.0.0.1:${port}`;
      if (!deviceId) throw new DeliveryError(400, "This computer could not be identified.");
      const successUrl = `${origin}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/dashboard?billing=cancel`;
      const checkoutUrl = billing.secretKey
        ? await createCheckoutSession(billing, { email, promo, deviceId, successUrl, cancelUrl })
        : await hostedCheckoutUrl({ email: email ?? "", promo: promo ?? "", device: deviceId, successUrl, cancelUrl });
      await presentCheckout(checkoutUrl, stringField(body, "present"));
      sendJson(res, 200, { url: checkoutUrl });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/billing/confirm") {
      const body = asRecord(await readJson(req, 4000));
      const sessionId = stringField(body, "sessionId");
      const confirmed = await confirmCheckout(sessionId);
      sendJson(res, 200, confirmed);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/browse") {
      const body = asRecord(await readJson(req, 4000));
      const initialPath = stringField(body, "initialPath") ?? "";
      const picked = options.widget ? await options.widget.browse(initialPath) : "";
      sendJson(res, 200, { path: picked });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/open") {
      const body = asRecord(await readJson(req, 8000));
      const installationId = stringField(body, "installationId");
      const projectPath = stringField(body, "projectPath");
      if (!installationId || !projectPath) throw new DeliveryError(400, "Choose an IDE installation and a project.");
      const installation = installations.find((item) => item.id === installationId);
      if (!installation) throw new DeliveryError(404, "That IDE installation is not available.");
      await resolveProjectTarget(projectPath);
      if (options.opener) options.opener(installation.executable, projectPath);
      else openProcess(installation.executable, projectPath);
      sendJson(res, 200, {
        ok: true,
        detail: `Launch requested for ${installation.label}. Confirm the window is the project you selected before pasting.`,
      });
      return;
    }
    sendJson(res, 404, { error: "Not found." });
  }

  async function bridgeRoute(req: http.IncomingMessage, res: http.ServerResponse, url: URL): Promise<void> {
    if (req.method === "POST" && url.pathname === "/api/bridge/hello") {
      const parsed = validateHello(await readJson(req, 200_000));
      if (!parsed.ok) throw new DeliveryError(400, parsed.error);
      const session = hub.hello(parsed.value);
      sendJson(res, 200, { sessionId: session.id });
      return;
    }
    const session = hub.touch(sessionId(req));
    if (!session) {
      sendJson(res, 401, { error: "Unknown extension session." });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/bridge/poll") {
      const wait = pollWaitMs(url);
      if (wait <= 0) {
        sendJson(res, 200, { job: hub.poll(session.id) });
        return;
      }
      const abort = new AbortController();
      const onClose = () => {
        if (!res.writableEnded) abort.abort();
      };
      res.on("close", onClose);
      const job = await hub.waitForJob(session.id, wait, abort.signal);
      res.off("close", onClose);
      if (!res.writableEnded) sendJson(res, 200, { job });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/bridge/result") {
      const parsed = validateResult(await readJson(req, 20_000));
      if (!parsed.ok) throw new DeliveryError(400, parsed.error);
      const matched = hub.complete(session.id, parsed.value.id, {
        outcome: parsed.value.outcome,
        detail: parsed.value.detail,
        handedOff: true,
      });
      if (!matched) throw new DeliveryError(404, "That job is not waiting.");
      sendJson(res, 200, { ok: true });
      return;
    }
    sendJson(res, 404, { error: "Not found." });
  }

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    port,
    pageToken,
    bridgeToken,
    inputDevice: settings.inputDevice,
    outputDevice: settings.outputDevice,
    registry,
    service,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}

function parseSubmit(value: unknown): SubmitInput {
  const body = asRecord(value);
  const ide = stringField(body, "ide");
  if (!isIde(ide)) throw new DeliveryError(400, "Unknown IDE.");
  const files = arrayOfStrings(body.files, "files");
  const uploads = arrayOfUploads(body.uploads);
  const images = arrayOfImages(body.images);
  return {
    idempotencyKey: stringField(body, "idempotencyKey") ?? "",
    routeId: stringField(body, "routeId") ?? "",
    ide,
    installationId: stringField(body, "installationId"),
    projectPath: stringField(body, "projectPath") ?? "",
    prompt: stringField(body, "prompt") ?? "",
    additionalInstructions: stringField(body, "additionalInstructions") ?? "",
    includeProjectPath: body.includeProjectPath === true,
    includeStackMarkers: body.includeStackMarkers === true,
    includeScreen: body.includeScreen === true,
    files,
    uploads,
    images,
    allowUnsandboxed: body.allowUnsandboxed === true,
    experimentalSubmit: body.experimentalSubmit === true,
    confirmDestination: body.confirmDestination === true,
    retry: body.retry === true,
  };
}

function arrayOfStrings(value: unknown, label: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new DeliveryError(400, `Invalid ${label}.`);
  }
  return value as string[];
}

function arrayOfUploads(value: unknown): { name: string; content: string }[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new DeliveryError(400, "Invalid uploads.");
  return value.map((item) => {
    const record = asRecord(item);
    const name = stringField(record, "name");
    const content = stringField(record, "content");
    if (!name || content === undefined) throw new DeliveryError(400, "Invalid upload.");
    if (Object.keys(record).some((key) => key !== "name" && key !== "content")) {
      throw new DeliveryError(400, "Invalid upload.");
    }
    return { name, content };
  });
}

function arrayOfImages(value: unknown): { data: string; mimeType: string }[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new DeliveryError(400, "Invalid images.");
  return value.map((item) => {
    const record = asRecord(item);
    const data = stringField(record, "data");
    const mimeType = stringField(record, "mimeType");
    if (!data || !mimeType) throw new DeliveryError(400, "Invalid image.");
    if (Object.keys(record).some((key) => key !== "data" && key !== "mimeType")) {
      throw new DeliveryError(400, "Invalid image.");
    }
    return { data, mimeType };
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new DeliveryError(400, "Expected an object.");
  }
  return value as Record<string, unknown>;
}

function stringField(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new DeliveryError(400, `Invalid ${key}.`);
  return value;
}

function finiteNumber(value: unknown, key: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new DeliveryError(400, `Invalid ${key}.`);
  return value;
}

function isIde(value: unknown): value is IdeId {
  return typeof value === "string" && (IDE_IDS as readonly string[]).includes(value);
}

function sessionId(req: http.IncomingMessage): string {
  const header = req.headers["x-z-session"];
  return typeof header === "string" ? header : "";
}

function pollWaitMs(url: URL): number {
  const raw = url.searchParams.get("wait");
  if (!raw) return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(20_000, Math.floor(value));
}

function authorized(req: http.IncomingMessage, token: string): boolean {
  const header = req.headers.authorization ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const left = Buffer.from(provided);
  const right = Buffer.from(token);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function isLocal(req: http.IncomingMessage): boolean {
  const host = req.headers.host ?? "";
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) return false;
  const address = req.socket.remoteAddress;
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function readJson(req: http.IncomingMessage, limit: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const succeed = (value: unknown) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        fail(new DeliveryError(413, "Request is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("error", fail);
    req.on("end", () => {
      if (size === 0) {
        succeed({});
        return;
      }
      try {
        succeed(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        fail(new DeliveryError(400, "Invalid JSON."));
      }
    });
  });
}

function readRaw(req: http.IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        fail(new DeliveryError(413, "That sound is larger than 8 MB."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("error", fail);
    req.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks));
    });
  });
}

function soundMime(header: string | undefined, body: Buffer): string {
  const declared = (header || "").split(";")[0].trim().toLowerCase();
  const sniffed = sniffAudio(body);
  if (sniffed) return sniffed;
  const allowed: Record<string, string> = {
    "audio/mpeg": "audio/mpeg",
    "audio/mp3": "audio/mpeg",
    "audio/wav": "audio/wav",
    "audio/x-wav": "audio/wav",
    "audio/wave": "audio/wav",
    "audio/ogg": "audio/ogg",
    "audio/webm": "audio/webm",
    "audio/mp4": "audio/mp4",
    "audio/x-m4a": "audio/mp4",
    "audio/aac": "audio/aac",
  };
  return allowed[declared] || "";
}

function sniffAudio(body: Buffer): string {
  if (body.length >= 3 && body.subarray(0, 3).toString("ascii") === "ID3") return "audio/mpeg";
  if (body.length >= 2 && body[0] === 0xff && (body[1] & 0xe0) === 0xe0) return "audio/mpeg";
  if (body.length >= 12 && body.subarray(0, 4).toString("ascii") === "RIFF" && body.subarray(8, 12).toString("ascii") === "WAVE") return "audio/wav";
  if (body.length >= 4 && body.subarray(0, 4).toString("ascii") === "OggS") return "audio/ogg";
  if (body.length >= 4 && body.subarray(0, 4).toString("ascii") === "fLaC") return "audio/flac";
  return "";
}

function chimeExtension(mime: string): string {
  if (mime === "audio/wav") return ".wav";
  if (mime === "audio/ogg") return ".ogg";
  if (mime === "audio/webm") return ".webm";
  if (mime === "audio/mp4") return ".m4a";
  if (mime === "audio/aac") return ".aac";
  if (mime === "audio/flac") return ".flac";
  return ".mp3";
}

async function writeCustomChime(configDir: string, body: Buffer, mime: string): Promise<void> {
  const names = await fs.readdir(configDir).catch(() => [] as string[]);
  await Promise.all(names.filter((name) => name.startsWith("chime-custom")).map((name) => fs.rm(path.join(configDir, name), { force: true })));
  const ext = chimeExtension(mime);
  await fs.writeFile(path.join(configDir, `chime-custom${ext}`), body, { mode: 0o600 });
  await fs.writeFile(path.join(configDir, "chime-custom.json"), JSON.stringify({ ext, mime }), { mode: 0o600 });
}

async function readCustomChime(configDir: string): Promise<{ mime: string; body: Buffer } | undefined> {
  const metaPath = path.join(configDir, "chime-custom.json");
  const raw = await readOptional(metaPath);
  if (!raw) return undefined;
  try {
    const meta = JSON.parse(raw) as { ext?: string; mime?: string };
    const ext = typeof meta.ext === "string" && /^\.[a-z0-9]+$/.test(meta.ext) ? meta.ext : "";
    if (!ext) return undefined;
    const body = await fs.readFile(path.join(configDir, `chime-custom${ext}`));
    return { mime: typeof meta.mime === "string" && meta.mime.startsWith("audio/") ? meta.mime : "audio/mpeg", body };
  } catch {
    return undefined;
  }
}

function defaultConfigDir(): string {
  const base = process.env.APPDATA || path.join(process.env.USERPROFILE || ".", ".config");
  return path.join(base, "Z");
}

async function writeBridgeFile(configDir: string, port: number, token: string): Promise<void> {
  const file = path.join(configDir, "bridge.json");
  await fs.writeFile(file, JSON.stringify({ v: 1, host: "127.0.0.1", port, token }, null, 2), { mode: 0o600 });
}

async function readOptional(file: string): Promise<string | undefined> {
  try {
    const text = (await fs.readFile(file, "utf8")).trim();
    return text || undefined;
  } catch {
    return undefined;
  }
}

function createUnavailableClipboard(): ClipboardPort {
  return {
    async write() {
      throw new Error("Clipboard is not configured.");
    },
    async read() {
      return "";
    },
  };
}

interface MemoryPreset {
  id: string;
  name: string;
  text: string;
}

const KEY_TARGETS = new Set([
  "cursor",
  "vscode",
  "windsurf",
  "jetbrains",
  "visualstudio",
  "zed",
  "sublime",
  "androidstudio",
  "neovim",
  ...CONNECTION_IDS,
]);

interface HooxieSettings {
  revision: number;
  version: string;
  detectable: boolean;
  button: string;
  opacity: number;
  audio: boolean;
  voiceActivation: boolean;
  inputDevice: string;
  outputDevice: string;
  session: boolean;
  language: string;
  lookReady: boolean;
  deliveryReady: boolean;
  trace: boolean;
  chime: string;
  openSound: string;
  closeSound: string;
  chimeCustom: boolean;
  arrows: boolean;
  ide: string;
  installationId: string;
  project: string;
  route: string;
  instructions: string;
  negativePrompt: string;
  memoryId: string;
  memory: MemoryPreset[];
  files: string;
  includePath: boolean;
  includeStack: boolean;
  unsandboxed: boolean;
  experimental: boolean;
  connectedIde: string;
  onboardingStep: string;
  dashboardMode: string;
  widgetMode: string;
}

async function loadSettings(configDir: string): Promise<HooxieSettings> {
  let version = "0.1.0";
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(rootDir, "package.json"), "utf8")) as { version?: string };
    if (typeof pkg.version === "string") version = pkg.version;
  } catch {
    /* The package file is optional at runtime. */
  }
  const base: HooxieSettings = {
    revision: 1,
    version,
    detectable: true,
    button: "#ffffff",
    opacity: 50,
    audio: true,
    voiceActivation: false,
    inputDevice: "",
    outputDevice: "",
    session: false,
    language: "en",
    lookReady: false,
    deliveryReady: false,
    trace: true,
    chime: "blushing",
    openSound: "notification",
    closeSound: "pluck-off",
    chimeCustom: false,
    arrows: false,
    ide: "",
    installationId: "",
    project: "",
    route: "",
    instructions: "",
    negativePrompt: "",
    memoryId: "",
    memory: [],
    files: "",
    includePath: false,
    includeStack: false,
    unsandboxed: false,
    experimental: false,
    connectedIde: "",
    onboardingStep: "",
    dashboardMode: "light",
    widgetMode: "dark",
  };
  const saved = await readOptional(path.join(configDir, "hooxie-settings.json"));
  if (!saved) return base;
  try {
    return normalizeSettings({ ...base, ...JSON.parse(saved), version });
  } catch {
    return base;
  }
}

function normalizeSettings(input: HooxieSettings): HooxieSettings {
  const opacity = Number(input.opacity);
  const memory = memoryPresets(input.memory);
  return {
    revision: Number.isFinite(input.revision) ? input.revision : 1,
    version: input.version || "0.1.0",
    detectable: input.detectable !== false,
    button: BUTTON_COLORS.includes(input.button) ? input.button : "#ffffff",
    opacity: Number.isFinite(opacity) ? Math.min(100, Math.max(10, Math.round(opacity))) : 50,
    audio: input.audio !== false,
    voiceActivation: input.voiceActivation === true,
    inputDevice: deviceId(input.inputDevice),
    outputDevice: deviceId(input.outputDevice),
    session: input.session === true,
    language: LANGUAGES.has(input.language) ? input.language : "en",
    lookReady: input.lookReady === true,
    deliveryReady: input.deliveryReady === true,
    trace: input.trace !== false,
    chime: CHIMES.has(input.chime) ? input.chime : "blushing",
    openSound: CHIMES.has(input.openSound) ? input.openSound : "notification",
    closeSound: CHIMES.has(input.closeSound) ? input.closeSound : "pluck-off",
    chimeCustom: input.chimeCustom === true,
    arrows: input.arrows === true,
    ide: clipText(input.ide, 40),
    installationId: clipText(input.installationId, 200),
    project: clipText(input.project, 500),
    route: clipText(input.route, 80),
    instructions: clipText(input.instructions, 8000),
    negativePrompt: clipText(input.negativePrompt, 2000),
    memory,
    memoryId: memoryId(input.memoryId, memory),
    files: clipText(input.files, 8000),
    includePath: input.includePath === true,
    includeStack: input.includeStack === true,
    unsandboxed: input.unsandboxed === true,
    experimental: input.experimental === true,
    connectedIde: isIde(input.connectedIde) ? input.connectedIde : "",
    onboardingStep: onboardingStep(input.onboardingStep),
    dashboardMode: input.dashboardMode === "dark" ? "dark" : "light",
    widgetMode: input.widgetMode === "light" ? "light" : "dark",
  };
}

function clipText(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function memoryPresets(value: unknown): MemoryPreset[] {
  if (!Array.isArray(value)) return [];
  const presets: MemoryPreset[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const id = clipText(record.id, 40).replace(/[^a-zA-Z0-9_-]/g, "");
    const name = clipText(record.name, 80).replace(/[\u0000-\u001f]/g, "").trim();
    const text = clipText(record.text, 1200);
    if (!id || !name) continue;
    presets.push({ id, name, text });
    if (presets.length >= 16) break;
  }
  return presets;
}

function memoryId(value: unknown, presets: MemoryPreset[]): string {
  const id = clipText(value, 40);
  return presets.some((item) => item.id === id) ? id : "";
}

async function loadServiceKeys(configDir: string, keys: Map<string, string>, remembered: Set<string>): Promise<void> {
  const raw = await readOptional(path.join(configDir, "service-keys.json"));
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const [id, key] of Object.entries(parsed)) {
      if (!KEY_TARGETS.has(id) || id === "cursor" || typeof key !== "string") continue;
      const trimmed = key.trim();
      if (trimmed.length < 8 || trimmed.length > 400 || /[\r\n]/.test(trimmed)) continue;
      keys.set(id, trimmed);
      remembered.add(id);
    }
  } catch {
    /* A broken key file is ignored. */
  }
}

async function saveServiceKeys(configDir: string, keys: Map<string, string>, remembered: Set<string>): Promise<void> {
  const body: Record<string, string> = {};
  for (const id of remembered) {
    const key = keys.get(id);
    if (key) body[id] = key;
  }
  await fs.writeFile(path.join(configDir, "service-keys.json"), JSON.stringify(body), { mode: 0o600 });
}

function deviceId(value: unknown): string {
  return clipText(value, 400).replace(/[\u0000-\u001f]/g, "");
}

function soundFilePath(name: string): string | undefined {
  if (!/^[a-z0-9][a-z0-9.-]{0,80}$/i.test(name)) return undefined;
  const root = path.resolve(publicDir, "sounds");
  const file = path.resolve(root, name);
  if (file !== root && !file.startsWith(root + path.sep)) return undefined;
  return file;
}

async function customChimePath(configDir: string): Promise<string | undefined> {
  const raw = await readOptional(path.join(configDir, "chime-custom.json"));
  if (!raw) return undefined;
  try {
    const meta = JSON.parse(raw) as { ext?: string };
    const ext = typeof meta.ext === "string" && /^\.[a-z0-9]+$/.test(meta.ext) ? meta.ext : "";
    if (!ext) return undefined;
    return path.join(configDir, `chime-custom${ext}`);
  } catch {
    return undefined;
  }
}

async function saveSettings(configDir: string, settings: HooxieSettings): Promise<void> {
  await fs.writeFile(path.join(configDir, "hooxie-settings.json"), JSON.stringify(settings), { mode: 0o600 });
}

async function serveSite(res: http.ServerResponse, pathname: string, pageToken: string): Promise<void> {
  const name = SITE_FILES[pathname];
  if (!name || name.includes("..") || name.includes("\\") || path.isAbsolute(name)) {
    sendJson(res, 404, { error: "Not found." });
    return;
  }
  const root = path.resolve(siteDir);
  const file = path.resolve(siteDir, name);
  if (file !== root && !file.startsWith(root + path.sep)) {
    sendJson(res, 404, { error: "Not found." });
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const types: Record<string, string> = {
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".xml": "application/xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".webp": "image/webp",
    ".ps1": "text/plain; charset=utf-8",
  };
  const type = types[ext] || "text/html; charset=utf-8";
  let body = await fs.readFile(file);
  if (name === "dashboard.html") {
    const html = body.toString("utf8")
      .replace('name="z-token" content=""', `name="z-token" content="${pageToken}"`)
      .replace('name="hooxie-local" content="0"', 'name="hooxie-local" content="1"');
    body = Buffer.from(html);
  }
  res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
  res.end(body);
}

function desktopRequest(req: http.IncomingMessage): boolean {
  const agent = req.headers["user-agent"];
  return typeof agent === "string" && agent.includes("HooxieDesktop");
}

function sendHtml(res: http.ServerResponse, html: string): void {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  res.end(html);
}

function browserDashboardPage(message: string): string {
  const text = message.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[char] || char);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Hooxie</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 Segoe UI,sans-serif;background:#fff;color:#111"><p style="max-width:36ch;margin:24px;text-align:center">${text}</p></body></html>`;
}

function openProcess(executable: string, projectPath: string): void {
  const child = spawn(executable, [projectPath], { detached: true, stdio: "ignore", windowsHide: false });
  child.unref();
}

const launchedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (launchedDirectly) {
  const clipboard = process.platform === "win32" ? (await import("./clipboard.ts")).createWindowsClipboard() : createUnavailableClipboard();
  const { createWidgetController } = await import("./widget.ts");
  const widget = createWidgetController();
  const bridge = await startBridge({ clipboard, widget, exitProcess: true });
  try {
    await widget.open(bridge.baseUrl);
    await widget.setAudioDevices(bridge.inputDevice, bridge.outputDevice).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Audio devices could not be changed.";
      console.log(message);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The desktop widget did not open.";
    console.log(`${message} Open ${bridge.baseUrl}`);
  }
}
