// Bench: compare a SwiGLU/GeGLU-style gated feed-forward sublayer against a plain one on the same input.
import { silu, gelu } from "./tfkit.js";
import { rng } from "./kit.js";

const D_MODEL = 4, D_FF = 6;

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Two projections, one gating the other" });
  const say = live(body);
  let x = [0.5, -0.3, 0.8, 0.1], act = "SiLU (SwiGLU)";

  const cv = canvas(body, { aspect: 0.5, label: "Gate, up projection, gated product and output" });
  const st = stats([["gatedParams", "gated sublayer parameters"], ["plainParams", "plain sublayer parameters"]]);
  const sliders = x.map((v, i) => slider({ label: `x[${i}]`, min: -1.5, max: 1.5, step: 0.1, value: v, format: (n) => n.toFixed(1), onInput: (n) => { x[i] = n; update(); } }));
  const ch = choice("Gating activation", [["SiLU (SwiGLU)", "SiLU (SwiGLU)"], ["GELU (GeGLU)", "GELU (GeGLU)"]], act, (v) => { act = v; update(); });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), ch.el);

  let gate = [], up = [], gated = [];
  cv.onDraw((ctx, w, hh, p) => {
    const rows = [["gate", gate, p.warm], ["up", up, p.ink], ["gated", gated, p.accent]];
    const rowH = hh / rows.length, bw = w / (D_FF + 1);
    rows.forEach(([label, vec, color], r) => {
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(label, 4, r * rowH + 14);
      const maxAbs = Math.max(...vec.map(Math.abs), 0.05);
      vec.forEach((v, i) => {
        const bh = (Math.abs(v) / maxAbs) * (rowH / 2 - 16);
        ctx.fillStyle = color;
        ctx.fillRect(bw * (i + 0.7), r * rowH + rowH / 2 - (v >= 0 ? bh : 0), bw * 0.5, v >= 0 ? bh : -bh);
      });
      ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(0, r * rowH + rowH / 2); ctx.lineTo(w, r * rowH + rowH / 2); ctx.stroke();
    });
  });

  function update() {
    const rand = rng(11);
    const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));
    const Wgate = randMat(D_FF, D_MODEL, 0.5), Wup = randMat(D_FF, D_MODEL, 0.5);
    const activation = act.startsWith("SiLU") ? silu : gelu;
    gate = Wgate.map((row) => activation(row.reduce((s, v, i) => s + v * x[i], 0)));
    up = Wup.map((row) => row.reduce((s, v, i) => s + v * x[i], 0));
    gated = gate.map((g, i) => g * up[i]);

    st.set("gatedParams", String(3 * D_FF * D_MODEL));
    st.set("plainParams", String(2 * D_FF * D_MODEL + D_FF + D_MODEL));
    say(`gating activation ${act}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
