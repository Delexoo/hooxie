import { spawn } from "node:child_process";

export function accountConnected(apiKey: string | undefined, sdkLoggedIn: boolean): boolean {
  return Boolean(apiKey && apiKey.trim()) || sdkLoggedIn;
}

export function publicConnectError(error: unknown): string {
  const raw = error instanceof Error ? error.message : "";
  if (/cancel/i.test(raw)) return "Sign-in was canceled. Press Connect Cursor to try again.";
  if (/timed out|timeout/i.test(raw)) return "Sign-in timed out. Press Connect Cursor to try again.";
  return "Cursor sign-in did not finish. Press Connect Cursor to try again.";
}

export function assertLoginUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("browser");
  }
  if (parsed.protocol !== "https:") throw new Error("browser");
  return parsed.toString();
}

export function openLoginUrl(url: string): void {
  openBrowser(assertLoginUrl(url));
}

export function assertLoopbackIdes(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("browser");
  }
  if (parsed.protocol !== "http:") throw new Error("browser");
  if (parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") throw new Error("browser");
  if (parsed.pathname !== "/ides") throw new Error("browser");
  if (parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error("browser");
  return parsed.toString();
}

export function openLoopbackIdes(url: string): void {
  openBrowser(assertLoopbackIdes(url));
}

export function openOnboardingHelp(port: number): void {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("browser");
  openBrowser(`http://127.0.0.1:${port}/help#onboarding`);
}

const DOWNLOAD_HOSTS = new Set([
  "cursor.com",
  "code.visualstudio.com",
  "windsurf.com",
  "www.jetbrains.com",
  "visualstudio.microsoft.com",
  "zed.dev",
  "www.sublimetext.com",
  "developer.android.com",
  "neovim.io",
]);

export function openStripeCheckout(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("browser");
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "checkout.stripe.com") throw new Error("browser");
  if (parsed.username || parsed.password) throw new Error("browser");
  openBrowser(parsed.toString());
}

export function openIdeDownload(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("browser");
  }
  if (parsed.protocol !== "https:") throw new Error("browser");
  if (!DOWNLOAD_HOSTS.has(parsed.hostname)) throw new Error("browser");
  if (parsed.username || parsed.password) throw new Error("browser");
  openBrowser(parsed.toString());
}

function openBrowser(target: string): void {
  const child = spawn("rundll32", ["url.dll,FileProtocolHandler", target], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
}
