// Bench: compare a query against a table flattened into prose versus the same table's rows kept separate.
import { cosineSim } from "./gakit.js";

const QUERY_VEC = [0.9, 0.1, 0.0]; // "what is the price of the Pro plan"
const FLATTENED_VEC = [0.3, 0.3, 0.3]; // the whole pricing table squashed into one paragraph
const ROW_PRESERVED_VEC = [0.88, 0.08, 0.02]; // just the "Pro plan: $49/mo" row, kept as its own chunk

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "A table loses its structure when it's flattened" });
  const say = live(body);
  let mode = "flattened";

  const cv = canvas(body, { aspect: 0.4, label: "Similarity to the query, by chunking choice" });
  const st = stats([["similarity", "cosine similarity to query"]]);
  const ch = choice("Table chunking", [["flattened", "flattened into one paragraph"], ["rowPreserved", "one row kept as its own chunk"]], mode, (v) => { mode = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function sim() { return cosineSim(QUERY_VEC, mode === "flattened" ? FLATTENED_VEC : ROW_PRESERVED_VEC); }

  cv.onDraw((ctx, w, hh, p) => {
    const s = sim();
    const bw = w - 40;
    ctx.fillStyle = p.soft; ctx.fillRect(20, hh / 2 - 15, bw, 30);
    ctx.fillStyle = p.accent; ctx.fillRect(20, hh / 2 - 15, bw * s, 30);
    ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`similarity ${s.toFixed(3)}`, w / 2, hh / 2 + 35);
  });

  function update() {
    st.set("similarity", sim().toFixed(4));
    say(`${mode === "flattened" ? "flattened table" : "row-preserved chunk"}: similarity to query ${sim().toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
