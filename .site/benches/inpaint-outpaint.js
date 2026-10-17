// Bench: compare harmonic inpainting between two anchors against ridge-regularized outpainting from one.
import { harmonicInpaint, ridgeOutpaint } from "./gakit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Filling a gap vs. extending past the edge" });
  const say = live(body);
  let mode = "inpaint", lambda = 0.2;

  const cv = canvas(body, { aspect: 0.5, label: "Known values (solid) and generated values (hollow)" });
  const st = stats([["values", "generated sequence"]]);
  const ch = choice("Mode", [["inpaint", "inpaint (both ends known)"], ["outpaint", "outpaint (one end known)"]], mode, (v) => { mode = v; update(); });
  const sl = slider({ label: "outpaint prior strength (λ)", min: 0.05, max: 0.5, step: 0.05, value: lambda, format: (v) => v.toFixed(2), onInput: (v) => { lambda = v; update(); } });
  body.append(cv.box, st.el, ch.el, sl.el);

  let seq = [], knownCount = 2;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (seq.length + 1), maxV = 55;
    seq.forEach((v, i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = i < knownCount ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(v.toFixed(1), bw * (i + 0.5) + bw * 0.3, hh - 22 - bh);
    });
  });

  function update() {
    if (mode === "inpaint") {
      seq = harmonicInpaint(10, 50, 4);
      knownCount = 1; // only the first is drawn distinctly as "known start"; last is also known
    } else {
      seq = ridgeOutpaint(50, 5, lambda);
      knownCount = 1;
    }
    st.set("values", seq.map((v) => v.toFixed(2)).join(", "));
    say(`${mode}: ${seq.map((v) => v.toFixed(1)).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
