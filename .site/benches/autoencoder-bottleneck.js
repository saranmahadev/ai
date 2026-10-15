// Bench: a 4D input compressed through a 2D bottleneck and reconstructed, with adjustable weights.
import { forwardMLP, identity } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Squeezing data through a bottleneck" });
  const say = live(body);
  let x = [1, 0, 1, 0];
  let decMix = 0.9; // decoder weight mixing: diag weight vs cross weight

  const Wenc = [[0.5, 0, 0.5, 0], [0, 0.5, 0, 0.5]], Benc = [0, 0];

  const cv = canvas(body, { aspect: 0.5, label: "Input, bottleneck code, and reconstruction" });
  const st = stats([["z", "bottleneck code"], ["rec", "reconstruction"], ["mse", "reconstruction error"]]);
  const sliders = x.map((v, i) => slider({ label: `x${i + 1}`, min: 0, max: 1, step: 0.1, value: v, format: (val) => val.toFixed(1), onInput: (val) => { x[i] = val; update(); } }));
  const sm = slider({ label: "decoder sharpness (1 = perfect inverse)", min: 0.5, max: 1, step: 0.01, value: decMix, format: (v) => v.toFixed(2), onInput: (v) => { decMix = v; update(); } });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sm.el);

  function compute() {
    const other = 1 - decMix;
    const Wdec = [[decMix, other], [other, decMix], [decMix, other], [other, decMix]], Bdec = [0, 0, 0, 0];
    const { acts } = forwardMLP(x, [{ W: Wenc, b: Benc, act: identity }, { W: Wdec, b: Bdec, act: identity }]);
    const z = acts[1], rec = acts[2];
    const mse = x.reduce((s, v, i) => s + (v - rec[i]) ** 2, 0) / x.length;
    return { z, rec, mse };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { z, rec } = compute();
    const groups = [{ label: "input", vals: x }, { label: "code", vals: z }, { label: "reconstruction", vals: rec }];
    const gw = w / groups.length;
    groups.forEach((g, gi) => {
      const bw = gw / (g.vals.length + 1);
      g.vals.forEach((v, i) => {
        const bh = v * (hh - 40);
        ctx.fillStyle = gi === 1 ? p.warm : p.accent;
        ctx.fillRect(gi * gw + (i + 0.5) * bw, hh - 24 - bh, bw * 0.7, bh);
      });
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(g.label, gi * gw + gw / 2, hh - 6);
    });
  });

  function update() {
    const { z, rec, mse } = compute();
    st.set("z", z.map((v) => v.toFixed(3)).join(", "));
    st.set("rec", rec.map((v) => v.toFixed(3)).join(", "));
    st.set("mse", mse.toFixed(4));
    say(`reconstruction error ${mse.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
