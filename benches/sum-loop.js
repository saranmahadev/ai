// Bench: a sum or product as a loop with a running total.
export default function mount(root, kit) {
  const { h, frame, slider, choice, stepper, stats, fmt, live } = kit;
  const body = frame(root, { title: "Sum as a loop" });
  const say = live(body);
  let term = "i", op = "sum", n = 5, i = 0, total = 0;
  const f = { i: (k) => k, sq: (k) => k * k, pow: (k) => 2 ** k };
  const label = { i: "i", sq: "i²", pow: "2ⁱ" };
  const rows = h("div", { class: "stage", style: "font:700 1.05rem/1.7 ui-monospace,monospace;min-height:13rem" });
  const st = stats([["tot", "running total"], ["cf", "closed form (for i)"]]);
  const sn = slider({ label: "upper limit n", min: 1, max: 8, step: 1, value: n, onInput: (v) => { n = v; reset(); } });
  const c1 = choice("Term", [["i", "i"], ["sq", "i²"], ["pow", "2ⁱ"]], term, (v) => { term = v; reset(); });
  const c2 = choice("Operation", [["sum", "Σ (add)"], ["prod", "Π (multiply)"]], op, (v) => { op = v; reset(); });
  const stp = stepper({ interval: 600, stepLabel: "Next i", onStep: () => { if (i >= n) return false; i++; total = i === 1 ? f[term](1) : op === "sum" ? total + f[term](i) : total * f[term](i); render(); if (i >= n) return false; }, onReset: () => reset() });
  function reset() { i = 0; total = op === "sum" ? 0 : 1; render(); }
  function render() {
    const sym = op === "sum" ? "Σ" : "Π", join = op === "sum" ? " + " : " × ";
    const head = `${sym} ${label[term]}   for i = 1 to ${n}`;
    const lines = [head, ""];
    let run = op === "sum" ? 0 : 1;
    for (let k = 1; k <= i; k++) { run = op === "sum" ? run + f[term](k) : run * f[term](k); lines.push(`i = ${k}:  term ${f[term](k)}  →  total ${run}`); }
    rows.textContent = lines.join("\n"); rows.style.whiteSpace = "pre";
    st.set("tot", i ? String(total) : "—");
    st.set("cf", op === "sum" && term === "i" ? String((n * (n + 1)) / 2) : op === "prod" && term === "i" ? `${n}! = ${[...Array(n)].reduce((a, _, k) => a * (k + 1), 1)}` : "—");
    say(i ? `Total ${total}` : "Reset");
  }
  body.append(rows, st.el, c2.el, c1.el, h("div", { class: "bench-controls" }, sn.el), stp.el);
  reset();
  return () => stp.stop();
}
