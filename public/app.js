const token = document.querySelector('meta[name="z-token"]').content;
const ADVANCED_KEY = "hooxie-advanced";
const SHELL_WIDTH = 440;
const ADVANCED_SHELL = 560;
const ADVANCED_TOOLS = ["files", "changes", "terminal", "details", "look"];
let advanced = localStorage.getItem(ADVANCED_KEY) === "1";
let advancedTool = ADVANCED_TOOLS.includes(localStorage.getItem("hooxie-advanced-tool") || "")
  ? localStorage.getItem("hooxie-advanced-tool")
  : "files";
fetch("/api/widget/frame", {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({ width: frameWidth(), height: 480 }),
}).catch(() => undefined);
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
const threadEl = document.querySelector("#thread");
const projectPathEl = document.querySelector("#project-path");
const viewScreenEl = document.querySelector("#view-screen");
const contextBarEl = document.querySelector("#context-bar");
const clearTarget = document.querySelector("#clear-target");
const promptEl = document.querySelector("#prompt");
const promptGhostEl = document.querySelector("#prompt-ghost");
const filesEl = document.querySelector("#files");
const imagesEl = document.querySelector("#images");
const folderEl = document.querySelector("#folder");
const shellEl = document.querySelector("#shell");
const frameEl = document.querySelector("#frame");
const pillEl = document.querySelector("#pill");
queueMicrotask(() => scheduleFit());
const attachmentsEl = document.querySelector("#attachments");

const STORAGE_KEY = "hooxie-target";
const LOOK_KEY = "hooxie-look";
const BUTTON_COLORS = ["#ffffff", "#4d9fff", "#3ddc97", "#ff8a3d", "#ff5d8f", "#b07bff", "#ffe14a", "#ff4d4d", "#3ee0d2"];
const opacityEl = document.querySelector("#opacity");
const opacityValueEl = document.querySelector("#opacity-value");
const traceEl = document.querySelector("#trace-toggle");
const swatchEls = [...document.querySelectorAll(".swatch")];
let buttonColor = "#ffffff";
let widgetMode = "dark";

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
let fitInstant = false;
let chatDrag = false;
let panel = "none";
let thread = [];
let renderedReply = "";
let lastPrompt = "";
let sendBlocked = true;
let cursorReady = false;
let setupReady = false;
let setupFlight = false;
let setupQueued = false;
let setupWizard = "";
let setupReport = null;
const SETUP_CHAPTERS = ["ide", "pay"];
let busy = false;
let stopRequested = false;
let promptQueue = [];
let sessionTerminals = [];
let sessionFiles = [];
let agentThought = "";
let agentCommand = "";
let activityOpen = "";
let activityDismissed = new Set();
let draining = false;
let listening = false;
let traceLive = false;
const TRACE_SPIN_MS = 2600;
let traceStopping = false;
let traceParked = true;
let traceStopFrom = 0;
let traceStopStarted = 0;
let promptBlurred = false;
let voiceTimer = 0;
let voicePollFlight = false;
let voiceBase = "";
let attachments = [];
let attachNote = "";
let inflightImageIds = [];
let lastScreenImage = null;
let audioEnabled = true;
let voiceActivation = false;
let voiceMode = "off";
let voiceRearm = true;
let voiceSending = false;
let voiceCueOpen = false;
let voiceCueTimer = 0;
let voiceWakeAt = 0;
let chimeId = "blushing";
let openSound = "notification";
let closeSound = "pluck-off";
let chimeAudio = null;
let arrowsApplied = null;
let dragDepth = 0;
let widgetActive = true;
let viewingId = null;
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
  const light = widgetMode === "light";
  document.documentElement.dataset.widget = light ? "light" : "dark";
  const wash = opacity / 100;
  document.documentElement.style.setProperty("--glass", light ? `rgba(255, 255, 255, ${wash})` : `rgba(0, 0, 0, ${wash})`);
  document.documentElement.style.setProperty("--accent", light ? "#111111" : color);
  document.documentElement.style.setProperty("--button", color);
  document.documentElement.style.setProperty("--button-ink", buttonInk(color));
  for (const swatch of swatchEls) {
    const on = swatch.dataset.color === color;
    swatch.classList.toggle("is-selected", on);
    swatch.setAttribute("aria-checked", String(on));
  }
  localStorage.setItem(LOOK_KEY, JSON.stringify({ opacity, button: color, trace: traceEl.checked }));
  if (publish) queueSettings({ button: color, opacity, lookReady: true });
  syncTrace();
}

function restoreLook() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOOK_KEY) || "null");
    if (saved && Number.isFinite(Number(saved.opacity))) opacityEl.value = String(saved.opacity);
    if (saved && BUTTON_COLORS.includes(saved.button)) buttonColor = saved.button;
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
  node.addEventListener("change", () => {
    touchDraft();
    renderTarget();
    if (id !== "prompt") publishDelivery();
    if (id === "unsandboxed") refreshRoutes();
  });
}
imagesEl.addEventListener("change", () => {
  const files = [...imagesEl.files];
  imagesEl.value = "";
  addFileList(files);
});
folderEl.addEventListener("change", () => {
  const files = [...folderEl.files];
  folderEl.value = "";
  addFileList(files);
});
sendEl.addEventListener("mousedown", (event) => {
  event.preventDefault();
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
  if (!promptEl.value.trim()) return;
  await sendPrompt();
});
promptEl.addEventListener("input", () => {
  syncAction();
  warmPromptConnection();
});
promptEl.addEventListener("focus", () => {
  stopPlaceholder();
  syncTrace();
  warmPromptConnection();
});
promptEl.addEventListener("blur", () => {
  promptBlurred = true;
  syncTrace();
  promptBlurred = false;
  if (!promptEl.value) startPlaceholder();
});
retryEl.addEventListener("click", () => submit(true));
cancelEl.addEventListener("click", () => { stopAgent(); });
document.querySelector("#open-ide").addEventListener("click", openIde);
document.querySelector("#save-key").addEventListener("click", saveKey);
document.querySelector("#browse").addEventListener("click", browseFolder);
document.querySelector("#add").addEventListener("contextmenu", (event) => {
  event.preventDefault();
  folderEl.click();
});
document.querySelector("#viewer-close").addEventListener("click", closeViewer);
opacityEl.addEventListener("input", applyLook);
traceEl.addEventListener("change", applyLook);
for (const swatch of swatchEls) {
  swatch.addEventListener("click", () => {
    buttonColor = swatch.dataset.color;
    applyLook();
  });
}
restoreLook();
applyAdvanced();
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
      showNotice(error.message);
    });
});
document.querySelector("#more-advanced").addEventListener("click", () => {
  advanced = !advanced;
  applyAdvanced();
});
document.querySelector("#more-tools").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tool]");
  if (!button) return;
  selectAdvancedTool(button.dataset.tool);
  closeMore();
});
document.querySelector("#advanced-tools").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tool]");
  if (!button) return;
  selectAdvancedTool(button.dataset.tool);
});
document.querySelector("#advanced-add").addEventListener("click", () => imagesEl.click());
document.querySelector("#advanced-folder").addEventListener("click", () => folderEl.click());
document.querySelector("#advanced-project").addEventListener("click", () => { browseFolder().catch(() => undefined); });
document.querySelector("#more-open-ide").addEventListener("click", openIde);
document.querySelector("#more-change-ide").addEventListener("click", () => {
  showChangeIde().catch((error) => showNotice(error.message));
});
document.querySelector("#more-hide").addEventListener("click", hideHooxie);
document.querySelector("#more-clear").addEventListener("click", clearChat);
document.querySelector("#chat-clear").addEventListener("click", clearChat);
document.querySelector("#chat-copy").addEventListener("click", () => { copyReply().catch(() => undefined); });
document.querySelector("#chat-again").addEventListener("click", () => { if (lastPrompt && !busy) submit(true); });
document.querySelector("#more-move").addEventListener("click", moveHooxie);
document.querySelector("#more-home").addEventListener("click", recenterHooxie);
document.querySelector("#more-ghost").addEventListener("click", toggleUndetectable);
document.querySelector("#more-exit").addEventListener("click", exitHooxie);
const ESC_HOLD_MS = 750;
let escHoldTimer = 0;
let escHoldDone = false;

function escHoldAllowed(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  if (target === promptEl) return true;
  return !target.closest("input, textarea, select, [contenteditable='true']");
}

function beginEscHold() {
  if (escHoldTimer) return;
  escHoldDone = false;
  frameEl.classList.add("is-escaping");
  escHoldTimer = window.setTimeout(() => { void finishEscHold(); }, ESC_HOLD_MS);
}

function cancelEscHold() {
  if (escHoldDone) return;
  window.clearTimeout(escHoldTimer);
  escHoldTimer = 0;
  frameEl.classList.remove("is-escaping");
}

function freezeTraceFade() {
  const trace = document.querySelector("#trace");
  if (trace) trace.style.transition = "none";
}

function releaseTraceFade() {
  const trace = document.querySelector("#trace");
  if (!trace) return;
  void trace.offsetWidth;
  trace.style.removeProperty("transition");
}

async function finishEscHold() {
  escHoldTimer = 0;
  escHoldDone = true;
  freezeTraceFade();
  if (listening || voiceMode === "prompt" || voiceMode === "manual") await stopVoice();
  promptEl.value = "";
  voiceBase = "";
  syncAction();
  try {
    await api("/api/widget/yield", { method: "POST", body: "{}" });
  } catch {
    /* The browser preview has no desktop window to release. */
  }
  freezeTraceFade();
  leaveTypingMode();
  frameEl.classList.remove("is-escaping");
  releaseTraceFade();
  escHoldDone = false;
  if (!promptEl.value) startPlaceholder();
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || event.repeat || !escHoldAllowed(event)) return;
  event.preventDefault();
  beginEscHold();
}, true);
document.addEventListener("keyup", (event) => {
  if (event.key !== "Escape") return;
  cancelEscHold();
}, true);

promptEl.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  const text = promptEl.value.trim();
  if (!text) return;
  if (busy) {
    queueMessage(text);
    return;
  }
  stopVoice();
  await sendPrompt();
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
document.querySelector("#drag").addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 24 : 12;
  const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
  if (!move) return;
  event.preventDefault();
  fetch("/api/widget/move", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ dx: move[0], dy: move[1] }),
  }).catch(() => showNotice("Hooxie could not move. Try again, or email support@delexo.store."));
});
document.querySelector("#trouble-retry")?.addEventListener("click", () => {
  const trouble = document.querySelector("#trouble");
  if (trouble) trouble.hidden = true;
  promptEl.focus();
  scheduleFit();
});

new ResizeObserver(() => scheduleFit()).observe(shellEl);

document.querySelector("#account-connect").addEventListener("click", () => {
  connectCursor().catch((error) => {
    document.querySelector("#account-note").textContent = error.message;
  });
});
boot();

