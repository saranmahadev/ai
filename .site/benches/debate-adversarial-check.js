// Bench: step through a proposer's claim and a challenger's recomputation catching a genuine error.
export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "An unchecked claim, or one a challenger recomputes" });
  const say = live(body);
  const A = 17, B = 23, actual = A * B, proposerClaim = 381;
  let step = 0;
  const STEPS = [
    `Proposer: "${A} × ${B} = ${proposerClaim}."`,
    "Single agent, no debate: accepts the claim as final.",
    `Challenger recomputes independently: ${A} × ${B} = ${actual}.`,
    `Mismatch found (${proposerClaim} ≠ ${actual}) — debate overrides to the recomputed answer.`,
  ];

  const list = h("ol", { class: "isai-list" });
  const st = stats([["final", "final accepted answer"]]);
  body.append(list, st.el);

  function update() {
    list.textContent = "";
    STEPS.forEach((s, i) => list.append(h("li", { class: i <= step ? "" : "isai-dim" }, s)));
    const final = step >= 3 ? actual : proposerClaim;
    st.set("final", String(final));
    say(`step ${step + 1}: ${STEPS[step]}`);
  }
  const sp = stepper({
    stepLabel: "Next step",
    onStep: () => { if (step >= STEPS.length - 1) return false; step++; update(); return step < STEPS.length - 1; },
    onReset: () => { step = 0; update(); },
  });
  body.append(sp.el);
  update();
  return () => {};
}
