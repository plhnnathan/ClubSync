let currentTheme = localStorage.getItem("theme") || "light";

let _brandPrimary = localStorage.getItem("clubColor") || "#00c853";
let _brandSecondary = localStorage.getItem("clubSecondary") || "#3b82f6";

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const c = (v) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function isHex(v) {
  return /^#[0-9A-Fa-f]{6}$/.test(v || "");
}

function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function getSaturation(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === min) return 0;
  const l = (max + min) / 2;
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

function shadeColor(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (c) =>
    percent < 0 ? c + (c * percent) / 100 : c + ((255 - c) * percent) / 100;
  return rgbToHex(adjust(r), adjust(g), adjust(b));
}

function readableTextOn(hex) {
  return getLuminance(hex) > 0.55 ? "#0b1220" : "#ffffff";
}

function adaptAccent(hex) {
  let out = hex;
  let lum = getLuminance(out);
  if (currentTheme === "light") {
    let guard = 0;
    while (lum > 0.62 && guard++ < 12) {
      out = shadeColor(out, -8);
      lum = getLuminance(out);
    }
  } else {
    let guard = 0;
    while (lum < 0.42 && guard++ < 12) {
      out = shadeColor(out, 12);
      lum = getLuminance(out);
    }
  }
  return out;
}

function applyPrimaryColor(rawHex, persist = false) {
  if (!isHex(rawHex)) return;
  _brandPrimary = rawHex;
  if (persist) localStorage.setItem("clubColor", rawHex);

  const accent = adaptAccent(rawHex);
  const strong = shadeColor(accent, currentTheme === "light" ? -16 : 14);
  const soft =
    currentTheme === "light" ? shadeColor(rawHex, 78) : shadeColor(rawHex, -55);

  const root = document.documentElement.style;
  root.setProperty("--primary", accent);
  root.setProperty("--primary-strong", strong);
  root.setProperty("--primary-soft", soft);
  root.setProperty("--on-primary", readableTextOn(accent));
}

function applySecondaryColor(rawHex, persist = false) {
  if (!isHex(rawHex)) return;
  _brandSecondary = rawHex;
  if (persist) localStorage.setItem("clubSecondary", rawHex);

  const accent = adaptAccent(rawHex);
  const strong = shadeColor(accent, currentTheme === "light" ? -16 : 14);
  const soft =
    currentTheme === "light" ? shadeColor(rawHex, 80) : shadeColor(rawHex, -55);

  const root = document.documentElement.style;
  root.setProperty("--secondary", accent);
  root.setProperty("--secondary-strong", strong);
  root.setProperty("--secondary-soft", soft);
  root.setProperty("--on-secondary", readableTextOn(accent));
}

function applyBrandColors() {
  applyPrimaryColor(_brandPrimary);
  applySecondaryColor(_brandSecondary);
}

function applyTheme() {
  document.body.classList.toggle("dark", currentTheme === "dark");
  document.body.classList.toggle("light", currentTheme === "light");

  const icon = currentTheme === "light" ? "🌙" : "☀️";
  const navBtn = document.getElementById("themeBtn");
  if (navBtn) navBtn.textContent = icon;
  const authBtn = document.getElementById("authThemeBtn");
  if (authBtn) authBtn.textContent = icon;

  applyBrandColors();
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("theme", currentTheme);
  applyTheme();
}

function extractPaletteFromImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = () => reject(new Error("load-failed"));
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        const buckets = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2],
            a = data[i + 3];
          if (a < 125) continue;
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          if (lum > 0.95 || lum < 0.06) continue;
          const sat = getSaturation(r, g, b);
          const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
          if (!buckets[key]) {
            buckets[key] = { r: 0, g: 0, b: 0, n: 0, sat: 0 };
          }
          const bk = buckets[key];
          bk.r += r;
          bk.g += g;
          bk.b += b;
          bk.n += 1;
          bk.sat += sat;
        }

        let list = Object.values(buckets).map((bk) => ({
          r: bk.r / bk.n,
          g: bk.g / bk.n,
          b: bk.b / bk.n,
          n: bk.n,
          sat: bk.sat / bk.n,
        }));

        if (!list.length) return reject(new Error("no-colors"));

        list.forEach((c) => {
          c.score = c.n * (0.35 + c.sat);
          c.hex = rgbToHex(c.r, c.g, c.b);
        });
        list.sort((a, b) => b.score - a.score);

        const primary = list[0];
        const secondary =
          list.find((c) => colorDistance(c, primary) > 80) ||
          list[1] ||
          primary;

        resolve({
          primary: primary.hex,
          secondary: secondary.hex,
          palette: list.slice(0, 6).map((c) => c.hex),
        });
      } catch (err) {
        reject(new Error("tainted"));
      }
    };
    img.src = src;
  });
}

function colorDistance(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function updateNavBrand(logoUrl, clubName) {
  const brand = document.querySelector(".nav-brand");
  if (!brand) return;
  const name = clubName || "ClubSync";
  brand.innerHTML = logoUrl
    ? `<img src="${logoUrl}" alt="${name}" class="nav-club-logo" /> <span class="brand-text">${name}</span>`
    : `<span class="nav-logo">⚽</span> <span class="brand-text">${name}</span>`;
}
