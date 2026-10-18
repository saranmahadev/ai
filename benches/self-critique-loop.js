// Bench: step through a 4-value trajectory and watch self-critique catch an injected arithmetic error before it propagates.
import { runSelfCritique } from "./agentkit.js";

const TRAJECTORY = [
  { start: 12 },
  { compute: (v) => v * 4, buggyOutput: (v) => v * 4 + 4 },
  { compute: (v) => v - 10 },
  { compute: (v) => v / 2 },
];

export default function mount(root, kit) {
  const { frame, canvas, toggles, stepper, stats, live } = kit;
  const body = frame(root, { title: "Catching the error before it spreads" });
  const say = live(body);
  let critique = false, step = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Value produced at each step" });
  const st = stats([["corrections", "corrections caught so far"]]);
  const tg = toggles([["critique", "Self-critique each step", false]], (vals) => { critique = vals.critique; reset(); });
  body.append(cv.box, st.el, tg.el);

  function runUpTo(n) {
    const full = runSelfCritique(TRAJECTORY, critique);
    return { log: full.log.slice(0, n + 1), correctionsCaught: full.correctionsCaught };
  }
  cv.onDraw((ctx, w, hh, p) => {
    const { log } = runUpTo(3);
    const bw = w / 4;
    for (let i = 0; i < 4; i++) {
      const v = i <= step ? log[i] : null;
      const bh = v == null ? 0 : Math.max(6, (v / 55) * (hh - 30));
      ctx.fillStyle = i === step ? p.accent : p.soft;
      if (v != null) ctx.fillRect(bw * i + bw * 0.2, hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`step ${i}${v != null ? ": " + v : ""}`, bw * i + bw * 0.5, hh - 2);
    }
  });

  function update() {
    const { log, correctionsCaught } = runUpTo(step);
    st.set("corrections", String(step === 0 ? 0 : correctionsCaught));
    say(`step ${step}: value ${log[step]}${critique ? ", self-critique on" : ", self-critique off"}`);
    cv.redraw();
  }
  function reset() { step = 0; update(); }
  const sp = stepper({
    stepLabel: "trajectory step",
    onStep: () => { if (step >= 3) return false; step++; update(); return step < 3; },
    onReset: () => reset(),
  });
  body.append(sp.el);
  update();
  return () => cv.destroy();
}
