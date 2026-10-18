// Bench: step through a single-hop retrieval versus a two-hop chain that uses the first hop's answer to retrieve a second fact.
const KB = { "Movie X": { director: "Director Y" }, "Director Y": { otherFilms: ["Film A", "Film B"] } };

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "The second question only exists after the first is answered" });
  const say = live(body);
  let step = 0;

  const STEPS = [
    `Question: "What else did the director of Movie X direct?"`,
    `Hop 1 — retrieve: "Movie X" was directed by "${KB["Movie X"].director}".`,
    `Hop 2 — retrieve using hop 1's answer: "${KB["Movie X"].director}" also directed ${KB[KB["Movie X"].director].otherFilms.join(" and ")}.`,
  ];

  const list = h("ol", { class: "isai-list" });
  const st = stats([["stage", "retrieval stage"]]);
  body.append(list, st.el);

  function render() {
    list.textContent = "";
    for (let i = 0; i <= step; i++) list.append(h("li", {}, STEPS[i]));
    st.set("stage", `${step + 1} / ${STEPS.length}`);
    say(STEPS[step]);
  }
  const sp = stepper({
    stepLabel: "retrieval hop",
    onStep: () => {
      if (step >= STEPS.length - 1) return false;
      step++;
      render();
      return step < STEPS.length - 1;
    },
    onReset: () => { step = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
