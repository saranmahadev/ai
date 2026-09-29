// Bench: forward chaining. Facts and rules produce new facts, and each new fact shows why it holds.
export default function mount(root, kit) {
  const { h, frame, toggles, button, choice, live } = kit;
  const body = frame(root, {
    title: "Facts, rules and inference",
    hint: "Start with four facts about parents. Switch rules on and run inference to see what follows."
  });
  const say = live(body);
  const NAMES = ["Asha", "Bala", "Chitra", "Dev", "Esha", "Farid"];
  const RULES = {
    grand: { text: "grandparent(X, Z) if parent(X, Y) and parent(Y, Z)", head: ["grandparent", "X", "Z"], body: [["parent", "X", "Y"], ["parent", "Y", "Z"]] },
    sib: { text: "sibling(X, Y) if parent(P, X) and parent(P, Y), X ≠ Y", head: ["sibling", "X", "Y"], body: [["parent", "P", "X"], ["parent", "P", "Y"]], neq: ["X", "Y"] },
    anc1: { text: "ancestor(X, Y) if parent(X, Y)", head: ["ancestor", "X", "Y"], body: [["parent", "X", "Y"]] },
    anc2: { text: "ancestor(X, Z) if parent(X, Y) and ancestor(Y, Z)", head: ["ancestor", "X", "Z"], body: [["parent", "X", "Y"], ["ancestor", "Y", "Z"]] }
  };
  let facts, on = { grand: true, sib: false, anc1: false, anc2: false }, rounds = 0;
  const fkey = (f) => f.join("|"), show = (f) => `${f[0]}(${f[1]}, ${f[2]})`;
  function reset() { facts = [["parent", "Asha", "Bala"], ["parent", "Asha", "Chitra"], ["parent", "Bala", "Dev"], ["parent", "Chitra", "Esha"]].map((f) => ({ f, why: "given" })); rounds = 0; render("Only the four given facts. No rules have run yet."); }
  const rulesUi = toggles(Object.entries(RULES).map(([k, r]) => [k, r.text, on[k]]), (v) => { on = v; });
  const pa = choice("Add a fact: parent", NAMES.map((n) => [n, n]), "Dev", () => {}), pb = choice("of", NAMES.map((n) => [n, n]), "Farid", () => {});
  const addBtn = button("Add this fact", () => { const f = ["parent", pa.get(), pb.get()]; if (pa.get() === pb.get()) { render("Nobody is their own parent."); return; } if (facts.some((x) => fkey(x.f) === fkey(f))) { render("That fact is already known."); return; } facts.push({ f, why: "given" }); render(`Added ${show(f)}.`); });
  const list = h("ul", { class: "isai-list yes" });
  const out = h("p", { class: "bench-verdict" });
  body.append(h("b", {}, "Rules (tick to switch on)"), rulesUi.el, h("div", { class: "bench-row" }, button("Run one round of inference", () => infer(false)), button("Run until nothing new", () => infer(true)), button("Reset", reset)), out, list, h("b", {}, "Teach it a new fact"), pa.el, pb.el, h("div", { class: "bench-row" }, addBtn));

  function match(rule, known) {
    const results = [];
    (function go(i, bind, used) {
      if (i === rule.body.length) { if (rule.neq && bind[rule.neq[0]] === bind[rule.neq[1]]) return; results.push({ bind, used }); return; }
      const [pred, a, b] = rule.body[i];
      for (const k of known) {
        if (k.f[0] !== pred) continue;
        const nb = { ...bind };
        if (nb[a] !== undefined && nb[a] !== k.f[1]) continue; nb[a] = k.f[1];
        if (nb[b] !== undefined && nb[b] !== k.f[2]) continue; nb[b] = k.f[2];
        go(i + 1, nb, [...used, k.f]);
      }
    })(0, {}, []);
    return results;
  }
  function infer(untilDone) {
    let total = 0, guard = 0;
    do {
      const known = facts.slice(), fresh = [];
      for (const [k, rule] of Object.entries(RULES)) {
        if (!on[k]) continue;
        for (const m of match(rule, known)) {
          const f = [rule.head[0], m.bind[rule.head[1]], m.bind[rule.head[2]]];
          if (facts.some((x) => fkey(x.f) === fkey(f)) || fresh.some((x) => fkey(x.f) === fkey(f))) continue;
          fresh.push({ f, why: `${rule.text.split(" if ")[0].replace(/\(X, Z\)|\(X, Y\)/, "")} rule: because ${m.used.map(show).join(" and ")}` });
        }
      }
      facts.push(...fresh); total += fresh.length; if (fresh.length) rounds++;
      if (!fresh.length) break;
    } while (untilDone && guard++ < 10);
    render(total ? `${total} new fact${total > 1 ? "s" : ""} derived. Each one lists what it follows from.` : on.grand || on.sib || on.anc1 || on.anc2 ? "Nothing new follows from the current facts and rules." : "No rules are switched on, so nothing can be inferred.");
  }
  function render(msg) {
    list.textContent = "";
    facts.forEach((x) => list.append(h("li", { style: x.why === "given" ? "" : "border-left-color:var(--warn-fg,#e8793a)" }, h("b", {}, show(x.f)), h("small", {}, ` — ${x.why}`))));
    const derived = facts.filter((x) => x.why !== "given").length;
    out.textContent = `${msg} (${facts.length} facts: ${facts.length - derived} given, ${derived} derived, ${rounds} round${rounds === 1 ? "" : "s"} run.)`; say(out.textContent);
  }
  reset();
}
