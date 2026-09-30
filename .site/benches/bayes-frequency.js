// Bench: 1,000 people, one test. Count who is sick among those who test positive.
export default function mount(root, kit) {
  const { h, fmt, canvas, slider, stats, button, frame, live } = kit;
  const body = frame(root, {
    title: "1,000 people, one test"
  });
  const say = live(body);
  let prev = 1, sens = 90, fpr = 9; // percentages

  const cv = canvas(body, { aspect: 0.42, label: "A grid of 1,000 dots coloured by disease status and test result" });
  const legend = h("ul", { class: "bench-legend" });
  const readout = stats([["tp", "sick and positive"], ["fp", "healthy but positive"], ["pos", "all positives"], ["post", "chance a positive is sick"]]);
  const sum = h("p", { class: "bench-line" });
  const verdict = h("p", { class: "bench-verdict" });
  const sp = slider({ label: "how many are sick (prior)", min: 0.1, max: 50, step: 0.1, value: prev, format: (v) => fmt(v, 1) + "%", onInput: (v) => { prev = v; update(); } });
  const ss = slider({ label: "test catches the sick (sensitivity)", min: 50, max: 100, step: 1, value: sens, format: (v) => v + "%", onInput: (v) => { sens = v; update(); } });
  const sf = slider({ label: "test wrongly flags the healthy (false positives)", min: 0, max: 30, step: 0.5, value: fpr, format: (v) => fmt(v, 1) + "%", onInput: (v) => { fpr = v; update(); } });
  const setAll = (p, s, f) => { prev = p; sens = s; fpr = f; sp.set(p, true); ss.set(s, true); sf.set(f, true); update(); };
  const presets = h("div", { class: "bench-row" },
    button("Rare disease (1%)", () => setAll(1, 90, 9)),
    button("Common disease (30%)", () => setAll(30, 90, 9)),
    button("Spam filter (40% spam)", () => setAll(40, 95, 2)),
    button("Near-perfect test", () => setAll(1, 99, 1))
  );
  body.append(cv.box, legend, readout.el, h("div", { class: "bench-controls" }, sp.el, ss.el, sf.el), presets);

  const N = 1000, COLS = 50;
  const KINDS = [["tp", "sick, tests positive"], ["fp", "healthy, tests positive"], ["fn", "sick, tests negative"], ["tn", "healthy, tests negative"]];
  let counts = { tp: 0, fp: 0, fn: 0, tn: 0 };

  cv.onDraw((ctx, w, hh, p) => {
    const rows = Math.ceil(N / COLS), cell = Math.min(w / COLS, hh / rows), r = cell * 0.36;
    const ox = (w - cell * COLS) / 2, oy = (hh - cell * rows) / 2;
    let i = 0;
    for (const [k] of KINDS) for (let n = 0; n < counts[k]; n++, i++) {
      const x = ox + (i % COLS) * cell + cell / 2, y = oy + Math.floor(i / COLS) * cell + cell / 2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
      if (k === "tp") { ctx.fillStyle = p.accent; ctx.fill(); }
      else if (k === "fp") { ctx.fillStyle = p.warm; ctx.fill(); }
      else if (k === "fn") { ctx.strokeStyle = p.accent; ctx.lineWidth = 1.6; ctx.stroke(); }
      else { ctx.globalAlpha = 0.35; ctx.fillStyle = p.muted; ctx.fill(); ctx.globalAlpha = 1; }
    }
  });
  const swatch = { tp: "bench-sw tp", fp: "bench-sw fp", fn: "bench-sw fn", tn: "bench-sw tn" };
  for (const [k, t] of KINDS) legend.append(h("li", {}, h("i", { class: swatch[k] }), t));

  function update() {
    const pr = prev / 100, se = sens / 100, fa = fpr / 100;
    const sick = Math.round(N * pr), tp = Math.round(sick * se), fp = Math.round((N - sick) * fa);
    counts = { tp, fp, fn: sick - tp, tn: N - sick - fp };
    const evidence = se * pr + fa * (1 - pr), post = evidence ? (se * pr) / evidence : 0;
    readout.set("tp", String(tp)); readout.set("fp", String(fp)); readout.set("pos", String(tp + fp));
    readout.set("post", fmt(post * 100, 1) + "%");
    sum.textContent = `P(sick | positive) = P(positive | sick) × P(sick) ÷ P(positive) = ${fmt(se, 2)} × ${fmt(pr, 3)} ÷ ${fmt(evidence, 4)} = ${fmt(post, 3)}`;
    const msg = post < 0.5
      ? `Most positives are false alarms: only about ${fmt(post * 100, 0)}% of people who test positive are actually sick, because the healthy crowd is so large.`
      : `A positive result is now strong evidence: about ${fmt(post * 100, 0)}% of positives are truly sick.`;
    verdict.textContent = msg;
    say(`Of ${tp + fp} positive tests, ${tp} are truly sick: ${fmt(post * 100, 1)} percent. ${msg}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
