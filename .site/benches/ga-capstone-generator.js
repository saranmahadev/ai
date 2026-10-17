// Capstone: trace a prompt through conditioning, CFG-guided denoising, and cross-modal decoding --
// reusing this planet's own verified functions end to end.
import { mixtureScore, gaussScore } from "./gakit.js";

const CLUSTERS = { cat: [-2, 2], dog: [2, 2], bird: [0, -2.5] };
const COMPONENTS = Object.values(CLUSTERS).map((mu) => ({ mu, sigma2: 1, weight: 1 / 3 }));
const STEPS = 6, STEP_SIZE = 0.3, GUIDANCE_SCALE = 3;

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "One prompt, traced end to end" });
  const say = live(body);
  let prompt = "cat";

  const stagesList = h("ol", { class: "isai-list" });
  const st = stats([["decoded", "decoded concept"], ["distance", "distance to true cluster"]]);
  const ch = choice("Prompt", Object.keys(CLUSTERS).map((k) => [k, k]), prompt, (v) => { prompt = v; update(); });
  body.append(stagesList, st.el, ch.el);

  function nearestConcept(x) {
    let best = null, bestD = Infinity;
    for (const [name, mu] of Object.entries(CLUSTERS)) {
      const d = Math.hypot(x[0] - mu[0], x[1] - mu[1]);
      if (d < bestD) { bestD = d; best = name; }
    }
    return { best, bestD };
  }

  function update() {
    stagesList.textContent = "";
    stagesList.append(h("li", {}, `prompt: "${prompt}"`));

    let x = [0, 0];
    for (let s = 0; s < STEPS; s++) {
      const uncond = mixtureScore(x, COMPONENTS);
      const cond = gaussScore(x, CLUSTERS[prompt], 1);
      const cfg = uncond.map((v, i) => v + GUIDANCE_SCALE * (cond[i] - v));
      x = [x[0] + STEP_SIZE * cfg[0], x[1] + STEP_SIZE * cfg[1]];
    }
    stagesList.append(h("li", {}, `after ${STEPS} CFG-guided denoising steps: latent (${x[0].toFixed(3)}, ${x[1].toFixed(3)})`));

    const { best, bestD } = nearestConcept(x);
    stagesList.append(h("li", {}, `decoded to nearest concept: "${best}" (distance ${bestD.toFixed(4)})`));

    st.set("decoded", best);
    st.set("distance", bestD.toFixed(4));
    say(`prompt "${prompt}" decoded to "${best}" at distance ${bestD.toFixed(3)} from the true cluster`);
  }
  update();
  return () => {};
}
