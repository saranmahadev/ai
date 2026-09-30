// Bench: naive Bayes as a product of likelihood ratios, applied to the words of one email.
export default function mount(root, kit) {
  const { h, frame, slider, toggles, stats, canvas, live, fmt } = kit;
  const body = frame(root, { title: "Multiply the evidence" });
  const say = live(body);
  const W = [["free", 0.6, 0.05], ["winner", 0.3, 0.01], ["urgent", 0.35, 0.1], ["invoice", 0.1, 0.15], ["thanks", 0.1, 0.4], ["meeting", 0.05, 0.4]];
  let prior = 0.4;
  const tg = toggles(W.map(([w], i) => [w, `"${w}" appears`, i < 1]), () => update());
  const sl = slider({ label: "prior P(spam)", min: 0.05, max: 0.95, step: 0.01, value: prior, format: (v) => fmt(v, 2), onInput: (v) => { prior = v; update(); } });
  const table = h("table", { class: "bench-table" });
  const st = stats([["o", "odds for spam"], ["p", "P(spam | words)"]]);
  body.append(table, st.el, tg.el, sl.el);
  function update() { const on = tg.get(); let odds = prior / (1 - prior); table.textContent = ""; table.append(h("tr", {}, h("th", {}, "step"), h("th", {}, "if spam"), h("th", {}, "if ham"), h("th", {}, "× ratio"), h("th", {}, "odds")), h("tr", {}, h("td", {}, "prior"), h("td", {}, fmt(prior, 2)), h("td", {}, fmt(1 - prior, 2)), h("td", {}, "—"), h("td", {}, fmt(odds, 2))));
    for (const [w, ps, ph] of W) if (on[w]) { odds *= ps / ph; table.append(h("tr", {}, h("td", {}, w), h("td", {}, fmt(ps, 2)), h("td", {}, fmt(ph, 2)), h("td", {}, "× " + fmt(ps / ph, 2)), h("td", {}, fmt(odds, 2)))); }
    const p = odds / (1 + odds); st.set("o", fmt(odds, 2)); st.set("p", fmt(p * 100, 1) + "%"); say(`Probability of spam ${fmt(p * 100, 1)} percent`); }
  update(); return () => {};
}
