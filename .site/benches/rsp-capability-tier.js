// Bench: slide a model's measured capability and see which safety tier's commitments it requires.
import { requiredSafetyTier } from "./llmkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "More capable, more required" });
  const say = live(body);
  let capability = 0.5;

  const cv = canvas(body, { aspect: 0.4, label: "Required safety tier by measured capability" });
  const st = stats([["tier", "required safety tier"]]);
  const sl = slider({ label: "measured capability score", min: 0, max: 1, step: 0.02, value: capability, format: (v) => v.toFixed(2), onInput: (v) => { capability = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const thresholds = [0.3, 0.6, 0.85, 1.0];
    let x0 = 0;
    thresholds.forEach((t, i) => {
      const x1 = t * w;
      ctx.fillStyle = i + 1 === requiredSafetyTier(capability) ? p.accent : p.soft;
      ctx.fillRect(x0, hh / 2 - 15, x1 - x0, 30);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`tier ${i + 1}`, (x0 + x1) / 2, hh / 2 + 5);
      x0 = x1;
    });
    const mx = capability * w;
    ctx.strokeStyle = p.warm; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, hh); ctx.stroke();
  });

  function update() {
    const tier = requiredSafetyTier(capability);
    st.set("tier", `Tier ${tier}`);
    say(`capability ${capability.toFixed(2)}: requires Tier ${tier} safety commitments`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
