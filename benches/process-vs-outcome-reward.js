// Bench: step through a flawed reasoning chain and compare what outcome reward sees vs process reward.
export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "Two wrongs, one accidentally right answer" });
  const say = live(body);
  const STEPS = [
    { text: "15 + 7 = 23", trueResult: 22, writtenResult: 23 },
    { text: "23 - 3 = 19", trueResult: 20, writtenResult: 19 },
  ];
  const TRUE_FINAL = 19;
  let shown = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["outcome", "outcome reward"], ["process", "process reward"]]);

  function report() {
    list.textContent = "";
    STEPS.slice(0, shown).forEach((s) => {
      const valid = s.writtenResult === s.trueResult;
      list.append(h("li", {}, `"${s.text}" — ${valid ? "valid step" : `INVALID (should be ${s.trueResult})`}`));
    });
    if (shown >= STEPS.length) {
      const finalAnswer = STEPS[STEPS.length - 1].writtenResult;
      st.set("outcome", finalAnswer === TRUE_FINAL ? `correct (${finalAnswer}) — rewarded` : "wrong — not rewarded");
      const anyInvalid = STEPS.some((s) => s.writtenResult !== s.trueResult);
      st.set("process", anyInvalid ? "flags invalid steps — NOT rewarded" : "all steps valid — rewarded");
      say(`final answer ${finalAnswer} ${finalAnswer === TRUE_FINAL ? "matches" : "does not match"} the true answer, but the chain contains invalid steps`);
    } else {
      st.set("outcome", "—"); st.set("process", "—");
    }
  }
  const sp = stepper({
    stepLabel: "Reveal next step",
    onStep: () => { if (shown >= STEPS.length) return false; shown++; report(); },
    onReset: () => { shown = 0; report(); },
  });
  body.append(list, st.el, sp.el);
  report();
  return () => {};
}
