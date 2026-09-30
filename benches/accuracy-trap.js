// Bench: when something is rare, a system that does nothing scores high on accuracy.
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, live, fmt } = kit;
  const body = frame(root, {
    title: "The 99% accurate system that catches nothing"
  });
  const say = live(body);
  const N = 10000;
  const DET = {
    lazy: { name: "Lazy: always says “no”", sens: 0, fpr: 0 },
    careful: { name: "Careful: catches 80%, 5% false alarms", sens: 0.8, fpr: 0.05 },
    jumpy: { name: "Jumpy: catches 95%, 20% false alarms", sens: 0.95, fpr: 0.2 }
  };
  let prev = 1, cur = "careful";
  const sp = slider({ label: "how common the real cases are", min: 0.5, max: 50, step: 0.5, value: prev, format: (v) => fmt(v, 1) + "%", onInput: (v) => { prev = v; update(); } });
  const pick = choice("Detector", Object.entries(DET).map(([k, d]) => [k, d.name]), cur, (k) => { cur = k; update(); });
  const cv = canvas(body, { aspect: 0.3, label: "Bars for accuracy, recall and precision of the chosen detector" });
  const table = h("table", { class: "bench-table" });
  const out = h("p", { class: "bench-verdict" });
  body.append(pick.el, sp.el, cv.box, table);

  function counts(d) {
    const real = Math.round(N * prev / 100), tp = Math.round(real * d.sens), fp = Math.round((N - real) * d.fpr);
    return { real, tp, fn: real - tp, fp, tn: N - real - fp };
  }
  const metrics = (c) => ({ acc: (c.tp + c.tn) / N, rec: c.real ? c.tp / c.real : NaN, prec: c.tp + c.fp ? c.tp / (c.tp + c.fp) : NaN });
  const pct = (v) => (Number.isFinite(v) ? fmt(Math.round(v * 1000 + 1e-9) / 10, 1) + "%" : "n/a");
  cv.onDraw((ctx, W, H, p) => {
    const m = metrics(counts(DET[cur])), rows = [["Accuracy: right answers overall", m.acc], ["Recall: real cases caught", m.rec], ["Precision: alarms that are real", m.prec]];
    const rh = H / 3;
    ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.textBaseline = "middle";
    rows.forEach(([t, v], i) => {
      ctx.fillStyle = p.soft2; ctx.beginPath(); ctx.roundRect(0, i * rh + 6, W, rh - 12, 10); ctx.fill();
      if (Number.isFinite(v)) { ctx.fillStyle = i === 0 ? p.accent : i === 1 ? p.good : p.warm; ctx.beginPath(); ctx.roundRect(0, i * rh + 6, Math.max(8, W * v), rh - 12, 10); ctx.fill(); }
      ctx.fillStyle = p.ink; ctx.textAlign = "left"; ctx.fillText(`${t}: ${pct(v)}`, 12, i * rh + rh / 2);
    });
  });
  function update() {
    const real = Math.round(N * prev / 100);
    table.textContent = "";
    table.append(h("thead", {}, h("tr", {}, ["Detector", "caught", "missed", "false alarms", "accuracy", "recall", "precision"].map((t) => h("th", {}, t)))));
    table.append(h("tbody", {}, ...Object.entries(DET).map(([k, d]) => { const c = counts(d), m = metrics(c); return h("tr", { style: k === cur ? "font-weight:900" : "" }, h("td", {}, d.name.split(":")[0]), h("td", {}, String(c.tp)), h("td", {}, String(c.fn)), h("td", {}, String(c.fp)), h("td", {}, pct(m.acc)), h("td", {}, pct(m.rec)), h("td", {}, pct(m.prec))); })));
    const lazy = metrics(counts(DET.lazy)), c = metrics(counts(DET.careful));
    const msg = c.acc < lazy.acc ? `Out of ${N.toLocaleString("en-US")} cases only ${real} are real. Doing nothing scores ${pct(lazy.acc)} accuracy, higher than the careful detector's ${pct(c.acc)}, yet it catches nobody.` : `With ${fmt(prev, 1)}% real cases, the careful detector's accuracy (${pct(c.acc)}) beats doing nothing (${pct(lazy.acc)}), so accuracy finally points the right way.`;
    out.textContent = msg; say(msg); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
