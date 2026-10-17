// Bench: add a learned positional vector to the same token embedding at a chosen position.
import { embeddingLookup, vecAdd } from "./tfkit.js";
import { rng } from "./kit.js";

const MAX_LEN = 5, D_MODEL = 4;
const TOKEN = [0.5, -0.2, 0.1, 0.4];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A trained row instead of a formula" });
  const say = live(body);
  let pos = 0;

  const rand = rng(17);
  const P = Array.from({ length: MAX_LEN }, () => Array.from({ length: D_MODEL }, () => (rand() * 2 - 1) * 0.3));

  const cv = canvas(body, { aspect: 0.4, label: "The same token embedding, with its positional row added" });
  const st = stats([["params", "table parameters"]]);
  const sl = slider({ label: "position", min: 0, max: MAX_LEN - 1, step: 1, value: pos, format: (v) => String(v), onInput: (v) => { pos = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let out;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (D_MODEL + 1);
    const rows = [["token", TOKEN, p.ink], [`P[${pos}]`, P[pos], p.warm], ["sum", out, p.accent]];
    const rowH = hh / rows.length;
    rows.forEach(([label, vec, color], r) => {
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(label, 4, r * rowH + 14);
      const maxAbs = Math.max(...vec.map(Math.abs), 0.1);
      vec.forEach((v, i) => {
        const bh = (Math.abs(v) / maxAbs) * (rowH / 2 - 16);
        ctx.fillStyle = color;
        ctx.fillRect(bw * (i + 0.7), r * rowH + rowH / 2 - (v >= 0 ? bh : 0), bw * 0.5, v >= 0 ? bh : -bh);
      });
      ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(0, r * rowH + rowH / 2); ctx.lineTo(w, r * rowH + rowH / 2); ctx.stroke();
    });
  });

  function update() {
    out = vecAdd(TOKEN, embeddingLookup(P, pos));
    st.set("params", String(MAX_LEN * D_MODEL));
    say(`position ${pos}, combined vector ${out.map((v) => v.toFixed(2)).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
