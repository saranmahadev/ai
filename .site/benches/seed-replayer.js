// Bench: pseudo-random generators, seeds and replay.
export default function mount(root, kit) {
  const { h, frame, slider, choice, button, canvas, stats, rng, fmt, live } = kit;
  const body = frame(root, { title: "The same seed replays the same numbers" });
  const say = live(body);
  let seed = 42, gen = "good", lastList = "";
  const G = { good: (s) => { const r = rng(s); return () => r(); }, lcg: (s) => { let x = s % 16; return () => { x = (5 * x + 3) % 16; return x / 16; }; } };
  const ss = slider({ label: "seed", min: 1, max: 99, step: 1, value: seed, onInput: (v) => { seed = v; update(true); } });
  const ch = choice("Generator", [["good", "a good generator"], ["lcg", "tiny generator x ← (5x + 3) mod 16"]], gen, (v) => { gen = v; update(true); });
  const cv = canvas(body, { aspect: 0.7, maxH: 380, label: "Each point is a pair of consecutive random numbers" });
  const st = stats([["l", "first ten numbers"], ["r", "replay with the same seed"], ["same", "identical?"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, ss.el), h("div", { class: "bench-row" }, button("Replay with the same seed", () => update(false)), button("Try the next seed", () => { seed = seed % 99 + 1; ss.set(seed, true); update(true); })));
  const list = (n) => { const g = G[gen](seed), out = []; for (let i = 0; i < n; i++) out.push(g()); return out; };
  cv.onDraw((ctx, w, hh, p) => { const s = Math.min(w, hh) - 30, x0 = (w - s) / 2, y0 = 10, v = list(300); ctx.strokeStyle = p.muted; ctx.strokeRect(x0, y0, s, s); ctx.fillStyle = p.accent; for (let i = 0; i + 1 < v.length; i++) { ctx.beginPath(); ctx.arc(x0 + v[i] * s, y0 + s - v[i + 1] * s, 3, 0, 7); ctx.fill(); } });
  function update(fresh) { const a = list(10).map((v) => fmt(v, 3)).join("  "); if (fresh) lastList = a; const b = list(10).map((v) => fmt(v, 3)).join("  "); st.set("l", lastList); st.set("r", b); st.set("same", lastList === b ? "yes: same seed, same numbers" : "no"); say(fresh ? "New sequence" : "Replayed"); cv.redraw(); }
  update(true);
  return () => cv.destroy();
}