async function boot() {
  showOnly("none");
  restoreTarget();
  await refreshSetup().catch(() => undefined);
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

function paintUsage(percent, credits, details) {
  const value = Number.isFinite(percent) ? Math.max(0, Math.min(100, Math.round(percent))) : null;
  const ring = document.querySelector("#usage-ring");
  const label = document.querySelector("#usage-percent");
  const note = document.querySelector("#usage-note");
  const button = document.querySelector("#usage-toggle");
  const creditsBox = document.querySelector("#usage-credits");
  const creditsBalance = document.querySelector("#usage-credits-balance");
  const creditsExpire = document.querySelector("#usage-credits-expire");
  const offset = value == null ? USAGE_RING : USAGE_RING * (1 - value / 100);
  const loading = button.classList.contains("is-loading");
  if (loading) {
    button.classList.remove("is-loading");
    ring.style.transition = "none";
    ring.style.strokeDasharray = String(USAGE_RING);
    ring.style.strokeDashoffset = String(USAGE_RING);
    void ring.offsetWidth;
    ring.style.removeProperty("transition");
  }
  ring.style.strokeDasharray = String(USAGE_RING);
  ring.style.strokeDashoffset = String(offset);
  label.textContent = value == null ? "–" : String(value);
  const title = value == null ? "Cursor usage" : `Cursor usage ${value}%`;
  button.title = title;
  button.setAttribute("aria-label", title);
  note.textContent = value == null ? "Cursor usage is not available yet." : `${value}% of this account's included usage.`;
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
  paintUsageDetails(details);
  scheduleFit();
}

function paintUsageDetails(details) {
  const plan = document.querySelector("#usage-plan");
  const list = document.querySelector("#usage-details");
  const planName = typeof details?.planName === "string" ? details.planName.trim() : "";
  const price = typeof details?.price === "string" ? details.price.trim() : "";
  plan.textContent = [planName, price].filter(Boolean).join(" · ");
  plan.hidden = plan.textContent.length === 0;
  const includedAmount = Number(details?.includedCents);
  const included = Number.isFinite(includedAmount) && includedAmount >= 0 ? formatCents(includedAmount) : "";
  const limit = moneyCents(details?.limitCents);
  setUsageRow("#usage-included", "#usage-included-value", included && limit ? `$${included} of $${limit}` : "");
  setUsageRow("#usage-auto", "#usage-auto-value", usagePercentLabel(details?.autoPercent));
  setUsageRow("#usage-api", "#usage-api-value", usagePercentLabel(details?.apiPercent));
  const bonus = moneyCents(details?.bonusCents);
  setUsageRow("#usage-bonus", "#usage-bonus-value", bonus ? `$${bonus}` : "");
  const resetsAt = Number(details?.resetsAtMs);
  setUsageRow(
    "#usage-resets",
    "#usage-resets-value",
    Number.isFinite(resetsAt) && resetsAt > 0 ? formatCreditDate(resetsAt) : "",
  );
  list.hidden = [...list.children].every((row) => row.hidden);
}

function setUsageRow(rowSelector, valueSelector, text) {
  const row = document.querySelector(rowSelector);
  const value = document.querySelector(valueSelector);
  value.textContent = text;
  row.hidden = text.length === 0;
}

function moneyCents(cents) {
  const amount = Number(cents);
  return Number.isFinite(amount) && amount > 0 ? formatCents(amount) : "";
}

function usagePercentLabel(percent) {
  const value = Number(percent);
  return Number.isFinite(value) ? `${Math.max(0, Math.min(100, Math.round(value)))}%` : "";
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

let usageLoaded = false;

function beginUsageLoading() {
  const ring = document.querySelector("#usage-ring");
  document.querySelector("#usage-toggle").classList.add("is-loading");
  ring.style.strokeDasharray = "";
  ring.style.strokeDashoffset = "";
}

async function refreshUsage() {
  if (!usageLoaded) beginUsageLoading();
  try {
    const body = await api("/api/cursor/usage");
    usageLoaded = true;
    paintUsage(body.percent, body.credits, body.details);
  } catch {
    paintUsage(null, null, null);
  } finally {
    document.querySelector("#usage-toggle").classList.remove("is-loading");
  }
}

window.setInterval(() => {
  refreshUsage().catch(() => undefined);
}, 60000);

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

async function openIdeDownload(id) {
  await api("/api/ides/open", { method: "POST", body: JSON.stringify({ ide: id }) });
}

document.querySelector("#setup-buy")?.addEventListener("click", () => {
  purchaseLicense().catch((error) => showNotice(error.message));
});

function showSetupChapter(chapter) {
  if (!SETUP_CHAPTERS.includes(chapter)) return;
  setupWizard = chapter;
  if (setupReport) paintSetup(setupReport);
  scheduleFit();
}

document.querySelector("#setup-next")?.addEventListener("click", () => {
  const index = SETUP_CHAPTERS.indexOf(setupWizard);
  if (index < 0 || index >= SETUP_CHAPTERS.length - 1) return;
  showSetupChapter(SETUP_CHAPTERS[index + 1]);
});

document.querySelector("#setup-back")?.addEventListener("click", () => {
  const index = SETUP_CHAPTERS.indexOf(setupWizard);
  if (index <= 0) return;
  showSetupChapter(SETUP_CHAPTERS[index - 1]);
});

document.querySelector("#setup-help")?.addEventListener("click", () => {
  api("/api/setup/help", { method: "POST", body: "{}" }).catch((error) => showNotice(error.message));
});

document.querySelector("#setup-bar")?.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest("button")) return;
  startDrag(event);
});

document.querySelector("#setup-min")?.addEventListener("click", () => {
  const setup = document.querySelector("#setup");
  const next = !setup.classList.contains("is-min");
  setup.classList.toggle("is-min", next);
  const button = document.querySelector("#setup-min");
  button.setAttribute("aria-pressed", String(next));
  button.title = next ? "Restore" : "Minimize";
  button.setAttribute("aria-label", next ? "Restore" : "Minimize");
  scheduleFit();
});

document.querySelector("#setup-close")?.addEventListener("click", () => {
  hideHooxie().catch((error) => showNotice(error.message));
});

async function refreshSetup() {
  if (setupFlight) {
    setupQueued = true;
    return;
  }
  setupFlight = true;
  try {
    const report = await api("/api/setup");
    try {
      const next = await api("/api/state");
      state = { ...state, ...next };
    } catch {
      /* The setup report still decides which step is showing. */
    }
    setupReady = report.phase === "ready";
    cursorReady = setupReady;
    paintSetup(report);
    renderRoute();
    scheduleFit();
  } finally {
    setupFlight = false;
    if (setupQueued) {
      setupQueued = false;
      refreshSetup().catch(() => undefined);
    }
  }
}

function setupProgress(report) {
  if (report.licensed === true) return 100;
  const connected = Boolean(report.connectedIde);
  if (connected && setupWizard === "pay") return 78;
  if (connected) return 50;
  if (setupWizard === "pay") return 36;
  return 16;
}

let licenseWatch = 0;
function watchLicense(active) {
  if (!active) {
    window.clearInterval(licenseWatch);
    licenseWatch = 0;
    return;
  }
  if (licenseWatch) return;
  licenseWatch = window.setInterval(() => {
    refreshSetup().catch(() => undefined);
  }, 3000);
}

function paintSetup(report) {
  setupReport = report;
  const setup = document.querySelector("#setup");
  const showFeatures = report.phase === "ready";
  const connected = Boolean(report.connectedIde);
  if (!SETUP_CHAPTERS.includes(setupWizard)) setupWizard = connected ? "pay" : "ide";
  if (report.licensed === true && setupWizard === "pay") setupWizard = "ide";
  const showPay = !showFeatures && setupWizard === "pay";
  if (!showFeatures && !pillEl.hidden) showOnly("none");
  setup.hidden = showFeatures;
  pillEl.hidden = !showFeatures;
  if (showFeatures) startPlaceholder();
  else stopPlaceholder();
  watchLicense(!showFeatures && report.licensed !== true);
  const connect = document.querySelector("#setup-connect");
  const license = document.querySelector("#setup-license");
  if (connect) connect.hidden = showFeatures || showPay;
  if (license) license.hidden = !showPay;
  const index = SETUP_CHAPTERS.indexOf(setupWizard);
  const back = document.querySelector("#setup-back");
  const next = document.querySelector("#setup-next");
  if (back) back.disabled = index <= 0;
  if (next) next.disabled = index < 0 || index >= SETUP_CHAPTERS.length - 1;
  const progress = setupProgress(report);
  const meter = document.querySelector("#setup-meter");
  const fill = document.querySelector("#setup-meter-fill");
  if (meter) meter.setAttribute("aria-valuenow", String(progress));
  if (fill) fill.style.width = `${progress}%`;
  if (showFeatures || connectingAccount) return;
  renderSetupIdes(report.ides || [], report.connectedIde || "", report.more || []);
}

async function purchaseLicense() {
  const button = document.querySelector("#setup-buy");
  const note = document.querySelector("#setup-license-note");
  if (button) button.disabled = true;
  if (note) note.textContent = "Opening checkout for this computer.";
  try {
    await api("/api/billing/checkout", { method: "POST", body: JSON.stringify({ present: "widget" }) });
    if (note) note.textContent = "Finish payment in the browser. If this computer is already paid for, Hooxie continues on its own.";
  } catch (error) {
    if (note) note.textContent = error.message || "Checkout could not start.";
  } finally {
    if (button) button.disabled = false;
  }
}

let setupIdeOpen = false;

function setupIdeRows(ides, connectedIde, more = []) {
  return [
    ...ides.map((ide) => ({
      id: ide.ide,
      label: ide.label,
      installed: ide.installed === true,
      connected: ide.ide === connectedIde,
    })),
    ...more.map((ide) => ({
      id: ide.id,
      label: ide.label,
      installed: false,
      connected: false,
    })),
  ];
}

function setSetupIdeOpen(open) {
  setupIdeOpen = open;
  const root = document.querySelector("#setup-ide");
  const button = document.querySelector("#setup-ide-button");
  const menu = document.querySelector("#setup-ide-menu");
  root?.classList.toggle("is-open", open);
  if (button) button.setAttribute("aria-expanded", String(open));
  if (menu) menu.hidden = !open;
  scheduleFit(true);
}

