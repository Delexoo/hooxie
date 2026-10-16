const scenes = {
  type: {
    prompt: "Make a simple studio site.",
    kicker: "Page",
    line: "A quiet studio page, ready to open.",
    live: false,
  },
  voice: {
    prompt: "Hey Hooxie, extend this note.",
    kicker: "Note",
    line: "The short note grows from 10 words to 20.",
    live: true,
  },
  preset: {
    prompt: "Explain this error.",
    kicker: "Saved prompt",
    line: "Sent again from the pill.",
    live: false,
  },
  all: {
    prompt: "Keep this on my screen.",
    kicker: "Hooxie",
    line: "Type it, say it, or send a saved prompt.",
    live: true,
  },
};

const steps = [...document.querySelectorAll(".intro-step")];
const marks = [...document.querySelectorAll(".intro-progress span")];
const prompt = document.querySelector("#intro-prompt");
const kicker = document.querySelector("#intro-kicker");
const line = document.querySelector("#intro-line");
const card = document.querySelector("#intro-card");
const pill = document.querySelector("#intro-pill");
const mic = document.querySelector("#intro-mic");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let choice = "type";
let timers = [];

const later = (fn, ms) => {
  const id = window.setTimeout(fn, ms);
  timers.push(id);
};

const clearTimers = () => {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
};

const startDemo = () => {
  const scene = scenes[choice] || scenes.type;
  const paint = () => {
    clearTimers();
    prompt.textContent = "";
    line.textContent = "";
    kicker.textContent = scene.kicker;
    card.hidden = true;
    mic.classList.toggle("is-live", scene.live);
    if (reduced) {
      prompt.textContent = scene.prompt;
      line.textContent = scene.line;
      card.hidden = false;
      pill.classList.remove("is-typing");
      mic.classList.remove("is-live");
      return;
    }
    pill.classList.add("is-typing");
    let index = 0;
    const type = () => {
      index += 1;
      prompt.textContent = scene.prompt.slice(0, index);
      if (index < scene.prompt.length) later(type, 42);
      else later(reveal, 380);
    };
    const reveal = () => {
      pill.classList.remove("is-typing");
      mic.classList.remove("is-live");
      line.textContent = scene.line;
      card.hidden = false;
      later(paint, 1900);
    };
    later(type, 260);
  };
  paint();
};

const show = (step) => {
  clearTimers();
  steps.forEach((panel) => {
    const on = Number(panel.dataset.step) === step;
    panel.classList.toggle("is-on", on);
    panel.hidden = !on;
  });
  marks.forEach((mark, index) => mark.classList.toggle("is-on", index < step));
  const heading = document.querySelector(`.intro-step[data-step="${step}"] :is(h1, h2)`);
  if (heading) heading.focus({ preventScroll: true });
  if (step === 3) startDemo();
};

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => show(Number(button.dataset.go)));
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    choice = button.dataset.choice;
    show(3);
  });
});

const opener = document.querySelector("#intro-open");
if (opener && !reduced) {
  const chars = [...opener.textContent];
  opener.textContent = "";
  opener.classList.add("is-saying");
  let index = 0;
  const say = () => {
    index += 1;
    const spoken = chars.slice(0, index).join("");
    opener.textContent = spoken;
    if (index >= chars.length) {
      opener.classList.remove("is-saying");
      return;
    }
    const wait = spoken.endsWith("...") ? 520 : chars[index - 1] === " " ? 28 : 34;
    later(say, wait);
  };
  later(say, 280);
}
