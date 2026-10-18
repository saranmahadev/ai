// Bench: slide where a failure happens in a 4-step run and see whether open-loop or closed-loop execution catches it.
import { loopDetectsFailure } from "./agentkit.js";

const N_STEPS = 4;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Checking the result, or not" });
  const say = live(body);
  let failStep = 1;

  const cv = canvas(body, { aspect: 0.4, label: "Does each loop style catch the failure?" });
  const st = stats([["open", "open-loop catches it?"], ["closed", "closed-loop catches it?"]]);
  const sl = slider({ label: "step where the action silently fails", min: 0, max: N_STEPS - 1, step: 1, value: failStep, format: (v) => `step ${v + 1}`, onInput: (v) => { failStep = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / N_STEPS;
    for (let i = 0; i < N_STEPS; i++) {
      ctx.fillStyle = i === failStep ? p.warm : p.soft;
      ctx.fillRect(bw * (i + 0.1), hh / 2 - 15, bw * 0.8, 30);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`step ${i + 1}`, bw * (i + 0.1) + bw * 0.4, hh / 2 + 5);
    }
  });

  function update() {
    const open = loopDetectsFailure(N_STEPS, failStep, false);
    const closed = loopDetectsFailure(N_STEPS, failStep, true);
    st.set("open", open ? "yes" : "no — reports success anyway");
    st.set("closed", closed ? `yes — stops at step ${failStep + 1}` : "no");
    say(`failure at step ${failStep + 1}: open-loop ${open ? "catches it" : "misses it and reports success"}, closed-loop ${closed ? "catches it immediately" : "misses it"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
