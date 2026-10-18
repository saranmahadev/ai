// Bench: compare enumerated, coarse and parameterized action spaces as the number of candidate objects grows.
import { enumeratedActionSuccess } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One action per object, one action total, or one parameterized action" });
  const say = live(body);
  let k = 5;

  const cv = canvas(body, { aspect: 0.45, label: "Random first-try success rate by design" });
  const st = stats([["enum", "enumerated: space size / success"], ["coarse", "coarse: space size / success"], ["param", "parameterized: space size / success"]]);
  const sl = slider({ label: "Candidate objects (k)", min: 2, max: 200, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const rows = [
      ["enumerated", enumeratedActionSuccess(k), p.warm],
      ["coarse", 0, p.soft],
      ["parameterized", 1, p.accent],
    ];
    const bw = w / rows.length;
    rows.forEach(([label, v, color], i) => {
      const bh = v * (hh - 40);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.2), hh - 24 - bh, bw * 0.6, Math.max(bh, 2));
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${(v * 100).toFixed(1)}%`, bw * (i + 0.2) + bw * 0.3, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.2) + bw * 0.3, hh - 6);
    });
  });

  function update() {
    const e = enumeratedActionSuccess(k);
    st.set("enum", `${k} / ${(e * 100).toFixed(1)}%`);
    st.set("coarse", `1 / 0%`);
    st.set("param", `1 / 100%`);
    say(`k=${k}: enumerated success ${(e * 100).toFixed(1)} percent, coarse 0 percent, parameterized 100 percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
