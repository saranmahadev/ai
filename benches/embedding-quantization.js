// Bench: quantize an embedding to int8 and compare its similarity and ranking against the original float32 version.
import { quantizeAndDequantize } from "./ragkit.js";
import { cosineSim } from "./gakit.js";

const QUERY_VEC = [0.9, 0.1];
const DOCS = { "refund timeline": [0.95, 0.05], "returns policy": [0.85, 0.15], "shipping times": [0.3, 0.2] };

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Four bytes per number, or one" });
  const say = live(body);
  let precision = "float32";

  const cv = canvas(body, { aspect: 0.4, label: "Ranking at full precision vs. quantized to int8" });
  const st = stats([["memory", "bytes per vector (2 dimensions)"]]);
  const ch = choice("Precision", [["float32", "float32 (4 bytes/dim)"], ["int8", "int8 (1 byte/dim, quantized)"]], precision, (v) => { precision = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function ranked() {
    return Object.entries(DOCS)
      .map(([name, v]) => [name, cosineSim(QUERY_VEC, precision === "int8" ? quantizeAndDequantize(v) : v)])
      .sort((a, b) => b[1] - a[1]);
  }

  cv.onDraw((ctx, w, hh, p) => {
    const r = ranked();
    const bw = w / 4;
    r.forEach(([name, score], i) => {
      const bh = score * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(name, bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(score.toFixed(4), bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    st.set("memory", precision === "int8" ? "2 bytes (4× smaller)" : "8 bytes");
    say(`${precision}: ranking ${ranked().map(([n]) => n).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
