const COLORS = ["#ffffff", "#4d9fff", "#3ddc97", "#ff8a3d", "#ff5d8f", "#b07bff", "#ffe14a", "#ff4d4d", "#3ee0d2"];
const LOCAL = document.querySelector('meta[name="hooxie-local"]')?.content === "1";
const TOKEN = document.querySelector('meta[name="z-token"]')?.content || "";
const COPY = {
  en: {},
  es: {
    "nav.general": "General", "nav.onboarding": "Inicio", "nav.widget": "Widget", "nav.keybinds": "Atajos", "nav.profile": "Perfil", "nav.language": "Idioma", "nav.billing": "Facturación", "nav.releases": "Notas", "nav.help": "Ayuda", "nav.contact": "Contacto",
    "general.title": "General", "general.intro": "Versión, visibilidad, color y micrófono de Hooxie en este equipo.",
    "keybinds.title": "Atajos", "profile.title": "Perfil", "language.title": "Idioma", "billing.title": "Facturación", "releases.title": "Notas de la versión", "help.title": "Centro de ayuda", "contact.title": "Contactar soporte",
    "billing.plan": "Plan Pro", "billing.subscribe": "Suscribirse", "profile.connect": "Conectar cuenta",
  },
  fr: {
    "nav.general": "Général", "nav.onboarding": "Démarrage", "nav.widget": "Widget", "nav.keybinds": "Raccourcis", "nav.profile": "Profil", "nav.language": "Langue", "nav.billing": "Facturation", "nav.releases": "Notes", "nav.help": "Aide", "nav.contact": "Contact",
    "general.title": "Général", "keybinds.title": "Raccourcis", "profile.title": "Profil", "language.title": "Langue", "billing.title": "Facturation", "releases.title": "Notes de version", "help.title": "Aide", "contact.title": "Contacter le support",
    "billing.plan": "Offre Pro", "billing.subscribe": "S'abonner", "profile.connect": "Connecter le compte",
  },
  de: {
    "nav.general": "Allgemein", "nav.onboarding": "Einrichtung", "nav.widget": "Widget", "nav.keybinds": "Tasten", "nav.profile": "Profil", "nav.language": "Sprache", "nav.billing": "Abrechnung", "nav.releases": "Hinweise", "nav.help": "Hilfe", "nav.contact": "Kontakt",
    "general.title": "Allgemein", "keybinds.title": "Tasten", "profile.title": "Profil", "language.title": "Sprache", "billing.title": "Abrechnung", "releases.title": "Versionshinweise", "help.title": "Hilfe", "contact.title": "Support kontaktieren",
    "billing.plan": "Pro-Tarif", "billing.subscribe": "Abonnieren", "profile.connect": "Konto verbinden",
  },
  pt: {
    "nav.general": "Geral", "nav.onboarding": "Início", "nav.widget": "Widget", "nav.keybinds": "Atalhos", "nav.profile": "Perfil", "nav.language": "Idioma", "nav.billing": "Cobrança", "nav.releases": "Notas", "nav.help": "Ajuda", "nav.contact": "Contato",
    "general.title": "Geral", "keybinds.title": "Atalhos", "profile.title": "Perfil", "language.title": "Idioma", "billing.title": "Cobrança", "releases.title": "Notas da versão", "help.title": "Ajuda", "contact.title": "Falar com o suporte",
    "billing.plan": "Plano Pro", "billing.subscribe": "Assinar", "profile.connect": "Conectar conta",
  },
  ja: {
    "nav.general": "一般", "nav.onboarding": "初期設定", "nav.widget": "ウィジェット", "nav.keybinds": "キー", "nav.profile": "プロフィール", "nav.language": "言語", "nav.billing": "料金", "nav.releases": "更新", "nav.help": "ヘルプ", "nav.contact": "連絡",
    "general.title": "一般", "keybinds.title": "キーバインド", "profile.title": "プロフィール", "language.title": "言語", "billing.title": "料金", "releases.title": "リリースノート", "help.title": "ヘルプ", "contact.title": "サポートに連絡",
    "billing.plan": "Pro プラン", "billing.subscribe": "登録する", "profile.connect": "アカウントを接続",
  },
  zh: {
    "nav.general": "通用", "nav.onboarding": "初始设置", "nav.widget": "浮窗", "nav.keybinds": "快捷键", "nav.profile": "账户", "nav.language": "语言", "nav.billing": "账单", "nav.releases": "更新", "nav.help": "帮助", "nav.contact": "联系",
    "general.title": "通用", "keybinds.title": "快捷键", "profile.title": "账户", "language.title": "语言", "billing.title": "账单", "releases.title": "更新说明", "help.title": "帮助中心", "contact.title": "联系支持",
    "billing.plan": "Pro 方案", "billing.subscribe": "订阅", "profile.connect": "连接账户",
  },
};

