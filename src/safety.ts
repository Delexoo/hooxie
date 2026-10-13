import fs from "node:fs/promises";
import path from "node:path";
import { DeliveryError } from "./types.ts";

const SENSITIVE_NAMES = new Set([
  ".env",
  ".npmrc",
  ".pypirc",
  ".netrc",
  "credentials.json",
  "secrets.json",
  "serviceaccount.json",
  "service-account.json",
  "id_rsa",
  "id_dsa",
  "id_ecdsa",
  "id_ed25519",
]);

const SENSITIVE_EXTENSIONS = new Set([".pem", ".p12", ".pfx", ".key", ".kdbx"]);

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

const SECRET_CONTENT = /-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|xox[baprs]-[0-9A-Za-z-]{10,}/;

export function samePath(a: string, b: string): boolean {
  const left = path.resolve(a);
  const right = path.resolve(b);
  if (process.platform === "win32") return left.toLowerCase() === right.toLowerCase();
  return left === right;
}

export function isSensitivePath(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  if (SENSITIVE_NAMES.has(base)) return true;
  if (base.startsWith(".env")) return true;
  const ext = path.extname(base);
  if (SENSITIVE_EXTENSIONS.has(ext)) return true;
  if (base.endsWith(".credentials.json")) return true;
  return false;
}

export function contentLooksSecret(text: string): boolean {
  return SECRET_CONTENT.test(text);
}

export async function resolveInside(root: string, relativePath: string): Promise<string> {
  if (!relativePath || relativePath.includes("\0")) {
    throw new DeliveryError(400, "A selected file path is invalid.");
  }
  if (path.isAbsolute(relativePath)) {
    throw new DeliveryError(400, "Select files by a path inside the project, not an absolute path.");
  }
  const rootReal = await fs.realpath(root);
  const abs = path.resolve(rootReal, relativePath);
  let fileReal: string;
  try {
    fileReal = await fs.realpath(abs);
  } catch {
    throw new DeliveryError(400, `Selected file was not found: ${relativePath}`);
  }
  const rel = path.relative(rootReal, fileReal);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new DeliveryError(400, `Selected file is outside the project: ${relativePath}`);
  }
  return fileReal;
}

export function assertUploads(uploads: { name: string; content: string }[]): { name: string; content: string }[] {
  if (uploads.length > 40) throw new DeliveryError(400, "Attach at most 40 files.");
  return uploads.map((upload) => {
    const name = upload.name.trim().replaceAll("\\", "/");
    const parts = name.split("/");
    if (!name || name.length > 240 || name.includes("\0") || parts.some((part) => !part || part === "." || part === "..")) {
      throw new DeliveryError(400, "An uploaded file name is invalid.");
    }
    if (isSensitivePath(name)) {
      throw new DeliveryError(400, `Refusing to attach a sensitive file (${name}). It was not sent.`);
    }
    if (upload.content.length > 200_000) {
      throw new DeliveryError(400, `Uploaded file ${name} is larger than 200 KB.`);
    }
    if (contentLooksSecret(upload.content)) {
      throw new DeliveryError(400, `Refusing to attach a sensitive file (${name}). It was not sent.`);
    }
    return { name, content: upload.content };
  });
}

export function assertImage(image: { data: string; mimeType: string }): void {
  if (!IMAGE_TYPES.has(image.mimeType)) {
    throw new DeliveryError(400, "Images must be PNG, JPEG, GIF, or WebP.");
  }
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(image.data) || image.data.length < 16) {
    throw new DeliveryError(400, "An image attachment is not valid base64.");
  }
  const bytes = Math.floor((image.data.replace(/\s/g, "").length * 3) / 4);
  if (bytes > 4_000_000) {
    throw new DeliveryError(400, "An image is larger than 4 MB.");
  }
}

export async function readSelectedFile(root: string, relativePath: string): Promise<{ relativePath: string; content: string }> {
  const full = await resolveInside(root, relativePath);
  if (isSensitivePath(full)) {
    throw new DeliveryError(
      400,
      `Refusing to attach a sensitive file (${relativePath}). It was not sent.`,
    );
  }
  const stat = await fs.stat(full);
  if (!stat.isFile()) throw new DeliveryError(400, `Not a file: ${relativePath}`);
  if (stat.size > 200_000) {
    throw new DeliveryError(400, `Selected file is too large to inline: ${relativePath}`);
  }
  const buf = await fs.readFile(full);
  if (buf.includes(0)) {
    throw new DeliveryError(400, `Selected file looks binary and was not inlined: ${relativePath}`);
  }
  const content = buf.toString("utf8");
  if (contentLooksSecret(content)) {
    throw new DeliveryError(
      400,
      `Refusing to attach ${relativePath} because it looks like it contains a credential. It was not sent.`,
    );
  }
  const portable = relativePath.replaceAll("\\", "/");
  return { relativePath: portable, content };
}
