import assert from "node:assert/strict";
import test from "node:test";
import { describeSetup } from "../src/setup.ts";
import { api, boot } from "./helper.ts";

test("no detected IDE stays on the download step", () => {
  const report = describeSetup({ installations: [], connectedIde: "", cursorConnected: false });
  assert.equal(report.phase, "download");
  assert.equal(report.ides.length, 6);
  assert.deepEqual(report.more.map((ide) => ide.label), ["Sublime Text", "Android Studio", "Neovim"]);
  assert.equal(report.ides.every((ide) => ide.installed === false), true);
});

test("a detected IDE waits until the user connects it", () => {
  const report = describeSetup({
    installations: [{ ide: "vscode" }, { ide: "windsurf" }],
    connectedIde: "",
    cursorConnected: false,
  });
  assert.equal(report.phase, "connect");
  assert.equal(report.ides.find((ide) => ide.ide === "vscode")?.installed, true);
  assert.equal(report.ides.find((ide) => ide.ide === "zed")?.installed, false);
});

test("connecting a detected IDE unlocks the widget", () => {
  const report = describeSetup({
    installations: [{ ide: "vscode" }],
    connectedIde: "vscode",
    cursorConnected: false,
  });
  assert.equal(report.phase, "ready");
  assert.equal(report.connectedIde, "vscode");
});

test("a found IDE switches onboarding to connect", () => {
  const waiting = describeSetup({
    installations: [{ ide: "cursor" }],
    connectedIde: "",
    cursorConnected: true,
    onboardingStep: "download",
  });
  assert.equal(waiting.phase, "connect");
  const empty = describeSetup({
    installations: [],
    connectedIde: "",
    cursorConnected: false,
    onboardingStep: "download",
  });
  assert.equal(empty.phase, "download");
});

test("Cursor still needs an account connection after the app is found", () => {
  const waiting = describeSetup({
    installations: [{ ide: "cursor" }],
    connectedIde: "cursor",
    cursorConnected: false,
  });
  assert.equal(waiting.phase, "connect");
  const ready = describeSetup({
    installations: [{ ide: "cursor" }],
    connectedIde: "",
    cursorConnected: true,
  });
  assert.equal(ready.phase, "ready");
  assert.equal(ready.connectedIde, "cursor");
});

test("the setup API follows install and connect", async () => {
  const opened: string[] = [];
  const ctx = await boot({
    installations: [{ id: "vscode-1", ide: "vscode", label: "Visual Studio Code", executable: "C:\\VS Code\\Code.exe" }],
    openUrl: (url) => opened.push(url),
  });
  try {
    const waiting = await api(ctx.bridge, "/api/setup");
    assert.equal(waiting.status, 200);
    assert.equal(waiting.body.phase, "connect");
    const missing = await api(ctx.bridge, "/api/ide/connect", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ ide: "zed" }),
    });
    assert.equal(missing.status, 409);
    const connected = await api(ctx.bridge, "/api/ide/connect", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ ide: "vscode" }),
    });
    assert.equal(connected.status, 200);
    assert.equal(connected.body.phase, "ready");
    const page = await fetch(`${ctx.bridge.baseUrl}/ides`);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /Download an IDE/);
    assert.match(html, /https:\/\/cursor.com\/download/);
    assert.match(html, /https:\/\/code.visualstudio.com\/Download/);
    assert.match(html, /Windsurf/);
    assert.match(html, /JetBrains/);
    assert.match(html, /Visual Studio/);
    assert.match(html, /Zed/);
    const launch = await api(ctx.bridge, "/api/ides/open", ctx.bridge.pageToken, { method: "POST", body: "{}" });
    assert.equal(launch.status, 200);
    assert.equal(opened.length, 1);
    assert.match(opened[0], /\/ides$/);
    const listed = await api(ctx.bridge, "/api/ides/open", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ ide: "sublime" }),
    });
    assert.equal(listed.status, 200);
    assert.equal(opened[1], "https://www.sublimetext.com/download");
    const unknown = await api(ctx.bridge, "/api/ides/open", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ ide: "notepad" }),
    });
    assert.equal(unknown.status, 400);
  } finally {
    await ctx.bridge.close();
  }
});

test("settings can restart onboarding at step 1", async () => {
  const ctx = await boot({
    installations: [{ id: "cursor-1", ide: "cursor", label: "Cursor", executable: "C:\\Cursor\\Cursor.exe" }],
  });
  try {
    const ready = await api(ctx.bridge, "/api/setup");
    assert.equal(ready.body.phase, "ready");
    const restarted = await api(ctx.bridge, "/api/onboarding/restart", ctx.bridge.pageToken, { method: "POST", body: "{}" });
    assert.equal(restarted.status, 200);
    assert.equal(restarted.body.phase, "connect");
    const stepped = await api(ctx.bridge, "/api/onboarding/advance", ctx.bridge.pageToken, { method: "POST", body: "{}" });
    assert.equal(stepped.body.phase, "connect");
    const connected = await api(ctx.bridge, "/api/ide/connect", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ ide: "cursor" }),
    });
    assert.equal(connected.body.phase, "ready");
  } finally {
    await ctx.bridge.close();
  }
});
