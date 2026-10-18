// Bench: watch attention's FLOPs cost grow quadratically as sequence length increases.
import { attentionFlops } from "./llmkit.js";

const D = 128;
const LENGTHS = [512, 1024, 2048, 4096, 8192];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Doubling the sequence quadruples the cost" });
  const say = live(body);
  let n = LENGTHS[0];

  const cv = canvas(body, { aspect: 0.45, label: "Attention FLOPs vs. sequence length" });
  const st = stats([["flops", "attention FLOPs"], ["ratio", "ratio to shortest"]]);
  const ch = choice("Sequence length", LENGTHS.map((v) => [String(v), String(v)]), String(n), (v) => { n = +v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (LENGTHS.length + 1);
    const maxFlops = attentionFlops(LENGTHS[LENGTHS.length - 1], D);
    LENGTHS.forEach((len, i) => {
      const bh = (attentionFlops(len, D) / maxFlops) * (hh - 30);
      ctx.fillStyle = len === n ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(len), bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const flops = attentionFlops(n, D);
    st.set("flops", flops.toExponential(3));
    st.set("ratio", (flops / attentionFlops(LENGTHS[0], D)).toFixed(1) + "×");
    say(`sequence length ${n}: attention cost ${flops.toExponential(2)} FLOPs`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