bootChrome();
const page = document.querySelector("[data-page]");
if (page?.dataset.page === "dashboard") bootDashboard();
if (page?.dataset.page === "contact") bootContact();
if (page?.dataset.page === "home") bootHome();

function bootChrome() {
  if (document.querySelector("[data-page]")?.dataset.page === "dashboard") return;
  let pageGarden = document.querySelector("#page-garden");
  if (!pageGarden) {
    pageGarden = document.createElement("canvas");
    pageGarden.id = "page-garden";
    pageGarden.setAttribute("aria-hidden", "true");
    document.body.prepend(pageGarden);
  }
  if (window.mountInkGarden) {
    window.mountInkGarden(pageGarden, "/ascii-editor/demos/generated/ref-029.webp", window.INK_GARDEN, { viewport: true });
  }

  const line = document.querySelector(".scroll-line");
  const bar = document.querySelector(".topbar");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-menu");
  const setMenu = (open) => {
    bar?.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("menu-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
    toggle?.querySelector(".sr")?.replaceChildren(document.createTextNode(open ? "Close" : "Menu"));
  };

  toggle?.addEventListener("click", () => setMenu(!bar.classList.contains("is-open")));
  nav?.querySelectorAll("a").forEach((anchor) => anchor.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && bar?.classList.contains("is-open")) setMenu(false);
  });

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    if (line) line.style.transform = `scaleX(${progress})`;
    if (line) line.classList.remove("is-dark");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  for (const item of document.querySelectorAll(".faq-item")) {
    const question = item.querySelector(".faq-q");
    question?.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      question.setAttribute("aria-expanded", String(open));
    });
  }
}

function bootDownloadButtons() {
  for (const button of document.querySelectorAll(".dl-btn")) {
    let phase = "idle";
    let timer = 0;
    const live = button.querySelector("[aria-live]");
    const setPhase = (next) => {
      phase = next;
      button.dataset.phase = next;
      button.setAttribute("aria-busy", next === "downloading" ? "true" : "false");
      if (live) {
        live.textContent = next === "downloading" ? "Downloading" : next === "done" ? "Downloaded" : "";
      }
    };
    button.addEventListener("click", () => {
      if (phase !== "idle") return;
      setPhase("downloading");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setPhase("done");
        timer = window.setTimeout(() => setPhase("idle"), 1800);
      }, 700);
    });
  }
}

function bootHome() {
  bootDownloadButtons();
  const prompt = document.querySelector("#demo-prompt");
  const send = document.querySelector("#demo-send");
  const status = document.querySelector("#demo-status");
  const paintSend = () => {
    if (!prompt || !send) return;
    send.textContent = prompt.value.trim() ? "Send" : "Mic";
  };
  prompt?.addEventListener("input", paintSend);
  paintSend();
  send?.addEventListener("click", () => {
    const text = prompt?.value.trim();
    if (!text) {
      status.textContent = "Voice would start on the real widget. Type a prompt to preview send.";
      return;
    }
    status.textContent = `Queued for C:\\work\\app — “${text.slice(0, 72)}”. Install Hooxie to send it through Cursor.`;
    prompt.value = "";
    paintSend();
  });
  prompt?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    send?.click();
  });
}

function bootContact() {
  const form = document.querySelector("#contact-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(name ? `Hooxie support from ${name}` : "Hooxie support");
    const body = encodeURIComponent(`${message}\n\n${email}`);
    location.href = `mailto:support@delexo.store?subject=${subject}&body=${body}`;
  });
}

