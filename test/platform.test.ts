import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { detectInstallations } from "../src/detect.ts";
import { isSensitivePath, readSelectedFile } from "../src/safety.ts";
import { createWindowsClipboard } from "../src/clipboard.ts";

test("detection maps a Cursor command path to Cursor.exe", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "z-detect-"));
  const exe = path.join(root, "Cursor.exe");
  const bin = path.join(root, "resources", "app", "bin", "cursor.cmd");
  await fs.mkdir(path.dirname(bin), { recursive: true });
  await fs.writeFile(exe, "");
  await fs.writeFile(bin, "");
  const found = await detectInstallations({
    where: async (name) => (name === "cursor" ? [bin] : []),
    exists: (file) => file === exe || file === bin,
    env: {},
    walk: () => [],
    vswhere: async () => undefined,
  });
  assert.equal(found.length, 1);
  assert.equal(found[0].ide, "cursor");
  assert.equal(found[0].executable, exe);
});

test("this machine's IDE detection returns executables", { timeout: 30000 }, async () => {
  const found = await detectInstallations();
  assert.ok(Array.isArray(found));
  for (const item of found) {
    assert.ok(item.id);
    assert.ok(item.executable);
  }
  assert.ok(found.some((item) => item.ide === "cursor"));
  assert.ok(found.some((item) => item.ide === "vscode"));
});

test("sensitive names are blocked before their contents are read", () => {
  assert.equal(isSensitivePath("C:\\work\\.env.local"), true);
  assert.equal(isSensitivePath("C:\\work\\id_ed25519"), true);
  assert.equal(isSensitivePath("C:\\work\\app.ts"), false);
});

test("a symlink that leaves the project is rejected", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "z-root-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "z-out-"));
  const target = path.join(outside, "secret.txt");
  const link = path.join(root, "linked.txt");
  await fs.writeFile(target, "secret");
  try {
    await fs.symlink(target, link);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EPERM" || code === "ENOTSUP") {
      t.skip("this environment cannot create symlinks");
      return;
    }
    throw error;
  }
  await assert.rejects(() => readSelectedFile(root, "linked.txt"), /outside the project/);
});

test("the Windows clipboard round-trips a prompt", { timeout: 20000 }, async (t) => {
  if (process.platform !== "win32") {
    t.skip("clipboard fallback is implemented for Windows");
    return;
  }
  const clipboard = createWindowsClipboard();
  const previous = await clipboard.read().catch(() => "");
  const prompt = `Z clipboard check ${Date.now()}`;
  try {
    await clipboard.write(prompt);
    const current = await clipboard.read();
    assert.equal(current.replace(/\r\n/g, "\n"), prompt);
  } finally {
    await clipboard.write(previous);
  }
});
