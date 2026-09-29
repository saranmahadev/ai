// Time-of-day theme. Reads the visitor's local clock (or ?time=HH:MM for testing), blends between keyframes,
// writes CSS variables, and tells the 3D scenes to re-light themselves. Refreshes every minute.

const DAY = { top: "#d6e6ff", mid: "#f3ecff", bot: "#ffe6e1", fog: "#f1eafd", sun: "#fff4e6", sunK: 1, hSky: "#ffffff", hGround: "#d8ccfa", hemiK: 1, night: 0 };
const NIGHT = { top: "#0b0e33", mid: "#1d1a55", bot: "#3a2a72", fog: "#1b1850", sun: "#a9bbff", sunK: 0.36, hSky: "#7480d4", hGround: "#22195a", hemiK: 0.6, night: 1 };
const DAWN = { top: "#6f7fc4", mid: "#f0adbe", bot: "#ffd9b0", fog: "#ecc2cc", sun: "#ffd2a8", sunK: 0.95, hSky: "#ffe3d0", hGround: "#c9a8d8", hemiK: 0.9, night: 0.2 };
const DUSK = { top: "#8a7ad6", mid: "#f4a68e", bot: "#ffcf8a", fog: "#efb59c", sun: "#ffb27a", sunK: 1, hSky: "#ffd6b0", hGround: "#b28ac4", hemiK: 0.9, night: 0.15 };
const TWILIGHT = { top: "#2c2f7e", mid: "#7f55a0", bot: "#dd7f8e", fog: "#8a5f9c", sun: "#c9a0ff", sunK: 0.55, hSky: "#a98ad8", hGround: "#3a2a72", hemiK: 0.65, night: 0.7 };

// [hour, look]
const KEYS = [[0, NIGHT], [5, NIGHT], [6.5, DAWN], [8.5, DAY], [16.5, DAY], [18.3, DUSK], [19.6, TWILIGHT], [21.2, NIGHT], [24, NIGHT]];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (a) => "#" + a.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mixHex = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const mix = (a, b, t) => a + (b - a) * t;

function at(hour) {
  let i = 0;
  while (i < KEYS.length - 2 && hour >= KEYS[i + 1][0]) i++;
  const [h0, a] = KEYS[i], [h1, b] = KEYS[i + 1];
  const t = Math.min(1, Math.max(0, (hour - h0) / (h1 - h0)));
  const out = {};
  for (const k of Object.keys(a)) out[k] = typeof a[k] === "string" ? mixHex(a[k], b[k], t) : mix(a[k], b[k], t);
  out.hour = hour;
  out.phase = hour < 5 || hour >= 21.2 ? "Night" : hour < 8.5 ? "Sunrise" : hour < 16.5 ? "Day" : hour < 21.2 ? "Sunset" : "Night";
  out.dark = out.night > 0.55;
  return out;
}

function currentHour() {
  const q = new URLSearchParams(location.search).get("time");
  const m = q && q.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (m) return Math.min(23.99, +m[1] + (+m[2] || 0) / 60);
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}

const listeners = new Set();
export const theme = {
  current: at(currentHour()),
  // fn(theme) is called now and then whenever the look changes
  subscribe(fn) { listeners.add(fn); fn(theme.current); return () => listeners.delete(fn); }
};

function apply(t) {
  const r = document.documentElement;
  r.style.setProperty("--sky1", t.top); r.style.setProperty("--sky2", t.mid); r.style.setProperty("--sky3", t.bot);
  r.classList.toggle("night", t.dark);
  r.dataset.phase = t.phase.toLowerCase();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t.dark ? "#1b1850" : t.mid;
}

function refresh() {
  theme.current = at(currentHour());
  apply(theme.current);
  listeners.forEach((fn) => fn(theme.current));
}
apply(theme.current);
if (!new URLSearchParams(location.search).get("time")) setInterval(refresh, 60000);
