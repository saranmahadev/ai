// Bench: compare fixed-size chunking against recursive, sentence-respecting chunking on the same text.
import { fixedChunks, recursiveChunks, splitsMidWord } from "./ragkit.js";

const DOC = "Returns are accepted within 30 days. Items must be unworn and in original packaging. Refunds are issued to the original payment method within 5 business days. Store credit is available as an alternative.";
const SIZE = 40;

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Splitting by character count vs. by sentence" });
  const say = live(body);
  let mode = "fixed";

  const list = h("ol", { class: "isai-list" });
  const st = stats([["chunks", "chunk count"], ["broken", "mid-word breaks"]]);
  const ch = choice("Chunking method", [["fixed", "fixed-size (40 chars)"], ["recursive", "recursive (sentence-aware)"]], mode, (v) => { mode = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const chunks = mode === "fixed" ? fixedChunks(DOC, SIZE) : recursiveChunks(DOC, SIZE);
    let broken = 0;
    for (let i = 0; i < chunks.length - 1; i++) if (splitsMidWord(chunks[i], chunks[i + 1])) broken++;
    list.textContent = "";
    chunks.forEach((c, i) => {
      const brokenHere = i < chunks.length - 1 && splitsMidWord(c, chunks[i + 1]);
      list.append(h("li", {}, `"${c}"${brokenHere ? "  ← cuts mid-word" : ""}`));
    });
    st.set("chunks", String(chunks.length));
    st.set("broken", String(broken));
    say(`${mode === "fixed" ? "fixed-size" : "recursive"} chunking: ${chunks.length} chunks, ${broken} mid-word breaks`);
  }
  update();
  return () => {};
}
