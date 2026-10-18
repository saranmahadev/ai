// Bench: compare a single call that ran out of room against an orchestrator assigning one worker per section.
const SECTIONS = ["market analysis", "financial projections", "risk assessment"];

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Guaranteed coverage, one worker per piece" });
  const say = live(body);
  let mode = "single";

  const list = h("ul", { class: "isai-list" });
  const st = stats([["covered", "sections covered"]]);
  const ch = choice("Approach", [["single", "single big call (ran out of room)"], ["orchestrator", "orchestrator-workers (one per section)"]], mode, (v) => { mode = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const covered = mode === "single" ? SECTIONS.slice(0, 2) : SECTIONS;
    list.textContent = "";
    SECTIONS.forEach((s) => list.append(h("li", {}, `${covered.includes(s) ? "✓" : "✗ (never reached)"} ${s}`)));
    st.set("covered", `${covered.length} of ${SECTIONS.length}`);
    say(`${mode === "single" ? "single big call" : "orchestrator-workers"}: ${covered.length} of ${SECTIONS.length} sections covered`);
  }
  update();
  return () => {};
}
