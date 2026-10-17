// Bench: compare greedy decoding against beam search on a tiny 2-step toy model.
import { softmax, greedyDecode, beamSearch } from "./gakit.js";

const VOCAB = ["A", "B", "C", "<eos>"];
const TABLE = { "": [1.0, 1.3, 0.1, -5], "0": [0.2, 0.2, 3.0, -5], "1": [0.2, 1.0, 1.0, -5] };
function nextLogits(prefix) {
  const key = prefix.join(",");
  return key in TABLE ? TABLE[key] : [-5, -5, -5, 5];
}

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Greedy vs. beam search" });
  const say = live(body);
  let beamWidth = 1;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["greedy", "greedy sequence"], ["beam", "beam search sequence"]]);
  const sl = slider({ label: "beam width", min: 1, max: 3, step: 1, value: beamWidth, format: (v) => String(v), onInput: (v) => { beamWidth = v; update(); } });
  body.append(list, st.el, sl.el);

  function render(ids) { return ids.map((i) => VOCAB[i]).join(" "); }

  function update() {
    const greedyIds = greedyDecode(nextLogits, { maxLen: 2, eosId: 3 });
    const beams = beamSearch(nextLogits, { beamWidth, maxLen: 2, eosId: 3 });
    const best = beams[0];

    list.textContent = "";
    beams.forEach((b, i) => {
      list.append(h("li", {}, `${render(b.ids)} — log-prob ${b.logProb.toFixed(4)}${i === 0 ? " (kept)" : ""}`));
    });

    st.set("greedy", `${render(greedyIds)}`);
    st.set("beam", `${render(best.ids)} (${best.logProb.toFixed(4)})`);
    say(`beam width ${beamWidth}: best sequence ${render(best.ids)} with log-probability ${best.logProb.toFixed(4)}`);
  }
  update();
  return () => {};
}
