// Bench: a tiny rule-based expert system. It handles what its rules cover, and breaks on what they do not.
export default function mount(root, kit) {
  const { h, frame, toggles, button, choice, live } = kit;
  const body = frame(root, {
    title: "A lamp troubleshooter built from rules"
  });
  const say = live(body);
  const SYM = { dead: "The lamp does not light", unplugged: "The plug is not in the socket", bulb: "The bulb looks broken", loose: "The switch feels loose", frayed: "The cord looks frayed", flicker: "It flickers when the washing machine starts", hum: "It hums loudly" };
  let rules = [
    { id: "r1", if: ["dead", "unplugged"], then: "Plug it in.", note: "" },
    { id: "r2", if: ["dead", "bulb"], then: "Replace the bulb.", note: "" },
    { id: "r3", if: ["dead", "loose"], then: "Replace the switch.", note: "" },
    { id: "r4", if: ["frayed"], then: "Unplug it now and replace the cord. This is a fire risk.", note: "" }
  ];
  const tg = toggles(Object.entries(SYM).map(([k, t]) => [k, t, k === "dead"]), run);
  const out = h("div", {});
  const verdict = h("p", { class: "bench-verdict" });
  const kb = h("p", { class: "bench-line" });
  const pick = choice("Teach it a new rule: when you see", Object.entries(SYM).map(([k, t]) => [k, t]), "flicker", () => {});
  const advice = h("input", { type: "text", value: "Call an electrician: the wiring may be overloaded.", "aria-label": "Advice for the new rule", style: "width:100%;font:700 14px var(--font);padding:8px 12px;border-radius:12px;border:2px solid var(--accent);background:var(--white);color:var(--ink)" });
  const add = button("Add this rule", () => { const s = pick.get(); rules.push({ id: "r" + (rules.length + 1), if: [s], then: advice.value.trim() || "See a technician.", note: "taught by a person" }); run(); });
  const reset = button("Forget taught rules", () => { rules = rules.slice(0, 4); run(); });
  body.append(tg.el, verdict, out, kb, h("hr"), pick.el, advice, h("div", { class: "bench-row" }, add, reset));

  function run() {
    const v = tg.get(), fired = rules.filter((r) => r.if.every((s) => v[s]));
    out.textContent = "";
    for (const r of fired) out.append(h("ul", { class: "isai-list yes", style: "margin:6px 0 0" }, h("li", {}, h("b", {}, `Rule ${r.id.slice(1)} fires: `), r.then, r.note ? h("small", {}, ` (${r.note})`) : null)));
    const anything = Object.values(v).some(Boolean);
    let msg;
    if (!anything) msg = "Tick an observation.";
    else if (!fired.length) msg = "No rule matches.";
    else if (fired.length > 1 && new Set(fired.map((r) => r.then)).size > 1) msg = `Conflict: ${fired.length} rules give different advice.`;
    else msg = "Covered by the rules.";
    verdict.textContent = msg;
    kb.textContent = `Knowledge base: ${rules.length} rule${rules.length === 1 ? "" : "s"}, ${rules.length - 4} taught by a person.`;
    say(msg);
  }
  run();
}
