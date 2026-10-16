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
    const style = getComputedStyle(input);
    measure.style.font = style.font;
    measure.style.letterSpacing = style.letterSpacing;
    measure.textContent = input.value;
    const text = measure.getBoundingClientRect().width;
    const max = Math.max(0, input.clientWidth - 2);
    caret.style.transform = `translateX(${Math.min(text, max)}px)`;
  };

  let stealthDots = 0;
  const placeStealthDots = (rect, width, height, radius) => {
    const perimeter = 2 * (width + height - 2 * radius) + 2 * Math.PI * radius;
    const ideal = Math.max(16, Math.round(perimeter / 7.5));
    if (!stealthDots || Math.abs(ideal - stealthDots) > 1) stealthDots = ideal;
    const step = 100 / stealthDots;
    const dot = Math.min(step * 0.42, (1.6 / Math.max(perimeter, 1)) * 100);
    rect.setAttribute("pathLength", "100");
    rect.setAttribute("stroke-dasharray", `${dot.toFixed(3)} ${(step - dot).toFixed(3)}`);
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
        if (svg.id === "pill-stealth") placeStealthDots(rect, w, h, radius);
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

  const story = document.querySelector("#demo-story");
  let shown = false;
  const prompt = prompts[0];
  const renderScroll = () => {
    if (!story || taken) return;
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    const scrolled = Math.min(distance, Math.max(0, -story.getBoundingClientRect().top));
    const progress = scrolled / distance;
    const typeEnd = 0.62;
    const revealAt = 0.74;
    if (progress < revealAt) {
      if (shown) {
        preview.innerHTML = "";
        shown = false;
      }
      const count = Math.round(Math.min(1, progress / typeEnd) * prompt.text.length);
      const next = prompt.text.slice(0, count);
      const typing = count > 0 && count < prompt.text.length;
      const caretHidden = count === 0 || count === prompt.text.length;
      if (input.value !== next) {
        input.value = next;
        placeCaret();
      }
      if (caret.hidden !== caretHidden) caret.hidden = caretHidden;
      if (playing !== typing) {
        playing = typing;
        syncWidget();
      }
      return;
    }
    playing = false;
    if (input.value !== prompt.text) input.value = prompt.text;
    caret.hidden = true;
    syncWidget();
    if (!shown) {
      build(prompt.text, prompt);
      shown = true;
    }
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

  const blockTyping = (event) => {
    event.preventDefault();
    input.blur();
  };
  input.addEventListener("beforeinput", blockTyping);
  input.addEventListener("paste", blockTyping);
  input.addEventListener("drop", blockTyping);
  input.addEventListener("keydown", blockTyping);
  input.addEventListener("focus", () => input.blur());

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
    pill.style.right = "auto";
    pill.style.top = `${box.top - screenBox.top}px`;
    pill.style.margin = "0";
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
  drag.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 28 : 14;
    const key = event.key;
    if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowDown") return;
    event.preventDefault();
    const screenBox = screen.getBoundingClientRect();
    const box = pill.getBoundingClientRect();
    pill.style.right = "auto";
    pill.style.margin = "0";
    pill.style.transform = "none";
    const dx = key === "ArrowLeft" ? -step : key === "ArrowRight" ? step : 0;
    const dy = key === "ArrowUp" ? -step : key === "ArrowDown" ? step : 0;
    const x = Math.max(8, Math.min(box.left - screenBox.left + dx, screenBox.width - pill.offsetWidth - 8));
    const y = Math.max(8, Math.min(box.top - screenBox.top + dy, screenBox.height - pill.offsetHeight - 8));
    pill.style.left = `${x}px`;
    pill.style.top = `${y}px`;
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    input.value = prompts[0].text;
    build(prompts[0].text, prompts[0]);
    syncWidget();
  } else {
    window.addEventListener("scroll", renderScroll, { passive: true });
    renderScroll();
  }

  fitRing();
  syncWidget();
  if (typeof ResizeObserver === "function") new ResizeObserver(fitRing).observe(pill);
  requestAnimationFrame(spinRing);
}

const voiceHello = document.querySelector("#voice-hello");
const voiceMic = document.querySelector("#voice-mic");

if (voiceHello && voiceMic) {
  const line = "Hey Hooxie! Create me a blank html that says Hello World";
  const follow = "Hey Hooxie, I forgot to bold it, haha.";
  const hello = "Hello World!";
  const voicePage = document.querySelector(".voice-page");
  const lineEl = document.querySelector("#voice-line");
  const followEl = document.querySelector("#voice-follow");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  voiceHello.replaceChildren(...[...hello].map((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    return span;
  }));
  const letters = [...voiceHello.children];

  const voice = document.querySelector("#voice");
  const story = document.querySelector("#voice-story");
  let recording = false;
  let bold = false;

  const paintBold = (on) => {
    if (on === bold) return;
    bold = on;
    letters.forEach((letter) => letter.classList.toggle("is-bold", on));
  };

  const setRecording = (hearing) => {
    if (recording === hearing) return;
    recording = hearing;
    voiceMic.classList.toggle("is-live", hearing);
    voice.classList.toggle("is-recording", hearing);
  };

  const showPage = () => {
    voicePage?.classList.add("is-in");
    if (lineEl) lineEl.textContent = `“${line}”`;
    if (followEl) followEl.textContent = `“${follow}”`;
    paintBold(true);
  };

  const renderVoice = () => {
    if (!story) return;
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    const scrolled = Math.min(distance, Math.max(0, -story.getBoundingClientRect().top));
    const progress = scrolled / distance;
    const pageAt = 0.32;
    const followAt = 0.4;
    if (progress < pageAt) {
      const count = Math.round(Math.min(1, progress / 0.26) * line.length);
      const next = line.slice(0, count);
      const spoken = next ? (count >= line.length ? `“${next}”` : `“${next}`) : "";
      if (lineEl && lineEl.textContent !== spoken) lineEl.textContent = spoken;
      if (followEl && followEl.textContent) followEl.textContent = "";
      setRecording(count > 0 && count < line.length);
      voicePage?.classList.remove("is-in");
      paintBold(false);
      return;
    }
    voicePage?.classList.add("is-in");
    if (lineEl && lineEl.textContent !== `“${line}”`) lineEl.textContent = `“${line}”`;
    if (progress < followAt) {
      if (followEl && followEl.textContent) followEl.textContent = "";
      setRecording(false);
      paintBold(false);
      return;
    }
    const count = Math.round(Math.min(1, (progress - followAt) / 0.28) * follow.length);
    const safe = Math.max(0, count);
    const done = safe >= follow.length;
    const next = follow.slice(0, safe);
    const spoken = next ? (done ? `“${next}”` : `“${next}`) : "";
    if (followEl && followEl.textContent !== spoken) followEl.textContent = spoken;
    setRecording(safe > 0 && !done);
    paintBold(done);
  };

  if (reduced) showPage();
  else {
    window.addEventListener("scroll", renderVoice, { passive: true });
    renderVoice();
  }
}
