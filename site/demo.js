const screen = document.querySelector("#demo-screen");
const preview = document.querySelector("#site-preview");
const pill = document.querySelector("#demo-pill");
const form = document.querySelector("#demo-form");
const input = document.querySelector("#pill-input");
const showBtn = document.querySelector("#demo-show");

if (screen && preview && pill && form && input && showBtn) {
  const prompts = [
    {
      text: "Make a simple studio site.",
      brand: "Studio",
      title: "Simple studio site",
      copy: "Selected work, a short note, and room for three projects.",
      action: "View work",
      cards: ["Print", "Identity", "Web"],
    },
    {
      text: "Build a quiet cafe page.",
      brand: "North",
      title: "Quiet cafe page",
      copy: "Hours, a short menu, and a table you can reserve.",
      action: "Reserve",
      cards: ["Coffee", "Lunch", "Cake"],
    },
    {
      text: "Create a small portfolio.",
      brand: "Atelier",
      title: "Small portfolio",
      copy: "Three pieces, a line about the practice, and a way to write.",
      action: "See pieces",
      cards: ["Form", "Type", "Still"],
    },
    {
      text: "Make a clean shop homepage.",
      brand: "Field",
      title: "Clean shop homepage",
      copy: "A featured item, two companions, and a clear way to buy.",
      action: "Shop",
      cards: ["Vessel", "Cloth", "Lamp"],
    },
  ];
  const panels = [
    ["#demo-preset", "#demo-presets"],
    ["#demo-more", "#demo-more-menu"],
    ["#demo-usage", "#demo-usage-panel"],
    ["#demo-dash", "#demo-dash-panel"],
  ].map(([button, panel]) => ({
    button: document.querySelector(button),
    panel: document.querySelector(panel),
  }));
  const caret = document.querySelector("#pill-caret");
  const measure = document.querySelector("#pill-measure");
  const sendBtn = document.querySelector("#demo-send");
  const trace = document.querySelector("#pill-trace");
  const traceGrad = document.querySelector("#pill-trace-grad");
  let timers = [];
  let playing = false;
  let taken = false;
  let listening = false;
  let ringOn = false;
  let index = 0;

  const wait = (ms) => new Promise((resolve) => {
    const id = window.setTimeout(resolve, ms);
    timers.push(id);
  });

  const stop = () => {
    taken = true;
    for (const id of timers) window.clearTimeout(id);
    timers = [];
    playing = false;
    caret.hidden = true;
  };

  const placeCaret = () => {
    measure.textContent = input.value;
    caret.style.transform = `translateX(${measure.offsetWidth}px)`;
  };

  const fitRing = () => {
    const width = Math.max(1, pill.clientWidth);
    const height = Math.max(1, pill.clientHeight);
    for (const svg of [trace, document.querySelector("#pill-stealth")]) {
      if (!svg) continue;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const inset = svg.id === "pill-stealth" ? 1.4 : 2.4;
      const w = Math.max(4, width - inset * 2);
      const h = Math.max(4, height - inset * 2);
      const radius = h / 2;
      svg.querySelectorAll("rect").forEach((rect) => {
        rect.setAttribute("x", String(inset));
        rect.setAttribute("y", String(inset));
        rect.setAttribute("width", String(w));
        rect.setAttribute("height", String(h));
        rect.setAttribute("rx", String(radius));
        rect.setAttribute("ry", String(radius));
      });
    }
    if (!traceGrad) return;
    traceGrad.setAttribute("x1", "0");
    traceGrad.setAttribute("y1", String(height / 2));
    traceGrad.setAttribute("x2", String(width));
    traceGrad.setAttribute("y2", String(height / 2));
  };

  const syncWidget = () => {
    const text = input.value.trim();
    sendBtn.classList.toggle("is-send", Boolean(text));
    sendBtn.classList.toggle("is-listening", listening && !text);
    sendBtn.setAttribute("aria-label", text ? "Send" : listening ? "Stop voice" : "Voice");
    ringOn = listening || document.activeElement === input || (playing && input.value.length > 0);
    pill.classList.toggle("is-live", ringOn);
  };

  const spinRing = (now) => {
    requestAnimationFrame(spinRing);
    if (!ringOn || !traceGrad) return;
    const angle = ((now % 2600) / 2600) * 360;
    traceGrad.setAttribute("gradientTransform", `rotate(${angle.toFixed(2)} ${pill.clientWidth / 2} ${pill.clientHeight / 2})`);
  };

  const closePanels = () => {
    for (const item of panels) {
      item.panel.hidden = true;
      item.button.setAttribute("aria-expanded", "false");
    }
  };

  const titleFrom = (text) => {
    const clean = text.replace(/[.!?]+$/g, "").trim();
    const stripped = clean.replace(/^(make|build|create)\s+(a|an|the)\s+/i, "");
    const words = (stripped || "Studio").split(/\s+/).slice(0, 4);
    const line = words.join(" ");
    return line.charAt(0).toUpperCase() + line.slice(1);
  };

  const build = (text, detail) => {
    const title = detail?.title || titleFrom(text);
    const brand = detail?.brand || title.split(/\s+/)[0] || "Studio";
    const copy = detail?.copy || "A simple page from that prompt, with a few sections ready to edit.";
    const action = detail?.action || "Open";
    const cards = detail?.cards || ["First", "Next", "Last"];
    preview.innerHTML = "";
    const site = document.createElement("article");
    site.className = "mini-site";
    const top = document.createElement("div");
    top.className = "mini-top";
    const brandEl = document.createElement("p");
    brandEl.className = "mini-brand";
    brandEl.textContent = brand;
    const nav = document.createElement("p");
    nav.className = "mini-nav";
    nav.textContent = "Work";
    top.append(brandEl, nav);
    const heading = document.createElement("h3");
    heading.textContent = title;
    const blurb = document.createElement("p");
    blurb.className = "mini-copy";
    blurb.textContent = copy;
    const row = document.createElement("div");
    row.className = "mini-cards";
    for (const label of cards) {
      const card = document.createElement("figure");
      const block = document.createElement("span");
      const name = document.createElement("figcaption");
      name.textContent = label;
      card.append(block, name);
      row.append(card);
    }
    const cta = document.createElement("p");
    cta.className = "mini-action";
    cta.textContent = action;
    site.append(top, heading, blurb, row, cta);
    preview.append(site);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => site.classList.add("is-in"));
    });
  };

  const play = async () => {
    if (taken || playing) return;
    playing = true;
    const prompt = prompts[index % prompts.length];
    preview.innerHTML = "";
    input.value = "";
    caret.hidden = false;
    placeCaret();
    syncWidget();
    for (const letter of prompt.text) {
      if (!playing) return;
      input.value += letter;
      placeCaret();
      syncWidget();
      await wait(letter === " " ? 110 : 64);
    }
    if (!playing) return;
    await wait(420);
    if (!playing) return;
    build(prompt.text, prompt);
    await wait(3200);
    if (!playing) return;
    const current = preview.querySelector(".mini-site");
    if (current) current.classList.add("is-out");
    caret.hidden = true;
    await wait(420);
    if (!playing) return;
    preview.innerHTML = "";
    input.value = "";
    playing = false;
    syncWidget();
    index += 1;
    await wait(360);
    if (!taken) play();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    stop();
    closePanels();
    const text = input.value.trim();
    listening = false;
    syncWidget();
    if (!text) return;
    build(text);
  });

  input.addEventListener("input", () => {
    stop();
    syncWidget();
  });

  input.addEventListener("focus", () => syncWidget());
  input.addEventListener("blur", () => syncWidget());

  sendBtn.addEventListener("click", () => {
    if (input.value.trim()) {
      form.requestSubmit();
      return;
    }
    stop();
    listening = !listening;
    syncWidget();
  });

  for (const item of panels) {
    item.button.addEventListener("click", () => {
      const open = item.button.getAttribute("aria-expanded") === "true";
      closePanels();
      if (!open) {
        item.panel.hidden = false;
        item.button.setAttribute("aria-expanded", "true");
      }
    });
  }

  document.querySelector("#demo-presets").addEventListener("click", (event) => {
    const choice = event.target.closest("[data-preset]");
    if (!choice) return;
    stop();
    input.value = choice.dataset.preset;
    closePanels();
    syncWidget();
  });

  document.querySelector("#demo-more-menu").addEventListener("click", (event) => {
    const choice = event.target.closest("[data-more]");
    if (!choice) return;
    if (choice.dataset.more === "hide") {
      stop();
      closePanels();
      pill.classList.add("is-away");
      showBtn.hidden = false;
      return;
    }
    if (choice.dataset.more === "clear") {
      stop();
      input.value = "";
      preview.innerHTML = "";
      closePanels();
      listening = false;
      syncWidget();
      return;
    }
    const enabled = choice.getAttribute("aria-pressed") !== "true";
    choice.setAttribute("aria-pressed", String(enabled));
    pill.classList.toggle("is-undetectable", enabled);
    document.querySelector("#demo-ghost-note").textContent = enabled
      ? "Hidden from screen share."
      : "Visible on a screen share.";
  });

  document.querySelector("#demo-voice").addEventListener("click", (event) => {
    const on = event.currentTarget.getAttribute("aria-pressed") !== "true";
    event.currentTarget.setAttribute("aria-pressed", String(on));
    event.currentTarget.textContent = on ? "Voice on" : "Voice off";
  });

  showBtn.addEventListener("click", () => {
    pill.classList.remove("is-away");
    showBtn.hidden = true;
  });

  screen.addEventListener("pointerdown", (event) => {
    if (pill.contains(event.target) || showBtn.contains(event.target)) return;
    closePanels();
  });

  const drag = document.querySelector("#demo-drag");
  drag.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const screenBox = screen.getBoundingClientRect();
    const box = pill.getBoundingClientRect();
    const offsetX = event.clientX - box.left;
    const offsetY = event.clientY - box.top;
    pill.style.left = `${box.left - screenBox.left}px`;
    pill.style.top = `${box.top - screenBox.top}px`;
    pill.style.transform = "none";
    drag.setPointerCapture(event.pointerId);
    const move = (ev) => {
      const bounds = screen.getBoundingClientRect();
      const width = pill.offsetWidth;
      const height = pill.offsetHeight;
      const x = Math.max(8, Math.min(ev.clientX - bounds.left - offsetX, bounds.width - width - 8));
      const y = Math.max(8, Math.min(ev.clientY - bounds.top - offsetY, bounds.height - height - 8));
      pill.style.left = `${x}px`;
      pill.style.top = `${y}px`;
    };
    const end = () => {
      drag.removeEventListener("pointermove", move);
      drag.removeEventListener("pointerup", end);
      drag.removeEventListener("pointercancel", end);
    };
    drag.addEventListener("pointermove", move);
    drag.addEventListener("pointerup", end);
    drag.addEventListener("pointercancel", end);
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    input.value = prompts[0].text;
    build(prompts[0].text, prompts[0]);
    syncWidget();
  } else {
    wait(600).then(() => {
      if (!taken && !input.value) play();
    });
  }

  fitRing();
  syncWidget();
  if (typeof ResizeObserver === "function") new ResizeObserver(fitRing).observe(pill);
  requestAnimationFrame(spinRing);
}

