// Bench: round, floor, ceiling, truncate, absolute value and modulo (on a clock).
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Round, floor, ceiling, absolute value and modulo" });
  const say = live(body);
  let x = 2.5, n = 5;
  const sx = slider({ label: "number x", min: -10, max: 10, step: 0.1, value: x, format: (v) => fmt(v, 1), onInput: (v) => { x = v; update(); } });
  const sn = slider({ label: "modulo divisor n", min: 2, max: 12, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, maxH: 320, label: "A clock face showing x modulo n" });
  const st = stats([["r", "round"], ["f", "floor ⌊x⌋"], ["c", "ceiling ⌈x⌉"], ["t", "truncate"], ["a", "|x|"], ["m", "x mod n"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sx.el, sn.el));
  const mod = (a, b) => a - b * Math.floor(a / b);
  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, R = Math.min(w, hh) / 2 - 22, m = mod(x, n);
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.fillStyle = p.ink; ctx.font = "800 13px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; ctx.fillText(String(i), cx + Math.cos(a) * (R + 13), cy + Math.sin(a) * (R + 13)); ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 8), cy + Math.sin(a) * (R - 8)); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
    const a = -Math.PI / 2 + (m / n) * Math.PI * 2; ctx.strokeStyle = p.warm; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12)); ctx.stroke();
  });
  function update() {
    st.set("r", String(Math.round(x))); st.set("f", String(Math.floor(x))); st.set("c", String(Math.ceil(x))); st.set("t", String(Math.trunc(x))); st.set("a", fmt(Math.abs(x), 1)); st.set("m", fmt(mod(x, n), 1));
    say(`x is ${fmt(x, 1)}, floor ${Math.floor(x)}, ceiling ${Math.ceil(x)}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
