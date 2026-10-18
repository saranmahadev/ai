// Bench: toggle an unsupported claim in/out of an answer and watch the faithfulness score respond.
import { faithfulnessScore } from "./ragkit.js";

const PASSAGES = { p1: [0.9, 0.1], p2: [0.1, 0.9] };
const ALL_CLAIMS = [
  { text: "Refunds are issued within 5 business days.", vec: [0.92, 0.08] },
  { text: "Shipping takes 3-5 days.", vec: [0.12, 0.88] },
  { text: "The company was founded in 1998.", vec: [0.5, 0.5] },
];
const THRESHOLD = 0.8;

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "What fraction of the answer is actually grounded?" });
  const say = live(body);
  let includeUnsupported = true;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["faithfulness", "faithfulness score"]]);
  const tg = toggles([["extra", "include the unsupported claim", includeUnsupported]], (v) => { includeUnsupported = v.extra; update(); });
  body.append(list, st.el, tg.el);

  function update() {
    const claims = includeUnsupported ? ALL_CLAIMS : ALL_CLAIMS.slice(0, 2);
    const score = faithfulnessScore(claims, PASSAGES, THRESHOLD);
    list.textContent = "";
    claims.forEach((c) => list.append(h("li", {}, `"${c.text}"`)));
    st.set("faithfulness", `${(score * 100).toFixed(0)}%`);
    say(`${claims.length} claims in the answer: faithfulness score ${(score * 100).toFixed(0)} percent`);
  }
  update();
  return () => {};
}
