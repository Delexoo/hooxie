const token = document.querySelector('meta[name="z-token"]').content;
const statusEl = document.querySelector("#status");
const ideEl = document.querySelector("#ide");
const installEl = document.querySelector("#install");
const installLabel = document.querySelector("#install-label");
const projectEl = document.querySelector("#project");
const routeEl = document.querySelector("#route");
const routeLabelEl = document.querySelector("#route-label");
const routePickerEl = document.querySelector('.choices[data-for="route"]');
const routeNote = document.querySelector("#route-note");
const workspacesEl = document.querySelector("#workspaces");
const limitsEl = document.querySelector("#limits");
const detailEl = document.querySelector("#detail");
const resultEl = document.querySelector("#result");
const sendEl = document.querySelector("#send");
const retryEl = document.querySelector("#retry");
const cancelEl = document.querySelector("#cancel");
const presetsEl = document.querySelector("#presets");
const presetToggle = document.querySelector("#preset-toggle");
const chatEl = document.querySelector("#chat");
const chatToggle = document.querySelector("#chat-toggle");
const threadEl = document.querySelector("#thread");
const projectPathEl = document.querySelector("#project-path");
const viewScreenEl = document.querySelector("#view-screen");
const clearTarget = document.querySelector("#clear-target");
const promptEl = document.querySelector("#prompt");
const filesEl = document.querySelector("#files");
const imagesEl = document.querySelector("#images");
const folderEl = document.querySelector("#folder");
const shellEl = document.querySelector("#shell");
const frameEl = document.querySelector("#frame");
const pillEl = document.querySelector("#pill");
const attachmentsEl = document.querySelector("#attachments");

const SHELL_WIDTH = 440;
const FRAME_WIDTH = SHELL_WIDTH + 8;
const STORAGE_KEY = "hooxie-target";
const LOOK_KEY = "hooxie-look";
const BUTTON_COLORS = ["#ffffff", "#4d9fff", "#3ddc97", "#ff8a3d", "#ff5d8f", "#b07bff", "#ffe14a", "#ff4d4d", "#3ee0d2"];
const opacityEl = document.querySelector("#opacity");
const opacityValueEl = document.querySelector("#opacity-value");
const blurEl = document.querySelector("#blur");
const traceEl = document.querySelector("#trace");
const swatchEls = [...document.querySelectorAll(".swatch")];
let buttonColor = "#ffffff";

const LABELS = {
  ready: "Ready",
  preparing: "Preparing",
  sending: "Sending",
  delivered: "Delivered",
  awaiting_user_action: "Awaiting user action",
  agent_working: "Agent working",
  completed: "Completed",
  failed: "Failed",
  disconnected: "Disconnected",
  status_unavailable: "Status unavailable",
};

let state = { ides: [], installations: [], sessions: [], cursorKeyConfigured: false, sdkReady: false };
let routes = [];
let draftKey = crypto.randomUUID();
let deliveryId = "";
let pollTimer = 0;
let statusName = "ready";
let fitTimer = 0;
let panel = "none";
let thread = [];
let renderedReply = "";
let lastPrompt = "";
let sendBlocked = true;
let cursorReady = false;
let busy = false;
let stopRequested = false;
let promptQueue = [];
let sessionTerminals = [];
let sessionFiles = [];
let activityOpen = "";
let activityDismissed = new Set();
let draining = false;
let listening = false;
let voiceTimer = 0;
let voicePollFlight = false;
let voiceBase = "";
let attachments = [];
let inflightImageIds = [];
let lastScreenImage = null;
let audioEnabled = true;
let chimeId = "blushing";
let chimeAudio = null;
let arrowsApplied = null;
let settingsRevision = 0;
let settingsTimer = 0;
let pendingSettings = null;
let applyingRemote = false;

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const TEXT_EXT = new Set(["html", "htm", "txt", "md", "json", "js", "mjs", "cjs", "css", "ts", "tsx", "jsx", "xml", "svg", "csv", "py", "cs", "java", "go", "rs", "yml", "yaml", "toml", "log", "ini", "cfg", "sh", "ps1", "sql", "vue", "svelte", "php", "rb", "kt", "swift"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "bin", "obj", "dist", ".vs", ".next"]);
const SENSITIVE_NAMES = new Set([".env", ".npmrc", ".pypirc", ".netrc", "credentials.json", "secrets.json", "id_rsa", "id_dsa", "id_ecdsa", "id_ed25519"]);
const MAX_UPLOADS = 40;
const fields = ["prompt", "instructions", "files", "include-path", "include-stack", "unsandboxed", "experimental"];

function buttonInk(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.64 ? "#2a2a2a" : "#ffffff";
}

function applyLook(publish = true) {
  const opacity = Math.min(100, Math.max(10, Number(opacityEl.value) || 50));
  const color = BUTTON_COLORS.includes(buttonColor) ? buttonColor : "#ffffff";
  buttonColor = color;
  opacityEl.value = String(opacity);
  opacityValueEl.textContent = `${opacity}%`;
  const blur = blurEl.checked;
  shellEl.classList.toggle("is-blur", blur);
  document.documentElement.style.setProperty("--glass", `rgba(0, 0, 0, ${opacity / 100})`);
  document.documentElement.style.setProperty("--blur-shade", (0.25 + opacity / 400).toFixed(3));
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--button", color);
  document.documentElement.style.setProperty("--button-ink", buttonInk(color));
  for (const swatch of swatchEls) {
    const on = swatch.dataset.color === color;
    swatch.classList.toggle("is-selected", on);
    swatch.setAttribute("aria-checked", String(on));
  }
  localStorage.setItem(LOOK_KEY, JSON.stringify({ opacity, button: color, blur: blurEl.checked, trace: traceEl.checked }));
  if (publish) queueSettings({ button: color, opacity });
  applyBlur(blurEl.checked);
  syncTrace();
}

function restoreLook() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOOK_KEY) || "null");
    if (saved && Number.isFinite(Number(saved.opacity))) opacityEl.value = String(saved.opacity);
    if (saved && BUTTON_COLORS.includes(saved.button)) buttonColor = saved.button;
    blurEl.checked = saved?.blur === true;
    if (saved) traceEl.checked = saved.trace !== false;
  } catch {
    localStorage.removeItem(LOOK_KEY);
  }
  applyLook(false);
}

