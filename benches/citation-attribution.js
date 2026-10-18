// Bench: trace each claim in a generated answer back to its best-supporting passage, flagging anything too weakly supported to cite.
import { bestSupport } from "./ragkit.js";

const PASSAGES = { p1: [0.9, 0.1], p2: [0.1, 0.9] };
const CLAIMS = [
  { text: "Refunds are issued within 5 business days.", vec: [0.92, 0.08] },
  { text: "Shipping takes 3-5 days.", vec: [0.12, 0.88] },
  { text: "The company was founded in 1998.", vec: [0.5, 0.5] },
];

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Can every claim point back to a source?" });
  const say = live(body);
  let threshold = 0.8;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["cited", "claims with a citation"]]);
  const sl = slider({ label: "citation threshold", min: 0.5, max: 0.99, step: 0.01, value: threshold, format: (v) => v.toFixed(2), onInput: (v) => { threshold = v; update(); } });
  body.append(list, st.el, sl.el);

  function update() {
    list.textContent = "";
    let cited = 0;
    CLAIMS.forEach((c) => {
      const [src, sim] = bestSupport(c.vec, PASSAGES);
      const ok = sim >= threshold;
      if (ok) cited++;
      list.append(h("li", {}, `"${c.text}" — best match ${src} (${sim.toFixed(3)}) ${ok ? `[cite ${src}]` : "[unsupported]"}`));
    });
    st.set("cited", `${cited} of ${CLAIMS.length}`);
    say(`at threshold ${threshold.toFixed(2)}: ${cited} of ${CLAIMS.length} claims have a citation`);
  }
  update();
  return () => {};
}
