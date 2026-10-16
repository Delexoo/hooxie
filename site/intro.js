const scene = {
  prompt: "Make a simple studio site.",
  kicker: "Page",
  line: "A quiet studio page, ready to open.",
};

const steps = [...document.querySelectorAll(".intro-step")];
const marks = [...document.querySelectorAll(".intro-progress span")];
const input = document.querySelector("#pill-input");
const caret = document.querySelector("#pill-caret");
const measure = document.querySelector("#pill-measure");
const send = document.querySelector("#demo-send");
const trace = document.querySelector("#pill-trace");
const stealth = document.querySelector("#pill-stealth");
const traceGrad = document.querySelector("#pill-trace-grad");
const kicker = document.querySelector("#intro-kicker");
const line = document.querySelector("#intro-line");
const card = document.querySelector("#intro-card");
const pill = document.querySelector("#intro-pill");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let timers = [];
let ringFrame = 0;
let ringOn = false;

const later = (fn, ms) => {
  const id = window.setTimeout(fn, ms);
  timers.push(id);
};

const stopRing = () => {
  ringOn = false;
  if (ringFrame) cancelAnimationFrame(ringFrame);
  ringFrame = 0;
};

const clearTimers = () => {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
  stopRing();
};

const fitRing = () => {
  const width = Math.max(1, pill.clientWidth);
  const height = Math.max(1, pill.clientHeight);
  for (const svg of [trace, stealth]) {
    if (!svg) continue;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const inset = svg === stealth ? 1.4 : 2.4;
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

const spinRing = (now) => {
  if (!ringOn || !traceGrad) return;
  ringFrame = requestAnimationFrame(spinRing);
  const angle = ((now % 2600) / 2600) * 360;
  traceGrad.setAttribute("gradientTransform", `rotate(${angle.toFixed(2)} ${pill.clientWidth / 2} ${pill.clientHeight / 2})`);
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

const startDemo = () => {
  const paint = () => {
    clearTimers();
    input.value = "";
    line.textContent = "";
    kicker.textContent = scene.kicker;
    card.classList.remove("is-in");
    caret.hidden = true;
    send.classList.remove("is-send");
    pill.classList.remove("is-live");
    fitRing();
    if (reduced) {
      input.value = scene.prompt;
      line.textContent = scene.line;
      card.classList.add("is-in");
      send.classList.add("is-send");
      return;
    }
    let index = 0;
    const type = () => {
      index += 1;
      input.value = scene.prompt.slice(0, index);
      caret.hidden = false;
      placeCaret();
      send.classList.add("is-send");
      if (!ringOn) {
        ringOn = true;
        pill.classList.add("is-live");
        ringFrame = requestAnimationFrame(spinRing);
      }
      if (index < scene.prompt.length) later(type, 42);
      else later(reveal, 380);
    };
    const reveal = () => {
      caret.hidden = true;
      pill.classList.remove("is-live");
      stopRing();
      line.textContent = scene.line;
      card.classList.add("is-in");
      later(paint, 2200);
    };
    later(type, 260);
  };
  paint();
};

let current = 1;
let enterTimer = 0;
let leaveTimer = 0;

const settle = (panel) => {
  panel.classList.remove("is-leaving", "is-enter", "is-on");
  panel.hidden = true;
};

const reveal = (next, step) => {
  next.hidden = false;
  next.classList.add("is-on");
  if (!reduced) {
    next.classList.remove("is-enter");
    void next.offsetWidth;
    next.classList.add("is-enter");
    enterTimer = window.setTimeout(() => next.classList.remove("is-enter"), 820);
  }
  marks.forEach((mark, index) => mark.classList.toggle("is-on", index < step));
  const heading = next.querySelector(":is(h1, h2)");
  if (heading) heading.focus({ preventScroll: true });
  if (step === 3) startDemo();
};

const show = (step) => {
  if (step === current) return;
  clearTimers();
  window.clearTimeout(enterTimer);
  window.clearTimeout(leaveTimer);
  const next = steps.find((panel) => Number(panel.dataset.step) === step);
  const prev = steps.find((panel) => Number(panel.dataset.step) === current);
  if (!next || next === prev) return;
  steps.forEach((panel) => {
    if (panel !== prev && panel.classList.contains("is-leaving")) settle(panel);
  });
  current = step;

  const finish = () => {
    if (!prev || !prev.classList.contains("is-leaving")) return;
    settle(prev);
    reveal(next, step);
  };

  if (prev && !reduced) {
    prev.classList.remove("is-enter");
    prev.classList.add("is-leaving");
    const done = (event) => {
      if (event.target !== prev) return;
      prev.removeEventListener("animationend", done);
      finish();
    };
    prev.addEventListener("animationend", done);
    leaveTimer = window.setTimeout(finish, 360);
    return;
  }

  if (prev) settle(prev);
  reveal(next, step);
};

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => show(Number(button.dataset.go)));
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => show(3));
});