ideEl.addEventListener("change", () => {
  renderInstallations();
  touchDraft();
  refreshRoutes();
  publishDelivery();
});
projectEl.addEventListener("change", () => { touchDraft(); refreshRoutes(); publishDelivery(); });
routeEl.addEventListener("change", () => { touchDraft(); renderRoute(); publishDelivery(); });
installEl.addEventListener("change", () => publishDelivery());
for (const id of fields) {
  const node = document.querySelector("#" + id);
  node.addEventListener("input", () => { touchDraft(); renderTarget(); if (id !== "prompt") publishDelivery(); });
  node.addEventListener("change", () => { touchDraft(); renderTarget(); if (id !== "prompt") publishDelivery(); });
}
imagesEl.addEventListener("change", () => {
  addFileList(imagesEl.files);
  imagesEl.value = "";
});
folderEl.addEventListener("change", () => {
  addFileList(folderEl.files);
  folderEl.value = "";
});
sendEl.addEventListener("click", async () => {
  if (busy) {
    await stopAgent();
    return;
  }
  if (!promptEl.value.trim()) {
    await toggleVoice();
    return;
  }
  if (listening) await stopVoice();
  if (!sendEl.disabled && promptEl.value.trim()) submit(false);
});
promptEl.addEventListener("input", syncAction);
promptEl.addEventListener("focus", () => {
  stopPlaceholder();
  syncTrace();
});
promptEl.addEventListener("blur", () => {
  syncTrace();
  if (!promptEl.value) startPlaceholder();
});
retryEl.addEventListener("click", () => submit(true));
cancelEl.addEventListener("click", () => { stopAgent(); });
document.querySelector("#open-ide").addEventListener("click", openIde);
document.querySelector("#save-key").addEventListener("click", saveKey);
document.querySelector("#browse").addEventListener("click", browseFolder);
document.querySelector("#add").addEventListener("click", () => imagesEl.click());
document.querySelector("#add").addEventListener("contextmenu", (event) => {
  event.preventDefault();
  folderEl.click();
});
document.querySelector("#viewer-close").addEventListener("click", closeViewer);
opacityEl.addEventListener("input", applyLook);
blurEl.addEventListener("change", applyLook);
traceEl.addEventListener("change", applyLook);
for (const swatch of swatchEls) {
  swatch.addEventListener("click", () => {
    buttonColor = swatch.dataset.color;
    applyLook();
  });
}
restoreLook();
projectPathEl.addEventListener("click", browseFolder);
viewScreenEl.checked = localStorage.getItem("hooxie-screen") === "1";
viewScreenEl.addEventListener("change", () => {
  localStorage.setItem("hooxie-screen", viewScreenEl.checked ? "1" : "0");
  renderRoute();
});
document.querySelector(".switch").title = "Include a screenshot of this screen with each prompt";
clearTarget.addEventListener("click", () => {
  projectEl.value = "";
  filesEl.value = "";
  touchDraft();
  refreshRoutes();
  publishDelivery();
});
chatToggle.addEventListener("click", () => togglePanel("chat"));
document.querySelector("#usage-toggle").addEventListener("click", () => {
  togglePanel("usage");
  refreshUsage().catch(() => undefined);
});
presetToggle.addEventListener("click", () => togglePanel("presets"));
document.querySelector("#preset-save").addEventListener("click", savePreset);
document.querySelector("#preset-from-prompt").addEventListener("click", () => {
  document.querySelector("#preset-text").value = promptEl.value;
});
document.querySelector("#more").addEventListener("click", () => {
  const menu = document.querySelector("#more-menu");
  showOnly(menu.hidden ? "more" : "none");
});
const dashboardToggle = document.querySelector("#dashboard-toggle");
function paintDashboard(open) {
  dashboardToggle.setAttribute("aria-expanded", String(open));
  dashboardToggle.setAttribute("aria-pressed", String(open));
  dashboardToggle.title = open ? "Close dashboard" : "Dashboard";
  dashboardToggle.setAttribute("aria-label", open ? "Close dashboard" : "Dashboard");
}
window.onDashboardOpen = (open) => paintDashboard(open === true);
dashboardToggle.addEventListener("click", () => {
  showOnly("none");
  const next = dashboardToggle.getAttribute("aria-expanded") !== "true";
  paintDashboard(next);
  api("/api/dashboard/open", { method: "POST", body: "{}" })
    .then((body) => paintDashboard(body.open === true))
    .catch((error) => {
      paintDashboard(!next);
      detailEl.textContent = error.message;
    });
});
document.querySelector("#more-hide").addEventListener("click", hideHooxie);
document.querySelector("#more-clear").addEventListener("click", clearChat);
document.querySelector("#more-move").addEventListener("click", moveHooxie);
document.querySelector("#more-ghost").addEventListener("click", toggleUndetectable);
promptEl.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  const text = promptEl.value.trim();
  if (!text) return;
  if (busy) {
    queueMessage(text);
    return;
  }
  if (sendEl.disabled) return;
  stopVoice();
  submit(false);
});
for (const name of ["terminals", "queue", "files"]) {
  document.querySelector(`#${name}-toggle`).addEventListener("click", () => {
    if (activityOpen === name) {
      activityDismissed.add(name);
      activityOpen = "";
    } else {
      activityDismissed.delete(name);
      activityOpen = name;
    }
    renderActivity();
    scheduleFit();
  });
}
document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("#more, #more-menu")) closeMore();
  if (activityOpen && !event.target.closest("#activity, #activity-panel")) {
    activityDismissed.add(activityOpen);
    activityOpen = "";
    renderActivity();
    scheduleFit();
  }
});
shellEl.addEventListener("dragenter", (event) => {
  if (!dragHasFiles(event)) return;
  event.preventDefault();
  dragDepth += 1;
  shellEl.classList.add("is-dropping");
});
shellEl.addEventListener("dragover", (event) => {
  if (!dragHasFiles(event)) return;
  event.preventDefault();
});
shellEl.addEventListener("dragleave", () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) shellEl.classList.remove("is-dropping");
});
shellEl.addEventListener("drop", (event) => {
  if (!dragHasFiles(event)) return;
  event.preventDefault();
  dragDepth = 0;
  shellEl.classList.remove("is-dropping");
  addDroppedItems(event.dataTransfer);
});
document.querySelector("#drag").addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  startDrag(event);
});

new ResizeObserver(() => scheduleFit()).observe(shellEl);

document.querySelector("#cursor-recheck").addEventListener("click", () => {
  refreshCursorReady().catch((error) => {
    detailEl.textContent = error.message;
  });
});
document.querySelector("#account-connect").addEventListener("click", () => {
  connectCursor().catch((error) => {
    document.querySelector("#account-note").textContent = error.message;
  });
});
document.querySelector("#cursor-connect").addEventListener("click", () => {
  connectCursor().catch((error) => {
    document.querySelector("#account-note").textContent = error.message;
  });
});

boot();

async function boot() {
  restoreTarget();
  await refreshCursorReady().catch(() => undefined);
  state = await api("/api/state");
  ideEl.replaceChildren(...state.ides.map((ide) => option(ide.ide, ide.label)));
  restoreTarget();
  renderInstallations();
  paintAccount(state.cursorKeyConfigured === true);
  renderWorkspaces();
  await refreshRoutes();
  try {
    const remote = await api("/api/settings");
    if (remote.revision > 1) applyRemoteSettings(remote);
    else {
      queueSettings({
        button: buttonColor,
        opacity: Number(opacityEl.value),
        detectable: localStorage.getItem("hooxie-ghost") !== "1",
        audio: true,
        session: localStorage.getItem("hooxie-ghost") === "1",
        language: "en",
        ...deliverySnapshot(),
      });
    }
    if (remote.lookReady !== true || remote.deliveryReady !== true) queueSettings(deliverySnapshot());
    applyArrows(remote.arrows === true);
  } catch {
    /* Settings sync needs the desktop server. */
  }
  if (localStorage.getItem("hooxie-ghost") === "1" && settingsRevision <= 1) {
    try {
      const result = await api("/api/widget/undetectable", { method: "POST", body: JSON.stringify({ enabled: true }) });
      renderUndetectable(result.enabled === true);
    } catch {
      renderUndetectable(false);
    }
  }
  renderPresets();
  scheduleFit();
  refreshUsage().catch(() => undefined);
}

const USAGE_RING = 2 * Math.PI * 14;

function paintUsage(percent, credits) {
  const value = Number.isFinite(percent) ? Math.max(0, Math.min(100, Math.round(percent))) : null;
  const ring = document.querySelector("#usage-ring");
  const label = document.querySelector("#usage-percent");
  const note = document.querySelector("#usage-note");
  const button = document.querySelector("#usage-toggle");
  const creditsBox = document.querySelector("#usage-credits");
  const creditsBalance = document.querySelector("#usage-credits-balance");
  const creditsExpire = document.querySelector("#usage-credits-expire");
  ring.style.strokeDasharray = String(USAGE_RING);
  ring.style.strokeDashoffset = String(value == null ? USAGE_RING : USAGE_RING * (1 - value / 100));
  label.textContent = value == null ? "–" : String(value);
  const title = value == null ? "Cursor usage" : `Cursor usage ${value}%`;
  button.title = title;
  button.setAttribute("aria-label", title);
  note.textContent = value == null ? "Cursor usage is not available yet." : `${value}% of included Cursor usage.`;
  const remaining = Number(credits?.remainingCents);
  const total = Number(credits?.totalCents);
  const hasCredits = Number.isFinite(remaining) && Number.isFinite(total) && total > 0;
  creditsBox.hidden = !hasCredits;
  if (hasCredits) {
    creditsBalance.textContent = `$${formatCents(remaining)}/$${formatCents(total)} remaining`;
    const expiresAt = Number(credits?.expiresAtMs);
    if (Number.isFinite(expiresAt) && expiresAt > 0) {
      creditsExpire.hidden = false;
      creditsExpire.textContent = `Credits expire on ${formatCreditDate(expiresAt)}.`;
    } else {
      creditsExpire.hidden = true;
      creditsExpire.textContent = "";
    }
  } else {
    creditsBalance.textContent = "";
    creditsExpire.textContent = "";
    creditsExpire.hidden = true;
  }
}

