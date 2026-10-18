// Bench: step through a chained pipeline and watch its validation gate catch a malformed intermediate result.
import { passesGate } from "./agentkit.js";

const OUTLINES = [
  { sections: ["intro", "body", "conclusion"] },
  { sections: ["intro", "body"] },
  { sections: ["intro", "body", "conclusion"] },
];
const REQUIRED = ["intro", "body", "conclusion"];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "Checking the outline before writing the draft" });
  const say = live(body);
  let i = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["passed", "outlines that proceeded"], ["caught", "outlines caught by the gate"]]);
  body.append(list, st.el);

  function render() {
    list.textContent = "";
    for (let j = 0; j <= i; j++) {
      const ok = passesGate(OUTLINES[j].sections, REQUIRED);
      list.append(h("li", {}, `outline ${j + 1} (${OUTLINES[j].sections.join(", ")}): ${ok ? "passes gate → drafted" : "fails gate → caught before drafting"}`));
    }
    const shown = OUTLINES.slice(0, i + 1).map((o) => passesGate(o.sections, REQUIRED));
    st.set("passed", String(shown.filter(Boolean).length));
    st.set("caught", String(shown.filter((x) => !x).length));
    say(`outline ${i + 1}: ${passesGate(OUTLINES[i].sections, REQUIRED) ? "passed the gate" : "caught by the gate"}`);
  }
  const sp = stepper({
    stepLabel: "pipeline step",
    onStep: () => { if (i >= OUTLINES.length - 1) return false; i++; render(); return i < OUTLINES.length - 1; },
    onReset: () => { i = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