function wireSidebar(buttons, status) {
  const dash = document.querySelector(".dash");
  const filter = document.querySelector("#side-filter");
  const searchBtn = document.querySelector("#side-search");
  const collapseBtn = document.querySelector("#side-collapse");
  const supportLabel = document.querySelector(".side-label");
  const toggle = document.querySelector("#toggle-hooxie");
  let widgetShown = true;

  function applyFilter() {
    const q = filter.value.trim().toLowerCase();
    let supportVisible = 0;
    for (const button of buttons) {
      const label = button.querySelector("span")?.textContent || "";
      const match = !q || label.toLowerCase().includes(q);
      button.hidden = !match;
      if (match && button.dataset.group === "support") supportVisible += 1;
    }
    if (supportLabel) supportLabel.hidden = q.length > 0 && supportVisible === 0;
  }

  searchBtn?.addEventListener("click", () => {
    if (dash.classList.contains("is-collapsed")) dash.classList.remove("is-collapsed");
    const open = filter.hidden;
    filter.hidden = !open;
    searchBtn.setAttribute("aria-expanded", String(open));
    if (open) filter.focus();
    else {
      filter.value = "";
      applyFilter();
    }
  });
  filter?.addEventListener("input", applyFilter);
  filter?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    filter.value = "";
    filter.hidden = true;
    searchBtn.setAttribute("aria-expanded", "false");
    applyFilter();
  });
  collapseBtn?.addEventListener("click", () => {
    const collapsed = dash.classList.toggle("is-collapsed");
    collapseBtn.setAttribute("aria-expanded", String(!collapsed));
    collapseBtn.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    if (!collapsed) return;
    filter.hidden = true;
    filter.value = "";
    searchBtn.setAttribute("aria-expanded", "false");
    applyFilter();
  });
  toggle?.addEventListener("click", async () => {
    if (!LOCAL || !TOKEN) {
      status.textContent = "Toggle Hooxie from the desktop app.";
      return;
    }
    const next = !widgetShown;
    toggle.disabled = true;
    try {
      const result = await request("/api/widget/visible", { shown: next });
      widgetShown = result.shown !== false;
      status.textContent = widgetShown ? "Hooxie is on screen." : "Hooxie is hidden. Ctrl+\\ shows it again.";
    } catch (error) {
      status.textContent = error.message;
    } finally {
      toggle.disabled = false;
    }
  });
}

