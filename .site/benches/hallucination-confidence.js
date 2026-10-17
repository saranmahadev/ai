// Bench: compare a generated claim's stated confidence against whether it's actually true.
const KB = { "Paris is the capital of France": true, "The Great Wall of China is visible from the Moon": false, "Water boils at 100°C at sea level": true, "Napoleon was extremely short for his era": false };
const CLAIMS = [
  { text: "Paris is the capital of France", confidence: 0.97 },
  { text: "The Great Wall of China is visible from the Moon", confidence: 0.89 },
  { text: "Water boils at 100°C at sea level", confidence: 0.95 },
  { text: "Napoleon was extremely short for his era", confidence: 0.80 },
];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "Confident, and wrong" });
  const say = live(body);
  let shown = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["hallucinations", "confident but false, so far"]]);

  function render() {
    list.textContent = "";
    let hallucinations = 0;
    CLAIMS.slice(0, shown).forEach((c) => {
      const factual = KB[c.text];
      if (!factual) hallucinations++;
      const verdict = !factual ? "HALLUCINATION — confident and wrong" : "correct";
      list.append(h("li", {}, `"${c.text}" — confidence ${c.confidence.toFixed(2)} — ${verdict}`));
    });
    st.set("hallucinations", String(hallucinations));
    if (shown > 0) say(CLAIMS[shown - 1] && !KB[CLAIMS[shown - 1].text] ? "that claim was confidently false" : "that claim checked out");
  }
  const sp = stepper({
    stepLabel: "Next claim",
    onStep: () => { if (shown >= CLAIMS.length) return false; shown++; render(); },
    onReset: () => { shown = 0; render(); },
  });
  body.append(list, st.el, sp.el);
  render();
  return () => {};
}
