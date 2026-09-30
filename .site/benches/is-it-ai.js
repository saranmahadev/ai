// Bench: whether something "counts as AI" depends on the definition you choose.
export default function mount(root, kit) {
  const { h, frame, toggles, button, stats, live } = kit;
  const body = frame(root, {
    title: "Is it AI? You choose the definition"
  });
  const say = live(body);
  // [name, senses its world, chooses actions toward a goal, improves from experience]
  const SYSTEMS = [
    ["Light switch", 0, 0, 0], ["Spreadsheet formula", 0, 0, 0], ["Pocket calculator", 0, 0, 0],
    ["Thermostat", 1, 1, 0], ["Scripted game enemy", 1, 1, 0], ["Robot vacuum that maps rooms", 1, 1, 0],
    ["Classic search-based chess program", 1, 1, 0], ["Spam filter that learns from your reports", 1, 1, 1],
    ["Photo app that learns to tag faces", 1, 1, 1], ["Streaming recommendations", 1, 1, 1],
    ["Voice assistant", 1, 1, 1], ["Self-driving car", 1, 1, 1]
  ];
  const req = toggles([["sense", "Senses its world", true], ["goal", "Chooses actions toward a goal", true], ["learn", "Improves from experience", false]], render);
  const yes = h("ul", { class: "isai-list yes" }), no = h("ul", { class: "isai-list no" });
  const st = stats([["n", "counts as AI"]]);
  const presets = h("div", { class: "bench-row" },
    button("Broad: senses and pursues a goal", () => req.set({ sense: true, goal: true, learn: false })),
    button("Common: must also learn", () => req.set({ sense: true, goal: true, learn: true })),
    button("Anything at all", () => req.set({ sense: false, goal: false, learn: false }))
  );
  body.append(st.el, h("span", { class: "bench-choice-label" }, "Required traits"), req.el, presets,
    h("div", { class: "bench-two" }, h("div", {}, h("b", {}, "Counts as AI"), yes), h("div", {}, h("b", {}, "Does not count"), no)));

  function trait(s) { return [s[1] ? "senses" : null, s[2] ? "goal" : null, s[3] ? "learns" : null].filter(Boolean).join(" · ") || "none of the three"; }
  function render(v) {
    yes.textContent = ""; no.textContent = "";
    let n = 0;
    for (const s of SYSTEMS) {
      const ok = (!v.sense || s[1]) && (!v.goal || s[2]) && (!v.learn || s[3]);
      (ok ? yes : no).append(h("li", {}, h("b", {}, s[0]), h("small", {}, ` (${trait(s)})`)));
      if (ok) n++;
    }
    const msg = n === SYSTEMS.length ? "With no requirements, even a light switch counts, so the word means nothing."
      : n === 0 ? "Nothing passes this test."
      : `${n} of ${SYSTEMS.length} systems count. Change the definition and the answer changes: the systems did not.`;
    st.set("n", `${n} of ${SYSTEMS.length}`); say(msg);
  }
  render(req.get());
}
