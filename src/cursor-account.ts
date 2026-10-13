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
  const target = assertLoginUrl(url);
  const child = spawn("rundll32", ["url.dll,FileProtocolHandler", target], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
}