const voiceInput = document.querySelector("#voice-input");
const voiceBody = document.querySelector("#voice-body");
const voiceCount = document.querySelector("#voice-count");
const voiceMic = document.querySelector("#voice-mic");
const voiceCaret = document.querySelector("#voice-caret");
const voiceMeasure = document.querySelector("#voice-measure");

if (voiceInput && voiceBody && voiceCount && voiceMic && voiceCaret && voiceMeasure) {
  const line = "Hey Hooxie! Can you extend that word count from 10 to 20!";
  const base = "This short note gives the page room to breathe well.";
  const more = ["And", "leaves", "a", "clear", "space", "for", "the", "work", "that", "follows."];
  const pause = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const voicePill = document.querySelector("#voice-pill");
  const voiceScreen = document.querySelector("#voice-screen");

  const growVoice = () => {
    const text = voiceInput.value;
    if (!text) {
      voicePill.style.width = "";
      voiceInput.style.height = "";
      voiceCaret.style.top = "";
      voiceCaret.style.bottom = "";
      voiceCaret.style.height = "";
      voiceCaret.style.transform = "translateX(0px)";
      return;
    }

    const inputStyle = getComputedStyle(voiceInput);
    const pillStyle = getComputedStyle(voicePill);
    const lineHeight = parseFloat(inputStyle.lineHeight) || 22;
    const padTop = parseFloat(inputStyle.paddingTop) || 0;
    const padBottom = parseFloat(inputStyle.paddingBottom) || 0;
    const padLeft = parseFloat(inputStyle.paddingLeft) || 0;
    const padRight = parseFloat(inputStyle.paddingRight) || 0;
    const oneLine = Math.ceil(lineHeight + padTop + padBottom);

    voiceMeasure.style.font = inputStyle.font;
    voiceMeasure.style.letterSpacing = inputStyle.letterSpacing;
    voiceMeasure.style.lineHeight = `${lineHeight}px`;
    voiceMeasure.style.padding = "0";
    voiceMeasure.style.whiteSpace = "nowrap";
    voiceMeasure.style.width = "auto";
    voiceMeasure.textContent = text;
    const textWidth = Math.ceil(voiceMeasure.getBoundingClientRect().width);

    const chrome = parseFloat(pillStyle.paddingLeft) + parseFloat(pillStyle.paddingRight) + (parseFloat(pillStyle.columnGap) || 0) + voiceMic.offsetWidth;
    const max = Math.max(96, voiceScreen.clientWidth - 14);
    const floor = Math.min(136, max);
    const next = Math.min(max, Math.max(floor, textWidth + chrome + padLeft + padRight + 2));
    voicePill.style.width = `${Math.ceil(next)}px`;

    const contentWidth = Math.max(8, next - chrome - padLeft - padRight);
    let lines = 1;
    let caretX = textWidth;
    let height = oneLine;
    if (textWidth > contentWidth + 1) {
      voiceMeasure.style.whiteSpace = "pre-wrap";
      voiceMeasure.style.width = `${contentWidth}px`;
      const wrapped = voiceMeasure.getBoundingClientRect().height;
      lines = Math.max(2, Math.round(wrapped / lineHeight));
      const cap = Math.max(oneLine, Math.min(voiceScreen.clientHeight * 0.46, 112));
      height = Math.min(cap, Math.ceil(lines * lineHeight + padTop + padBottom));
      caretX = textWidth - (lines - 1) * contentWidth;
      voiceMeasure.style.whiteSpace = "nowrap";
      voiceMeasure.style.width = "auto";
    }

    voiceInput.style.height = `${height}px`;
    if (lines <= 1) {
      voiceCaret.style.top = "";
      voiceCaret.style.bottom = "";
      voiceCaret.style.height = "";
    } else {
      voiceCaret.style.bottom = "auto";
      voiceCaret.style.height = `${lineHeight}px`;
      voiceCaret.style.top = `${padTop + (lines - 1) * lineHeight}px`;
    }
    voiceCaret.style.transform = `translateX(${Math.max(0, caretX)}px)`;
  };

  const resetVoice = () => {
    voicePill.style.width = "";
    voiceInput.style.height = "";
    voiceCaret.style.top = "";
    voiceCaret.style.bottom = "";
    voiceCaret.style.height = "";
    voiceCaret.style.transform = "translateX(0px)";
  };

  const showExtended = () => {
    voiceBody.textContent = `${base} ${more.join(" ")}`;
    voiceCount.textContent = "20 words";
    voiceCount.classList.add("is-grown");
    voiceInput.value = line;
    growVoice();
  };

  const playVoice = async () => {
    voiceBody.textContent = base;
    voiceCount.textContent = "10 words";
    voiceCount.classList.remove("is-grown");
    voiceInput.value = "";
    resetVoice();
    voiceCaret.hidden = false;
    growVoice();
    voiceMic.classList.add("is-live");
    for (const letter of line) {
      voiceInput.value += letter;
      growVoice();
      await pause(letter === " " ? 70 : 38);
    }
    voiceMic.classList.remove("is-live");
    voiceCaret.hidden = true;
    await pause(420);
    const added = document.createElement("span");
    added.className = "voice-added";
    voiceBody.append(document.createTextNode(" "));
    voiceBody.append(added);
    for (let i = 0; i < more.length; i += 1) {
      added.textContent = more.slice(0, i + 1).join(" ");
      voiceCount.textContent = `${11 + i} words`;
      await pause(150);
    }
    voiceCount.classList.add("is-grown");
    await pause(2400);
    playVoice();
  };

  if (reduced) showExtended();
  else pause(700).then(playVoice);
}