function renderSetupIdes(ides, connectedIde, more = []) {
  const label = document.querySelector("#setup-ide-label");
  const menu = document.querySelector("#setup-ide-menu");
  const note = document.querySelector("#setup-ide-note");
  if (!menu || !label) return;
  const rows = setupIdeRows(ides, connectedIde, more);
  const chosenId = rows.some((ide) => ide.id === connectedIde) ? connectedIde : "";
  menu.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.textContent = "No IDEs found.";
    menu.append(empty);
  }
  for (const ide of rows) {
    const option = document.createElement("button");
    option.type = "button";
    option.dataset.ide = ide.id;
    option.dataset.installed = ide.installed || ide.connected ? "true" : "false";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(ide.id === chosenId));
    const name = document.createElement("span");
    name.textContent = ide.label;
    option.append(name);
    if (option.dataset.installed !== "true") {
      const tag = document.createElement("span");
      tag.textContent = "Download";
      option.append(tag);
    }
    menu.append(option);
  }
  const chosen = rows.find((ide) => ide.id === chosenId);
  label.textContent = chosen ? chosen.label : "Choose an IDE";
  if (document.querySelector("#setup-connect")?.hidden) setupIdeOpen = false;
  setSetupIdeOpen(setupIdeOpen);
  if (!note) return;
  note.textContent = !chosen
    ? "The widget uses the IDE you pick."
    : "The widget uses this IDE.";
}

function chooseSetupIde(ide, installed) {
  const previous = setupReport?.connectedIde || "";
  setSetupIdeOpen(false);
  if (!ide) {
    if (previous) disconnectIde(previous).catch((error) => showNotice(error.message));
    return;
  }
  if (!installed) {
    const note = document.querySelector("#setup-ide-note");
    if (note) note.textContent = "Opening the download. The widget stays on the IDE that is already connected.";
    openIdeDownload(ide).catch((error) => showNotice(error.message));
    return;
  }
  connectIde(ide).catch((error) => {
    const note = document.querySelector("#setup-ide-note");
    if (note) note.textContent = error.message;
  });
}

document.querySelector("#setup-ide-button")?.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setSetupIdeOpen(!setupIdeOpen);
});

document.querySelector("#setup-ide-menu")?.addEventListener("pointerdown", (event) => {
  const option = event.target.closest("button");
  if (!option) return;
  event.preventDefault();
  event.stopPropagation();
  chooseSetupIde(option.dataset.ide || "", option.dataset.installed === "true");
});

document.addEventListener("pointerdown", (event) => {
  if (!setupIdeOpen) return;
  const target = event.target;
  if (target instanceof Element && target.closest("#setup-ide")) return;
  setSetupIdeOpen(false);
  scheduleFit(true);
}, true);

function markConnected(ide) {
  const label = document.querySelector("#setup-ide-label");
  const menu = document.querySelector("#setup-ide-menu");
  const match = menu?.querySelector(`button[data-ide="${CSS.escape(ide)}"]`);
  if (label && match) label.textContent = match.querySelector("span")?.textContent || label.textContent;
  menu?.querySelectorAll("button").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.ide === ide));
  });
  const note = document.querySelector("#setup-ide-note");
  if (note && ide) note.textContent = "The widget uses this IDE.";
}

async function disconnectIde(ide) {
  await api("/api/ide/disconnect", { method: "POST", body: JSON.stringify({ ide }) });
  const label = document.querySelector("#setup-ide-label");
  if (label) label.textContent = "Choose an IDE";
  await refreshSetup();
}

async function connectIde(ide) {
  if (connectingAccount) return;
  if (ide === "cursor" && !state.cursorKeyConfigured) {
    await connectCursor();
    if (!state.cursorKeyConfigured) {
      const note = document.querySelector("#account-note");
      throw new Error(note?.textContent || "Sign in to Cursor, then connect it.");
    }
  }
  await api("/api/ide/connect", { method: "POST", body: JSON.stringify({ ide }) });
  markConnected(ide);
  await new Promise((resolve) => window.setTimeout(resolve, 520));
  try {
    const next = await api("/api/state");
    state = { ...state, ...next };
  } catch {
    /* Connect already saved. The next setup check will unlock the widget. */
  }
  const match = state.installations.find((item) => item.ide === ide);
  if (match && [...ideEl.options].some((item) => item.value === ide)) {
    ideEl.value = ide;
    renderInstallations();
    if ([...installEl.options].some((item) => item.value === match.id)) installEl.value = match.id;
    publishDelivery();
  }
  await refreshSetup();
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
      voiceActivation = result.voiceActivation === true;
      if (typeof result.chime === "string") chimeId = result.chime;
      if (typeof result.openSound === "string") openSound = result.openSound;
      if (typeof result.closeSound === "string") closeSound = result.closeSound;
    } catch {
      /* The page also loads in a normal browser tab. */
    }
  }, 200);
}

function applyRemoteSettings(body) {
  settingsRevision = body.revision;
  applyingRemote = true;
  if (BUTTON_COLORS.includes(body.button)) buttonColor = body.button;
  if (body.widgetMode === "light" || body.widgetMode === "dark") widgetMode = body.widgetMode;
  if (Number.isFinite(Number(body.opacity))) opacityEl.value = String(body.opacity);
  if (body.lookReady === true) traceEl.checked = body.trace !== false;
  const nextAudio = body.audio !== false;
  const nextVoice = body.voiceActivation === true;
  const voiceChanged = nextAudio !== audioEnabled || nextVoice !== voiceActivation;
  audioEnabled = nextAudio;
  voiceActivation = nextVoice;
  if (typeof body.chime === "string") chimeId = body.chime;
  if (typeof body.openSound === "string") openSound = body.openSound;
  if (typeof body.closeSound === "string") closeSound = body.closeSound;
  applyArrows(body.arrows === true);
  applyLook(false);
  renderUndetectable(body.detectable === false);
  if (body.deliveryReady === true) applyDelivery(body);
  applyingRemote = false;
  if (voiceChanged) syncVoiceActivation();
}

function deliverySnapshot() {
  return {
    lookReady: true,
    deliveryReady: true,
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
  if (busy || !setupReady) return;
  if (!projectEl.value.trim()) {
    detailEl.textContent = "Choose a project file or folder before asking about the screen.";
    showOnly("chat");
    return;
  }
  if (!promptEl.value.trim()) promptEl.value = "What is on my screen right now?";
  if (listening) await stopVoice();
  syncAction();
  submit(false, { screen: true });
}

window.setInterval(() => {
  if (setupReady || connectingAccount) return;
  refreshSetup().catch(() => undefined);
}, 3000);

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

let promptConnectionAt = 0;
let routesFlight = null;

function warmPromptConnection() {
  if (!projectEl.value.trim()) return;
  const now = Date.now();
  if (routesFlight || now - promptConnectionAt < 1500) return;
  promptConnectionAt = now;
  routesFlight = refreshRoutes().finally(() => {
    routesFlight = null;
  });
}

async function refreshRoutes() {
  const project = projectEl.value.trim();
  if (!project) {
    routes = [];
    routeEl.replaceChildren(option("", "Enter a project file or folder"));
    syncPickers();
    renderRoute();
    return;
  }
  promptConnectionAt = Date.now();
  try {
    const sandbox = document.querySelector("#unsandboxed").checked ? "1" : "0";
    const body = await api(`/api/routes?ide=${encodeURIComponent(ideEl.value)}&projectPath=${encodeURIComponent(project)}&allowUnsandboxed=${sandbox}`);
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
    routeNote.textContent = project ? "" : "Choose an IDE and a project file or folder.";
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
  renderAdvanced();
  renderTarget();
  rememberTarget();
}

function paintOpenIde() {
  const note = document.querySelector("#more-open-ide-note");
  const change = document.querySelector("#more-change-ide-note");
  const name = connectedIdeLabel();
  if (note) note.textContent = projectEl.value.trim() ? `Open this project in ${name}` : `Open ${name}`;
  if (change) change.textContent = name ? `Now using ${name}` : "Switch the IDE this widget uses";
}

function connectedIdeLabel() {
  const connected = setupReport?.connectedIde;
  const match = setupReport?.ides?.find((ide) => ide.ide === connected);
  if (match?.label) return match.label;
  const selected = ideEl.selectedOptions[0]?.textContent?.trim();
  return selected || "";
}

async function showChangeIde() {
  const list = document.querySelector("#more-ides");
  const button = document.querySelector("#more-change-ide");
  if (!list || !button) return;
  if (!list.hidden) {
    collapseChangeIde();
    scheduleFit();
    return;
  }
  if (!setupReport?.ides) {
    setupReport = await api("/api/setup");
  }
  renderMoreIdes(setupReport.ides || [], setupReport.connectedIde || "", setupReport.more || []);
  list.hidden = false;
  button.setAttribute("aria-expanded", "true");
  scheduleFit();
}

function collapseChangeIde() {
  const list = document.querySelector("#more-ides");
  const button = document.querySelector("#more-change-ide");
  if (list) list.hidden = true;
  if (button) button.setAttribute("aria-expanded", "false");
}

function renderMoreIdes(ides, connectedIde, more) {
  const list = document.querySelector("#more-ides");
  if (!list) return;
  const rows = [
    ...ides.map((ide) => ({
      id: ide.ide,
      label: ide.label,
      installed: ide.installed === true || ide.ide === connectedIde,
    })),
    ...more.map((ide) => ({ id: ide.id, label: ide.label, installed: false })),
  ];
  list.replaceChildren(...rows.map((ide) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "more-ide";
    if (ide.id === connectedIde) button.setAttribute("aria-current", "true");
    const copy = document.createElement("span");
    copy.className = "more-copy";
    const name = document.createElement("strong");
    name.textContent = ide.label;
    const detail = document.createElement("span");
    detail.textContent = ide.id === connectedIde ? "In use" : ide.installed ? "Switch to this IDE" : "Download";
    copy.append(name, detail);
    button.append(copy);
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      chooseMoreIde(ide).catch((error) => showNotice(error.message));
    });
    return button;
  }));
}

async function chooseMoreIde(ide) {
  if (ide.id && ide.id === setupReport?.connectedIde) {
    collapseChangeIde();
    scheduleFit();
    return;
  }
  if (!ide.installed) {
    const note = document.querySelector("#more-change-ide-note");
    if (note) note.textContent = "Opening the download. The widget stays on the current IDE.";
    await openIdeDownload(ide.id);
    return;
  }
  await connectIde(ide.id);
  paintOpenIde();
  closeMore();
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
    projectPathEl.title = "Choose a file or folder Hooxie may modify";
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
  paintOpenIde();
  renderThread();
}

let editingIndex = -1;
let editingDraft = "";
let editingCaret = null;

let threadPaint = "";

