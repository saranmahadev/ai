// Bench: compare one noisy direct guess against a chain of more-reliable sub-steps.
import { directVsChainTrial } from "./llmkit.js";
import { rng } from "./kit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One guess vs. a chain of smaller, surer ones" });
  const say = live(body);
  let stepP = 0.92;
  const DIRECT_P = 0.55, N_STEPS = 3;

  const cv = canvas(body, { aspect: 0.45, label: "Accuracy over 5,000 simulated trials" });
  const st = stats([["direct", "direct accuracy"], ["chain", "chain-of-thought accuracy"]]);
  const sl = slider({ label: "per-step reliability", min: 0.5, max: 0.99, step: 0.01, value: stepP, format: (v) => v.toFixed(2), onInput: (v) => { stepP = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let direct = 0, chain = 0;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 3;
    const dH = direct * (hh - 30), cH = chain * (hh - 30);
    ctx.fillStyle = p.soft; ctx.fillRect(bw * 0.5, hh - 15 - dH, bw * 0.6, dH);
    ctx.fillStyle = p.accent; ctx.fillRect(bw * 1.7, hh - 15 - cH, bw * 0.6, cH);
  });

  function update() {
    const rand = rng(7);
    let dCorrect = 0, cCorrect = 0;
    const trials = 5000;
    for (let t = 0; t < trials; t++) {
      const { direct: d, chain: c } = directVsChainTrial(rand, { directP: DIRECT_P, stepP, nSteps: N_STEPS });
      if (d) dCorrect++;
      if (c) cCorrect++;
    }
    direct = dCorrect / trials; chain = cCorrect / trials;
    st.set("direct", `${(direct * 100).toFixed(1)}%`);
    st.set("chain", `${(chain * 100).toFixed(1)}%`);
    say(`direct ${(direct * 100).toFixed(1)}%, chain-of-thought ${(chain * 100).toFixed(1)}%`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
