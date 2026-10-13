const CHAR_SETS = {
  standard: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: "01",
  hex: "0123456789ABCDEF",
};

const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const INK_GARDEN = {
  renderMode: "dither",
  bgMode: "none",
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 9,
  coverage: 100,
  invert: false,
  styleBlend: "source-over",
  charSet: "standard",
  customChars: "",
  brightness: 0,
  contrast: 158,
  edgeEmphasis: 0,
  density: 20,
  toneCurve: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
  tint: "#3ca6ff",
  tintOpacity: 0,
  overlayBlend: "multiply",
  saturation: 100,
  grayscale: 0,
  blurType: "off",
  blurAmount: 35,
  blurAngle: 0,
  directionalBothSides: false,
  tiltFocus: 35,
  tiltPosition: 50,
  tiltFeather: 15,
  lensFocus: 40,
  blurCenterX: 50,
  blurCenterY: 50,
  progressivePosition: 55,
  progressiveReverse: false,
  pfx: {
    vignette: { enabled: false, intensity: 38 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: false, intensity: 25 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
  },
  animated: true,
  animStyle: "pulse",
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
  lights: { enabled: false, points: [] },
  mask: { enabled: false, tool: "freehand", brushSize: 30, showOverlay: true, invert: false, dataUrl: null, shapes: [] },
};

function mountInkGarden(canvas, photoUrl, params = INK_GARDEN) {
  const cfg = { ...INK_GARDEN, ...params, pfx: { ...INK_GARDEN.pfx, ...(params.pfx || {}) } };
  const gl = canvas.getContext("2d", { alpha: false });
  if (!gl) return () => undefined;
  const photo = new Image();
  photo.decoding = "async";
  let cells = [];
  let cols = 0;
  let rows = 0;
  let cell = cfg.cellSize;
  let raf = 0;
  let start = performance.now();
  let photoReady = false;
  const scratch = document.createElement("canvas");
  const sx = scratch.getContext("2d", { willReadFrequently: true });
  const maskImg = new Image();
  if (cfg.mask?.enabled && cfg.mask.dataUrl) maskImg.src = cfg.mask.dataUrl;

  function sizeCanvas() {
    const parent = canvas.parentElement || canvas;
    const w = Math.max(320, Math.floor(parent.clientWidth || window.innerWidth));
    const h = Math.max(320, Math.floor(parent.clientHeight || window.innerHeight));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    gl.setTransform(dpr, 0, 0, dpr, 0, 0);
    sample(w, h);
  }

  function sample(w, h) {
    cell = Math.max(4, cfg.cellSize | 0);
    cols = Math.ceil(w / cell);
    rows = Math.ceil(h / cell);
    scratch.width = cols;
    scratch.height = rows;
    sx.fillStyle = "#000";
    sx.fillRect(0, 0, cols, rows);
    if (photoReady) {
      coverImage(sx, photo, cols, rows);
    }
    const pixels = sx.getImageData(0, 0, cols, rows).data;
    cells = new Array(cols * rows);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const i = (y * cols + x) * 4;
        const r = pixels[i] / 255;
        const g = pixels[i + 1] / 255;
        const b = pixels[i + 2] / 255;
        let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        lum = tone(lum, cfg.toneCurve);
        lum = clamp01(lum + cfg.brightness / 100);
        lum = clamp01((lum - 0.5) * (cfg.contrast / 100) + 0.5);
        if (cfg.invert) lum = 1 - lum;
        let sat = cfg.saturation / 100;
        const grayMix = cfg.grayscale / 100;
        const avg = (r + g + b) / 3;
        let cr = avg + (r - avg) * sat;
        let cg = avg + (g - avg) * sat;
        let cb = avg + (b - avg) * sat;
        cr = cr * (1 - grayMix) + lum * grayMix;
        cg = cg * (1 - grayMix) + lum * grayMix;
        cb = cb * (1 - grayMix) + lum * grayMix;
        cells[y * cols + x] = { lum, r: cr, g: cg, b: cb };
      }
    }
    if (cfg.edgeEmphasis > 0) emphasizeEdges();
  }

  function emphasizeEdges() {
    const amount = cfg.edgeEmphasis / 100;
    const next = cells.map((c) => ({ ...c }));
    for (let y = 1; y < rows - 1; y += 1) {
      for (let x = 1; x < cols - 1; x += 1) {
        const i = y * cols + x;
        const gx = cells[i + 1].lum - cells[i - 1].lum;
        const gy = cells[i + cols].lum - cells[i - cols].lum;
        const mag = Math.min(1, Math.hypot(gx, gy) * 2);
        next[i].lum = clamp01(cells[i].lum + mag * amount);
      }
    }
    cells = next;
  }

  function anim(t) {
    if (!cfg.animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
    const speed = cfg.animSpeed?.enabled ? (cfg.animSpeed.intensity || 0) / 100 : 0;
    const intensity = cfg.animIntensity?.enabled ? (cfg.animIntensity.intensity || 0) / 100 : 0;
    const phase = t * 0.0018 * (0.35 + speed * 1.4);
    if (cfg.animStyle === "wave") return Math.sin(phase) * intensity;
    if (cfg.animStyle === "shimmer") return (Math.sin(phase * 2.2) * 0.5 + Math.sin(phase * 0.7) * 0.5) * intensity;
    if (cfg.animStyle === "ripple") return Math.sin(phase) * intensity;
    if (cfg.animStyle === "flicker") return (Math.random() * 2 - 1) * intensity * 0.25;
    return (0.5 + 0.5 * Math.sin(phase)) * intensity;
  }

  function drawFrame(now) {
    const parent = canvas.parentElement || canvas;
    const w = Math.max(1, parent.clientWidth || window.innerWidth);
    const h = Math.max(1, parent.clientHeight || window.innerHeight);
    const pulse = anim(now - start);
    gl.globalCompositeOperation = "source-over";
    drawBackground(gl, w, h);
    gl.globalCompositeOperation = cfg.styleBlend || "source-over";
    const coverage = Math.max(0, Math.min(1, cfg.coverage / 100));
    const density = Math.max(0.04, cfg.density / 100);
    const chars = cfg.customChars || CHAR_SETS[cfg.charSet] || CHAR_SETS.standard;
    const mode = cfg.renderMode;
    const rain = ((now - start) / 90) | 0;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (coverage < 1 && hash(x, y) > coverage) continue;
        const cellData = cells[y * cols + x];
        if (!cellData) continue;
        let lum = cellData.lum;
        if (cfg.animStyle === "ripple") {
          const cx = x / cols - 0.5;
          const cy = y / rows - 0.5;
          lum = clamp01(lum + Math.sin((Math.hypot(cx, cy) * 14) - (now - start) * 0.004) * pulse * 0.35);
        } else if (cfg.animStyle === "wave") {
          lum = clamp01(lum + Math.sin(x * 0.35 + (now - start) * 0.003) * pulse * 0.35);
        } else if (cfg.animStyle === "shimmer") {
          lum = clamp01(lum + pulse * 0.22 * Math.sin(x * 0.8 + y * 0.4));
        } else {
          lum = clamp01(lum * (0.72 + pulse * 0.7) + pulse * 0.06);
        }
        const px = x * cell;
        const py = y * cell;
        const color = tinted(cellData, lum, cfg);
        drawCell(gl, mode, px, py, cell, lum, color, chars, density, x, y, rain);
      }
    }

    applyBlur(gl, w, h, cfg);
    applyTint(gl, w, h, cfg);
    applyPfx(gl, w, h, cfg, now);
    applyLights(gl, w, h, cfg);
    applyMask(gl, w, h, cfg);
    raf = window.requestAnimationFrame(drawFrame);
  }

  photo.onload = () => {
    photoReady = true;
    sizeCanvas();
    window.cancelAnimationFrame(raf);
    start = performance.now();
    raf = window.requestAnimationFrame(drawFrame);
  };
  photo.onerror = () => {
    photoReady = false;
    sizeCanvas();
    raf = window.requestAnimationFrame(drawFrame);
  };
  photo.src = photoUrl;
  window.addEventListener("resize", sizeCanvas);
  return () => {
    window.removeEventListener("resize", sizeCanvas);
    window.cancelAnimationFrame(raf);
  };

  function drawBackground(ctx, w, h) {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, w, h);
    if (!photoReady || cfg.bgMode === "none") return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, cfg.bgOpacity / 100));
    if (cfg.bgMode === "color") {
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, w, h);
    } else {
      if (cfg.bgMode === "blur") ctx.filter = `blur(${cfg.bgBlur}px)`;
      coverImage(ctx, photo, w, h);
      ctx.filter = "none";
    }
    ctx.restore();
  }
}

