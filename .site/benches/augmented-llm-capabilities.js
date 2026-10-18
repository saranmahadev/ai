// Bench: compare what a bare LLM can do against the same model augmented with tools, memory and retrieval.
export default function mount(root, kit) {
  const { frame, h, choice, live } = kit;
  const body = frame(root, { title: "What augmentation actually unlocks" });
  const say = live(body);
  let which = "bare";

  const CAPS = [
    { label: "answer from training data alone", bare: true, augmented: true },
    { label: "take an action in the real world", bare: false, augmented: true },
    { label: "recall something from a past conversation", bare: false, augmented: true },
    { label: "answer using a document it's never seen", bare: false, augmented: true },
  ];

  const list = h("ul", { class: "isai-list" });
  const ch = choice("Model", [["bare", "a bare LLM"], ["augmented", "an augmented LLM (tools + memory + retrieval)"]], which, (v) => { which = v; update(); });
  body.append(list, ch.el);

  function update() {
    list.textContent = "";
    CAPS.forEach((c) => list.append(h("li", {}, `${c[which] ? "✓" : "✗"} ${c.label}`)));
    const count = CAPS.filter((c) => c[which]).length;
    say(`${which === "bare" ? "a bare LLM" : "an augmented LLM"}: handles ${count} of ${CAPS.length} listed capabilities`);
  }
  update();
  return () => {};
}
