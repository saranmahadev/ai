// Bench: compare late-interaction MaxSim scoring against single-vector pooled scoring as unrelated document tokens pile up.
import { maxSimScore, singleVectorScore } from "./ragkit.js";

const QUERY_TOKENS = [[0.95, 0.05], [0.4, 0.6]]; // "refund", "timeline"
const STRONG_TOKEN = [0.97, 0.03];
const UNRELATED_TOKEN_POOL = [[0.1, 0.9], [0.15, 0.85], [0.2, 0.8], [0.25, 0.75], [0.1, 0.9], [0.05, 0.95], [0.3, 0.7]];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A strong match survives being buried; a pooled average doesn't" });
  const say = live(body);
  let distractors = 7;

  const cv = canvas(body, { aspect: 0.4, label: "Score vs. number of unrelated document tokens" });
  const st = stats([["maxsim", "multi-vector MaxSim score"], ["pooled", "single-vector pooled score"]]);
  const sl = slider({ label: "unrelated tokens surrounding the one strong match", min: 0, max: 7, step: 1, value: distractors, format: (v) => String(v), onInput: (v) => { distractors = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function docTokens(n) { return [STRONG_TOKEN, ...UNRELATED_TOKEN_POOL.slice(0, n)]; }

  cv.onDraw((ctx, w, hh, p) => {
    const steps = [0, 1, 2, 3, 4, 5, 6, 7];
    const bw = w / steps.length;
    steps.forEach((n, i) => {
      const maxsim = maxSimScore(QUERY_TOKENS, docTokens(n)) / 2;
      const bh = maxsim * (hh - 30);
      ctx.fillStyle = n === distractors ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.2), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    const d = docTokens(distractors);
    const maxsim = maxSimScore(QUERY_TOKENS, d);
    const pooled = singleVectorScore(QUERY_TOKENS, d);
    st.set("maxsim", maxsim.toFixed(4));
    st.set("pooled", pooled.toFixed(4));
    say(`${distractors} unrelated tokens: MaxSim score ${maxsim.toFixed(3)}, pooled score ${pooled.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
