// Bench: compare what a bare ANN library handles against what a full vector database adds on top.
export default function mount(root, kit) {
  const { frame, h, choice, live } = kit;
  const body = frame(root, { title: "An index structure is only part of the job" });
  const say = live(body);
  let which = "bareLib";

  const CAPABILITIES = [
    { label: "compute nearest neighbors for a query vector", bareLib: true, vectorDb: true },
    { label: "insert, update or delete vectors after the index is built", bareLib: false, vectorDb: true },
    { label: "persist the index to disk and reload it", bareLib: false, vectorDb: true },
    { label: "filter by metadata alongside similarity", bareLib: false, vectorDb: true },
    { label: "replicate across multiple machines", bareLib: false, vectorDb: true },
  ];

  const list = h("ul", { class: "isai-list" });
  const ch = choice("System", [["bareLib", "a bare ANN library"], ["vectorDb", "a vector database"]], which, (v) => { which = v; update(); });
  body.append(list, ch.el);

  function update() {
    list.textContent = "";
    CAPABILITIES.forEach((c) => list.append(h("li", {}, `${c[which] ? "✓" : "✗"} ${c.label}`)));
    const count = CAPABILITIES.filter((c) => c[which]).length;
    say(`${which === "bareLib" ? "a bare ANN library" : "a vector database"}: handles ${count} of ${CAPABILITIES.length} listed capabilities`);
  }
  update();
  return () => {};
}
