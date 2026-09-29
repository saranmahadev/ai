// Bench: hand-written rules against a filter that learns word weights from labelled examples.
export default function mount(root, kit) {
  const { h, frame, slider, toggles, button, rng, fmt, live } = kit;
  const body = frame(root, {
    title: "Spam filter duel: your rules vs a learned filter",
    hint: "All emails are made up. Tick the words your rules will flag, then compare with a filter that learned from labelled examples."
  });
  const say = live(body);
  const SPAM = ["free", "winner", "prize", "claim", "urgent", "cash", "offer", "click", "limited", "deal", "bonus", "credit"];
  const NEW = ["crypto", "airdrop", "wallet", "invest", "giveaway", "token"];
  const HAM = ["meeting", "lunch", "report", "schedule", "thanks", "notes", "project", "tomorrow", "agenda", "draft", "review", "call", "team", "budget", "photos", "dinner"];
  const SHARED = ["free", "offer", "urgent", "deal", "click", "now", "prize", "today", "please", "hello"];
  const RULE_CANDIDATES = ["free", "winner", "prize", "urgent", "offer", "click", "deal", "cash", "meeting", "crypto"];

  function make(r, n, wave) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const spam = i % 2 === 0, words = new Set();
      const k = 5 + r.int(3);
      while (words.size < k) {
        if (spam) words.add(r.chance(0.62) ? r.pick(wave && r.chance(0.6) ? NEW : SPAM) : r.chance(0.5) ? r.pick(SHARED) : r.pick(HAM));
        else words.add(r.chance(0.72) ? r.pick(HAM) : r.pick(SHARED));
      }
      out.push({ words: [...words], spam });
    }
    return out;
  }
  const train = make(rng(7), 400, false);
  const trainNew = make(rng(31), 400, true);
  const testOld = make(rng(99), 100, false);
  const testNew = make(rng(123), 100, true);

  let picked = new Set(), need = 1, nTrain = 20, wave = false, retrain = false, model = null;
  const chips = toggles(RULE_CANDIDATES.map((w) => [w, w, false]), (v) => { picked = new Set(Object.keys(v).filter((k) => v[k])); update(); });
  const sNeed = slider({ label: "flag if at least this many rule words appear", min: 1, max: 3, step: 1, value: need, format: (v) => v, onInput: (v) => { need = v; update(); } });
  const sTrain = slider({ label: "emails the learned filter trained on", min: 2, max: 400, step: 2, value: nTrain, format: (v) => v, onInput: (v) => { nTrain = v; update(); } });
  const waveBtn = button("Spammers change their words: off", () => { wave = !wave; waveBtn.textContent = `Spammers change their words: ${wave ? "on" : "off"}`; waveBtn.setAttribute("aria-pressed", String(wave)); update(); }, { pressed: false });
  const retrainBtn = button("Learned filter retrains on new-wave emails: off", () => { retrain = !retrain; retrainBtn.textContent = `Learned filter retrains on new-wave emails: ${retrain ? "on" : "off"}`; retrainBtn.setAttribute("aria-pressed", String(retrain)); update(); }, { pressed: false });
  const st = kit.stats([["rules", "your rules (accuracy)"], ["ml", "learned filter (accuracy)"], ["n", "test emails"]]);
  const verdict = h("p", { class: "bench-verdict" });
  const top = h("p", { class: "bench-line" });
  const samples = h("ul", { class: "isai-list yes" });
  body.append(h("b", {}, "Your rules: flag an email if it contains these words"), chips.el, sNeed.el, h("hr"), h("b", {}, "The learned filter"), sTrain.el, h("div", { class: "bench-row" }, waveBtn, retrainBtn), st.el, verdict, top, h("b", {}, "A few test emails"), samples);

  function fit(n) {
    const data = (wave && retrain ? trainNew : train).slice(0, n), c = { spam: {}, ham: {}, ns: 0, nh: 0 };
    for (const e of data) { const t = e.spam ? c.spam : c.ham; e.spam ? c.ns++ : c.nh++; for (const w of e.words) t[w] = (t[w] || 0) + 1; }
    const vocab = [...new Set([...SPAM, ...NEW, ...HAM, ...SHARED])], wt = {};
    for (const w of vocab) wt[w] = Math.log(((c.spam[w] || 0) + 1) / (c.ns + 2)) - Math.log(((c.ham[w] || 0) + 1) / (c.nh + 2));
    return { wt, bias: Math.log((c.ns + 1) / (c.nh + 1)) };
  }
  const ruleSays = (e) => e.words.filter((w) => picked.has(w)).length >= need;
  const mlSays = (e) => model.bias + e.words.reduce((s, w) => s + (model.wt[w] || 0), 0) > 0;
  function update() {
    model = fit(nTrain);
    const test = wave ? testNew : testOld;
    const acc = (f) => test.filter((e) => f(e) === e.spam).length / test.length;
    const a = acc(ruleSays), b = acc(mlSays);
    st.set("rules", `${fmt(a * 100, 0)}%`); st.set("ml", `${fmt(b * 100, 0)}%`); st.set("n", String(test.length));
    const w = Object.entries(model.wt).sort((x, y) => y[1] - x[1]);
    top.textContent = `Learned as spammiest: ${w.slice(0, 4).map((x) => x[0]).join(", ")}. Learned as most normal: ${w.slice(-4).map((x) => x[0]).join(", ")}.`;
    samples.textContent = "";
    test.slice(0, 6).forEach((e) => samples.append(h("li", {}, e.words.join(" "), h("small", {}, ` — truly ${e.spam ? "spam" : "not spam"}; rules say ${ruleSays(e) ? "spam" : "ok"}; learned says ${mlSays(e) ? "spam" : "ok"}`))));
    const msg = wave && retrain ? "Retrained on fresh labelled examples, the learned filter recovers with no one rewriting rules. Your rules still need a person."
      : wave ? "New vocabulary hurts both. Your rules need a person to rewrite them; the learned filter needs fresh labelled examples (try the retrain button)."
      : nTrain <= 6 ? "With almost no examples the learned filter is guessing. Learning needs data."
      : `Your rules score ${fmt(a * 100, 0)}%, the learned filter ${fmt(b * 100, 0)}%. Move the training slider and watch the learned score change.`;
    verdict.textContent = msg; say(msg);
  }
  update();
}
