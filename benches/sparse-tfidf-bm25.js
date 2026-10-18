// Bench: compare raw word-overlap, TF-IDF and BM25 scores for the same query across a tiny corpus.
import { tokenize, tfidfScore, bm25Score } from "./ragkit.js";

const CORPUS = { d1: "the cat sat on the mat", d2: "the dog sat on the log", d3: "a mat for yoga practice" };
const DOCS = Object.fromEntries(Object.entries(CORPUS).map(([k, v]) => [k, tokenize(v)]));
const QUERY = "cat mat";

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Weighting matters: raw overlap isn't the only option" });
  const say = live(body);
  let method = "overlap";

  const cv = canvas(body, { aspect: 0.4, label: `Scores for query "${QUERY}"` });
  const st = stats([["winner", "top-ranked document"]]);
  const ch = choice("Scoring method", [["overlap", "raw word overlap"], ["tfidf", "TF-IDF"], ["bm25", "BM25"]], method, (v) => { method = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function scoreFor(name, doc) {
    if (method === "overlap") return tokenize(QUERY).filter((t) => doc.includes(t)).length;
    if (method === "tfidf") return tfidfScore(QUERY, doc, DOCS);
    return bm25Score(QUERY, doc, DOCS);
  }

  cv.onDraw((ctx, w, hh, p) => {
    const scores = Object.entries(DOCS).map(([n, d]) => [n, scoreFor(n, d)]);
    const maxV = Math.max(...scores.map((s) => s[1]), 1);
    const bw = w / 4;
    scores.forEach(([name, score], i) => {
      const bh = (score / maxV) * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(name, bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(score.toFixed(3), bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    const scores = Object.entries(DOCS).map(([n, d]) => [n, scoreFor(n, d)]).sort((a, b) => b[1] - a[1]);
    st.set("winner", `${scores[0][0]} (${scores[0][1].toFixed(3)})`);
    say(`${method}: ${scores.map(([n, s]) => `${n} ${s.toFixed(3)}`).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
