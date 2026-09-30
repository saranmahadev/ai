// Bench: a tiny word-count naive Bayes classifier with Laplace smoothing you can switch off.
export default function mount(root, kit) {
  const { h, frame, slider, stats, button, live, fmt } = kit;
  const body = frame(root, { title: "Classify a message from word counts" });
  const say = live(body);
  const SPAM = ["win free prize now", "free money now", "claim your free prize", "urgent claim cash now", "win cash prize", "free offer click now", "limited offer win cash", "click to claim free money"];
  const HAM = ["meeting moved to noon", "lunch tomorrow with the team", "notes from the meeting", "please review the report", "thanks for the notes", "dinner tomorrow night", "report due tomorrow", "call me after the meeting"];
  const count = (docs) => { const c = {}; for (const d of docs) for (const w of d.split(" ")) c[w] = (c[w] || 0) + 1; return c; };
  const cs = count(SPAM), ch = count(HAM), ts = Object.values(cs).reduce((a, b) => a + b, 0), th = Object.values(ch).reduce((a, b) => a + b, 0), V = new Set([...Object.keys(cs), ...Object.keys(ch)]).size;
  let alpha = 1;
  const input = h("input", { type: "text", class: "bench-text", value: "free lunch tomorrow", "aria-label": "Message to classify" });
  const sl = slider({ label: "smoothing α", min: 0, max: 2, step: 0.1, value: alpha, format: (v) => fmt(v, 1), onInput: (v) => { alpha = v; update(); } });
  const table = h("table", { class: "bench-table" });
  const st = stats([["v", "verdict"], ["p", "P(spam | message)"]]);
  body.append(table, st.el, h("label", { class: "bench-slider" }, h("span", {}, "message"), input), sl.el);
  input.addEventListener("input", update);
  const lik = (c, t, w) => ((c[w] || 0) + alpha) / (t + alpha * V);
  function update() { const words = input.value.toLowerCase().split(/\s+/).filter(Boolean); let lg = Math.log(0.5 / 0.5), broke = false; table.textContent = ""; table.append(h("tr", {}, h("th", {}, "word"), h("th", {}, "spam count"), h("th", {}, "ham count"), h("th", {}, "log₂ evidence")));
    for (const w of words) { const a = lik(cs, ts, w), b = lik(ch, th, w); let e; if (a === 0 || b === 0) { broke = true; e = a === 0 ? "−∞ (breaks)" : "+∞ (breaks)"; } else { e = Math.log2(a / b); lg += Math.log(a / b); } table.append(h("tr", {}, h("td", {}, w), h("td", {}, cs[w] || 0), h("td", {}, ch[w] || 0), h("td", {}, typeof e === "number" ? fmt(e, 2) : e))); }
    if (broke) { st.set("v", "cannot decide"); st.set("p", "0 × something"); say("An unseen word gets zero probability without smoothing"); return; }
    const p = 1 / (1 + Math.exp(-lg)); st.set("v", p > 0.5 ? "spam" : "not spam"); st.set("p", fmt(p * 100, 1) + "%"); say(`${p > 0.5 ? "Spam" : "Not spam"}, ${fmt(p * 100, 1)} percent`); }
  update(); return () => {};
}