function renderThread() {
  const paint = `${editingIndex}|${statusName}|${agentThought}|${agentCommand}|${thread.map((message) => [message.role, message.deliveryId || "", message.text, message.previews?.length || 0].join("\u0000")).join("\u0001")}`;
  if (paint === threadPaint && threadEl.childElementCount) {
    syncFold();
    syncChatActions();
    return false;
  }
  threadPaint = paint;
  const scroll = threadEl.scrollTop;
  const previous = threadEl.querySelector(".bubble-edit");
  if (previous && document.activeElement === previous) editingCaret = previous.selectionStart;
  threadEl.replaceChildren();
  thread.forEach((message, index) => {
    if (message.role === "user") {
      const bubble = document.createElement("div");
      const editing = index === editingIndex;
      bubble.className = editing ? "bubble is-editing" : "bubble";
      const edit = () => openMessageEditor(index);
      if (!editing) {
        bubble.title = "Edit message";
        bubble.addEventListener("click", (event) => {
          if (event.target.closest(".bubble-pic, .bubble-text")) return;
          if (window.getSelection()?.toString()) return;
          edit();
        });
      }
      if (message.previews?.length) {
        const row = document.createElement("div");
        row.className = "bubble-images";
        message.previews.forEach((preview, pictureIndex) => {
          const src = typeof preview === "string" ? preview : preview.url;
          const name = typeof preview === "string" ? "Attached picture" : preview.name || "Attached picture";
          const alt = message.previews.length > 1 ? `Attached picture ${pictureIndex + 1}` : "Attached picture";
          const img = document.createElement("img");
          img.src = src;
          img.alt = alt;
          const open = document.createElement("button");
          open.type = "button";
          open.className = "bubble-pic";
          open.append(img);
          open.addEventListener("click", (event) => {
            event.stopPropagation();
            openViewer({ kind: "image", name, url: src });
          });
          row.append(open);
        });
        bubble.append(row);
      }
      if (editing) bubble.append(messageEditor(index));
      else {
        const text = document.createElement("p");
        text.className = "bubble-text";
        text.tabIndex = 0;
        text.setAttribute("role", "button");
        text.setAttribute("aria-label", "Edit message");
        text.textContent = message.text;
        text.addEventListener("click", () => {
          if (window.getSelection()?.toString()) return;
          edit();
        });
        text.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          edit();
        });
        bubble.append(text);
      }
      threadEl.append(bubble);
      return;
    }
    const block = document.createElement("div");
    block.className = "reply";
    const who = document.createElement("p");
    who.className = "who";
    who.textContent = message.ide || "Cursor";
    const body = document.createElement("div");
    body.className = "reply-text";
    fillReply(body, message.text);
    block.append(who, body);
    threadEl.append(block);
  });
  if (statusName === "failed" && detailEl.textContent) {
    const last = thread[thread.length - 1];
    if (!last || last.text !== detailEl.textContent) {
      const live = document.createElement("p");
      live.className = "live";
      live.textContent = detailEl.textContent;
      threadEl.append(live);
    }
  } else if (statusName !== "ready" && !terminal(statusName)) {
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
    if (statusName === "agent_working" && agentThought) {
      const thought = document.createElement("p");
      thought.className = "live-thought";
      thought.textContent = agentThought;
      thought.title = agentThought;
      threadEl.append(thought);
    }
    if (statusName === "agent_working" && agentCommand) {
      const command = document.createElement("p");
      command.className = "live-command";
      command.title = agentCommand;
      command.setAttribute("aria-label", `Command running: ${agentCommand}`);
      const mark = document.createElement("span");
      mark.className = "live-command-mark";
      mark.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.textContent = agentCommand;
      command.append(mark, text);
      threadEl.append(command);
    }
  }
  if (editingIndex >= 0) threadEl.scrollTop = scroll;
  else threadEl.scrollTop = threadEl.scrollHeight;
  syncFold();
  syncChatActions();
  return true;
}

function fillReply(node, text) {
  node.replaceChildren();
  for (const part of replyParts(text)) appendReplyPart(node, part);
}

function appendReplyPart(node, part) {
  if (part.type === "text") {
    node.append(part.text);
    return;
  }
  if (part.type === "code" || part.type === "fence") {
    const code = document.createElement("code");
    code.textContent = part.text;
    if (part.type === "code") {
      node.append(code);
      return;
    }
    const block = document.createElement("pre");
    block.append(code);
    node.append(block);
    return;
  }
  const strong = document.createElement("strong");
  for (const child of part.parts) appendReplyPart(strong, child);
  node.append(strong);
}

function messageEditor(index) {
  const wrap = document.createElement("div");
  const box = document.createElement("textarea");
  box.className = "bubble-edit";
  box.value = editingDraft;
  box.setAttribute("aria-label", "Edit your message");
  const actions = document.createElement("div");
  actions.className = "bubble-edit-actions";
  const resend = document.createElement("button");
  resend.type = "button";
  resend.className = "bubble-resend";
  resend.textContent = "Resend";
  resend.disabled = busy || !editingDraft.trim();
  resend.addEventListener("mousedown", (event) => event.preventDefault());
  resend.addEventListener("click", () => closeMessageEditor(index, true));
  actions.append(resend);
  box.addEventListener("input", () => {
    editingDraft = box.value;
    resend.disabled = busy || !box.value.trim();
  });
  box.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      editingDraft = thread[index].text;
      editingIndex = -1;
      renderThread();
    } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      closeMessageEditor(index, true);
    }
  });
  box.addEventListener("blur", () => {
    setTimeout(() => {
      if (editingIndex !== index || !box.isConnected) return;
      if (document.activeElement?.closest?.(".bubble.is-editing")) return;
      closeMessageEditor(index, false);
    }, 0);
  });
  wrap.append(box, actions);
  queueMicrotask(() => {
    if (editingIndex !== index) return;
    box.focus();
    const pos = editingCaret == null ? box.value.length : editingCaret;
    editingCaret = null;
    box.setSelectionRange(pos, pos);
  });
  return wrap;
}

function openMessageEditor(index) {
  const message = thread[index];
  if (!message || message.role !== "user") return;
  editingIndex = index;
  editingDraft = message.text;
  renderThread();
}

function closeMessageEditor(index, resend) {
  if (editingIndex !== index) return;
  const message = thread[index];
  if (!message) {
    editingIndex = -1;
    return;
  }
  const text = editingDraft.trim();
  if (resend && (busy || !text)) return;
  editingIndex = -1;
  if (text) message.text = text;
  if (!resend || !text) {
    renderThread();
    return;
  }
  thread.splice(index + 1);
  renderedReply = "";
  lastPrompt = text;
  touchDraft();
  lastScreenImage = null;
  renderThread();
  submit(true, { freshScreen: viewScreenEl.checked });
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
  sendEl.disabled = false;
  if (busy && !text) {
    stopPlaceholder();
    promptEl.placeholder = "Queue a follow-up";
  }
  syncTrace();
  fitPrompt();
  syncFold();
  syncChatActions();
}

function promptNeedsRoom() {
  const text = promptEl.value;
  if (!text) return false;
  const toolbar = document.querySelector("#toolbar");
  const tools = document.querySelector("#toolbar-tools");
  const probe = document.querySelector("#prompt-measure");
  if (!toolbar || !tools || !probe || toolbar.clientWidth < 80) return false;
  const bar = getComputedStyle(toolbar);
  const pad = parseFloat(bar.paddingLeft) + parseFloat(bar.paddingRight);
  const gap = parseFloat(bar.columnGap || bar.gap) || 4;
  const narrow = toolbar.clientWidth - pad - tools.offsetWidth - gap - 60;
  const font = getComputedStyle(promptEl);
  probe.style.font = font.font;
  probe.style.lineHeight = font.lineHeight;
  probe.style.width = `${Math.max(24, Math.floor(narrow))}px`;
  probe.textContent = text;
  return probe.scrollHeight > Math.ceil(parseFloat(font.lineHeight) + 8);
}

function fitPrompt() {
  const toolbar = document.querySelector("#toolbar");
  const stacked = promptNeedsRoom();
  const wasStacked = toolbar.classList.contains("is-stacked");
  toolbar.classList.toggle("is-stacked", stacked);
  const current = Number.parseFloat(promptEl.style.height) || 30;
  const max = 280;
  promptEl.style.height = "30px";
  const next = Math.min(max, Math.max(30, promptEl.scrollHeight));
  promptEl.style.height = `${next}px`;
  promptEl.style.overflowY = promptEl.scrollHeight > max + 1 ? "auto" : "hidden";
  if (stacked !== wasStacked || Math.abs(next - current) > 1) scheduleFit();
}

function foldNeeded() {
  if (busy || listening) return true;
  if (promptEl.value.trim()) return true;
  if (thread.length > 0) return true;
  if (attachments.length > 0) return true;
  return false;
}

function syncFold() {
  const band = document.querySelector("#chat-band");
  const show = foldNeeded();
  const was = !band.hidden;
  const collapsed = show && chatCollapsed;
  band.hidden = !show;
  band.classList.toggle("is-collapsed", collapsed);
  contextBarEl.hidden = !show || collapsed;
  const menuOpen = !document.querySelector("#more-menu").hidden;
  shellEl.classList.toggle("is-open", (show && !collapsed) || advanced || panel !== "none" || menuOpen);
  if (show && !was && !collapsed) threadEl.scrollTop = threadEl.scrollHeight;
  if (show !== was) scheduleFit(true);
}

function promptFocused() {
  return widgetActive && !promptBlurred && document.activeElement === promptEl;
}

function syncTrace() {
  const live = traceEl.checked && (listening || promptFocused());
  const appeared = live && !traceLive;
  const vanished = !live && traceLive;
  frameEl.classList.toggle("is-live", live);
  traceLive = live;
  if (appeared) {
    traceStopping = false;
    traceParked = false;
  } else if (vanished) {
    const into = (performance.now() % TRACE_SPIN_MS) / TRACE_SPIN_MS;
    traceStopFrom = into;
    traceStopStarted = performance.now();
    traceStopping = into > 0.001;
    traceParked = !traceStopping;
  }
  if (appeared) playChatSound("open");
  else if (vanished) playChatSound("close");
}

function applyVoiceText(spoken) {
  const said = spoken.trim();
  const next = voiceBase && said ? `${voiceBase} ${said}` : (said || voiceBase);
  if (next === promptEl.value) return;
  promptEl.value = next;
  const end = promptEl.value.length;
  promptEl.setSelectionRange(end, end);
  syncAction();
}

function setVoiceOff() {
  listening = false;
  window.clearInterval(voiceTimer);
  voiceTimer = 0;
  syncAction();
}

async function stopVoice() {
  if (voiceMode === "wake" && voiceActivation && audioEnabled && voiceRearm) return;
  const rearm = voiceRearm && voiceActivation && audioEnabled;
  voiceMode = "off";
  voiceCueOpen = false;
  window.clearTimeout(voiceCueTimer);
  voiceCueTimer = 0;
  setVoiceOff();
  try {
    await api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "stop" }) });
  } catch {
    /* The recognizer is already stopped. */
  }
  if (!promptEl.value && document.activeElement !== promptEl) startPlaceholder();
  if (rearm) await armWake();
}

