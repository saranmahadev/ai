// Bench: expand a small seed set of instructions into many more via template substitution.
const SEEDS = ["Summarize this article", "Translate this sentence", "Explain this concept"];
const TEMPLATES = ["Please {s} in one paragraph.", "Can you {s}, for a beginner?", "{s}. Be concise.", "{s}, and include an example."];

function expand(seeds, templates) {
  const out = [];
  for (const s of seeds) for (const t of templates) out.push(t.replace("{s}", s));
  return out;
}

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "A handful of seeds, many more instructions" });
  const say = live(body);
  let nTemplates = 1;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["seeds", "seed instructions"], ["total", "expanded instructions"]]);
  const sl = slider({ label: "templates applied per seed", min: 1, max: TEMPLATES.length, step: 1, value: nTemplates, format: (v) => String(v), onInput: (v) => { nTemplates = v; update(); } });
  body.append(list, st.el, sl.el);

  function update() {
    const expanded = expand(SEEDS, TEMPLATES.slice(0, nTemplates));
    list.textContent = "";
    expanded.slice(0, 6).forEach((instr) => list.append(h("li", {}, instr)));
    st.set("seeds", String(SEEDS.length));
    st.set("total", String(expanded.length));
    say(`${SEEDS.length} seeds × ${nTemplates} templates = ${expanded.length} instructions`);
  }
  update();
  return () => {};
}
