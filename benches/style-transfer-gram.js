// Bench: step a toy feature map toward a style's Gram matrix while keeping content's structure.
import { gramMatrix, frobeniusDiff, styleTransferStep } from "./gakit.js";

const CONTENT = [[1, 0], [0.8, 0.2], [0.2, 0.8], [0, 1]];
const STYLE = [[2, 2], [1.8, 2.2], [2.2, 1.8], [2, 2]];
const STYLE_GRAM = gramMatrix(STYLE);
const ALPHA = 1, BETA = 0.05, LR = 0.02;

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "Matching content structure and style statistics" });
  const say = live(body);
  let F = CONTENT.map((r) => r.slice()), iterations = 0;

  const out = h("p", { class: "isai-readout" });
  const st = stats([["iterations", "optimization steps"], ["loss", "total loss"]]);

  function loss(features) {
    let contentLoss = 0;
    for (let p = 0; p < features.length; p++) for (let c = 0; c < features[0].length; c++) contentLoss += (features[p][c] - CONTENT[p][c]) ** 2;
    return ALPHA * contentLoss + BETA * frobeniusDiff(gramMatrix(features), STYLE_GRAM);
  }

  function report() {
    out.textContent = F.map((row) => `[${row.map((v) => v.toFixed(2)).join(", ")}]`).join("  ");
    st.set("iterations", String(iterations));
    st.set("loss", loss(F).toFixed(3));
    say(`after ${iterations} steps, loss is ${loss(F).toFixed(3)}`);
  }
  const sp = stepper({
    stepLabel: "Step ×20",
    onStep: () => {
      if (iterations >= 500) return false;
      for (let i = 0; i < 20; i++) F = styleTransferStep(F, CONTENT, STYLE_GRAM, { alpha: ALPHA, beta: BETA, lr: LR });
      iterations += 20;
      report();
    },
    onReset: () => { F = CONTENT.map((r) => r.slice()); iterations = 0; report(); },
  });
  body.append(out, st.el, sp.el);
  report();
  return () => {};
}
