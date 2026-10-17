// Bench: compare what's actually accessible between open-weight and closed/API-only model access.
const CAPABILITIES = [
  { label: "run fully offline", open: true, closed: false },
  { label: "inspect/modify the weights", open: true, closed: false },
  { label: "fine-tune locally, any method", open: true, closed: false },
  { label: "guaranteed version never changes under you", open: true, closed: false },
  { label: "use without any infrastructure of your own", open: false, closed: true },
  { label: "get provider-managed safety updates automatically", open: false, closed: true },
];

export default function mount(root, kit) {
  const { frame, h, choice, live } = kit;
  const body = frame(root, { title: "Different things are actually possible" });
  const say = live(body);
  let mode = "open";

  const list = h("ul", { class: "isai-list" });
  const ch = choice("Access mode", [["open", "open-weight"], ["closed", "closed/API-only"]], mode, (v) => { mode = v; update(); });
  body.append(list, ch.el);

  function update() {
    list.textContent = "";
    CAPABILITIES.forEach((c) => {
      const possible = mode === "open" ? c.open : c.closed;
      list.append(h("li", {}, `${possible ? "✓" : "✗"} ${c.label}`));
    });
    const count = CAPABILITIES.filter((c) => (mode === "open" ? c.open : c.closed)).length;
    say(`${mode === "open" ? "open-weight" : "closed"} access: ${count} of ${CAPABILITIES.length} capabilities available`);
  }
  update();
  return () => {};
}