async function syncVoiceActivation() {
  if (!voiceActivation || !audioEnabled) {
    if (voiceMode === "wake" || voiceMode === "prompt") await stopVoice();
    return;
  }
  if (voiceMode === "off") await armWake();
}

async function armWake() {
  if (!voiceActivation || !audioEnabled || voiceMode !== "off" || listening) return;
  try {
    const state = await api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "wake" }) });
    if (!voiceActivation || !audioEnabled || voiceMode !== "off" || listening) {
      await api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "stop" }) });
      return;
    }
    if (state.error) throw new Error(state.error);
    voiceMode = "wake";
    window.clearInterval(voiceTimer);
    voiceTimer = window.setInterval(pollVoice, 160);
  } catch (error) {
    voiceMode = "off";
    showNotice(error.message || "Voice activation could not start.");
  }
}

function beginHandsFree() {
  if (voiceMode !== "wake") return;
  const now = Date.now();
  if (now - voiceWakeAt < 4000) return;
  voiceWakeAt = now;
  voiceMode = "prompt";
  voiceCueOpen = false;
  listening = true;
  voiceBase = "";
  promptEl.value = "";
  const wasLive = traceLive;
  if (panel !== "chat") showOnly("chat");
  syncAction();
  stopPlaceholder();
  const openListening = () => {
    if (voiceMode !== "prompt" || voiceCueOpen) return;
    voiceCueOpen = true;
    window.clearTimeout(voiceCueTimer);
    voiceCueTimer = 0;
    api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "start" }) }).catch(() => undefined);
  };
  if (!traceLive || wasLive) {
    openListening();
    return;
  }
  const watchCue = (player) => {
    if (!player || voiceMode !== "prompt" || voiceCueOpen) return;
    if (player.ended) openListening();
    else player.addEventListener("ended", openListening, { once: true });
  };
  chatPlayback.then(watchCue);
  voiceCueTimer = window.setTimeout(openListening, 3200);
}

async function finishHandsFree() {
  if (voiceSending || voiceMode !== "prompt") return;
  voiceSending = true;
  const text = promptEl.value.trim();
  voiceMode = "off";
  try {
    await stopVoice();
    if (!text) return;
    promptEl.value = text;
    submit(false);
  } finally {
    voiceSending = false;
  }
}

function showNotice(message) {
  sendEl.title = message;
  statusEl.textContent = message;
  detailEl.textContent = message;
  const setupNote = document.querySelector("#setup-note");
  const setup = document.querySelector("#setup");
  if (setupNote && setup && !setup.hidden) setupNote.textContent = message;
  const trouble = document.querySelector("#trouble");
  const troubleText = document.querySelector("#trouble-text");
  if (!trouble || !troubleText) return;
  const failed = /could not|did not|failed|went wrong|try again|support@delexo/i.test(message || "");
  if (!message || !failed) {
    trouble.hidden = true;
    return;
  }
  troubleText.textContent = message;
  trouble.hidden = false;
  scheduleFit();
}

async function toggleVoice() {
  if (listening || voiceMode === "prompt" || voiceMode === "manual") {
    if (traceEl.checked && promptFocused()) playChatSound("close");
    await stopVoice();
    return;
  }
  if (!cursorReady) {
    showNotice("Connect an IDE before prompting.");
    return;
  }
  if (!audioEnabled) {
    showNotice("Turn on the microphone in the dashboard.");
    return;
  }
  if (voiceMode === "wake") {
    voiceRearm = false;
    voiceMode = "off";
    await stopVoice();
    voiceRearm = true;
  }
  showOnly("chat");
  listening = true;
  voiceMode = "manual";
  voiceBase = promptEl.value.trim();
  promptEl.focus();
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
    window.clearInterval(voiceTimer);
    voiceTimer = window.setInterval(pollVoice, 120);
  } catch (error) {
    voiceMode = "off";
    setVoiceOff();
    const message = error.message || "Voice prompting could not start.";
    sendEl.title = message;
    detailEl.textContent = message;
    if (!promptEl.value) startPlaceholder();
    if (voiceActivation && audioEnabled) await armWake();
  }
}

async function pollVoice() {
  if (voicePollFlight) return;
  if (voiceMode !== "wake" && voiceMode !== "prompt" && voiceMode !== "manual") return;
  voicePollFlight = true;
  try {
    const state = await api("/api/widget/voice", { method: "POST", body: JSON.stringify({ action: "poll" }) });
    if (voiceMode === "wake") {
      if (state.awake === true) beginHandsFree();
      return;
    }
    if (voiceMode !== "prompt" && voiceMode !== "manual") return;
    if (state.error) throw new Error(state.error);
    if (voiceMode === "prompt" && !voiceCueOpen) return;
    applyVoiceText(state.text);
    if (voiceMode === "prompt") {
      const said = state.text.trim();
      if (said && state.silenceMs >= 1800) await finishHandsFree();
      else if (!said && state.silenceMs >= 8000) await stopVoice();
      return;
    }
    if (!state.listening) await stopVoice();
  } catch (error) {
    if (voiceMode === "off") return;
    voiceMode = "off";
    setVoiceOff();
    const message = error.message || "Voice prompting stopped.";
    sendEl.title = message;
    detailEl.textContent = message;
  } finally {
    voicePollFlight = false;
  }
}

function explainSendBlock() {
  if (!cursorReady) return "Connect an IDE before sending.";
  const project = projectEl.value.trim();
  const route = selectedRoute();
  if (!project || !route) return "Choose a project file or folder before sending.";
  if (!route.available) return route.reason || "This prompt cannot be sent on the current route.";
  const images = attachments.filter((item) => item.kind === "image").length;
  if ((images > 0 || viewScreenEl.checked) && !route.capabilities.images) {
    return "This route cannot carry a screenshot or other images.";
  }
  return "";
}

function showSendBlock(message) {
  showNotice(message);
  setStatus("failed", message);
  if (pillEl.hidden) return;
  showOnly("chat");
  renderThread();
}

async function sendPrompt() {
  if (!cursorReady) await refreshSetup();
  let message = explainSendBlock();
  if (message === "Choose a project file or folder before sending.") {
    showSendBlock(message);
    await browseFolder();
    message = explainSendBlock();
  }
  if (message) {
    showSendBlock(message);
    return;
  }
  submit(false);
}

async function submit(retry, options = {}) {
  if (!cursorReady) {
    await refreshSetup();
    if (!cursorReady) {
      showSendBlock("Connect an IDE before sending.");
      return;
    }
  }
  const route = selectedRoute();
  const project = projectEl.value.trim();
  if (!route || !project) {
    showSendBlock("Choose a project file or folder before sending.");
    return;
  }
  warmPromptConnection();
  const text = (typeof options.text === "string" ? options.text : retry ? lastPrompt : promptEl.value).trim();
  if (!text) return;
  busy = true;
  stopRequested = false;
  syncAction();
  if (options.freshScreen || (!retry && (options.screen === true || viewScreenEl.checked))) {
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
  }, 250);
}

function show(delivery) {
  const stopped = stopRequested;
  setStatus(delivery.status, `${delivery.detail} Destination: ${delivery.destination}`);
  retryEl.hidden = !delivery.retryable;
  cancelEl.hidden = !delivery.canCancel;
  agentThought = delivery.status === "agent_working" && typeof delivery.thought === "string" ? delivery.thought.trim() : "";
  if (Array.isArray(delivery.terminals)) {
    sessionTerminals = delivery.terminals.filter((item) => item && item.status === "running" && typeof item.command === "string");
  }
  agentCommand = delivery.status === "agent_working" ? latestRunningCommand() : "";
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
  const activityChanged = renderActivity();
  renderAdvanced();
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
      const existing = thread.findIndex((item) => item.role === "agent" && item.deliveryId === delivery.id);
      if (existing >= 0) thread[existing].text = delivery.responseText;
      else thread.push({ role: "agent", text: delivery.responseText, ide: ideLabel(), deliveryId: delivery.id });
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
  const threadChanged = renderThread();
  if (activityChanged || threadChanged) scheduleFit();
  if (terminal(delivery.status) && !stopped) void drainQueue();
}

function latestRunningCommand() {
  for (let index = sessionTerminals.length - 1; index >= 0; index -= 1) {
    const item = sessionTerminals[index];
    if (item?.status === "running" && item.command) return item.command;
  }
  return "";
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
let placeholderIde = "";
let placeholderTimer = 0;
let placeholderRun = 0;
const PLACEHOLDER_LETTER_DELAY = 50;
const PLACEHOLDER_LETTER_FADE = 500;
const PLACEHOLDER_HOLD = 1350;
const PLACEHOLDER_OUT = 1000;

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
  if (placeholderIndex !== 0 || !placeholderTimer) return;
  window.clearTimeout(placeholderTimer);
  placeholderTimer = 0;
  placeholderRun += 1;
  playPlaceholderPhrase();
}

function stopPlaceholder() {
  placeholderRun += 1;
  window.clearTimeout(placeholderTimer);
  placeholderTimer = 0;
  promptGhostEl.hidden = true;
  promptGhostEl.replaceChildren();
  promptGhostEl.style.transition = "none";
  promptGhostEl.style.opacity = "1";
  setPlaceholderFade(1);
  promptEl.placeholder = "";
}

function startPlaceholder() {
  if (busy || promptEl.value || listening) return;
  if (document.activeElement === promptEl) return;
  if (pillEl.hidden) return;
  if (placeholderTimer) return;
  playPlaceholderPhrase();
}

