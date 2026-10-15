// Bench: check whether a gradient underflows FP16, and whether loss scaling rescues it.
const FP16_MIN_SUBNORMAL = 5.96e-8;
const FP16_MIN_NORMAL = 6.1e-5;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Rescuing a gradient from underflow" });
  const say = live(body);
  let gradExp = -8, scaleExp = 16; // gradient = 3 * 10^gradExp, scale = 2^scaleExp

  const cv = canvas(body, { aspect: 0.45, label: "Raw gradient vs scaled gradient against FP16's representable range" });
  const st = stats([["raw", "raw gradient"], ["scaled", "scaled gradient"], ["status", "status"]]);
  const sg = slider({ label: "gradient exponent (grad = 3×10^e)", min: -10, max: -3, step: 1, value: gradExp, onInput: (v) => { gradExp = v; update(); } });
  const ss = slider({ label: "scale factor (2^e)", min: 0, max: 20, step: 1, value: scaleExp, onInput: (v) => { scaleExp = v; update(); } });
  body.append(cv.box, st.el, sg.el, ss.el);

  function compute() {
    const grad = 3 * 10 ** gradExp;
    const scale = 2 ** scaleExp;
    const scaled = grad * scale;
    const rawUnderflows = Math.abs(grad) < FP16_MIN_SUBNORMAL;
    const scaledSafe = Math.abs(scaled) >= FP16_MIN_NORMAL;
    return { grad, scale, scaled, rawUnderflows, scaledSafe };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { grad, scaled } = compute();
    const m = { x0: 60, x1: w - 20 };
    const logMin = -10, logMax = 0;
    const X = (v) => m.x0 + ((Math.log10(Math.abs(v)) - logMin) / (logMax - logMin)) * (m.x1 - m.x0);
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x0, hh / 2); ctx.lineTo(m.x1, hh / 2); ctx.stroke();
    const markX = X(FP16_MIN_NORMAL);
    ctx.strokeStyle = p.warm; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(markX, hh / 2 - 30); ctx.lineTo(markX, hh / 2 + 30); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("FP16 safe zone →", markX + 50, hh / 2 - 36);
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(X(grad), hh / 2, 7, 0, 7); ctx.fill();
    ctx.fillText("raw", X(grad), hh / 2 + 20);
    ctx.fillStyle = p.good; ctx.beginPath(); ctx.arc(X(scaled), hh / 2, 7, 0, 7); ctx.fill();
    ctx.fillText("scaled", X(scaled), hh / 2 - 20);
  });

  function update() {
    const { grad, scaled, rawUnderflows, scaledSafe } = compute();
    st.set("raw", grad.toExponential(3));
    st.set("scaled", scaled.toExponential(3));
    st.set("status", rawUnderflows ? (scaledSafe ? "raw underflows; scaling rescues it" : "raw underflows; scaling not yet enough") : "raw is already safely representable");
    say(rawUnderflows ? (scaledSafe ? "scaling rescues this gradient" : "still not enough scaling") : "no underflow risk here");
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