function drawCell(ctx, mode, x, y, size, lum, color, chars, density, cx, cy, rain) {
  const m = 1 + density * 2.2;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  if (mode === "dither") {
    const t = (BAYER8[cy & 7][cx & 7] + 0.5) / 64;
    if (lum > t * (1.05 - density * 0.45)) {
      const s = Math.max(1, size * (0.28 + lum * 0.72));
      ctx.fillRect(x + (size - s) / 2, y + (size - s) / 2, s, s);
    }
    return;
  }
  if (mode === "pixel" || mode === "mosaic") {
    ctx.globalAlpha = Math.max(0.12, lum);
    ctx.fillRect(x, y, size, size);
    ctx.globalAlpha = 1;
    return;
  }
  if (mode === "dots" || mode === "disco") {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, (size / 2) * lum * m * 0.7, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (mode === "cross") {
    ctx.lineWidth = Math.max(1, lum * 2);
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x + size, y + size / 2);
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size / 2, y + size);
    ctx.stroke();
    return;
  }
  if (mode === "diamond" || mode === "voxel") {
    const s = size * lum * 0.7;
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y + size / 2 - s);
    ctx.lineTo(x + size / 2 + s, y + size / 2);
    ctx.lineTo(x + size / 2, y + size / 2 + s);
    ctx.lineTo(x + size / 2 - s, y + size / 2);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (mode === "lego" || mode === "halfblocks") {
    ctx.fillRect(x + 1, y + 1, size - 2, size * (mode === "halfblocks" ? 0.5 + lum * 0.5 : lum));
    return;
  }
  if (mode === "lines" || mode === "hatch") {
    ctx.lineWidth = Math.max(0.6, lum * 2.2);
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + size * lum * m, y);
    if (mode === "hatch") {
      ctx.moveTo(x, y);
      ctx.lineTo(x + size * lum, y + size);
    }
    ctx.stroke();
    return;
  }
  if (mode === "diagonal" || mode === "contour") {
    ctx.lineWidth = 1;
    ctx.globalAlpha = lum;
    ctx.beginPath();
    ctx.moveTo(x, y + size * (1 - lum));
    ctx.lineTo(x + size, y + size * lum);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  if (mode === "rings") {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, Math.max(1, (size / 2) * lum), 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  if (mode === "hearts" || mode === "stars") {
    const glyph = mode === "hearts" ? "♥" : "★";
    ctx.font = `${Math.max(6, size * lum * 1.4)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph, x + size / 2, y + size / 2);
    return;
  }
  if (mode === "hexagons" || mode === "triangles" || mode === "bubbles") {
    ctx.beginPath();
    if (mode === "triangles") {
      ctx.moveTo(x + size / 2, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x, y + size);
    } else {
      ctx.arc(x + size / 2, y + size / 2, (size / 2) * Math.max(0.15, lum), 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.globalAlpha = Math.max(0.15, lum);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }
  if (mode === "braille") {
    const dots = "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏".split("");
    ctx.font = `${size}px monospace`;
    ctx.fillText(dots[(lum * (dots.length - 1)) | 0], x, y + size * 0.85);
    return;
  }
  if (mode === "hexdump") {
    ctx.font = `${Math.max(7, size * 0.9)}px ui-monospace, monospace`;
    ctx.fillText("0123456789ABCDEF".charAt((lum * 15) | 0), x + 1, y + size * 0.8);
    return;
  }
  if (mode === "matrix") {
    const rainGlyph = "01アイウエオカキクケコ"[Math.abs((cy + rain + cx * 3) % 16)];
    ctx.fillStyle = `rgba(80,255,120,${0.15 + lum * 0.85})`;
    ctx.font = `${size}px ui-monospace, monospace`;
    ctx.fillText(rainGlyph, x, y + size * 0.85);
    return;
  }
  const glyphs = chars;
  const ch = glyphs.charAt(Math.max(0, Math.min(glyphs.length - 1, (lum * (glyphs.length - 1)) | 0)));
  ctx.font = `${Math.max(7, size * (0.7 + lum * 0.6))}px ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ch, x + size / 2, y + size / 2);
}

function applyTint(ctx, w, h, cfg) {
  if (!cfg.tintOpacity) return;
  ctx.save();
  ctx.globalAlpha = cfg.tintOpacity / 100;
  ctx.globalCompositeOperation = cfg.overlayBlend || "multiply";
  ctx.fillStyle = cfg.tint || "#3ca6ff";
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function applyBlur(ctx, w, h, cfg) {
  if (!cfg.blurType || cfg.blurType === "off" || !cfg.blurAmount) return;
  ctx.save();
  ctx.filter = `blur(${Math.max(0, cfg.blurAmount) / 18}px)`;
  ctx.drawImage(ctx.canvas, 0, 0, w, h);
  ctx.restore();
}

function applyPfx(ctx, w, h, cfg, now) {
  const pfx = cfg.pfx || {};
  if (pfx.scanLines?.enabled) {
    ctx.save();
    ctx.globalAlpha = pfx.scanLines.intensity / 280;
    ctx.fillStyle = "#000";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    ctx.restore();
  }
  if (pfx.vignette?.enabled) {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${pfx.vignette.intensity / 120})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  if (pfx.bloom?.enabled) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = pfx.bloom.intensity / 400;
    ctx.filter = "blur(8px)";
    ctx.drawImage(ctx.canvas, 0, 0, w, h);
    ctx.restore();
  }
  if (pfx.filmGrain?.enabled || pfx.filmDust?.enabled) {
    const amp = ((pfx.filmGrain?.enabled ? pfx.filmGrain.intensity : 0) + (pfx.filmDust?.enabled ? pfx.filmDust.intensity : 0)) / 800;
    ctx.save();
    ctx.globalAlpha = amp;
    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
    }
    ctx.restore();
  }
  if (pfx.glitch?.enabled) {
    const slice = (pfx.glitch.intensity / 100) * 18;
    ctx.drawImage(ctx.canvas, slice * Math.sin(now / 120), 0, w, h / 8, 0, h * 0.4, w, h / 8);
  }
  if (pfx.chromatic?.enabled) {
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = pfx.chromatic.intensity / 400;
    ctx.drawImage(ctx.canvas, 2, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }
  if (pfx.halftone?.enabled) {
    ctx.save();
    ctx.globalAlpha = pfx.halftone.intensity / 400;
    ctx.fillStyle = "#fff";
    for (let y = 0; y < h; y += 8) {
      for (let x = 0; x < w; x += 8) ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();
  }
  if (pfx.pixelate?.enabled) {
    const s = Math.max(2, (pfx.pixelate.intensity / 8) | 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ctx.canvas, 0, 0, w / s, h / s);
    ctx.drawImage(ctx.canvas, 0, 0, w / s, h / s, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
  }
}

function applyLights(ctx, w, h, cfg) {
  if (!cfg.lights?.enabled || !cfg.lights.points?.length) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const p of cfg.lights.points) {
    const x = (p.x || 0) * w;
    const y = (p.y || 0) * h;
    const r = (p.radius || 0.2) * Math.max(w, h);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${(p.intensity || 0.4) * 0.5})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function applyMask(ctx, w, h, cfg) {
  if (!cfg.mask?.enabled || !cfg.mask.dataUrl) return;
  const img = new Image();
  img.src = cfg.mask.dataUrl;
  if (!img.complete || !img.naturalWidth) return;
  ctx.save();
  ctx.globalCompositeOperation = cfg.mask.invert ? "destination-in" : "destination-out";
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();
}

function tinted(cell, lum, cfg) {
  const v = Math.round(clamp01(lum) * 255);
  if (!cfg.tintOpacity) return `rgb(${v},${v},${v})`;
  const t = hexRgb(cfg.tint);
  const a = cfg.tintOpacity / 100;
  return `rgb(${mix(v, t.r, a) | 0},${mix(v, t.g, a) | 0},${mix(v, t.b, a) | 0})`;
}

function coverImage(ctx, img, w, h) {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = w / h;
  let dw = w;
  let dh = h;
  let dx = 0;
  let dy = 0;
  if (ir > cr) {
    dw = h * ir;
    dx = (w - dw) / 2;
  } else {
    dh = w / ir;
    dy = (h - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function tone(v, curve) {
  if (!Array.isArray(curve) || curve.length < 2) return v;
  const pts = curve.slice().sort((a, b) => a.x - b.x);
  if (v <= pts[0].x) return pts[0].y;
  for (let i = 1; i < pts.length; i += 1) {
    if (v <= pts[i].x) {
      const t = (v - pts[i - 1].x) / Math.max(1e-6, pts[i].x - pts[i - 1].x);
      return pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t;
    }
  }
  return pts[pts.length - 1].y;
}

function hexRgb(hex) {
  const n = (hex || "#ffffff").replace("#", "");
  const v = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  return { r: parseInt(v.slice(0, 2), 16), g: parseInt(v.slice(2, 4), 16), b: parseInt(v.slice(4, 6), 16) };
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function hash(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

window.mountInkGarden = mountInkGarden;
window.INK_GARDEN = INK_GARDEN;