function formatCents(cents) {
  const dollars = Math.max(0, Number(cents) || 0) / 100;
  if (Number.isInteger(dollars)) return String(dollars);
  return dollars.toFixed(2).replace(/\.?0+$/, "");
}

function formatCreditDate(ms) {
  try {
    return new Date(ms).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

async function refreshUsage() {
  try {
    const body = await api("/api/cursor/usage");
    paintUsage(body.percent, body.credits);
  } catch {
    paintUsage(null, null);
  }
}

window.setInterval(() => {
  refreshUsage().catch(() => undefined);
}, 60000);

window.setHooxieBlur = (url) => {
  const plate = document.querySelector("#blur-plate");
  if (!plate) return;
  plate.style.backgroundImage = url ? `url("${url}")` : "";
};

async function applyBlur(enabled) {
  if (blurApplied === enabled) return;
  blurApplied = enabled;
  try {
    await api("/api/widget/blur", { method: "POST", body: JSON.stringify({ enabled }) });
  } catch {
    blurApplied = null;
  }
}

async function applyArrows(enabled) {
  const next = enabled === true;
  if (arrowsApplied === next) return;
  arrowsApplied = next;
  try {
    await api("/api/widget/arrows", { method: "POST", body: JSON.stringify({ enabled: next }) });
  } catch {
    arrowsApplied = null;
  }
}

async function refreshCursorReady() {
  const report = await api("/api/cursor/ready");
  cursorReady = report.ready === true;
  const gate = document.querySelector("#cursor-gate");
  const lead = document.querySelector("#cursor-lead");
  const list = document.querySelector("#cursor-steps");
  gate.hidden = cursorReady;
  lead.textContent = cursorReady
    ? "Cursor is ready."
    : "Hooxie sends every prompt through the Cursor app. Finish the open steps, then check again.";
  list.replaceChildren(...(report.steps || []).map((step) => {
    const item = document.createElement("li");
    item.classList.toggle("is-done", step.done === true);
    const title = document.createElement("strong");
    title.textContent = step.done ? `${step.title} — done` : step.title;
    const detail = document.createElement("span");
    detail.textContent = step.detail;
    item.append(title, detail);
    return item;
  }));
  renderRoute();
  scheduleFit();
}

function queueSettings(partial) {
  pendingSettings = { ...pendingSettings, ...partial };
  window.clearTimeout(settingsTimer);
  settingsTimer = window.setTimeout(async () => {
    const body = pendingSettings;
    pendingSettings = null;
    if (!body) return;
    try {
      const result = await api("/api/settings", { method: "POST", body: JSON.stringify(body) });
      settingsRevision = result.revision;
      audioEnabled = result.audio !== false;
      if (typeof result.chime === "string") chimeId = result.chime;
    } catch {
      /* The page also loads in a normal browser tab. */
    }
  }, 200);
}

function applyRemoteSettings(body) {
  settingsRevision = body.revision;
  applyingRemote = true;
  if (BUTTON_COLORS.includes(body.button)) buttonColor = body.button;
  if (Number.isFinite(Number(body.opacity))) opacityEl.value = String(body.opacity);
  if (body.lookReady === true) {
    blurEl.checked = body.blur === true;
    traceEl.checked = body.trace !== false;
  }
  audioEnabled = body.audio !== false;
  if (typeof body.chime === "string") chimeId = body.chime;
  applyArrows(body.arrows === true);
  applyLook(false);
  renderUndetectable(body.detectable === false);
  if (body.deliveryReady === true) applyDelivery(body);
  applyingRemote = false;
}

function deliverySnapshot() {
  return {
    lookReady: true,
    deliveryReady: true,
    blur: blurEl.checked,
    trace: traceEl.checked,
    ide: ideEl.value,
    installationId: installEl.value,
    project: projectEl.value,
    route: routeEl.value,
    instructions: document.querySelector("#instructions").value,
    files: filesEl.value,
    includePath: document.querySelector("#include-path").checked,
    includeStack: document.querySelector("#include-stack").checked,
    unsandboxed: document.querySelector("#unsandboxed").checked,
    experimental: document.querySelector("#experimental").checked,
  };
}

function publishDelivery() {
  if (applyingRemote) return;
  queueSettings(deliverySnapshot());
}

function applyDelivery(body) {
  const ide = typeof body.ide === "string" ? body.ide : "";
  if (ide && [...ideEl.options].some((item) => item.value === ide) && ideEl.value !== ide) {
    ideEl.value = ide;
    renderInstallations();
  }
  if (typeof body.installationId === "string" && [...installEl.options].some((item) => item.value === body.installationId)) {
    installEl.value = body.installationId;
  }
  if (typeof body.project === "string" && body.project !== projectEl.value) projectEl.value = body.project;
  if (typeof body.instructions === "string") document.querySelector("#instructions").value = body.instructions;
  if (typeof body.files === "string") filesEl.value = body.files;
  document.querySelector("#include-path").checked = body.includePath === true;
  document.querySelector("#include-stack").checked = body.includeStack === true;
  document.querySelector("#unsandboxed").checked = body.unsandboxed === true;
  document.querySelector("#experimental").checked = body.experimental === true;
  if (typeof body.route === "string" && body.route) routeEl.dataset.prefer = body.route;
  syncPickers();
  refreshRoutes();
  renderTarget();
}

window.onHooxieHotkey = async (name) => {
  if (name === "clear") {
    clearChat();
    return;
  }
  if (name === "session") {
    await toggleUndetectable();
    return;
  }
  if (name === "ask") await askAboutContext();
};

async function askAboutContext() {
  if (busy) return;
  if (!projectEl.value.trim()) {
    detailEl.textContent = "Choose a project folder before asking about the screen.";
    showOnly("chat");
    return;
  }
  if (!promptEl.value.trim()) promptEl.value = "What is on my screen right now?";
  if (listening) await stopVoice();
  syncAction();
  submit(false, { screen: true });
}

window.setInterval(async () => {
  try {
    const remote = await api("/api/settings");
    paintAccount(remote.cursorConnected === true);
    if (remote.revision !== settingsRevision) applyRemoteSettings(remote);
  } catch {
    /* Settings sync needs the desktop server. */
  }
}, 1500);

let connectingAccount = false;

function paintAccount(connected) {
  if (connectingAccount) return;
  state.cursorKeyConfigured = connected === true;
  const bar = document.querySelector("#account-bar");
  if (bar) bar.hidden = state.cursorKeyConfigured;
  const gateButton = document.querySelector("#cursor-connect");
  if (gateButton) gateButton.hidden = state.cursorKeyConfigured;
  const keyNote = document.querySelector("#key-note");
  if (keyNote) {
    keyNote.textContent = state.cursorKeyConfigured
      ? "Cursor is connected for this session."
      : "Press Connect Cursor. Sign-in opens in the browser. A pasted API key also works.";
  }
}

async function connectCursor() {
  if (connectingAccount || state.cursorKeyConfigured) return;
  connectingAccount = true;
  const buttons = [document.querySelector("#account-connect"), document.querySelector("#cursor-connect")];
  const note = document.querySelector("#account-note");
  for (const button of buttons) if (button) button.disabled = true;
  if (note) note.textContent = "Finish sign-in in the browser.";
  try {
    const result = await api("/api/cursor/connect", { method: "POST", body: "{}" });
    connectingAccount = false;
    paintAccount(result.connected === true);
  } catch (error) {
    connectingAccount = false;
    if (note) note.textContent = error.message;
    paintAccount(false);
    if (note) note.textContent = error.message;
  } finally {
    connectingAccount = false;
    for (const button of buttons) if (button) button.disabled = false;
  }
}

function option(value, label) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = label;
  return node;
}

function renderInstallations() {
  const matches = state.installations.filter((item) => item.ide === ideEl.value);
  installEl.replaceChildren(...matches.map((item) => option(item.id, item.label)));
  const show = matches.length > 0;
  installEl.hidden = !show;
  installLabel.hidden = !show;
  if (!show) installEl.replaceChildren(option("", "Not found on this machine"));
  syncPlaceholderLead();
  syncPickers();
}

function renderWorkspaces() {
  workspacesEl.replaceChildren();
  for (const session of state.sessions) {
    for (const workspace of session.workspaces) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${session.ide}: ${workspace.name}`;
      button.addEventListener("click", () => {
        ideEl.value = session.ide;
        projectEl.value = workspace.path;
        renderInstallations();
        touchDraft();
        refreshRoutes();
        publishDelivery();
      });
      workspacesEl.append(button);
    }
  }
}

async function refreshRoutes() {
  const project = projectEl.value.trim();
  if (!project) {
    routes = [];
    routeEl.replaceChildren(option("", "Enter a project folder"));
    syncPickers();
    renderRoute();
    return;
  }
  try {
    const body = await api(`/api/routes?ide=${encodeURIComponent(ideEl.value)}&projectPath=${encodeURIComponent(project)}`);
    routes = body.routes;
  } catch (error) {
    routes = [];
    routeNote.textContent = error.message;
  }
  const current = routeEl.dataset.prefer || routeEl.value;
  delete routeEl.dataset.prefer;
  routeEl.replaceChildren(...routes.map((route) => option(route.id, routeLabel(route))));
  const agent = routes.find((route) => route.id === "cursor-sdk");
  const recommended = routes.find((route) => route.recommended);
  if (ideEl.value === "cursor" && agent) routeEl.value = agent.id;
  else if (routes.some((route) => route.id === current)) routeEl.value = current;
  else if (recommended) routeEl.value = recommended.id;
  syncPickers();
  renderRoute();
}

function routeLabel(route) {
  const tag = route.available ? route.capabilities.stability : "unavailable";
  return `${route.label} (${tag})`;
}

function selectedRoute() {
  return routes.find((route) => route.id === routeEl.value);
}

function renderRoute() {
  const route = selectedRoute();
  const project = projectEl.value.trim();
  const directCursor = ideEl.value === "cursor";
  routeLabelEl.hidden = directCursor;
  routePickerEl.hidden = directCursor;
  document.querySelector("#sandbox-row").hidden = !route || route.id !== "cursor-sdk";
  document.querySelector("#experimental-row").hidden = !route || route.id !== "companion";
  const images = attachments.filter((item) => item.kind === "image").length;
  const screenOn = viewScreenEl.checked;
  const visual = images > 0 || screenOn;
  if (!route) {
    routeNote.textContent = project ? "" : "Choose an IDE and an existing project folder.";
    limitsEl.replaceChildren();
  } else if (route.id === "cursor-sdk") {
    routeNote.textContent = route.available
      ? ""
      : route.reason || "Add a Cursor API key so Hooxie can send this prompt to the Cursor agent.";
    limitsEl.replaceChildren();
  } else {
    const bits = [];
    if (!route.available && route.reason) bits.push(route.reason);
    if (route.id === "companion") {
      bits.push("Text placed in the chat input is not the agent accepting the prompt. Agent progress stays unavailable.");
    }
    if (route.id === "clipboard") {
      bits.push("Hooxie copies the prompt. You paste and submit it in the IDE.");
    }
    if (visual && !route.capabilities.images) bits.push("This route cannot carry a screenshot or other images.");
    routeNote.textContent = bits.join(" ");
    limitsEl.replaceChildren(...route.unsupported.map((item) => {
      const li = document.createElement("li");
      li.textContent = `Unsupported: ${item}`;
      return li;
    }));
  }
  sendBlocked = !cursorReady || !project || !route || !route.available || (visual && !route.capabilities.images);
  syncAction();
  renderTarget();
  rememberTarget();
}

function listedFiles() {
  return filesEl.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function renderTarget() {
  const project = projectEl.value.trim();
  const files = listedFiles();
  clearTarget.disabled = !project && files.length === 0;
  projectPathEl.dataset.empty = project ? "false" : "true";
  if (!project) {
    projectPathEl.textContent = "Project Path: none";
    projectPathEl.title = "Choose the folder Hooxie may modify";
  } else if (files.length === 1) {
    projectPathEl.textContent = `Project Path: ${project} · ${files[0]}`;
    projectPathEl.title = project;
  } else if (files.length > 1) {
    projectPathEl.textContent = `Project Path: ${project} · ${files.length} files`;
    projectPathEl.title = `${project}\n${files.join("\n")}`;
  } else {
    projectPathEl.textContent = `Project Path: ${project}`;
    projectPathEl.title = project;
  }
  renderThread();
}

function renderThread() {
  threadEl.replaceChildren();
  for (const message of thread) {
    if (message.role === "user") {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      if (message.previews?.length) {
        const row = document.createElement("div");
        row.className = "bubble-images";
        for (const preview of message.previews) {
          const src = typeof preview === "string" ? preview : preview.url;
          const name = typeof preview === "string" ? "Image" : preview.name || "Image";
          const img = document.createElement("img");
          img.src = src;
          img.alt = name;
          img.addEventListener("click", () => openViewer({ kind: "image", name, url: src }));
          row.append(img);
        }
        bubble.append(row);
      }
      const text = document.createElement("p");
      text.textContent = message.text;
      bubble.append(text);
      threadEl.append(bubble);
      continue;
    }
    const block = document.createElement("div");
    block.className = "reply";
    const who = document.createElement("p");
    who.className = "who";
    who.textContent = "Hooxie";
    const body = document.createElement("p");
    body.className = "reply-text";
    body.textContent = message.text;
    block.append(who, body);
    threadEl.append(block);
  }
  if (statusName !== "ready" && !terminal(statusName)) {
    const live = document.createElement("p");
    live.className = "live";
    live.textContent = LABELS[statusName] || statusName;
    if (statusName === "agent_working") {
      const dots = document.createElement("span");
      dots.className = "thinking";
      dots.setAttribute("aria-hidden", "true");
      dots.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
      live.append(dots);
    }
    threadEl.append(live);
  }
  threadEl.scrollTop = threadEl.scrollHeight;
}

function rememberTarget() {
  const project = projectEl.value.trim();
  if (!project) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ide: ideEl.value,
    project,
    route: routeEl.value,
    files: filesEl.value,
  }));
}

function restoreTarget() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved.project !== "string") return;
    if ([...ideEl.options].some((item) => item.value === saved.ide)) ideEl.value = saved.ide;
    projectEl.value = saved.project;
    if (typeof saved.files === "string") filesEl.value = saved.files;
    if (typeof saved.route === "string") routeEl.dataset.prefer = saved.route;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function touchDraft() {
  draftKey = crypto.randomUUID();
  retryEl.hidden = true;
}

function syncAction() {
  const text = promptEl.value.trim();
  const mode = busy ? "stop" : text ? "send" : "voice";
  const voiceOn = listening && mode === "voice";
  sendEl.classList.toggle("is-stop", mode === "stop");
  sendEl.classList.toggle("is-send", mode === "send");
  sendEl.classList.toggle("is-listening", voiceOn);
  sendEl.setAttribute("aria-pressed", String(voiceOn));
  sendEl.setAttribute("aria-label", mode === "stop" ? "Stop the agent" : mode === "send" ? "Send prompt" : voiceOn ? "Stop voice prompting" : "Prompt by voice");
  sendEl.title = mode === "stop" ? "Stop" : mode === "send" ? "Send" : voiceOn ? "Stop voice prompting" : "Prompt by voice";
  sendEl.disabled = mode === "send" && sendBlocked;
  if (busy && !text) promptEl.placeholder = "Queue a follow-up";
  syncTrace();
}

function promptFocused() {
  return widgetActive && document.activeElement === promptEl;
}

function syncTrace() {
  const live = traceEl.checked && (listening || promptFocused());
  frameEl.classList.toggle("is-live", live);
}

function applyVoiceText(spoken) {
  const said = spoken.trim();
  const next = voiceBase && said ? `${voiceBase} ${said}` : (said || voiceBase);
  if (next === promptEl.value) return;
  promptEl.value = next;
  syncAction();
}

function setVoiceOff() {
  listening = false;
  window.clearInterval(voiceTimer);
  voiceTimer = 0;
  syncAction();
}

async function stopVoice() {
  if (!listening && !voiceTimer) return;
  setVoiceOff();
  try {
    await api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "stop" }) });
  } catch {
    /* The recognizer is already stopped. */
  }
  if (!promptEl.value && document.activeElement !== promptEl) startPlaceholder();
}

async function toggleVoice() {
  if (listening) {
    await stopVoice();
    return;
  }
  if (!cursorReady) {
    sendEl.title = "Finish the Cursor steps before prompting.";
    detailEl.textContent = "Finish the Cursor steps before prompting.";
    return;
  }
  if (!audioEnabled) {
    sendEl.title = "Turn on the microphone in the dashboard.";
    detailEl.textContent = "Turn on the microphone in the dashboard.";
    return;
  }
  listening = true;
  voiceBase = promptEl.value.trim();
  syncAction();
  stopPlaceholder();
  try {
    const state = await api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "start" }) });
    if (!listening) {
      await api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "stop" }) });
      return;
    }
    if (state.error) throw new Error(state.error);
    applyVoiceText(state.text);
    voiceTimer = window.setInterval(pollVoice, 280);
  } catch (error) {
    setVoiceOff();
    const message = error.message || "Voice prompting could not start.";
    sendEl.title = message;
    detailEl.textContent = message;
    if (!promptEl.value) startPlaceholder();
  }
}

async function pollVoice() {
  if (!listening || voicePollFlight) return;
  voicePollFlight = true;
  try {
    const state = await api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "poll" }) });
    if (!listening) return;
    if (state.error) throw new Error(state.error);
    applyVoiceText(state.text);
    if (!state.listening) await stopVoice();
  } catch (error) {
    if (!listening) return;
    setVoiceOff();
    const message = error.message || "Voice prompting stopped.";
    sendEl.title = message;
    detailEl.textContent = message;
  } finally {
    voicePollFlight = false;
  }
}

async function submit(retry, options = {}) {
  if (!cursorReady) {
    await refreshCursorReady();
    if (!cursorReady) {
      setStatus("failed", "Finish the Cursor steps above before sending.");
      return;
    }
  }
  const route = selectedRoute();
  const project = projectEl.value.trim();
  if (!route || !project) return;
  const text = (retry ? lastPrompt : promptEl.value).trim();
  if (!text) return;
  busy = true;
  stopRequested = false;
  syncAction();
  if (!retry && (options.screen === true || viewScreenEl.checked)) {
    setStatus("sending", "Capturing the screen.");
    try {
      lastScreenImage = await captureScreen();
    } catch (error) {
      lastScreenImage = null;
      clearBusy();
      setStatus("failed", error.message);
      renderRoute();
      return;
    }
    if (stopRequested) {
      clearBusy();
      setStatus("ready", "Stopped before the prompt was sent.");
      return;
    }
  } else if (!retry) {
    lastScreenImage = null;
  }
  const screenImage = lastScreenImage;
  if (!retry) {
    stopVoice();
    lastPrompt = text;
    inflightImageIds = attachments.map((item) => item.id);
    const previews = [
      ...(screenImage ? [{ kind: "image", name: "Current screen", url: `data:${screenImage.mimeType};base64,${screenImage.data}` }] : []),
      ...attachments.filter((item) => item.kind === "image").map((item) => ({ kind: "image", name: item.name, url: item.url })),
    ];
    thread.push({ role: "user", text, previews });
    promptEl.value = "";
    syncAction();
    renderedReply = "";
    renderThread();
    showOnly("chat");
  }
  setStatus("sending", retry ? "Retrying the same submission." : "Preparing the prompt.");
  try {
    const images = [...(screenImage ? [screenImage] : []), ...(await readImages())];
    const delivery = await api("/api/deliveries", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: draftKey,
        routeId: route.id,
        ide: ideEl.value,
        projectPath: project,
        prompt: text,
        additionalInstructions: document.querySelector("#instructions").value,
        includeProjectPath: document.querySelector("#include-path").checked,
        includeStackMarkers: document.querySelector("#include-stack").checked,
        includeScreen: Boolean(screenImage),
        files: listedFiles(),
        uploads: readUploads(),
        images,
        allowUnsandboxed: document.querySelector("#unsandboxed").checked,
        experimentalSubmit: document.querySelector("#experimental").checked,
        confirmDestination: true,
        retry,
      }),
    });
    deliveryId = delivery.id;
    if (stopRequested && delivery.canCancel && !terminal(delivery.status)) {
      show(await api(`/api/deliveries/${delivery.id}/cancel`, { method: "POST" }));
    } else {
      if (stopRequested && terminal(delivery.status)) stopRequested = false;
      show(delivery);
      if (!terminal(delivery.status)) poll();
    }
  } catch (error) {
    clearBusy();
    setStatus("failed", error.message);
    renderRoute();
  }
}

function poll() {
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    if (!deliveryId) return;
    try {
      const delivery = await api(`/api/deliveries/${deliveryId}`);
      show(delivery);
      if (terminal(delivery.status)) clearInterval(pollTimer);
    } catch (error) {
      setStatus("disconnected", error.message);
      clearInterval(pollTimer);
    }
  }, 800);
}

function show(delivery) {
  const stopped = stopRequested;
  setStatus(delivery.status, `${delivery.detail} Destination: ${delivery.destination}`);
  retryEl.hidden = !delivery.retryable;
  cancelEl.hidden = !delivery.canCancel;
  if (Array.isArray(delivery.terminals)) {
    sessionTerminals = delivery.terminals.filter((item) => item && item.status === "running" && typeof item.command === "string");
  }
  if (Array.isArray(delivery.files)) {
    for (const file of delivery.files) {
      if (!file || typeof file.path !== "string") continue;
      const kind = file.kind === "added" || file.kind === "deleted" ? file.kind : "modified";
      const next = { path: file.path, kind };
      const index = sessionFiles.findIndex((item) => item.path === next.path);
      if (index >= 0) sessionFiles[index] = next;
      else sessionFiles.push(next);
    }
  }
  renderActivity();
  if (terminal(delivery.status)) clearBusy();
  else syncAction();
  if (terminal(delivery.status) && delivery.status !== "failed" && inflightImageIds.length) {
    const drop = new Set(inflightImageIds);
    attachments = attachments.filter((item) => !drop.has(item.id));
    inflightImageIds = [];
    renderAttachments();
  }
  if (delivery.responseVerified && delivery.responseText) {
    resultEl.hidden = false;
    resultEl.textContent = delivery.responseText;
    const key = `${delivery.id}:${delivery.responseText}`;
    if (renderedReply !== key) {
      renderedReply = key;
      thread.push({ role: "agent", text: delivery.responseText, ide: ideLabel() });
    }
    showOnly("chat");
  } else if (terminal(delivery.status) && delivery.detail) {
    resultEl.hidden = true;
    resultEl.textContent = "";
    const key = `${delivery.id}:${delivery.status}:${delivery.detail}`;
    if (renderedReply !== key) {
      renderedReply = key;
      thread.push({ role: "agent", text: delivery.detail, ide: ideLabel() });
    }
    showOnly("chat");
  } else {
    resultEl.hidden = true;
    resultEl.textContent = "";
  }
  renderThread();
  scheduleFit();
  if (terminal(delivery.status) && !stopped) void drainQueue();
}

function ideLabel() {
  return ideEl.selectedOptions[0]?.textContent || "Cursor";
}

const PLACEHOLDER_EXAMPLES = [
  "What does this code do?",
  "How do I fix this bug?",
  "Can you add a test?",
  "Why is this failing?",
  "How can I simplify this?",
];

let placeholderIndex = 0;
let placeholderPhase = "in";
let placeholderIde = "";
let placeholderTimer = 0;
let widgetActive = true;

function placeholderPhrases() {
  return [`Prompt ${ideLabel()} anything.`, ...PLACEHOLDER_EXAMPLES];
}

function setPlaceholderFade(value) {
  promptEl.style.setProperty("--placeholder-fade", String(value));
}

function syncPlaceholderLead() {
  const label = ideLabel();
  if (label === placeholderIde) return;
  placeholderIde = label;
  if (placeholderIndex !== 0) return;
  placeholderPhase = "in";
}

function stopPlaceholder() {
  window.clearTimeout(placeholderTimer);
  placeholderTimer = 0;
  setPlaceholderFade(1);
  promptEl.placeholder = "";
}

function startPlaceholder() {
  if (!widgetActive || busy) return;
  window.clearTimeout(placeholderTimer);
  placeholderPhase = "in";
  tickPlaceholder();
}

function leaveTypingMode() {
  const focused = document.activeElement;
  if (focused && focused !== document.body && typeof focused.blur === "function") focused.blur();
  promptEl.blur();
  syncTrace();
}

function onWidgetActive(active) {
  widgetActive = active;
  if (!active) {
    leaveTypingMode();
    stopPlaceholder();
    if (listening) stopVoice();
    return;
  }
  syncTrace();
  if (!promptEl.value && document.activeElement !== promptEl && !listening) startPlaceholder();
}

window.onWidgetActive = onWidgetActive;
window.addEventListener("blur", () => onWidgetActive(false));
window.addEventListener("focus", () => onWidgetActive(true));

let focusFlight = false;
window.setInterval(async () => {
  if (focusFlight) return;
  focusFlight = true;
  try {
    const state = await api("/api/widget/focus", { method: "POST", body: "{}" });
    const active = state.active !== false;
    if (active !== widgetActive) onWidgetActive(active);
  } catch {
    /* The page also loads in a normal browser tab. */
  } finally {
    focusFlight = false;
  }
}, 300);

function tickPlaceholder() {
  if (busy) {
    stopPlaceholder();
    if (!promptEl.value) promptEl.placeholder = "Queue a follow-up";
    return;
  }
  if (!widgetActive || document.activeElement === promptEl || promptEl.value) {
    stopPlaceholder();
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phrases = placeholderPhrases();
  const phrase = phrases[placeholderIndex % phrases.length];
  let delay = 2200;

  if (reduced) {
    setPlaceholderFade(1);
    promptEl.placeholder = phrase;
    placeholderIndex = (placeholderIndex + 1) % phrases.length;
    delay = 2800;
  } else if (placeholderPhase === "in") {
    promptEl.placeholder = phrase;
    setPlaceholderFade(0);
    void promptEl.offsetWidth;
    setPlaceholderFade(1);
    placeholderPhase = "hold";
    delay = 2200;
  } else if (placeholderPhase === "hold") {
    setPlaceholderFade(0);
    placeholderPhase = "out";
    delay = 500;
  } else {
    placeholderIndex = (placeholderIndex + 1) % phrases.length;
    placeholderPhase = "in";
    delay = 40;
  }

  placeholderTimer = window.setTimeout(tickPlaceholder, delay);
}

syncPlaceholderLead();
tickPlaceholder();

function clearBusy() {
  busy = false;
  stopRequested = false;
  syncAction();
  if (!promptEl.value && widgetActive && document.activeElement !== promptEl) startPlaceholder();
}

function queueMessage(text) {
  promptQueue.push({ id: crypto.randomUUID(), text });
  promptEl.value = "";
  syncAction();
  renderActivity();
  scheduleFit();
}

async function drainQueue() {
  if (draining || busy || !promptQueue.length) return;
  if (!selectedRoute() || !projectEl.value.trim()) return;
  draining = true;
  const next = promptQueue.shift();
  renderActivity();
  touchDraft();
  promptEl.value = next.text;
  try {
    await submit(false);
  } finally {
    draining = false;
  }
}

function renderActivity() {
  const running = sessionTerminals.filter((item) => item.status === "running");
  const rowsByName = { terminals: running, queue: promptQueue, files: sessionFiles };
  const labels = { terminals: "Terminals", queue: "Queued", files: "Files" };
  const order = ["files", "terminals", "queue"];
  for (const name of order) {
    if (!rowsByName[name].length) activityDismissed.delete(name);
  }
  if (activityOpen && !rowsByName[activityOpen].length) activityOpen = "";
  if (!activityOpen) {
    activityOpen = order.find((name) => rowsByName[name].length && !activityDismissed.has(name)) || "";
  }
  document.querySelector("#activity").hidden = order.every((name) => !rowsByName[name].length);
  for (const name of Object.keys(labels)) {
    const button = document.querySelector(`#${name}-toggle`);
    const count = rowsByName[name].length;
    button.hidden = count === 0;
    button.textContent = count ? `${labels[name]} ${count}` : labels[name];
    button.setAttribute("aria-expanded", String(activityOpen === name));
  }
  const panel = document.querySelector("#activity-panel");
  panel.hidden = activityOpen === "";
  panel.replaceChildren();
  if (!activityOpen) return;
  const rows = rowsByName[activityOpen];
  for (const item of rows) {
    const row = document.createElement("div");
    row.className = "activity-item";
    const text = document.createElement("p");
    if (activityOpen === "terminals") {
      text.textContent = item.command;
      text.title = item.command;
      row.append(text);
    } else if (activityOpen === "queue") {
      text.textContent = item.text;
      text.title = item.text;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        promptQueue = promptQueue.filter((entry) => entry.id !== item.id);
        renderActivity();
        scheduleFit();
      });
      row.append(text, remove);
    } else {
      const kind = item.kind === "added" ? "Added" : item.kind === "deleted" ? "Deleted" : "Modified";
      text.textContent = `${kind} ${item.path}`;
      text.title = item.path;
      row.append(text);
    }
    panel.append(row);
  }
}

