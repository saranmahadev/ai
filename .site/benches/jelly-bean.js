// Bench: many tests on pure noise still produce "discoveries".
export default function mount(root, kit) {
  const { h, frame, slider, toggles, button, canvas, stats, rng, fmt, live } = kit;
  const body = frame(root, { title: "Twenty tests on pure noise" });
  const say = live(body);
  let m = 20, bonf = false, seed = 1, ps = [];
  const sm = slider({ label: "number of tests (no real effects anywhere)", min: 1, max: 100, step: 1, value: m, onInput: (v) => { m = v; run(); } });
  const tg = toggles([["b", "Bonferroni correction (threshold 0.05 ÷ tests)", false]], (v) => { bonf = v.b; run(); });
  const cv = canvas(body, { aspect: 0.4, maxH: 240, label: "One dot per test showing its p-value; dots below the threshold are false discoveries" });
  const st = stats([["hit", "false discoveries in this study"], ["theory", "chance of at least one in a study"], ["sim", "simulated: studies (of 500) with at least one"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sm.el), tg.el, h("div", { class: "bench-row" }, button("Run a new study", () => { seed++; run(); })));
  const thr = () => (bonf ? 0.05 / m : 0.05);
  function run() { const r = rng(seed * 61 + m); ps = Array.from({ length: m }, () => r()); let any = 0; const r2 = rng(seed * 7 + m + 1000); for (let s = 0; s < 500; s++) { for (let i = 0; i < m; i++) if (r2() < thr()) { any++; break; } } update(any); }
  cv.onDraw((ctx, w, hh, p) => {
    const pad = 28, y0 = hh - 28, H = hh - 44, X = (i) => pad + ((i + 0.5) / m) * (w - pad - 12), Y = (v) => y0 - v * H;
    ctx.strokeStyle = p.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(pad, 10); ctx.lineTo(pad, y0); ctx.lineTo(w - 8, y0); ctx.stroke(); ctx.fillStyle = p.muted; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "right"; [0, 0.5, 1].forEach((v) => ctx.fillText(String(v), pad - 4, Y(v) + 3));
    ctx.strokeStyle = p.warm; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad, Y(thr())); ctx.lineTo(w - 8, Y(thr())); ctx.stroke(); ctx.setLineDash([]);
    ps.forEach((v, i) => { ctx.fillStyle = v < thr() ? p.warm : p.accent; ctx.beginPath(); ctx.arc(X(i), Y(v), v < thr() ? 5 : 3.2, 0, 7); ctx.fill(); });
  });
  function update(any) { const hit = ps.filter((v) => v < thr()).length; st.set("hit", `${hit} of ${m}`); st.set("theory", fmt(100 * (1 - (1 - thr()) ** m), 1) + "%"); st.set("sim", `${any} of 500  (${fmt(any / 5, 1)}%)`); say(`${hit} false discoveries`); cv.redraw(); }
  run();
  return () => cv.destroy();
}
