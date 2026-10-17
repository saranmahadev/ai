// Bench: look up a token's embedding row and watch it scale with √d_model.
import { embeddingLookup, vecNorm } from "./tfkit.js";

const TABLE = [
  [0.1, -0.2, 0.3, 0.05],
  [0.4, 0.1, -0.1, 0.2],
  [-0.3, 0.5, 0.2, -0.4],
  [0.2, 0.2, 0.2, 0.2],
  [-0.1, -0.1, 0.3, 0.1]
];

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "From token id to scaled vector" });
  const say = live(body);
  let tokenId = 2, dModel = 4;

  const cv = canvas(body, { aspect: 0.4, label: "The embedding row, raw and scaled" });
  const st = stats([["scale", "√d_model"], ["rawNorm", "raw vector norm"], ["scaledNorm", "scaled vector norm"]]);
  const ch = choice("Token id", TABLE.map((_, i) => [String(i), String(i)]), String(tokenId), (v) => { tokenId = +v; update(); });
  const sl = slider({ label: "d_model", min: 1, max: 16, step: 1, value: dModel, format: (v) => String(v), onInput: (v) => { dModel = v; update(); } });
  body.append(cv.box, st.el, ch.el, sl.el);

  let raw, scaled;
  cv.onDraw((ctx, w, hh, p) => {
    const n = raw.length;
    const colW = w / 2, barW = colW / (n + 1);
    [["raw", raw], ["scaled", scaled]].forEach(([label, vec], col) => {
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, colW * col + colW / 2, 16);
      const maxAbs = Math.max(...vec.map(Math.abs), 0.1);
      vec.forEach((v, i) => {
        const bh = (Math.abs(v) / maxAbs) * (hh / 2 - 20);
        ctx.fillStyle = p.accent;
        ctx.fillRect(colW * col + barW * (i + 0.5), hh / 2 - (v >= 0 ? bh : 0), barW * 0.6, v >= 0 ? bh : -bh);
      });
      ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(colW * col, hh / 2); ctx.lineTo(colW * col + colW, hh / 2); ctx.stroke();
    });
  });

  function update() {
    raw = embeddingLookup(TABLE, tokenId);
    const scale = Math.sqrt(dModel);
    scaled = embeddingLookup(TABLE, tokenId, scale);
    st.set("scale", scale.toFixed(3));
    st.set("rawNorm", vecNorm(raw).toFixed(4));
    st.set("scaledNorm", vecNorm(scaled).toFixed(4));
    say(`token ${tokenId}, scale ${scale.toFixed(2)}, raw norm ${vecNorm(raw).toFixed(3)}, scaled norm ${vecNorm(scaled).toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
