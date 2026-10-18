// Bench: compare a bare query's similarity to a real document against a generated hypothetical answer's similarity.
import { cosineSim } from "./gakit.js";

const BARE_QUERY_VEC = [0.5, 0.5];
const HYPOTHETICAL_ANSWER_VEC = [0.86, 0.14];
const REAL_DOC_VEC = [0.88, 0.12];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Embedding a guessed answer instead of the question" });
  const say = live(body);
  let mode = "bare";

  const cv = canvas(body, { aspect: 0.4, label: "Similarity to the real relevant document" });
  const st = stats([["similarity", "cosine similarity to the real document"]]);
  const ch = choice("Embed", [["bare", "the bare question"], ["hyde", "a generated hypothetical answer"]], mode, (v) => { mode = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function sim() { return cosineSim(mode === "bare" ? BARE_QUERY_VEC : HYPOTHETICAL_ANSWER_VEC, REAL_DOC_VEC); }

  cv.onDraw((ctx, w, hh, p) => {
    const s = sim(), bw = w - 40;
    ctx.fillStyle = p.soft; ctx.fillRect(20, hh / 2 - 15, bw, 30);
    ctx.fillStyle = p.accent; ctx.fillRect(20, hh / 2 - 15, bw * s, 30);
  });

  function update() {
    st.set("similarity", sim().toFixed(4));
    say(`${mode === "bare" ? "bare question" : "hypothetical answer"}: similarity to the real document ${sim().toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
