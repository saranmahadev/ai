// Bench: compare index-based vs. selector-based element targeting across a mid-sequence DOM re-render.
import { webActionAccuracy } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Clicking by position, or by identity" });
  const say = live(body);
  const N = 5, RERENDER_AT = 3;
  let action = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Correct clicks so far, by targeting method" });
  const st = stats([["index", "index-based correct"], ["selector", "selector-based correct"]]);
  body.append(cv.box, st.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (N + 1);
    for (let i = 1; i <= N; i++) {
      const shifted = i >= RERENDER_AT;
      ctx.fillStyle = i > action ? p.soft : (shifted ? p.warm : p.accent);
      ctx.fillRect(bw * i + bw * 0.1, hh - 50, bw * 0.35, 36);
      ctx.fillStyle = i > action ? p.soft : p.accent;
      ctx.fillRect(bw * i + bw * 0.55, hh - 50, bw * 0.35, 36);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`#${i}`, bw * i + bw * 0.5, hh - 54);
    }
    ctx.fillText("index", bw * 0.5, hh - 10);
    ctx.fillText("selector", bw * 0.5, hh + 4);
  });

  function update() {
    const r = webActionAccuracy(Math.min(action, N), RERENDER_AT);
    st.set("index", `${action === 0 ? 0 : r.indexCorrect} of ${N}`);
    st.set("selector", `${action === 0 ? 0 : r.selectorCorrect} of ${N}`);
    say(`after action ${action}: index-based ${action === 0 ? 0 : r.indexCorrect} of ${N} correct, selector-based ${action === 0 ? 0 : r.selectorCorrect} of ${N} correct`);
    cv.redraw();
  }
  const sp = stepper({
    stepLabel: "Take next action",
    onStep: () => { if (action >= N) return false; action++; if (action === RERENDER_AT) say("a banner ad just inserted a new element, shifting every index after it"); update(); return action < N; },
    onReset: () => { action = 0; update(); },
  });
  body.append(sp.el);
  update();
  return () => cv.destroy();
}