function bootDashboard() {
  const buttons = [...document.querySelectorAll(".side button[data-open]")];
  const sections = [...document.querySelectorAll("[data-section]")];
  const status = document.querySelector("#status");
  const detectable = document.querySelector("#detectable");
  const audio = document.querySelector("#audio");
  const opacity = document.querySelector("#opacity");
  const opacityValue = document.querySelector("#opacity-value");
  const swatches = document.querySelector("#swatches");
  const languageButtons = [...document.querySelectorAll("#language-choices button")];
  const email = document.querySelector("#email");
  const promo = document.querySelector("#promo");
  const session = document.querySelector("#session-state");
  let revision = 0;
  let settings = {
    detectable: true,
    button: "#ffffff",
    opacity: 50,
    audio: true,
    session: false,
    language: "en",
    blur: false,
    trace: true,
    ide: "cursor",
    installationId: "",
    project: "",
    route: "",
    instructions: "",
    files: "",
    includePath: false,
    includeStack: false,
    unsandboxed: false,
    experimental: false,
    chime: "blushing",
    chimeCustom: false,
    arrows: false,
    dashboardMode: "dark",
    widgetMode: "dark",
  };
  let catalog = { ides: [], installations: [], sessions: [] };
  let routes = [];

  for (const color of COLORS) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.dataset.color = color;
    swatch.style.background = color;
    swatch.setAttribute("aria-label", color);
    swatch.addEventListener("click", () => save({ button: color }));
    swatches.append(swatch);
  }
  email.value = localStorage.getItem("hooxie-account-email") || "";

  function show(name) {
    for (const section of sections) section.hidden = section.dataset.section !== name;
    for (const button of buttons) {
      if (button.dataset.open === name) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
    history.replaceState(null, "", `#${name}`);
  }
  for (const button of buttons) button.addEventListener("click", () => show(button.dataset.open));
  show((location.hash || "#general").slice(1) || "general");
  wireSidebar(buttons, status);

  function paint() {
    detectable.checked = settings.detectable !== false;
    audio.checked = settings.audio !== false;
    opacity.value = String(settings.opacity ?? 50);
    opacityValue.textContent = `${opacity.value}%`;
    setLanguage(settings.language || "en");
    session.textContent = settings.session ? "Running" : "Stopped";
    const version = document.querySelector("#version");
    if (settings.version && version) version.textContent = settings.version;
    for (const swatch of swatches.children) {
      swatch.setAttribute("aria-checked", String(swatch.dataset.color === settings.button));
    }
    document.documentElement.style.setProperty("--button", COLORS.includes(settings.button) ? settings.button : "#ffffff");
    const blur = document.querySelector("#blur");
    const trace = document.querySelector("#trace");
    if (blur) blur.checked = settings.blur === true;
    if (trace) trace.checked = settings.trace !== false;
    const arrows = document.querySelector("#arrows");
    if (arrows) arrows.checked = settings.arrows === true;
    paintChimes();
    paintWidget();
    paintAccount();
    paintOnboarding();
    paintModes();
  }

  function paintModes() {
    const dashboardMode = settings.dashboardMode === "light" ? "light" : "dark";
    const widgetMode = settings.widgetMode === "light" ? "light" : "dark";
    document.documentElement.dataset.appearance = dashboardMode;
    for (const button of document.querySelectorAll("[data-dashboard-mode]")) {
      button.setAttribute("aria-checked", String(button.dataset.dashboardMode === dashboardMode));
    }
    for (const button of document.querySelectorAll("[data-widget-mode]")) {
      button.setAttribute("aria-checked", String(button.dataset.widgetMode === widgetMode));
    }
  }

  function paintOnboarding() {
    const note = document.querySelector("#onboarding-note");
    if (!note) return;
    if (settings.onboardingStep === "download" || settings.onboardingStep === "connect") note.textContent = "The widget is showing Download and Connect again.";
    else note.textContent = "Start over to see Download and Connect again.";
  }

  function setLanguage(code) {
    const next = languageButtons.some((button) => button.dataset.lang === code) ? code : "en";
    for (const button of languageButtons) button.setAttribute("aria-checked", String(button.dataset.lang === next));
    applyLanguage(next);
  }

  function applyLanguage(code) {
    const table = COPY[code] || {};
    for (const node of document.querySelectorAll("[data-i18n]")) {
      const next = table[node.dataset.i18n];
      if (next) node.textContent = next;
    }
    document.documentElement.lang = code || "en";
  }

  async function save(partial) {
    settings = { ...settings, ...partial };
    if ("detectable" in partial) settings.session = partial.detectable === false;
    if ("session" in partial) settings.detectable = partial.session !== true;
    paint();
    if (!LOCAL || !TOKEN) {
      localStorage.setItem("hooxie-dash", JSON.stringify(settings));
      return;
    }
    try {
      const result = await request("/api/settings", settings);
      revision = result.revision;
      settings = result;
      paint();
    } catch (error) {
      status.textContent = error.message;
    }
  }

  detectable.addEventListener("change", () => save({ detectable: detectable.checked }));
  audio.addEventListener("change", () => save({ audio: audio.checked }));
  document.querySelector("#blur").addEventListener("change", (event) => save({ blur: event.target.checked, lookReady: true }));
  document.querySelector("#trace").addEventListener("change", (event) => save({ trace: event.target.checked, lookReady: true }));
  document.querySelector("#arrows").addEventListener("change", (event) => save({ arrows: event.target.checked }));
  opacity.addEventListener("input", () => {
    opacityValue.textContent = `${opacity.value}%`;
    save({ opacity: Number(opacity.value) });
  });
  for (const button of languageButtons) {
    button.addEventListener("click", () => save({ language: button.dataset.lang }));
  }
  for (const button of document.querySelectorAll("[data-dashboard-mode]")) {
    button.addEventListener("click", () => save({ dashboardMode: button.dataset.dashboardMode }));
  }
  for (const button of document.querySelectorAll("[data-widget-mode]")) {
    button.addEventListener("click", () => save({ widgetMode: button.dataset.widgetMode }));
  }
  document.querySelector("#onboarding-restart")?.addEventListener("click", () => {
    restartOnboarding().catch((error) => {
      const note = document.querySelector("#onboarding-note");
      if (note) note.textContent = error.message;
    });
  });
  document.querySelector("#connect").addEventListener("click", () => startCheckout(email.value, promo.value));

  async function restartOnboarding() {
    const note = document.querySelector("#onboarding-note");
    if (!LOCAL || !TOKEN) {
      if (note) note.textContent = "Start over from the Hooxie widget on this computer.";
      return;
    }
    const result = await request("/api/onboarding/restart", {});
    settings = { ...settings, onboardingStep: result.phase === "connect" ? "connect" : "download", connectedIde: "" };
    paint();
  }
  document.querySelector("#subscribe").addEventListener("click", () => startCheckout(email.value, promo.value));

  async function startCheckout(accountEmail, code) {
    status.textContent = "Opening checkout.";
    try {
      if (accountEmail) localStorage.setItem("hooxie-account-email", accountEmail.trim());
      const path = LOCAL ? "/api/billing/checkout" : "/api/checkout";
      const result = await request(path, { email: accountEmail, promo: code });
      location.href = result.url;
    } catch (error) {
      status.textContent = error.message;
    }
  }

  async function refresh() {
    if (!LOCAL || !TOKEN) {
      const saved = localStorage.getItem("hooxie-dash");
      if (saved) settings = { ...settings, ...JSON.parse(saved) };
      paint();
      return;
    }
    const result = await request("/api/settings");
    if (result.revision !== revision) {
      revision = result.revision;
      settings = result;
      paint();
      await loadRoutes();
    }
    if (!catalog.ides.length) {
      catalog = await request("/api/state");
      if (catalog.cursorKeyConfigured) settings.cursorConnected = true;
      paintWidget();
      paintAccount();
    }
  }

  const params = new URLSearchParams(location.search);
  if (params.get("billing") === "success") {
    status.textContent = "You're on Pro. Stripe emailed the receipt.";
    const sessionId = params.get("session_id");
    if (LOCAL && sessionId) {
      request("/api/billing/confirm", { sessionId }).then((result) => {
        status.textContent = result.active ? `Pro is active${result.email ? ` for ${result.email}` : ""}.` : "Checkout is not complete yet.";
      }).catch((error) => { status.textContent = error.message; });
    }
  } else if (params.get("billing") === "cancel") {
    status.textContent = "Checkout was canceled.";
  }
  wireChimes();
  wireWidget();

  const CHIME_CHOICES = [
    ["blushing", "Blushing"],
    ["xtreme-bass", "Xtreme bass"],
    ["undertaker", "Undertaker"],
    ["ekh", "Ekh"],
    ["cat-choke", "Cat choke"],
    ["off", "Off"],
  ];
  const CHIME_FILES = {
    blushing: "blushing-sound.mp3",
    "xtreme-bass": "xtreme-bass-effect.mp3",
    undertaker: "undertaker-cloche.mp3",
    ekh: "ekh.mp3",
    "cat-choke": "cat-choke.mp3",
  };
  let previewAudio = null;
  let previewUrl = "";
  refresh().catch((error) => { status.textContent = error.message; });
  if (LOCAL && TOKEN) window.setInterval(() => { refresh().catch(() => {}); }, 1500);

  function paintChimes() {
    const list = document.querySelector("#chime-list");
    if (!list) return;
    const choices = [...CHIME_CHOICES];
    if (settings.chimeCustom || settings.chime === "custom") choices.splice(choices.length - 1, 0, ["custom", "Your sound"]);
    list.replaceChildren(...choices.map(([id, label]) => {
      const row = document.createElement("div");
      row.className = "chime-item";
      const pick = document.createElement("button");
      pick.type = "button";
      pick.className = "pick";
      pick.textContent = label;
      pick.setAttribute("aria-checked", String(settings.chime === id));
      pick.addEventListener("click", () => save({ chime: id }));
      row.append(pick);
      if (id !== "off") {
        const preview = document.createElement("button");
        preview.type = "button";
        preview.className = "preview";
        preview.textContent = "Preview";
        preview.addEventListener("click", () => { previewChime(id).catch((error) => { status.textContent = error.message; }); });
        row.append(preview);
      }
      return row;
    }));
  }

  async function previewChime(id) {
    if (previewAudio) previewAudio.pause();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }
    let src = "";
    if (id === "custom") {
      const response = await fetch("/api/chime", { headers: TOKEN ? { authorization: `Bearer ${TOKEN}` } : {} });
      if (!response.ok) throw new Error("Upload a sound before previewing it.");
      previewUrl = URL.createObjectURL(await response.blob());
      src = previewUrl;
    } else {
      src = `/sounds/${CHIME_FILES[id]}`;
    }
    previewAudio = new Audio(src);
    await previewAudio.play();
  }

  function wireChimes() {
    const input = document.querySelector("#chime-file");
    document.querySelector("#chime-upload").addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      input.value = "";
      const note = document.querySelector("#chime-note");
      if (!file) return;
      if (file.size > 8_000_000) {
        note.textContent = "That sound is larger than 8 MB.";
        return;
      }
      if (!LOCAL || !TOKEN) {
        note.textContent = "Uploaded sounds are saved in the desktop app.";
        return;
      }
      try {
        const response = await fetch("/api/chime", {
          method: "POST",
          headers: {
            authorization: `Bearer ${TOKEN}`,
            "content-type": file.type || "application/octet-stream",
          },
          body: file,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Upload failed.");
        revision = payload.revision;
        settings = payload;
        paint();
        note.textContent = "Your sound is selected. It plays when the agent finishes.";
      } catch (error) {
        note.textContent = error.message;
      }
    });
  }

  function paintWidget() {
    const project = document.querySelector("#dash-project");
    const instructions = document.querySelector("#dash-instructions");
    const files = document.querySelector("#dash-files");
    if (document.activeElement !== project) project.value = settings.project || "";
    if (document.activeElement !== instructions) instructions.value = settings.instructions || "";
    if (document.activeElement !== files) files.value = settings.files || "";
    document.querySelector("#dash-include-path").checked = settings.includePath === true;
    document.querySelector("#dash-include-stack").checked = settings.includeStack === true;
    document.querySelector("#dash-unsandboxed").checked = settings.unsandboxed === true;
    document.querySelector("#dash-experimental").checked = settings.experimental === true;
    renderIdeChoices();
    renderInstallChoices();
    renderRouteChoices();
    renderWorkspaceChoices();
  }

  function paintAccount() {
    const connected = settings.cursorConnected === true;
    const button = document.querySelector("#dash-connect");
    const note = document.querySelector("#dash-key-note");
    if (button) button.hidden = connected;
    if (note && note.dataset.hold !== "1") {
      note.textContent = connected
        ? "Cursor is connected. Hooxie can send."
        : "Press Connect Cursor. Sign-in opens in the browser.";
    }
  }

  function choiceButton(label, checked, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-checked", String(checked));
    button.addEventListener("click", onClick);
    return button;
  }

  function renderIdeChoices() {
    const box = document.querySelector("#dash-ides");
    const ides = catalog.ides || [];
    box.replaceChildren(...ides.map((ide) => choiceButton(ide.label, settings.ide === ide.ide, () => {
      save({ ide: ide.ide, installationId: "", route: "", deliveryReady: true });
      loadRoutes();
    })));
  }

  function renderInstallChoices() {
    const box = document.querySelector("#dash-installs");
    const label = document.querySelector("#dash-install-label");
    const matches = (catalog.installations || []).filter((item) => item.ide === (settings.ide || "cursor"));
    label.hidden = matches.length === 0;
    box.hidden = matches.length === 0;
    box.replaceChildren(...matches.map((item) => choiceButton(item.label, settings.installationId === item.id, () => {
      save({ installationId: item.id, deliveryReady: true });
    })));
  }

  function renderRouteChoices() {
    const box = document.querySelector("#dash-routes");
    const label = document.querySelector("#dash-route-label");
    const direct = (settings.ide || "cursor") === "cursor";
    label.hidden = direct || routes.length === 0;
    box.hidden = direct || routes.length === 0;
    box.replaceChildren(...routes.map((route) => choiceButton(route.label, settings.route === route.id, () => {
      save({ route: route.id, deliveryReady: true });
    })));
    const note = document.querySelector("#dash-route-note");
    const current = routes.find((route) => route.id === settings.route) || routes.find((route) => route.recommended);
    note.textContent = current && current.available === false ? (current.reason || "") : "";
    document.querySelector("#dash-sandbox-row").hidden = !current || current.id !== "cursor-sdk";
    document.querySelector("#dash-experimental-row").hidden = !current || current.id !== "companion";
  }

  function renderWorkspaceChoices() {
    const box = document.querySelector("#dash-workspaces");
    const buttons = [];
    for (const session of catalog.sessions || []) {
      for (const workspace of session.workspaces || []) {
        buttons.push(choiceButton(`${session.ide}: ${workspace.name}`, settings.project === workspace.path, () => {
          save({ ide: session.ide, project: workspace.path, deliveryReady: true });
          loadRoutes();
        }));
      }
    }
    box.replaceChildren(...buttons);
  }

  async function loadRoutes() {
    const project = (settings.project || "").trim();
    if (!LOCAL || !TOKEN || !project) {
      routes = [];
      renderRouteChoices();
      return;
    }
    try {
      const body = await request(`/api/routes?ide=${encodeURIComponent(settings.ide || "cursor")}&projectPath=${encodeURIComponent(project)}`);
      routes = body.routes || [];
      if (!routes.some((route) => route.id === settings.route)) {
        const agent = routes.find((route) => route.id === "cursor-sdk");
        const recommended = routes.find((route) => route.recommended);
        const next = settings.ide === "cursor" && agent ? agent.id : (recommended ? recommended.id : "");
        if (next && next !== settings.route) {
          save({ route: next, deliveryReady: true });
          return;
        }
      }
      renderRouteChoices();
    } catch (error) {
      routes = [];
      document.querySelector("#dash-route-note").textContent = error.message;
    }
  }

  function wireWidget() {
    const project = document.querySelector("#dash-project");
    const instructions = document.querySelector("#dash-instructions");
    const files = document.querySelector("#dash-files");
    let textTimer = 0;
    const later = (partial) => {
      window.clearTimeout(textTimer);
      textTimer = window.setTimeout(() => save({ ...partial, deliveryReady: true }), 250);
    };
    project.addEventListener("input", () => later({ project: project.value }));
    project.addEventListener("change", () => { save({ project: project.value, deliveryReady: true }); loadRoutes(); });
    instructions.addEventListener("input", () => later({ instructions: instructions.value }));
    files.addEventListener("input", () => later({ files: files.value }));
    document.querySelector("#dash-include-path").addEventListener("change", (event) => save({ includePath: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-include-stack").addEventListener("change", (event) => save({ includeStack: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-unsandboxed").addEventListener("change", (event) => save({ unsandboxed: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-experimental").addEventListener("change", (event) => save({ experimental: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-browse").addEventListener("click", async () => {
      try {
        const body = await request("/api/browse", { initialPath: project.value.trim() });
        if (!body.path) return;
        await save({ project: body.path, deliveryReady: true });
        loadRoutes();
      } catch (error) {
        status.textContent = error.message;
      }
    });
    document.querySelector("#dash-clear").addEventListener("click", () => {
      save({ project: "", files: "", deliveryReady: true });
      loadRoutes();
    });
    document.querySelector("#dash-open-ide").addEventListener("click", async () => {
      try {
        const body = await request("/api/open", { installationId: settings.installationId, projectPath: settings.project || "" });
        status.textContent = body.detail || "Opened.";
      } catch (error) {
        status.textContent = error.message;
      }
    });
    document.querySelector("#dash-save-key").addEventListener("click", async () => {
      const note = document.querySelector("#dash-key-note");
      try {
        await request("/api/key", {
          apiKey: document.querySelector("#dash-key").value,
          remember: document.querySelector("#dash-remember-key").checked,
        });
        document.querySelector("#dash-key").value = "";
        settings.cursorConnected = true;
        delete note.dataset.hold;
        paint();
        loadRoutes();
      } catch (error) {
        note.dataset.hold = "1";
        note.textContent = error.message;
      }
    });
    document.querySelector("#dash-connect").addEventListener("click", async () => {
      const note = document.querySelector("#dash-key-note");
      const button = document.querySelector("#dash-connect");
      button.disabled = true;
      note.dataset.hold = "1";
      note.textContent = "Finish sign-in in the browser.";
      try {
        const result = await request("/api/cursor/connect", {});
        settings.cursorConnected = result.connected === true;
        delete note.dataset.hold;
        paint();
        loadRoutes();
      } catch (error) {
        note.textContent = error.message;
      } finally {
        button.disabled = false;
        if (settings.cursorConnected === true) delete note.dataset.hold;
      }
    });
  }
}

async function request(path, body) {
  const headers = { "content-type": "application/json" };
  if (LOCAL && TOKEN) headers.authorization = `Bearer ${TOKEN}`;
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}
