// Bench: compare sparse word-overlap scoring against dense cosine similarity for a query with no shared vocabulary with the relevant document.
import { tokenize } from "./ragkit.js";
import { cosineSim } from "./gakit.js";

const QUERY = "automobile repair";
const DOC = "car maintenance and servicing guide";
const QUERY_VEC = [0.9, 0.1];
const DOC_VEC = [0.88, 0.12];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "No shared words, same meaning" });
  const say = live(body);
  let method = "sparse";

  const cv = canvas(body, { aspect: 0.4, label: "Relevance score by method" });
  const st = stats([["score", "relevance score"]]);
  const ch = choice("Method", [["sparse", "sparse (word overlap)"], ["dense", "dense (cosine similarity)"]], method, (v) => { method = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function score() {
    if (method === "sparse") return tokenize(QUERY).filter((t) => tokenize(DOC).includes(t)).length;
    return cosineSim(QUERY_VEC, DOC_VEC);
  }

  cv.onDraw((ctx, w, hh, p) => {
    const s = score(), maxV = method === "sparse" ? 2 : 1;
    const bw = w - 40;
    ctx.fillStyle = p.soft; ctx.fillRect(20, hh / 2 - 15, bw, 30);
    ctx.fillStyle = p.accent; ctx.fillRect(20, hh / 2 - 15, bw * (s / maxV), 30);
  });

  function update() {
    const s = score();
    st.set("score", method === "sparse" ? `${s} shared word(s)` : s.toFixed(4));
    say(`query "${QUERY}" vs. doc "${DOC}": ${method} score ${method === "sparse" ? `${s} shared words` : s.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
