import { execFile, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const PILL_WIDTH = 448;
const PILL_HEIGHT = 236;

export interface WidgetControl {
  resize(width: number, height: number, instant?: boolean): Promise<void>;
  move(dx: number, dy: number): Promise<void>;
  browse(initialPath?: string): Promise<string>;
  capture(): Promise<{ data: string; mimeType: string }>;
  voice(action: "start" | "stop" | "poll" | "wake"): Promise<{ listening: boolean; text: string; error: string; phase: string; silenceMs: number; awake: boolean }>;
  audioDevices(): Promise<{ inputs: { id: string; name: string }[]; outputs: { id: string; name: string }[] }>;
  setAudioDevices(input: string, output: string): Promise<void>;
  play(filePath: string): Promise<void>;
  focused(): Promise<boolean>;
  yieldFocus(): Promise<void>;
  setShown(shown: boolean): Promise<boolean>;
  follow(): Promise<void>;
  home(): Promise<void>;
  setUndetectable(enabled: boolean): Promise<boolean>;
  setMoveKeys(enabled: boolean): Promise<boolean>;
  toggleDashboard(): Promise<boolean>;
  quit(): Promise<void>;
  open(pageUrl: string): Promise<void>;
}

interface HostResponse {
  ok?: boolean;
  ready?: boolean;
  error?: string;
  path?: string;
  image?: string;
  mimeType?: string;
  listening?: boolean;
  text?: string;
  inputs?: { id?: string; name?: string }[];
  outputs?: { id?: string; name?: string }[];
  phase?: string;
  silenceMs?: number;
  awake?: boolean;
  active?: boolean;
  shown?: boolean;
  enabled?: boolean;
  open?: boolean;
}

export function createWidgetController(): WidgetControl {
  let host: WidgetHost | undefined;
  return {
    async resize(width, height, instant = false) {
      host?.queueFit(width, height, instant);
    },
    async move(dx, dy) {
      host?.nudge(dx, dy);
    },
    async browse(initialPath = "") {
      if (!host) return "";
      const response = await host.call({ cmd: "browse", initialPath }, 180000);
      return typeof response.path === "string" ? response.path : "";
    },
    async capture() {
      if (!host) throw new Error("The desktop widget is not open, so the screen cannot be captured.");
      const response = await host.call({ cmd: "capture" }, 15000);
      if (!response.ok || !response.image) {
        throw new Error(response.error || "The screen could not be captured.");
      }
      return { data: response.image, mimeType: response.mimeType || "image/jpeg" };
    },
    async audioDevices() {
      if (!host) return { inputs: [], outputs: [] };
      const response = await host.call({ cmd: "devices" }, 8000);
      if (!response.ok) throw new Error(response.error || "Audio devices could not be listed.");
      return { inputs: audioEndpoints(response.inputs), outputs: audioEndpoints(response.outputs) };
    },
    async setAudioDevices(input, output) {
      if (!host) return;
      const response = await host.call({ cmd: "audio", input, output }, 8000);
      if (!response.ok) throw new Error(response.error || "Audio devices could not be changed.");
    },
    async play(filePath) {
      if (!host) throw new Error("Sound plays through the desktop widget.");
      const response = await host.call({ cmd: "play", path: filePath }, 8000);
      if (!response.ok) throw new Error(response.error || "The sound could not play.");
    },
    async voice(action) {
      if (!host) throw new Error("Voice prompting is available in the desktop widget.");
      const response = await host.call({ cmd: "voice", action }, 20000);
      if (!response.ok) throw new Error(response.error || "Voice prompting could not start.");
      return {
        listening: response.listening === true,
        text: typeof response.text === "string" ? response.text : "",
        error: typeof response.error === "string" ? response.error : "",
        phase: response.phase === "wake" || response.phase === "prompt" ? response.phase : "off",
        silenceMs: typeof response.silenceMs === "number" && Number.isFinite(response.silenceMs) ? Math.max(0, response.silenceMs) : 0,
        awake: response.awake === true,
      };
    },
    async focused() {
      if (!host) return true;
      const response = await host.call({ cmd: "focus" }, 4000);
      return response.active === true;
    },
    async yieldFocus() {
      if (!host) return;
      const response = await host.call({ cmd: "yield" }, 4000);
      if (!response.ok) throw new Error(response.error || "Hooxie could not release focus.");
    },
    async setShown(shown) {
      if (!host) return true;
      const response = await host.call({ cmd: "visible", shown }, 4000);
      if (!response.ok) throw new Error(response.error || "Hooxie could not be hidden.");
      return response.shown !== false;
    },
    async follow() {
      if (!host) return;
      const response = await host.call({ cmd: "follow" }, 4000);
      if (!response.ok) throw new Error(response.error || "Hooxie could not be moved.");
    },
    async home() {
      if (!host) return;
      const response = await host.call({ cmd: "home" }, 4000);
      if (!response.ok) throw new Error(response.error || "Hooxie could not move back.");
    },
    async setUndetectable(enabled) {
      if (!host) return false;
      const response = await host.call({ cmd: "undetectable", enabled }, 4000);
      if (!response.ok) throw new Error(response.error || "Undetectable mode could not be changed.");
      return response.enabled === true;
    },
    async setMoveKeys(enabled) {
      if (!host) return false;
      const response = await host.call({ cmd: "arrows", enabled }, 4000);
      if (!response.ok) throw new Error(response.error || "Arrow keys could not be changed.");
      return response.enabled === true;
    },
    async toggleDashboard() {
      if (!host) throw new Error("The dashboard opens inside Hooxie.");
      const response = await host.call({ cmd: "dashboard" }, 4000);
      if (!response.ok) throw new Error(response.error || "The dashboard could not open.");
      return response.open === true;
    },
    async quit() {
      if (!host) return;
      const response = await host.call({ cmd: "quit" }, 4000);
      if (!response.ok) throw new Error(response.error || "Hooxie could not exit.");
    },
    async open(pageUrl) {
      if (process.platform !== "win32") {
        console.log(`Desktop widget is available on Windows. Open ${pageUrl}`);
        return;
      }
      await closePreviousWidget();
      host = new WidgetHost(pageUrl);
      await host.ready();
      await host.call({ cmd: "fit", cssWidth: PILL_WIDTH, cssHeight: PILL_HEIGHT }, 12000);
    },
  };
}

function audioEndpoints(value: { id?: string; name?: string }[] | undefined): { id: string; name: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const id = typeof item?.id === "string" ? item.id : "";
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    return id && name ? [{ id, name }] : [];
  });
}

function widgetShellPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(here, "widget-shell", "bin", "Release", "net10.0-windows", "HooxieShell.exe"),
    path.join(here, "..", "shell", "HooxieShell.exe"),
  ];
  return candidates.find((file) => fs.existsSync(file)) ?? candidates[0];
}

class WidgetHost {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly queue: { payload: unknown; resolve: (value: HostResponse) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }[] = [];
  private pending: { resolve: (value: HostResponse) => void; reject: (error: Error) => void; timer: NodeJS.Timeout } | undefined;
  private pendingFit: { width: number; height: number; instant: boolean } | null = null;
  private fitActive = false;
  private pendingDx = 0;
  private pendingDy = 0;
  private moveActive = false;
  private readyPromise: Promise<void>;
  private rejectReady: ((error: Error) => void) | undefined;
  private failed: Error | undefined;

  constructor(url: string) {
    const exe = widgetShellPath();
    this.child = spawn(exe, [url], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    this.child.on("error", (error) => this.fail(error));
    this.child.stderr.setEncoding("utf8");
    this.child.on("exit", (code) => {
      this.fail(new Error(`Widget host exited (${code ?? "unknown"}).`));
    });
    const lines = readline.createInterface({ input: this.child.stdout });
    this.readyPromise = new Promise((resolve, reject) => {
      this.rejectReady = reject;
      const timer = setTimeout(() => reject(new Error("Widget host did not start.")), 20000);
      const onLine = (line: string) => {
        const message = parseLine(line);
        if (!message?.ready) return;
        clearTimeout(timer);
        this.rejectReady = undefined;
        lines.off("line", onLine);
        lines.on("line", (next) => this.onLine(next));
        resolve();
      };
      lines.on("line", onLine);
    });
  }

  ready(): Promise<void> {
    if (this.failed) return Promise.reject(this.failed);
    return this.readyPromise;
  }

  queueFit(width: number, height: number, instant = false): void {
    this.pendingFit = { width, height, instant };
    this.kickFit();
  }

  nudge(dx: number, dy: number): void {
    this.pendingDx += dx;
    this.pendingDy += dy;
    this.kickMove();
  }

  private kickFit(): void {
    if (this.fitActive || !this.pendingFit || this.failed) return;
    const next = this.pendingFit;
    this.pendingFit = null;
    this.fitActive = true;
    this.call({ cmd: "fit", cssWidth: next.width, cssHeight: next.height, instant: next.instant }, 12000)
      .catch(() => undefined)
      .finally(() => {
        this.fitActive = false;
        this.kickFit();
      });
  }

  private kickMove(): void {
    if (this.moveActive || this.failed) return;
    if (!this.pendingDx && !this.pendingDy) return;
    const dx = this.pendingDx;
    const dy = this.pendingDy;
    this.pendingDx = 0;
    this.pendingDy = 0;
    this.moveActive = true;
    this.call({ cmd: "move", dx, dy }, 4000)
      .catch(() => undefined)
      .finally(() => {
        this.moveActive = false;
        this.kickMove();
      });
  }

  call(payload: unknown, timeoutMs: number): Promise<HostResponse> {
    if (this.failed) return Promise.reject(this.failed);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Widget host timed out."));
      }, timeoutMs);
      this.queue.push({ payload, resolve, reject, timer });
      this.pump();
    });
  }

  private pump(): void {
    if (this.pending || this.queue.length === 0 || this.failed) return;
    const next = this.queue.shift();
    if (!next) return;
    this.pending = next;
    this.child.stdin.write(`${JSON.stringify(next.payload)}\n`);
  }

  private onLine(line: string): void {
    const message = parseLine(line);
    if (!message || !this.pending) return;
    const current = this.pending;
    this.pending = undefined;
    clearTimeout(current.timer);
    current.resolve(message);
    this.pump();
  }

  private fail(error: Error): void {
    if (this.failed) return;
    this.failed = error;
    this.rejectReady?.(error);
    this.rejectReady = undefined;
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.reject(error);
      this.pending = undefined;
    }
    for (const item of this.queue) {
      clearTimeout(item.timer);
      item.reject(error);
    }
    this.queue.length = 0;
  }
}

function parseLine(line: string): HostResponse | undefined {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return undefined;
  try {
    return JSON.parse(trimmed) as HostResponse;
  } catch {
    return undefined;
  }
}

async function closePreviousWidget(): Promise<void> {
  const script = `
Get-Process msedge, chrome, HooxieShell -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowTitle -eq 'Hooxie' } |
  Stop-Process -Force -ErrorAction SilentlyContinue
`;
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  await execFileAsync("powershell.exe", ["-NoProfile", "-EncodedCommand", encoded], { windowsHide: true }).catch(() => undefined);
}
