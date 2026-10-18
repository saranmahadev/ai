// Bench: compare a RoPE rotation angle under extrapolation vs. interpolation against the trained range.
import { ropeAngle } from "./llmkit.js";

const TRAINED_MAX = 2048;
const FREQ = 0.0005;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Staying inside the angles the model actually learned" });
  const say = live(body);
  let docLen = 4096;

  const cv = canvas(body, { aspect: 0.4, label: "Max rotation angle reached" });
  const st = stats([["extrapolated", "extrapolated max angle"], ["interpolated", "interpolated max angle"]]);
  const sl = slider({ label: "document length", min: 2048, max: 8192, step: 256, value: docLen, format: (v) => String(v), onInput: (v) => { docLen = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let trainedAngle, extrapAngle, interpAngle;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 4, maxA = Math.max(trainedAngle, extrapAngle) * 1.1;
    [["trained", trainedAngle, p.soft], ["extrapolated", extrapAngle, p.warm], ["interpolated", interpAngle, p.accent]].forEach(([label, a, color], i) => {
      const bh = (a / maxA) * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const maxRelExtrap = docLen - 1;
    const scale = TRAINED_MAX / docLen;
    const maxRelInterp = maxRelExtrap * scale;
    trainedAngle = ropeAngle(TRAINED_MAX - 1, FREQ);
    extrapAngle = ropeAngle(maxRelExtrap, FREQ);
    interpAngle = ropeAngle(maxRelInterp, FREQ);
    st.set("extrapolated", `${extrapAngle.toFixed(3)} rad`);
    st.set("interpolated", `${interpAngle.toFixed(3)} rad (trained max: ${trainedAngle.toFixed(3)})`);
    say(`document length ${docLen}: extrapolated angle ${extrapAngle.toFixed(3)}, interpolated angle ${interpAngle.toFixed(3)}, trained max ${trainedAngle.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
