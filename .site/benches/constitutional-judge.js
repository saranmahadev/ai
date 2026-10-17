// Bench: rank responses by a written-principle-based AI judge and compare against a human-preference ranking.
const RESPONSES = [
  { text: "Detailed, safe, helpful answer", helpful: 0.9, harmful: 0.05 },
  { text: "Vague, unhelpful, safe answer", helpful: 0.3, harmful: 0.05 },
  { text: "Detailed but harmful answer", helpful: 0.8, harmful: 0.7 },
];

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Scoring by a written principle" });
  const say = live(body);
  let harmWeight = 2.0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["agreement", "matches human ranking?"]]);
  const sl = slider({ label: "weight on harmfulness in the principle", min: 0.5, max: 3, step: 0.1, value: harmWeight, format: (v) => v.toFixed(1), onInput: (v) => { harmWeight = v; update(); } });
  body.append(list, st.el, sl.el);

  function aiScore(r) { return r.helpful - harmWeight * r.harmful; }
  function humanScore(r) { return r.helpful - 2.2 * r.harmful; }

  function update() {
    const aiRanking = [...RESPONSES].sort((a, b) => aiScore(b) - aiScore(a));
    const humanRanking = [...RESPONSES].sort((a, b) => humanScore(b) - humanScore(a));
    list.textContent = "";
    aiRanking.forEach((r) => list.append(h("li", {}, `${r.text} (score ${aiScore(r).toFixed(2)})`)));
    const matches = aiRanking.every((r, i) => r.text === humanRanking[i].text);
    st.set("agreement", matches ? "yes" : "no");
    say(`harm weight ${harmWeight.toFixed(1)}: AI judge ranking ${matches ? "matches" : "does not match"} the human ranking`);
  }
  update();
  return () => {};
}
