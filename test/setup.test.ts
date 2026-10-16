import assert from "node:assert/strict";
import test from "node:test";
import { saveLicense } from "../src/license.ts";
import { describeSetup } from "../src/setup.ts";
import { api, boot, deliveryBody, TEST_DEVICE, TEST_LICENSE_SECRET } from "./helper.ts";

test("no detected IDE stays on the download step", () => {
  const report = describeSetup({ installations: [], connectedIde: "", cursorConnected: false, licensed: false });
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
    licensed: false,
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
    licensed: true,
  });
  assert.equal(report.phase, "ready");
  assert.equal(report.connectedIde, "vscode");
});

test("a found IDE switches onboarding to connect", () => {
  const waiting = describeSetup({
    installations: [{ ide: "cursor" }],
    connectedIde: "",
    cursorConnected: true,
    licensed: true,
    onboardingStep: "download",
  });
  assert.equal(waiting.phase, "connect");
  const empty = describeSetup({
    installations: [],
    connectedIde: "",
    cursorConnected: false,
    licensed: false,
    onboardingStep: "download",
  });
  assert.equal(empty.phase, "download");
});

test("Cursor still needs an account connection after the app is found", () => {
  const waiting = describeSetup({
    installations: [{ ide: "cursor" }],
    connectedIde: "cursor",
    cursorConnected: false,
    licensed: true,
  });
  assert.equal(waiting.phase, "connect");
  const ready = describeSetup({
    installations: [{ ide: "cursor" }],
    connectedIde: "",
    cursorConnected: true,
    licensed: true,
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
    const disconnected = await api(ctx.bridge, "/api/ide/disconnect", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ ide: "vscode" }),
    });
    assert.equal(disconnected.status, 200);
    assert.equal(disconnected.body.phase, "connect");
    assert.equal(disconnected.body.connectedIde, "");
    const page = await fetch(`${ctx.bridge.baseUrl}/ides`);
    assert.equal(page.status, 404);
    const launch = await api(ctx.bridge, "/api/ides/open", ctx.bridge.pageToken, { method: "POST", body: "{}" });
    assert.equal(launch.status, 400);
    assert.equal(opened.length, 0);
    const listed = await api(ctx.bridge, "/api/ides/open", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ ide: "sublime" }),
    });
    assert.equal(listed.status, 200);
    assert.equal(opened[0], "https://www.sublimetext.com/download");
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

test("a connected IDE stays locked until this device has a license", async () => {
  const ctx = await boot({
    licensed: false,
    installations: [{ id: "vscode-1", ide: "vscode", label: "Visual Studio Code", executable: "C:\\VS Code\\Code.exe" }],
  });
  try {
    const connected = await api(ctx.bridge, "/api/ide/connect", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ ide: "vscode" }),
    });
    assert.equal(connected.status, 200);
    assert.equal(connected.body.phase, "license");
    assert.equal(connected.body.licensed, false);
    const blocked = await api(ctx.bridge, "/api/deliveries", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify(deliveryBody(ctx.project)),
    });
    assert.equal(blocked.status, 402);
    await saveLicense(ctx.configDir, TEST_LICENSE_SECRET, "other-device", "cs_test_other", "owner@example.com");
    const copied = await api(ctx.bridge, "/api/setup");
    assert.equal(copied.body.phase, "license");
    await saveLicense(ctx.configDir, TEST_LICENSE_SECRET, TEST_DEVICE, "cs_test_device", "owner@example.com");
    const unlocked = await api(ctx.bridge, "/api/setup");
    assert.equal(unlocked.body.phase, "ready");
    assert.equal(unlocked.body.licensed, true);
  } finally {
    await ctx.bridge.close();
  }
});
