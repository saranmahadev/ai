// Bench: pick constraints and see which classical architecture on this planet actually fits them.
const METHODS = [
  { key: "noLabels", label: "No labelled training data", method: "Classical Hopfield network", detail: "stores patterns directly; capacity ≈ 0.138 × N units, no labels needed at all." },
  { key: "noTime", label: "No time to iterate or train", method: "ELM or RBF network", detail: "one linear solve for the output layer; no gradient descent, no epochs." },
  { key: "lowPower", label: "Severe, fixed energy budget", method: "Spiking network on neuromorphic hardware", detail: "cost scales with firing rate r, not with population size × time steps — a 1/r sparsity advantage." }
];

export default function mount(root, kit) {
  const { frame, h, toggles, live } = kit;
  const body = frame(root, { title: "Match the constraint to the method" });
  const say = live(body);

  const list = h("ul", { class: "isai-list" });
  const tg = toggles(METHODS.map((m) => [m.key, m.label, false]), (values) => update(values));
  body.append(list, tg.el);

  function update(values) {
    const active = METHODS.filter((m) => values[m.key]);
    list.textContent = "";
    if (!active.length) {
      list.append(h("li", {}, h("b", {}, "No unusual constraint selected: "), "a standard, backpropagation-trained deep network is the sensible default here."));
    } else {
      for (const m of active) list.append(h("li", {}, h("b", {}, `${m.label} → ${m.method}: `), m.detail));
      if (active.length > 1) list.append(h("li", { class: "bench-verdict" }, "More than one constraint applies at once — there may not be a single clean answer; consider which constraint matters most."));
    }
    say(active.length ? `${active.length} constraint${active.length > 1 ? "s" : ""} selected` : "no constraints selected, standard deep network recommended");
  }
  update(tg.get());
  return () => {};
}
