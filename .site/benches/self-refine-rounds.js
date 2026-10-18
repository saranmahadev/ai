// Bench: step through critique-revise rounds and watch quality climb with diminishing returns.
import { selfRefineQuality } from "./llmkit.js";

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Each revision closes half the remaining gap" });
  const say = live(body);
  let round = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Quality across critique-revise rounds" });
  const st = stats([["round", "round"], ["quality", "quality"]]);

  function report() {
    st.set("round", String(round));
    st.set("quality", selfRefineQuality(round).toFixed(4));
    say(`round ${round}: quality ${selfRefineQuality(round).toFixed(3)}`);
    cv.redraw();
  }
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 6;
    for (let r = 0; r <= 4; r++) {
      const bh = selfRefineQuality(r) * (hh - 30);
      ctx.fillStyle = r <= round ? p.accent : p.soft;
      ctx.fillRect(bw * (r + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`r${r}`, bw * (r + 0.5) + bw * 0.3, hh - 2);
    }
  });
  const sp = stepper({
    stepLabel: "Critique and revise",
    onStep: () => { if (round >= 4) return false; round++; report(); },
    onReset: () => { round = 0; report(); },
  });
  body.append(cv.box, st.el, sp.el);
  report();
  return () => cv.destroy();
}
