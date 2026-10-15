import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const LICENSE_PRICE_CENTS = 599;

export interface StoredLicense {
  v: 1;
  device: string;
  sessionId: string;
  email: string;
  sig: string;
}

export function signLicense(secret: string, device: string, sessionId: string, email: string): string {
  return createHmac("sha256", secret).update(`${device}\n${sessionId}\n${email}`).digest("hex");
}

export function licenseMatches(secret: string, device: string, record: Partial<StoredLicense> | null): boolean {
  if (!secret || !device || !record) return false;
  if (record.v !== 1 || record.device !== device) return false;
  if (typeof record.sessionId !== "string" || typeof record.email !== "string" || typeof record.sig !== "string") return false;
  if (!/^[a-f0-9]{64}$/.test(record.sig)) return false;
  const expected = signLicense(secret, device, record.sessionId, record.email);
  const left = Buffer.from(expected);
  const right = Buffer.from(record.sig);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function readDeviceId(): Promise<string> {
  if (process.platform !== "win32") throw new Error("This computer could not be identified.");
  const { stdout } = await execFileAsync("reg", ["query", "HKLM\\SOFTWARE\\Microsoft\\Cryptography", "/v", "MachineGuid"], {
    windowsHide: true,
    timeout: 5000,
  });
  const match = /MachineGuid\s+REG_SZ\s+([0-9a-fA-F-]{16,})/.exec(stdout);
  if (!match) throw new Error("This computer could not be identified.");
  return createHash("sha256").update(match[1].trim().toLowerCase()).digest("hex");
}

export async function saveLicense(configDir: string, secret: string, device: string, sessionId: string, email: string): Promise<void> {
  const record: StoredLicense = {
    v: 1,
    device,
    sessionId,
    email,
    sig: signLicense(secret, device, sessionId, email),
  };
  await fs.writeFile(path.join(configDir, "license.json"), JSON.stringify(record), { mode: 0o600 });
}

export async function readStoredLicense(configDir: string, secret: string, device: string): Promise<boolean> {
  try {
    const raw = await fs.readFile(path.join(configDir, "license.json"), "utf8");
    const record = JSON.parse(raw) as Partial<StoredLicense>;
    return licenseMatches(secret, device, record);
  } catch {
    return false;
  }
}
