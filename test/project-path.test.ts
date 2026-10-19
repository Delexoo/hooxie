import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { resolveProjectTarget } from "../src/prompt.ts";

test("a selected file uses its folder as the project", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "hooxie-path-"));
  const file = path.join(directory, "hello.html");
  await fs.writeFile(file, "<p>Hello</p>");
  try {
    const selected = await resolveProjectTarget(file);
    assert.equal(selected.directory, path.resolve(directory));
    assert.equal(selected.file, path.resolve(file));
    const folder = await resolveProjectTarget(directory);
    assert.equal(folder.directory, path.resolve(directory));
    assert.equal(folder.file, "");
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
