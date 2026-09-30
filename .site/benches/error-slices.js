// Bench: an overall accuracy that hides weak slices, and the gain from fixing the slice with the most errors.
export default function mount(root, kit) {
  const { h, frame, button, stats, live, fmt } = kit;
  const body = frame(root, { title: "Where are the mistakes?" });
  const say = live(body);
  const S = [["short messages", 380, 0.94], ["long messages", 300, 0.92], ["messages with numbers", 160, 0.88], ["non-English messages", 90, 0.61], ["messages with typos", 70, 0.7]];
  const fixed = new Set();
  const table = h("table", { class: "bench-table" });
  const st = stats([["a", "overall accuracy"], ["e", "total mistakes (of 1000)"], ["w", "biggest source of mistakes"]]);
  const row = h("div", { class: "bench-row" }), btns = S.map(([name], i) => button(`Fix: ${name}`, () => { fixed.has(i) ? fixed.delete(i) : fixed.add(i); btns[i].setAttribute("aria-pressed", String(fixed.has(i))); update(); }, { pressed: false }));
  btns.forEach((b) => row.append(b));
  body.append(table, st.el, row);
  const acc = (i) => (fixed.has(i) ? 0.95 : S[i][2]);
  function update() { const errs = S.map(([, n], i) => n * (1 - acc(i))), tot = errs.reduce((a, b) => a + b, 0), order = S.map((_, i) => i).sort((a, b) => errs[b] - errs[a]);
    table.textContent = ""; table.append(h("tr", {}, h("th", {}, "slice"), h("th", {}, "examples"), h("th", {}, "accuracy"), h("th", {}, "mistakes"), h("th", {}, "share")), ...order.map((i) => h("tr", {}, h("td", {}, S[i][0] + (fixed.has(i) ? " (fixed)" : "")), h("td", {}, S[i][1]), h("td", {}, fmt(acc(i) * 100, 0) + "%"), h("td", {}, fmt(errs[i], 1)), h("td", {}, fmt((errs[i] / tot) * 100, 0) + "%"))));
    st.set("a", fmt((1 - tot / 1000) * 100, 1) + "%"); st.set("e", fmt(tot, 0)); st.set("w", S[order[0]][0]); say(`Overall accuracy ${fmt((1 - tot / 1000) * 100, 1)} percent`); }
  update(); return () => {};
}