function playPlaceholderPhrase() {
  const run = ++placeholderRun;
  window.clearTimeout(placeholderTimer);
  const phrases = placeholderPhrases();
  const phrase = phrases[placeholderIndex % phrases.length];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    promptGhostEl.hidden = true;
    setPlaceholderFade(1);
    promptEl.placeholder = phrase;
    placeholderTimer = window.setTimeout(() => {
      if (run !== placeholderRun) return;
      placeholderTimer = 0;
      placeholderIndex = (placeholderIndex + 1) % phrases.length;
      startPlaceholder();
    }, 3400);
    return;
  }
  promptEl.placeholder = "";
  promptGhostEl.hidden = false;
  promptGhostEl.style.transition = "none";
  promptGhostEl.style.opacity = "1";
  void promptGhostEl.offsetWidth;
  promptGhostEl.replaceChildren(...[...phrase].map((char, index) => {
    const letter = document.createElement("span");
    letter.textContent = char;
    letter.style.animationDelay = `${index * PLACEHOLDER_LETTER_DELAY}ms`;
    return letter;
  }));
  const typed = phrase.length * PLACEHOLDER_LETTER_DELAY + PLACEHOLDER_LETTER_FADE;
  placeholderTimer = window.setTimeout(() => {
    if (run !== placeholderRun) return;
    promptGhostEl.style.transition = `opacity ${PLACEHOLDER_OUT}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    promptGhostEl.style.opacity = "0";
    placeholderTimer = window.setTimeout(() => {
      if (run !== placeholderRun) return;
      placeholderTimer = 0;
      placeholderIndex = (placeholderIndex + 1) % phrases.length;
      startPlaceholder();
    }, PLACEHOLDER_OUT + 180);
  }, typed + PLACEHOLDER_HOLD);
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
    if (!escHoldDone) {
      window.clearTimeout(escHoldTimer);
      escHoldTimer = 0;
    } else {
      freezeTraceFade();
    }
    leaveTypingMode();
    frameEl.classList.remove("is-escaping");
    if (listening || voiceMode === "prompt" || voiceMode === "manual") stopVoice();
    if (!promptEl.value) startPlaceholder();
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

syncPlaceholderLead();

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

let activityFiles = [];
let activityTerminals = [];
let activityPaint = "";

function renderActivity() {
  const inProgress = statusName === "sending" || statusName === "agent_working";
  const running = sessionTerminals.filter((item) => item.status === "running");
  if (!inProgress) {
    activityFiles = sessionFiles.slice();
    activityTerminals = running.slice();
  }
  const rowsByName = { terminals: activityTerminals, queue: promptQueue, files: activityFiles };
  const paint = [
    activityOpen,
    inProgress ? "working" : "idle",
    activityTerminals.map((item) => item.command).join("\n"),
    promptQueue.map((item) => item.id).join("\n"),
    activityFiles.map((item) => `${item.kind}:${item.path}`).join("\n"),
  ].join("|");
  if (paint === activityPaint) return false;
  activityPaint = paint;
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
    button.replaceChildren();
    if (name === "queue" && count) {
      const label = document.createElement("span");
      label.textContent = "Queued";
      const badge = document.createElement("span");
      badge.className = "queue-count";
      badge.textContent = String(count);
      button.append(label, badge);
    } else {
      button.textContent = count ? `${labels[name]} ${count}` : labels[name];
    }
    button.setAttribute("aria-expanded", String(activityOpen === name));
  }
  const panel = document.querySelector("#activity-panel");
  panel.hidden = activityOpen === "";
  panel.replaceChildren();
  if (!activityOpen) return true;
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
      const place = rows.indexOf(item) + 1;
      row.className = "activity-item queue-item";
      const index = document.createElement("span");
      index.className = "queue-index";
      index.textContent = String(place);
      index.title = place === 1 ? "Sends next" : `Position ${place}`;
      text.textContent = item.text;
      text.title = item.text;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "queue-remove";
      remove.setAttribute("aria-label", `Remove queued message ${place}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        promptQueue = promptQueue.filter((entry) => entry.id !== item.id);
        renderActivity();
        scheduleFit();
      });
      row.append(index, text, remove);
    } else {
      const kind = item.kind === "added" ? "Added" : item.kind === "deleted" ? "Deleted" : "Modified";
      text.textContent = `${kind} ${item.path}`;
      text.title = item.path;
      row.append(text);
    }
    panel.append(row);
  }
  renderAdvanced();
  return true;
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
  closeMore();
  try {
    const installationId = installEl.value;
    if (!installationId) {
      showNotice("Hooxie could not find that IDE on this machine.");
      return;
    }
    const projectPath = projectEl.value.trim();
    if (!projectPath) {
      showNotice("Choose a project file or folder first.");
      return;
    }
    const body = await api("/api/open", {
      method: "POST",
      body: JSON.stringify({ installationId, projectPath }),
    });
    showNotice(body.detail);
  } catch (error) {
    showNotice(error.message);
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

function frameWidth() {
  return (advanced ? ADVANCED_SHELL : SHELL_WIDTH) + 8;
}

function applyAdvanced() {
  document.querySelector("#advanced").hidden = !advanced;
  document.querySelector("#more-tools").hidden = !advanced;
  const button = document.querySelector("#more-advanced");
  const note = document.querySelector("#more-advanced-note");
  button.setAttribute("aria-pressed", String(advanced));
  note.textContent = advanced
    ? "On. Files, changes, terminal, details, and look stay on the widget."
    : "A larger widget with files, details, and IDE tools";
  localStorage.setItem(ADVANCED_KEY, advanced ? "1" : "0");
  if (advanced) selectAdvancedTool(advancedTool);
  syncFold();
  scheduleFit(true);
}

function selectAdvancedTool(name) {
  advancedTool = ADVANCED_TOOLS.includes(name) ? name : "files";
  localStorage.setItem("hooxie-advanced-tool", advancedTool);
  for (const button of document.querySelectorAll("[data-tool]")) {
    const on = button.dataset.tool === advancedTool;
    if (button.getAttribute("role") === "tab") button.setAttribute("aria-selected", String(on));
    else button.setAttribute("aria-current", on ? "true" : "false");
  }
  for (const pane of document.querySelectorAll("#advanced-body [data-pane]")) {
    pane.hidden = pane.dataset.pane !== advancedTool;
  }
  renderAdvanced();
  scheduleFit();
}

function renderAdvanced() {
  if (!advanced) return;
  const inProgress = statusName === "sending" || statusName === "agent_working";
  renderAdvancedFiles();
  if (!inProgress) {
    renderAdvancedChanges();
    renderAdvancedTerminal();
  }
  renderAdvancedDetails();
}

function renderAdvancedFiles() {
  const list = document.querySelector("#advanced-attached");
  list.replaceChildren();
  if (!attachments.length) {
    const empty = document.createElement("p");
    empty.textContent = "No files attached.";
    list.append(empty);
    return;
  }
  for (const item of attachments) {
    const row = document.createElement("div");
    row.className = "advanced-row";
    const name = document.createElement("button");
    name.type = "button";
    name.className = "advanced-name";
    const baseName = item.name.split(/[/\\]/).pop() || item.name;
    name.textContent = baseName;
    name.title = item.name;
    name.addEventListener("click", () => openViewer(item));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "advanced-remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeAttachment(item.id));
    row.append(name, remove);
    list.append(row);
  }
}

function renderAdvancedChanges() {
  const list = document.querySelector("#advanced-changes");
  list.replaceChildren();
  if (!sessionFiles.length) {
    const empty = document.createElement("p");
    empty.textContent = "No file changes from this session.";
    list.append(empty);
    return;
  }
  for (const item of sessionFiles) {
    const row = document.createElement("p");
    const kind = item.kind === "added" ? "Added" : item.kind === "deleted" ? "Deleted" : "Modified";
    row.textContent = `${kind} ${item.path}`;
    row.title = item.path;
    list.append(row);
  }
}

function renderAdvancedTerminal() {
  const list = document.querySelector("#advanced-terminal");
  list.replaceChildren();
  const running = sessionTerminals.filter((item) => item.status === "running");
  if (!running.length) {
    const empty = document.createElement("p");
    empty.textContent = "No terminal from this session.";
    list.append(empty);
    return;
  }
  for (const item of running) {
    const row = document.createElement("p");
    row.textContent = item.command;
    row.title = item.command;
    list.append(row);
  }
}

function renderAdvancedDetails() {
  const status = document.querySelector("#advanced-status");
  const routeLine = document.querySelector("#advanced-route");
  const projectLine = document.querySelector("#advanced-project");
  const label = LABELS[statusName] || statusName;
  const detail = detailEl.textContent.trim();
  status.textContent = detail ? `${label}. ${detail}` : label;
  const selected = routeEl.selectedOptions[0];
  routeLine.textContent = selected && selected.value ? selected.textContent : "No delivery route yet.";
  const project = projectEl.value.trim();
  projectLine.textContent = project || "No project path yet.";
}

function closeMore() {
  const menu = document.querySelector("#more-menu");
  if (menu.hidden) return;
  collapseChangeIde();
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
  frameEl.classList.toggle("is-undetectable", enabled);
}

async function hideHooxie() {
  closeMore();
  try {
    await api("/api/widget/visible", { method: "POST", body: JSON.stringify({ shown: false }) });
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

async function exitHooxie() {
  closeMore();
  try {
    await api("/api/widget/exit", { method: "POST", body: "{}" });
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

function latestReply() {
  for (let index = thread.length - 1; index >= 0; index -= 1) {
    const message = thread[index];
    if (message.role === "agent" && message.text) return message.text;
  }
  return "";
}

function syncChatActions() {
  const copy = document.querySelector("#chat-copy");
  const again = document.querySelector("#chat-again");
  const clear = document.querySelector("#chat-clear");
  if (!copy || !again || !clear) return;
  copy.disabled = !latestReply();
  again.disabled = busy || !lastPrompt;
  clear.disabled = thread.length === 0;
  if (copy.textContent !== "Copied") copy.textContent = "Copy reply";
}

let copyReplyTimer = 0;

async function copyReply() {
  const text = latestReply();
  if (!text) return;
  const button = document.querySelector("#chat-copy");
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
    clearTimeout(copyReplyTimer);
    copyReplyTimer = setTimeout(() => {
      if (button.textContent === "Copied") button.textContent = "Copy reply";
    }, 1200);
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

function clearChat() {
  const project = projectEl.value.trim();
  thread = [];
  renderedReply = "";
  promptQueue = [];
  sessionTerminals = [];
  sessionFiles = [];
  agentThought = "";
  agentCommand = "";
  activityFiles = [];
  activityTerminals = [];
  activityPaint = "";
  threadPaint = "";
  activityOpen = "";
  activityDismissed = new Set();
  resultEl.hidden = true;
  resultEl.textContent = "";
  renderThread();
  renderActivity();
  closeMore();
  if (project) {
    void api("/api/conversation/reset", { method: "POST", body: JSON.stringify({ projectPath: project }) }).catch(() => undefined);
  }
}

async function moveHooxie() {
  closeMore();
  try {
    await api("/api/widget/follow", { method: "POST", body: "{}" });
  } catch (error) {
    detailEl.textContent = error.message;
  }
}

async function recenterHooxie() {
  closeMore();
  try {
    await api("/api/widget/home", { method: "POST", body: "{}" });
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
  if (which !== "more") collapseChangeIde();
  menu.hidden = which !== "more";
  document.querySelector("#more").setAttribute("aria-expanded", String(which === "more"));
  if (which !== "viewer") {
    viewingId = null;
    viewer.hidden = true;
    document.querySelector("#viewer-body").replaceChildren();
  }
  panel = which === "presets" || which === "usage" ? which : "none";
  presetsEl.hidden = panel !== "presets";
  document.querySelector("#usage").hidden = panel !== "usage";
  presetToggle.setAttribute("aria-expanded", String(panel === "presets"));
  document.querySelector("#usage-toggle").setAttribute("aria-expanded", String(panel === "usage"));
  syncFold();
  scheduleFit(true);
}

const PRESET_KEY = "hooxie-presets";
let editingPresetId = "";
let viewingPresetId = "";

function readPresets() {
  try {
    const list = JSON.parse(localStorage.getItem(PRESET_KEY) || "[]");
    return Array.isArray(list) ? list.filter((item) => item && typeof item.text === "string" && typeof item.name === "string") : [];
  } catch {
    return [];
  }
}

function presetButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderPresets() {
  const list = document.querySelector("#preset-list");
  const save = document.querySelector("#preset-save");
  if (save) save.textContent = editingPresetId ? "Update" : "Save";
  list.replaceChildren(...readPresets().map((preset) => {
    const row = document.createElement("div");
    row.className = "preset";
    if (viewingPresetId === preset.id) row.classList.add("is-open");
    const name = document.createElement("strong");
    name.textContent = preset.name;
    const actions = document.createElement("div");
    actions.className = "preset-actions";
    actions.append(
      presetButton("Use", () => {
        promptEl.value = preset.text;
        stopPlaceholder();
        syncAction();
        showOnly("none");
      }),
      presetButton("View", () => {
        viewingPresetId = viewingPresetId === preset.id ? "" : preset.id;
        renderPresets();
      }),
      presetButton("Edit", () => {
        editingPresetId = preset.id;
        document.querySelector("#preset-name").value = preset.name;
        document.querySelector("#preset-text").value = preset.text;
        document.querySelector("#preset-text").focus();
        renderPresets();
      }),
      presetButton("Delete", () => {
        if (editingPresetId === preset.id) clearPresetEditor();
        if (viewingPresetId === preset.id) viewingPresetId = "";
        localStorage.setItem(PRESET_KEY, JSON.stringify(readPresets().filter((item) => item.id !== preset.id)));
        renderPresets();
      }),
    );
    row.append(name, actions);
    if (viewingPresetId === preset.id) {
      const view = document.createElement("p");
      view.className = "preset-view";
      view.textContent = preset.text;
      row.append(view);
    }
    return row;
  }));
  if (!presetsEl.hidden) scheduleFit(true);
}

function clearPresetEditor() {
  editingPresetId = "";
  document.querySelector("#preset-name").value = "";
  document.querySelector("#preset-text").value = "";
}

function savePreset() {
  const text = document.querySelector("#preset-text").value.trim();
  if (!text) {
    document.querySelector("#preset-text").focus();
    return;
  }
  const typedName = document.querySelector("#preset-name").value.trim();
  const name = typedName || text.split("\n")[0].slice(0, 42);
  const current = readPresets();
  const next = editingPresetId
    ? current.map((item) => item.id === editingPresetId ? { ...item, name, text } : item)
    : [{ id: crypto.randomUUID(), name, text }, ...current].slice(0, 40);
  localStorage.setItem(PRESET_KEY, JSON.stringify(next));
  clearPresetEditor();
  renderPresets();
}

function scheduleFit(instant = false) {
  if (chatDrag) {
    queueDragFit();
    return;
  }
  if (instant) fitInstant = true;
  clearTimeout(fitTimer);
  fitTimer = setTimeout(() => {
    const snap = fitInstant;
    fitInstant = false;
    fitWindow(snap);
  }, 16);
}

function fitTrace() {
  const svg = document.querySelector("#trace");
  const rects = svg ? [...svg.querySelectorAll("rect")] : [];
  const grad = svg?.querySelector("#trace-grad");
  if (!svg || !rects.length || !grad) return;
  const width = Math.max(1, frameEl.clientWidth);
  const height = Math.max(1, frameEl.clientHeight);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const inset = 2.75;
  const w = Math.max(4, width - inset * 2);
  const h = Math.max(4, height - inset * 2);
  const radius = Math.min(26, h / 2);
  for (const rect of rects) {
    rect.setAttribute("x", String(inset));
    rect.setAttribute("y", String(inset));
    rect.setAttribute("width", String(w));
    rect.setAttribute("height", String(h));
    rect.setAttribute("rx", String(radius));
    rect.setAttribute("ry", String(radius));
  }
  grad.setAttribute("x1", "0");
  grad.setAttribute("y1", String(height / 2));
  grad.setAttribute("x2", String(width));
  grad.setAttribute("y2", String(height / 2));
  const stealth = document.querySelector("#stealth");
  const ring = stealth?.querySelector("rect");
  if (!stealth || !ring) return;
  stealth.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const edge = 1.4;
  const ringW = Math.max(4, width - edge * 2);
  const ringH = Math.max(4, height - edge * 2);
  ring.setAttribute("x", String(edge));
  ring.setAttribute("y", String(edge));
  ring.setAttribute("width", String(ringW));
  ring.setAttribute("height", String(ringH));
  const advancedOpen = !document.querySelector("#advanced")?.hidden;
  const ringRadius = shellEl.classList.contains("is-open") || advancedOpen ? Math.min(26, ringH / 2) : ringH / 2;
  ring.setAttribute("rx", String(ringRadius));
  ring.setAttribute("ry", String(ringRadius));
  placeStealthDots(ring, ringW, ringH, ringRadius);
}

let stealthDots = 0;

function placeStealthDots(ring, width, height, radius) {
  const perimeter = 2 * (width + height - 2 * radius) + 2 * Math.PI * radius;
  const ideal = Math.max(16, Math.round(perimeter / 7.5));
  if (!stealthDots || Math.abs(ideal - stealthDots) > 1) stealthDots = ideal;
  const step = 100 / stealthDots;
  const dot = Math.min(step * 0.42, (1.6 / Math.max(perimeter, 1)) * 100);
  ring.setAttribute("pathLength", "100");
  ring.setAttribute("stroke-dasharray", `${dot.toFixed(3)} ${(step - dot).toFixed(3)}`);
}

if (typeof ResizeObserver === "function") {
  new ResizeObserver(() => {
    fitTrace();
    fitPrompt();
  }).observe(frameEl);
}
fitTrace();

const traceSpinReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
function applyTraceAngle(grad, angle) {
  const width = Math.max(1, frameEl.clientWidth);
  const height = Math.max(1, frameEl.clientHeight);
  grad.setAttribute("gradientTransform", `rotate(${angle.toFixed(2)} ${width / 2} ${height / 2})`);
}
function spinTrace(now) {
  requestAnimationFrame(spinTrace);
  if (traceSpinReduced.matches) return;
  const grad = document.querySelector("#trace-grad");
  if (!grad) return;
  if (traceLive) {
    traceStopping = false;
    traceParked = false;
    applyTraceAngle(grad, ((now % TRACE_SPIN_MS) / TRACE_SPIN_MS) * 360);
    return;
  }
  if (traceParked) return;
  if (!traceStopping) {
    applyTraceAngle(grad, 0);
    traceParked = true;
    return;
  }
  const remain = Math.max(1, (1 - traceStopFrom) * TRACE_SPIN_MS);
  const t = Math.min(1, (now - traceStopStarted) / remain);
  applyTraceAngle(grad, (traceStopFrom + (1 - traceStopFrom) * t) * 360);
  if (t >= 1) {
    applyTraceAngle(grad, 0);
    traceStopping = false;
    traceParked = true;
  }
}
requestAnimationFrame(spinTrace);

function measureFrame() {
  const html = document.documentElement;
  const saved = {
    htmlHeight: html.style.height,
    bodyHeight: document.body.style.height,
    frameMax: frameEl.style.maxHeight,
    shellMax: shellEl.style.maxHeight,
  };
  html.style.height = "auto";
  document.body.style.height = "auto";
  frameEl.style.maxHeight = "none";
  shellEl.style.maxHeight = "none";
  frameEl.style.overflow = "visible";
  shellEl.style.overflow = "visible";
  const height = Math.ceil(Math.max(frameEl.getBoundingClientRect().height, frameEl.scrollHeight));
  html.style.height = saved.htmlHeight;
  document.body.style.height = saved.bodyHeight;
  frameEl.style.maxHeight = saved.frameMax;
  shellEl.style.maxHeight = saved.shellMax;
  frameEl.style.overflow = "";
  shellEl.style.overflow = "";
  return Math.max(48, height || 48);
}

let fitFlight = false;
let fitQueued = false;
let fittedFrame = "";

async function fitWindow(instant = false) {
  if (fitFlight) {
    fitQueued = true;
    if (instant) fitInstant = true;
    return;
  }
  fitFlight = true;
  try {
    const width = frameWidth();
    const height = measureFrame();
    const next = `${width}x${height}`;
    if (next === fittedFrame && !instant) return;
    await api("/api/widget/frame", {
      method: "POST",
      body: JSON.stringify({ width, height, instant }),
    });
    fittedFrame = next;
  } catch {
    /* The page also loads in a normal browser tab. */
  } finally {
    fitFlight = false;
    if (fitQueued) {
      fitQueued = false;
      const snap = fitInstant;
      fitInstant = false;
      fitWindow(snap);
    }
  }
}

const CHAT_H_MIN = 72;
const CHAT_H_MAX = 640;
const CHAT_CLOSE = 36;
let chatCollapsed = localStorage.getItem("hooxie-chat-collapsed") === "1";
let chatDragFrame = 0;

function clampChatHeight(px) {
  return Math.min(CHAT_H_MAX, Math.max(CHAT_H_MIN, Math.round(px)));
}

function rememberChatHeight(px) {
  localStorage.setItem("hooxie-chat-h", String(px));
  localStorage.removeItem("hooxie-chat-collapsed");
}

function setChatHeight(px, persist) {
  const band = document.querySelector("#chat-band");
  if (px <= CHAT_CLOSE) {
    chatCollapsed = true;
    if (persist) localStorage.setItem("hooxie-chat-collapsed", "1");
  } else {
    chatCollapsed = false;
    const next = Math.min(CHAT_H_MAX, Math.max(0, Math.round(px)));
    band.style.setProperty("--chat-h", `${next}px`);
    if (persist) {
      if (next >= CHAT_H_MIN) rememberChatHeight(next);
      else {
        chatCollapsed = true;
        localStorage.setItem("hooxie-chat-collapsed", "1");
      }
    }
  }
  syncFold();
  if (chatDrag) queueDragFit();
  else scheduleFit(true);
}

function queueDragFit() {
  if (chatDragFrame) return;
  chatDragFrame = requestAnimationFrame(() => {
    chatDragFrame = 0;
    if (!chatDrag) return;
    const width = frameWidth();
    const height = measureFrame();
    const next = `${width}x${height}`;
    if (next === fittedFrame) return;
    fittedFrame = next;
    fetch("/api/widget/frame", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ width, height, instant: true }),
    }).catch(() => undefined);
  });
}

const savedChatHeight = Number(localStorage.getItem("hooxie-chat-h"));
if (!chatCollapsed && Number.isFinite(savedChatHeight) && savedChatHeight > 0) setChatHeight(savedChatHeight, false);
else if (chatCollapsed) syncFold();

const chatResize = document.querySelector("#chat-resize");
chatResize.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  chatResize.setPointerCapture(event.pointerId);
  chatDrag = true;
  const startY = event.screenY;
  const start = chatCollapsed ? 0 : chatEl.getBoundingClientRect().height;
  const move = (ev) => setChatHeight(start + (ev.screenY - startY), false);
  const end = (ev) => {
    chatResize.removeEventListener("pointermove", move);
    chatResize.removeEventListener("pointerup", end);
    chatResize.removeEventListener("pointercancel", end);
    if (chatDragFrame) cancelAnimationFrame(chatDragFrame);
    chatDragFrame = 0;
    chatDrag = false;
    setChatHeight(start + (ev.screenY - startY), true);
  };
  chatResize.addEventListener("pointermove", move);
  chatResize.addEventListener("pointerup", end);
  chatResize.addEventListener("pointercancel", end);
});
chatResize.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 48 : 24;
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  if (chatCollapsed && event.key === "ArrowDown") {
    const saved = Number(localStorage.getItem("hooxie-chat-h"));
    setChatHeight(Number.isFinite(saved) && saved >= CHAT_H_MIN ? saved : 112, true);
    return;
  }
  const current = chatCollapsed ? 0 : chatEl.getBoundingClientRect().height;
  setChatHeight(current + (event.key === "ArrowDown" ? step : -step), true);
});

