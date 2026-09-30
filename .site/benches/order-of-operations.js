// Bench: evaluate an expression one operation at a time, in the agreed order.
export default function mount(root, kit) {
  const { h, frame, button, choice, live, fmt } = kit;
  const body = frame(root, { title: "Evaluate step by step" });
  const say = live(body);
  const EXPRS = {
    a: "2 + 3 × 4",
    b: "( 2 + 3 ) × 4",
    c: "10 − 4 − 3",
    d: "3 + 4 × ( 2 + 1 ) ^ 2 − 6 ÷ 3",
    e: "8 ÷ 2 × 4"
  };
  const PREC = { "+": 1, "−": 1, "×": 2, "÷": 2, "^": 3 };
  let toks = [], hi = null, explain = "";
  const apply = (a, op, b) => (op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : op === "÷" ? a / b : a ** b);
  function reduceRange(lo, hiIdx) { // reduce one operation between toks[lo..hiIdx)
    let best = -1;
    for (let i = lo; i < hiIdx; i++) if (PREC[toks[i]]) { if (best < 0 || PREC[toks[i]] > PREC[toks[best]] || (toks[i] === "^" && toks[best] === "^")) best = i; }
    const a = parseFloat(toks[best - 1]), b = parseFloat(toks[best + 1]), v = apply(a, toks[best], b);
    explain = `${fmt(a, 4)} ${toks[best]} ${fmt(b, 4)} = ${fmt(v, 4)}`;
    toks.splice(best - 1, 3, String(v)); hi = [best - 1, best - 1];
  }
  function step() {
    if (toks.length === 1) return false;
    let close = toks.indexOf(")");
    if (close >= 0) {
      const open = toks.lastIndexOf("(", close);
      if (close - open === 2) { toks.splice(close, 1); toks.splice(open, 1); hi = [open, open]; explain = "parentheses resolved"; }
      else reduceRange(open + 1, close);
    } else reduceRange(0, toks.length);
    draw();
    if (toks.length === 1) { say(`Result ${toks[0]}`); return false; }
  }
  function reset(key = which.get()) { toks = EXPRS[key].split(" "); hi = null; explain = "next: parentheses first, then powers, × and ÷, then + and −, left to right"; draw(); }
  const which = choice("Expression", Object.entries(EXPRS).map(([k, v]) => [k, v.replace(/ /g, "")]), "a", (k) => reset(k));
  const view = h("div", { class: "stage bench-expr", style: "font:800 1.5rem/1.4 Nunito,system-ui,sans-serif;display:flex;gap:.55rem;flex-wrap:wrap;align-items:center;min-height:5rem" });
  const note = h("p", { class: "bench-verdict", "aria-live": "polite" });
  function draw() {
    view.textContent = "";
    toks.forEach((t, i) => { const s = h("span", { style: hi && i >= hi[0] && i <= hi[1] ? "background:var(--soft);border-radius:8px;padding:0 .35rem;color:var(--accent)" : "" }, t.length > 8 ? fmt(parseFloat(t), 4) : t); view.append(s); });
    note.textContent = explain;
  }
  body.append(view, note, which.el, h("div", { class: "bench-row" }, button("Step", step), button("Reset", () => reset())));
  reset("a");
  return () => {};
}
