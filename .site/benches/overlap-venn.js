// Bench: probabilities as areas; the union subtracts the overlap.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Areas that add up to probabilities" });
  const say = live(body);
  let a = 0.5, b = 0.4, o = 0.2;
  const sa = slider({ label: "P(A)", min: 0.05, max: 0.95, step: 0.05, value: a, format: (v) => fmt(v, 2), onInput: (v) => { a = v; fix(); } });
  const sb = slider({ label: "P(B)", min: 0.05, max: 0.95, step: 0.05, value: b, format: (v) => fmt(v, 2), onInput: (v) => { b = v; fix(); } });
  const so = slider({ label: "P(A and B)", min: 0, max: 0.95, step: 0.05, value: o, format: (v) => fmt(v, 2), onInput: (v) => { o = v; fix(); } });
  const cv = canvas(body, { aspect: 0.4, maxH: 220, label: "The unit square with the areas of events A and B" });
  const st = stats([["u", "P(A or B) = P(A) + P(B) − P(A and B)"], ["c", "P(not A)"], ["e", "mutually exclusive?"], ["lim", "allowed overlap"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sa.el, sb.el, so.el));
  function fix() { const lo = Math.max(0, a + b - 1), hi = Math.min(a, b); o = Math.min(hi, Math.max(lo, o)); so.set(Math.round(o * 20) / 20, true); o = so.get(); o = Math.min(hi, Math.max(lo, o)); update(); }
  cv.onDraw((ctx, w, hh, p) => {
    const pad = 12, W = w - 2 * pad, H = hh - 2 * pad;
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.strokeRect(pad, pad, W, H);
    ctx.globalAlpha = 0.45; ctx.fillStyle = p.accent; ctx.fillRect(pad, pad, W * a, H); ctx.fillStyle = p.warm; ctx.fillRect(pad + W * (a - o), pad, W * b, H); ctx.globalAlpha = 1;
    ctx.fillStyle = p.ink; ctx.fillRect(pad + W * (a - o), pad, W * o, H * 0.06);
    ctx.font = "800 13px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("A", pad + W * (a - o) / 2, hh / 2); ctx.fillText("B", pad + W * (a - o + b) - W * (b - o) / 2, hh / 2); if (o > 0.05) ctx.fillText("A and B", pad + W * (a - o / 2), hh / 2 + 18);
  });
  function update() { const lo = Math.max(0, a + b - 1), hi = Math.min(a, b); st.set("u", fmt(a + b - o, 3)); st.set("c", fmt(1 - a, 3)); st.set("e", o === 0 ? "yes (overlap is 0)" : "no"); st.set("lim", `${fmt(lo, 2)} to ${fmt(hi, 2)}`); say(`P of A or B is ${fmt(a + b - o, 2)}`); cv.redraw(); }
  fix();
  return () => cv.destroy();
}
