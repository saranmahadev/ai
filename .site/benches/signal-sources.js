// Bench: compare error-driven vs correlation-driven weight updates on the same connection.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Four ways to get a training signal" });
  const say = live(body);
  let w = 0.2, x = 0.8, target = 1.0, eta = 0.1;

  const cv = canvas(body, { aspect: 0.45, label: "The weight update, error-driven vs correlation-driven" });
  const st = stats([["y", "current output y = wx"], ["err", "error-driven Δw"], ["hebb", "correlation-driven Δw"]]);
  const sw = slider({ label: "weight w", min: 0, max: 1, step: 0.05, value: w, format: (v) => v.toFixed(2), onInput: (v) => { w = v; update(); } });
  const sx = slider({ label: "input x", min: 0, max: 1, step: 0.05, value: x, format: (v) => v.toFixed(2), onInput: (v) => { x = v; update(); } });
  const st2 = slider({ label: "target", min: 0, max: 1, step: 0.05, value: target, format: (v) => v.toFixed(2), onInput: (v) => { target = v; update(); } });
  const se = slider({ label: "learning rate η", min: 0.02, max: 0.3, step: 0.02, value: eta, format: (v) => v.toFixed(2), onInput: (v) => { eta = v; update(); } });
  body.append(cv.box, st.el, sw.el, sx.el, st2.el, se.el);

  function compute() {
    const y = w * x;
    const dwErr = eta * (target - y) * x;
    const dwHebb = eta * x * y;
    return { y, dwErr, dwHebb };
  }

  cv.onDraw((ctx, w2, hh, p) => {
    const { dwErr, dwHebb } = compute();
    const maxV = Math.max(Math.abs(dwErr), Math.abs(dwHebb), 0.05) * 1.2;
    const bars = [["error-driven", dwErr, p.accent], ["correlation-driven", dwHebb, p.warm]];
    const bw = w2 / 3;
    bars.forEach(([label, v, color], i) => {
      const bh = (Math.abs(v) / maxV) * (hh / 2 - 10);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 1) - bw * 0.25, hh / 2 - (v >= 0 ? bh : 0), bw * 0.5, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 6);
      ctx.fillText(v.toFixed(4), bw * (i + 1), hh / 2 - (v >= 0 ? bh : 0) - 8);
    });
    ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(0, hh / 2); ctx.lineTo(w2, hh / 2); ctx.stroke();
  });

  function update() {
    const { y, dwErr, dwHebb } = compute();
    st.set("y", y.toFixed(4));
    st.set("err", dwErr.toFixed(4));
    st.set("hebb", dwHebb.toFixed(4));
    say(`output ${y.toFixed(3)}, error-driven update ${dwErr.toFixed(4)}, correlation-driven update ${dwHebb.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