function startDrag(event) {
  if (event.button !== 0) return;
  const handle = event.currentTarget;
  handle.setPointerCapture(event.pointerId);
  let dragDx = 0;
  let dragDy = 0;
  let dragFrame = 0;
  let lastX = event.screenX;
  let lastY = event.screenY;
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
    dragDx += next.screenX - lastX;
    dragDy += next.screenY - lastY;
    lastX = next.screenX;
    lastY = next.screenY;
    if (dragFrame) return;
    dragFrame = requestAnimationFrame(flushDrag);
  };
  const end = () => {
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", end);
    handle.removeEventListener("pointercancel", end);
    if (dragFrame) cancelAnimationFrame(dragFrame);
    flushDrag();
  };
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
}

function setStatus(stateName, detail) {
  const finished = statusName !== "ready" && !terminal(statusName) && terminal(stateName);
  statusName = stateName;
  statusEl.dataset.state = stateName;
  statusEl.textContent = LABELS[stateName] || stateName;
  if (detail) detailEl.textContent = detail;
  renderTarget();
  renderAdvanced();
  if (finished) playChime();
}

const CHIME_FILES = {
  blushing: "blushing-sound.mp3",
  "xtreme-bass": "xtreme-bass-effect.mp3",
  undertaker: "undertaker-cloche.mp3",
  ekh: "ekh.mp3",
  "cat-choke": "cat-choke.mp3",
  alert: "notification-alert.mp3",
  "pluck-off": "notification-pluck-off.mp3",
  notification: "notification-2.mp3",
  "new-notification": "new-notification.mp3",
  "menu-open": "menu-open.mp3",
  "holographic-open": "menu-open-holographic.mp3",
};