async function stopAgent() {
  if (stopRequested) return;
  if (!busy && !deliveryId) return;
  stopRequested = true;
  if (!deliveryId) return;
  try {
    show(await api(`/api/deliveries/${deliveryId}/cancel`, { method: "POST" }));
  } catch (error) {
    stopRequested = false;
    detailEl.textContent = error.message || "The agent could not be stopped.";
  }
}

async function openIde() {
  try {
    const installationId = installEl.value;
    if (!installationId) {
      detailEl.textContent = "Hooxie could not find that IDE on this machine.";
      return;
    }
    const body = await api("/api/open", {
      method: "POST",
      body: JSON.stringify({ installationId, projectPath: projectEl.value.trim() }),
    });
    detailEl.textContent = body.detail;
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

async function saveKey() {
  try {
    await api("/api/key", {
      method: "POST",
      body: JSON.stringify({
        apiKey: document.querySelector("#api-key").value,
        remember: document.querySelector("#remember-key").checked,
      }),
    });
    document.querySelector("#api-key").value = "";
    paintAccount(true);
    await refreshRoutes();
  } catch (error) {
    document.querySelector("#key-note").textContent = error.message;
  }
}

async function browseFolder() {
  try {
    const body = await api("/api/browse", {
      method: "POST",
      body: JSON.stringify({ initialPath: projectEl.value.trim() }),
    });
    if (!body.path) return;
    projectEl.value = body.path;
    touchDraft();
    await refreshRoutes();
    publishDelivery();
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

function closeMore() {
  const menu = document.querySelector("#more-menu");
  if (menu.hidden) return;
  menu.hidden = true;
  document.querySelector("#more").setAttribute("aria-expanded", "false");
  scheduleFit();
}

function renderUndetectable(enabled) {
  const button = document.querySelector("#more-ghost");
  const note = document.querySelector("#more-ghost-note");
  button.setAttribute("aria-pressed", String(enabled));
  note.textContent = enabled
    ? "On. You can see Hooxie. Screen share and recordings cannot."
    : "Hidden from screen share and recordings";
  localStorage.setItem("hooxie-ghost", enabled ? "1" : "0");
}

async function hideHooxie() {
  closeMore();
  try {
    await api("/api/widget/visible", { method: "POST", body: JSON.stringify({ shown: false }) });
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

function clearChat() {
  thread = [];
  renderedReply = "";
  promptQueue = [];
  sessionTerminals = [];
  sessionFiles = [];
  activityOpen = "";
  activityDismissed = new Set();
  resultEl.hidden = true;
  resultEl.textContent = "";
  renderThread();
  renderActivity();
  closeMore();
}

async function moveHooxie() {
  closeMore();
  try {
    await api("/api/widget/follow", { method: "POST", body: "{}" });
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

async function toggleUndetectable() {
  const next = document.querySelector("#more-ghost").getAttribute("aria-pressed") !== "true";
  try {
    const result = await api("/api/widget/undetectable", { method: "POST", body: JSON.stringify({ enabled: next }) });
    renderUndetectable(result.enabled === true);
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

function togglePanel(next) {
  showOnly(panel === next ? "none" : next);
}

function showOnly(which) {
  const menu = document.querySelector("#more-menu");
  const viewer = document.querySelector("#viewer");
  menu.hidden = which !== "more";
  document.querySelector("#more").setAttribute("aria-expanded", String(which === "more"));
  if (which !== "viewer") {
    viewingId = null;
    viewer.hidden = true;
    document.querySelector("#viewer-body").replaceChildren();
  }
  panel = which === "chat" || which === "presets" || which === "usage" ? which : "none";
  chatEl.hidden = panel !== "chat";
  presetsEl.hidden = panel !== "presets";
  document.querySelector("#usage").hidden = panel !== "usage";
  chatToggle.setAttribute("aria-expanded", String(panel === "chat"));
  presetToggle.setAttribute("aria-expanded", String(panel === "presets"));
  document.querySelector("#usage-toggle").setAttribute("aria-expanded", String(panel === "usage"));
  shellEl.classList.toggle("is-open", panel !== "none");
  if (panel === "chat") threadEl.scrollTop = threadEl.scrollHeight;
  scheduleFit();
}

const PRESET_KEY = "hooxie-presets";

function readPresets() {
  try {
    const list = JSON.parse(localStorage.getItem(PRESET_KEY) || "[]");
    return Array.isArray(list) ? list.filter((item) => item && typeof item.text === "string" && typeof item.name === "string") : [];
  } catch {
    return [];
  }
}

function renderPresets() {
  const list = document.querySelector("#preset-list");
  list.replaceChildren(...readPresets().map((preset) => {
    const row = document.createElement("div");
    row.className = "preset";
    const name = document.createElement("strong");
    name.textContent = preset.name;
    name.title = preset.text;
    const use = document.createElement("button");
    use.type = "button";
    use.textContent = "Use";
    use.addEventListener("click", () => {
      promptEl.value = preset.text;
      stopPlaceholder();
      syncAction();
      showOnly("none");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      localStorage.setItem(PRESET_KEY, JSON.stringify(readPresets().filter((item) => item.id !== preset.id)));
      renderPresets();
    });
    row.append(name, use, remove);
    return row;
  }));
}

function savePreset() {
  const text = document.querySelector("#preset-text").value.trim();
  if (!text) {
    document.querySelector("#preset-text").focus();
    return;
  }
  const typedName = document.querySelector("#preset-name").value.trim();
  const name = typedName || text.split("\n")[0].slice(0, 42);
  const next = [{ id: crypto.randomUUID(), name, text }, ...readPresets()].slice(0, 40);
  localStorage.setItem(PRESET_KEY, JSON.stringify(next));
  document.querySelector("#preset-name").value = "";
  document.querySelector("#preset-text").value = "";
  renderPresets();
}

function scheduleFit() {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(fitWindow, 16);
}

let fitFlight = false;
let fitQueued = false;

async function fitWindow() {
  if (fitFlight) {
    fitQueued = true;
    return;
  }
  fitFlight = true;
  try {
    const box = frameEl.getBoundingClientRect();
    const width = Math.ceil(box.width) || FRAME_WIDTH;
    const height = Math.ceil(box.height);
    await api("/api/widget/frame", {
      method: "POST",
      body: JSON.stringify({ width, height }),
    });
  } catch {
    /* The page also loads in a normal browser tab. */
  } finally {
    fitFlight = false;
    if (fitQueued) {
      fitQueued = false;
      fitWindow();
    }
  }
}

function startDrag(event) {
  if (event.button !== 0) return;
  shellEl.setPointerCapture(event.pointerId);
  let dragDx = 0;
  let dragDy = 0;
  let dragFrame = 0;
  const headers = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
  const flushDrag = () => {
    dragFrame = 0;
    if (!dragDx && !dragDy) return;
    const body = JSON.stringify({ dx: dragDx, dy: dragDy });
    dragDx = 0;
    dragDy = 0;
    fetch("/api/widget/move", { method: "POST", headers, body }).catch(() => undefined);
  };
  const move = (next) => {
    dragDx += next.movementX;
    dragDy += next.movementY;
    if (dragFrame) return;
    dragFrame = requestAnimationFrame(flushDrag);
  };
  const end = () => {
    shellEl.removeEventListener("pointermove", move);
    shellEl.removeEventListener("pointerup", end);
    shellEl.removeEventListener("pointercancel", end);
    if (dragFrame) cancelAnimationFrame(dragFrame);
    flushDrag();
  };
  shellEl.addEventListener("pointermove", move);
  shellEl.addEventListener("pointerup", end);
  shellEl.addEventListener("pointercancel", end);
}

function setStatus(stateName, detail) {
  const finished = statusName !== "ready" && !terminal(statusName) && terminal(stateName);
  statusName = stateName;
  statusEl.dataset.state = stateName;
  statusEl.textContent = LABELS[stateName] || stateName;
  if (detail) detailEl.textContent = detail;
  renderTarget();
  if (finished) playChime();
}

const CHIME_FILES = {
  blushing: "blushing-sound.mp3",
  "xtreme-bass": "xtreme-bass-effect.mp3",
  undertaker: "undertaker-cloche.mp3",
  ekh: "ekh.mp3",
  "cat-choke": "cat-choke.mp3",
};

async function playChime() {
  if (!chimeId || chimeId === "off") return;
  try {
    let src = "";
    if (chimeId === "custom") {
      const response = await fetch("/api/chime", { headers: { authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      src = URL.createObjectURL(await response.blob());
    } else if (CHIME_FILES[chimeId]) {
      src = `/sounds/${CHIME_FILES[chimeId]}`;
    } else {
      return;
    }
    if (chimeAudio) chimeAudio.pause();
    const audio = new Audio(src);
    chimeAudio = audio;
    audio.addEventListener("ended", () => {
      if (src.startsWith("blob:")) URL.revokeObjectURL(src);
    }, { once: true });
    await audio.play();
  } catch {
    /* A missing file or a blocked playback stays quiet. */
  }
}

function terminal(stateName) {
  return ["delivered", "awaiting_user_action", "completed", "failed", "disconnected", "status_unavailable"].includes(stateName);
}

function readImages() {
  return attachments
    .filter((item) => item.kind === "image")
    .map((item) => ({ data: item.data, mimeType: item.mimeType }));
}

function readUploads() {
  return attachments
    .filter((item) => item.kind !== "image")
    .map((item) => ({
      name: item.name,
      content: item.text || `(Attached file ${item.name}. Its contents were not inlined.)`,
    }));
}

async function captureScreen() {
  const shot = await api("/api/widget/screen", { method: "POST", body: "{}" });
  if (!shot?.data || shot.mimeType !== "image/jpeg") {
    throw new Error("The screen could not be captured.");
  }
  return { data: shot.data, mimeType: shot.mimeType };
}

function dragHasFiles(event) {
  return [...(event.dataTransfer?.types || [])].includes("Files");
}

function extensionOf(name) {
  const base = String(name).split(/[/\\]/).pop() || "";
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : "";
}

function extToMime(ext) {
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function isSensitiveName(name) {
  const base = String(name).split(/[/\\]/).pop().toLowerCase();
  if (SENSITIVE_NAMES.has(base) || base.startsWith(".env")) return true;
  return /\.(pem|p12|pfx|key|kdbx)$/i.test(base);
}

function looksSecret(text) {
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text) || /\bAKIA[0-9A-Z]{16}\b/.test(text);
}

function classifyFile(file) {
  const ext = extensionOf(file.name);
  const type = (file.type || "").toLowerCase();
  if (IMAGE_TYPES.has(type) || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (
    type.startsWith("text/") ||
    type === "application/json" ||
    type === "application/javascript" ||
    type === "application/xml" ||
    type === "image/svg+xml" ||
    TEXT_EXT.has(ext)
  ) return "text";
  return "file";
}

async function addFileList(fileList) {
  const notes = [];
  for (const file of fileList) {
    const result = await addFile(file, file.webkitRelativePath || file.name);
    if (result !== "ok") notes.push(result);
  }
  finishAdd(notes);
}

async function addDroppedItems(dataTransfer) {
  const items = [...(dataTransfer.items || [])];
  const entries = items.map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
  if (!entries.length) {
    await addFileList(dataTransfer.files);
    return;
  }
  const notes = [];
  for (const entry of entries) await addEntry(entry, "", notes);
  finishAdd(notes);
}

async function addEntry(entry, prefix, notes) {
  if (attachments.length >= MAX_UPLOADS) {
    notes.push("limit");
    return;
  }
  if (entry.isFile) {
    const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
    const result = await addFile(file, prefix + entry.name);
    if (result !== "ok") notes.push(result);
    return;
  }
  if (!entry.isDirectory || SKIP_DIRS.has(entry.name)) return;
  const children = await readAllEntries(entry.createReader());
  for (const child of children) await addEntry(child, `${prefix}${entry.name}/`, notes);
}

function readAllEntries(reader) {
  return new Promise((resolve, reject) => {
    const all = [];
    const read = () => {
      reader.readEntries((batch) => {
        if (!batch.length) resolve(all);
        else {
          all.push(...batch);
          read();
        }
      }, reject);
    };
    read();
  });
}

async function addFile(file, name = file.name) {
  if (attachments.length >= MAX_UPLOADS) return "limit";
  if (isSensitiveName(name)) return "sensitive";
  const kind = classifyFile(file);
  if (kind === "image") {
    if (file.size > 4_000_000) return "large";
    const mimeType = IMAGE_TYPES.has(file.type) ? file.type : extToMime(extensionOf(name));
    attachments.push({
      id: crypto.randomUUID(),
      kind: "image",
      name,
      mimeType,
      data: bufferToBase64(await file.arrayBuffer()),
      url: URL.createObjectURL(file),
    });
    return "ok";
  }
  if (kind === "text") {
    if (file.size > 200_000) return "large";
    const text = await file.text();
    if (text.includes("\u0000") || looksSecret(text)) return text.includes("\u0000") ? "binary" : "sensitive";
    attachments.push({
      id: crypto.randomUUID(),
      kind: "text",
      name,
      mimeType: file.type || "text/plain",
      text,
      url: URL.createObjectURL(file),
    });
    return "ok";
  }
  attachments.push({
    id: crypto.randomUUID(),
    kind: "file",
    name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    url: URL.createObjectURL(file),
  });
  return "ok";
}

function finishAdd(notes) {
  renderAttachments();
  touchDraft();
  renderRoute();
  if (notes.includes("sensitive")) detailEl.textContent = "A sensitive file was left out.";
  else if (notes.includes("large")) detailEl.textContent = "A file was left out because it is over the size limit.";
  else if (notes.includes("limit")) detailEl.textContent = `Only the first ${MAX_UPLOADS} files were attached.`;
}

let viewingId = null;

function openViewer(item) {
  const id = item.id || item.url || item.name;
  if (viewingId === id) {
    closeViewer();
    return;
  }
  viewingId = id;
  const panel = document.querySelector("#viewer");
  const body = document.querySelector("#viewer-body");
  document.querySelector("#viewer-name").textContent = item.name.split(/[/\\]/).pop() || item.name;
  body.replaceChildren();
  body.className = "";
  if (item.kind === "image") {
    body.classList.add("is-image");
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.name;
    body.append(img);
  } else if (isHtmlFile(item)) {
    body.classList.add("is-page");
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.srcdoc = item.text || "";
    frame.title = item.name;
    body.append(frame);
  } else if (item.kind === "text") {
    body.classList.add("is-text");
    const pre = document.createElement("pre");
    pre.textContent = item.text || "";
    body.append(pre);
  } else {
    const note = document.createElement("p");
    note.className = "viewer-meta";
    const size = typeof item.size === "number" ? `${Math.max(1, Math.round(item.size / 1024))} KB` : "preview unavailable";
    note.textContent = `${item.name} · ${item.mimeType || "file"} · ${size}`;
    body.append(note);
  }
  panel.hidden = false;
  showOnly("viewer");
}

function isHtmlFile(item) {
  const base = String(item.name || "").split(/[/\\]/).pop() || "";
  const type = String(item.mimeType || "").toLowerCase();
  return type === "text/html" || /\.html?$/i.test(base);
}

function closeViewer() {
  viewingId = null;
  document.querySelector("#viewer").hidden = true;
  document.querySelector("#viewer-body").replaceChildren();
  scheduleFit();
}

function renderAttachments() {
  attachmentsEl.replaceChildren();
  pillEl.classList.toggle("has-files", attachments.length > 0);
  const add = document.querySelector("#add");
  add.title = attachments.length
    ? `${attachments.length} file${attachments.length === 1 ? "" : "s"} attached. Add more.`
    : "Add any file, or drop a folder. Right-click to choose a folder.";
  if (viewingId && !attachments.some((item) => item.id === viewingId)) closeViewer();
  for (const item of attachments) {
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.tabIndex = 0;
    thumb.title = `View ${item.name}`;
    if (item.kind === "image") {
      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.name;
      thumb.append(img);
    } else {
      const chip = document.createElement("span");
      chip.className = "thumb-file";
      const ext = document.createElement("span");
      ext.className = "thumb-ext";
      ext.textContent = (extensionOf(item.name) || "file").slice(0, 4).toUpperCase();
      const label = document.createElement("span");
      label.className = "thumb-name";
      label.textContent = item.name.split(/[/\\]/).pop();
      chip.append(ext, label);
      thumb.append(chip);
    }
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "thumb-remove";
    remove.setAttribute("aria-label", `Remove ${item.name}`);
    remove.textContent = "×";
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      attachments = attachments.filter((entry) => entry.id !== item.id);
      renderAttachments();
      touchDraft();
      renderRoute();
    });
    const show = () => openViewer(item);
    thumb.addEventListener("click", show);
    thumb.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      show();
    });
    thumb.append(remove);
    attachmentsEl.append(thumb);
  }
  scheduleFit();
}

function syncPickers() {
  for (const select of [ideEl, installEl, routeEl]) syncPicker(select);
}

function syncPicker(select) {
  const group = document.querySelector(`.choices[data-for="${select.id}"]`);
  if (!group) return;
  group.hidden = select.hidden;
  const options = [...select.options];
  if (options.length === 0 || (options.length === 1 && options[0].value === "")) {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = options[0]?.textContent || "Choose";
    group.replaceChildren(note);
    return;
  }
  group.replaceChildren(...options.filter((opt) => opt.value !== "").map((opt) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "choice";
    item.setAttribute("role", "radio");
    item.setAttribute("aria-checked", String(opt.value === select.value));
    const mark = document.createElement("i");
    mark.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.textContent = opt.textContent;
    item.append(mark, text);
    item.addEventListener("click", () => {
      if (select.value === opt.value) return;
      select.value = opt.value;
      select.dispatchEvent(new Event("change"));
      syncPicker(select);
    });
    return item;
  }));
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function api(pathname, init = {}) {
  const response = await fetch(pathname, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}
