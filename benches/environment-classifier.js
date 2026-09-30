// Bench: describe environments along five properties and see what makes an AI problem hard.
export default function mount(root, kit) {
  const { h, frame, choice, button, live } = kit;
  const body = frame(root, {
    title: "How hard is this environment?"
  });
  const say = live(body);
  const PROPS = [
    ["obs", "Can the agent see everything relevant?", [["full", "Fully observable"], ["part", "Partly observable"]]],
    ["det", "Is the next state fully determined by the state and action?", [["det", "Deterministic"], ["sto", "Stochastic (chance involved)"]]],
    ["epi", "Are decisions independent of one another?", [["epi", "Episodic"], ["seq", "Sequential"]]],
    ["dyn", "Does the world change while the agent thinks?", [["sta", "Static"], ["dyn", "Dynamic"]]],
    ["agt", "How many agents act in it?", [["one", "Single agent"], ["multi", "Multiple agents"]]]
  ];
  const HARD = { part: 1, sto: 1, seq: 1, dyn: 1, multi: 1 };
  const ENV = [
    ["Crossword puzzle", { obs: "full", det: "det", epi: "seq", dyn: "sta", agt: "one" }, "Everything is on the page, no chance is involved, each letter affects the next, and nothing changes while you think."],
    ["Chess (untimed)", { obs: "full", det: "det", epi: "seq", dyn: "sta", agt: "multi" }, "The whole board is visible and moves have fixed results, but an opponent replies, and each move shapes the rest of the game."],
    ["Backgammon", { obs: "full", det: "sto", epi: "seq", dyn: "sta", agt: "multi" }, "The board is fully visible, but the dice add chance, and there is an opponent."],
    ["Poker", { obs: "part", det: "sto", epi: "seq", dyn: "sta", agt: "multi" }, "You cannot see the other hands, cards are dealt at random, and you play against others."],
    ["Taxi driving", { obs: "part", det: "sto", epi: "seq", dyn: "dyn", agt: "multi" }, "The road ahead is hidden, traffic is unpredictable, the world moves while you decide, and other drivers act too."],
    ["Medical diagnosis", { obs: "part", det: "sto", epi: "seq", dyn: "dyn", agt: "one" }, "The patient's condition is only partly visible, treatments have uncertain effects, and the patient changes over time."],
    ["Part-picking robot on a conveyor", { obs: "part", det: "sto", epi: "epi", dyn: "dyn", agt: "one" }, "Each part is a separate decision, but parts keep moving and the camera view is imperfect."],
    ["Classifying a single photo", { obs: "full", det: "det", epi: "epi", dyn: "sta", agt: "one" }, "The whole image is given, the answer does not depend on earlier photos, and the picture does not change."]
  ];
  let cur = 0, ans = {}, shown = false;
  const pick = choice0();
  function choice0() { return kit.choice("Environment", ENV.map((e, i) => [i, e[0]]), cur, (i) => { cur = i; ans = {}; shown = false; render(); }); }
  const qs = PROPS.map(([key, q, opts]) => {
    const c = kit.choice(q, opts, null, (v) => { ans[key] = v; shown = false; render(); });
    return { key, c };
  });
  const check = button("Check my answers", () => { shown = true; render(); });
  const out = h("p", { class: "bench-verdict" });
  const why = h("p", { class: "bench-line" });
  body.append(pick.el, ...qs.map((q) => q.c.el), h("div", { class: "bench-row" }, check), out, why);
  function render() {
    const truth = ENV[cur][1];
    qs.forEach((q) => q.c.set(ans[q.key] ?? null, true));
    if (!shown) { out.textContent = ""; why.textContent = ""; return; }
    const right = PROPS.filter(([k]) => ans[k] === truth[k]).length, answered = PROPS.filter(([k]) => ans[k]).length;
    const hardness = Object.values(truth).filter((v) => HARD[v]).length;
    const msg = `${right} of 5 match · ${hardness} of 5 hard properties`;
    out.textContent = msg; why.textContent = ENV[cur][2]; say(msg);
  }
  render();
}