const CHAT_SOUNDS = {
  open: "notification",
  close: "pluck-off",
};
const soundUrls = new Map();
const soundLoads = new Map();
let chatLive = null;
let chatPlayback = Promise.resolve(null);
let chatPlayToken = 0;
let chimeToken = 0;

function loadSound(file) {
  const ready = soundLoads.get(file);
  if (ready) return ready;
  const pending = fetch(`/sounds/${file}`)
    .then((response) => {
      if (!response.ok) throw new Error("missing sound");
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      soundUrls.set(file, url);
      return url;
    })
    .catch(() => "");
  soundLoads.set(file, pending);
  return pending;
}

function releaseAudio(audio) {
  if (!audio) return;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

function startChatSound(src, token) {
  if (token !== chatPlayToken) return null;
  releaseAudio(chatLive);
  const audio = new Audio(src);
  audio.preload = "auto";
  chatLive = audio;
  const attempt = (tries) => {
    if (token !== chatPlayToken || chatLive !== audio) return;
    const pending = audio.play();
    if (!pending || typeof pending.then !== "function") return;
    pending.catch(() => {
      if (token !== chatPlayToken || chatLive !== audio || tries >= 1) return;
      if (!audio.paused || audio.currentTime > 0.05) return;
      window.setTimeout(() => attempt(tries + 1), 40);
    });
  };
  attempt(0);
  return audio;
}

async function playThroughWidget(body) {
  try {
    await api("/api/widget/play", { method: "POST", body: JSON.stringify(body) });
    return true;
  } catch {
    return false;
  }
}

function playChatSound(kind) {
  const id = kind === "close" ? closeSound : openSound;
  if (!id || id === "off") return null;
  const file = id === "custom" ? "" : CHIME_FILES[id];
  if (id !== "custom" && !file) return null;
  const token = ++chatPlayToken;
  const body = id === "custom" ? { custom: true } : { file };
  playThroughWidget(body).then((played) => {
    if (played || token !== chatPlayToken || !file) return;
    startChatSoundFallback(file, token);
  });
  return null;
}

function startChatSoundFallback(file, token) {
  const src = soundUrls.get(file);
  if (src) {
    const audio = startChatSound(src, token);
    chatPlayback = Promise.resolve(audio);
    return audio;
  }
  chatPlayback = loadSound(file).then((url) => {
    if (!url || token !== chatPlayToken) return null;
    return startChatSound(url, token);
  });
  return null;
}

function prepareChatSounds() {
  for (const kind of Object.keys(CHAT_SOUNDS)) {
    const file = CHIME_FILES[CHAT_SOUNDS[kind]];
    if (file) loadSound(file);
  }
  const rest = () => {
    for (const file of Object.values(CHIME_FILES)) loadSound(file);
  };
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(rest);
  else window.setTimeout(rest, 400);
}

prepareChatSounds();

async function playChime() {
  if (!chimeId || chimeId === "off") return;
  const generation = ++chimeToken;
  if (chimeId === "custom") {
    if (await playThroughWidget({ custom: true })) return;
  } else if (CHIME_FILES[chimeId] && await playThroughWidget({ file: CHIME_FILES[chimeId] })) {
    return;
  }
  if (generation !== chimeToken) return;
  try {
    let src = "";
    let temporary = false;
    if (chimeId === "custom") {
      const response = await fetch("/api/chime", { headers: { authorization: `Bearer ${token}` } });
      if (!response.ok || generation !== chimeToken) return;
      src = URL.createObjectURL(await response.blob());
      temporary = true;
    } else if (CHIME_FILES[chimeId]) {
      src = soundUrls.get(CHIME_FILES[chimeId]) || await loadSound(CHIME_FILES[chimeId]);
    }
    if (!src || generation !== chimeToken) {
      if (temporary) URL.revokeObjectURL(src);
      return;
    }
    releaseAudio(chimeAudio);
    const audio = new Audio(src);
    chimeAudio = audio;
    if (temporary) audio.addEventListener("ended", () => URL.revokeObjectURL(src), { once: true });
    await audio.play();
  } catch {
    if (generation !== chimeToken || !chimeAudio) return;
    chimeAudio.play().catch(() => undefined);
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
  try {
    if (attachments.length >= MAX_UPLOADS) return "limit";
    if (isSensitiveName(name)) return "sensitive";
    const kind = classifyFile(file);
    if (kind === "image") {
      if (file.size > 4_000_000) return "large";
      const item = {
        id: crypto.randomUUID(),
        kind: "image",
        name,
        mimeType: IMAGE_TYPES.has(file.type) ? file.type : extToMime(extensionOf(name)),
        url: URL.createObjectURL(file),
      };
      attachments.push(item);
      renderAttachments();
      try {
        item.data = bufferToBase64(await file.arrayBuffer());
      } catch {
        removeAttachment(item.id);
        return "failed";
      }
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
      renderAttachments();
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
    renderAttachments();
    return "ok";
  } catch {
    return "failed";
  }
}

function removeAttachment(id) {
  const item = attachments.find((entry) => entry.id === id);
  attachments = attachments.filter((entry) => entry.id !== id);
  if (item?.url?.startsWith("blob:")) URL.revokeObjectURL(item.url);
  renderAttachments();
  touchDraft();
  renderRoute();
}

function finishAdd(notes) {
  if (notes.includes("sensitive")) attachNote = "A sensitive file was left out.";
  else if (notes.includes("large")) attachNote = "A file was left out because it is over the size limit.";
  else if (notes.includes("limit")) attachNote = `Only the first ${MAX_UPLOADS} files were attached.`;
  else if (notes.includes("failed") || notes.includes("binary")) attachNote = "A file could not be attached.";
  else attachNote = "";
  renderAttachments();
  touchDraft();
  renderRoute();
  if (attachNote) detailEl.textContent = attachNote;
}

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
    img.alt = "Attached picture";
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

function thumbImage(item) {
  const img = document.createElement("img");
  img.className = "thumb-preview";
  img.src = item.url;
  img.alt = "";
  return img;
}

function thumbGlyph() {
  const icon = document.createElement("span");
  icon.className = "thumb-preview thumb-glyph";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = `<svg viewBox="0 0 16 16"><path d="M3.2 1.5h5.6L13 5.6v8c0 .7-.6 1.3-1.3 1.3H3.2c-.7 0-1.3-.6-1.3-1.3V2.8c0-.7.6-1.3 1.3-1.3z"/><path d="M8.6 1.7V5.8H12.6"/></svg>`;
  return icon;
}

function renderAttachments() {
  attachmentsEl.replaceChildren();
  pillEl.classList.toggle("has-files", attachments.length > 0);
  const add = document.querySelector("#add");
  add.title = attachments.length
    ? `${attachments.length} file${attachments.length === 1 ? "" : "s"} attached. Add more.`
    : "Add any file, or drop a folder. Right-click to choose a folder.";
  imagesEl.title = add.title;
  if (viewingId && !attachments.some((item) => item.id === viewingId)) closeViewer();
  for (const item of attachments) {
    const baseName = item.name.split(/[/\\]/).pop() || item.name;
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.tabIndex = 0;
    thumb.title = `View ${baseName}`;
    thumb.append(item.kind === "image" ? thumbImage(item) : thumbGlyph());
    const label = document.createElement("span");
    label.className = "thumb-name";
    label.textContent = baseName;
    thumb.append(label);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "thumb-remove";
    remove.setAttribute("aria-label", `Remove ${baseName}`);
    remove.textContent = "x";
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      removeAttachment(item.id);
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
  if (attachNote) {
    const note = document.createElement("p");
    note.className = "attach-note";
    note.textContent = attachNote;
    attachmentsEl.append(note);
  }
  if (attachments.length) attachmentsEl.scrollIntoView({ block: "nearest" });
  renderAdvanced();
  syncFold();
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
  if (!response.ok) throw new Error(body.error || "That request did not go through. Try again, or email support@delexo.store.");
  return body;
}
