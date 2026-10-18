// Bench: add a new document to a store and compare how a "parametric" and a "non-parametric" answer respond.
export default function mount(root, kit) {
  const { frame, h, button, stats, live } = kit;
  const body = frame(root, { title: "One of these can be updated without retraining" });
  const say = live(body);
  let added = false;

  const trainedFacts = { "capital-of-france": "Paris" };
  const store = { "capital-of-france": "Paris" };

  const st = stats([["parametric", "parametric model's answer"], ["retrieved", "retrieval-augmented answer"]]);
  const btn = button("Add the new document to the store", () => { added = true; update(); });
  body.append(st.el, btn);

  function answer(dict, key) { return dict[key] ?? "unknown — not in this source"; }

  function update() {
    if (added) store["newest-policy"] = "effective March 2026";
    const p = answer(trainedFacts, "newest-policy");
    const r = answer(store, "newest-policy");
    st.set("parametric", p);
    st.set("retrieved", r);
    say(`parametric model: ${p}. retrieval-augmented model: ${r}.`);
  }
  update();
  return () => {};
}
