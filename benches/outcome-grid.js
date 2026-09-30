// Bench: the 36 outcomes of two dice and the events made of them.
export default function mount(root, kit) {
  const { h, frame, slider, choice, button, canvas, stats, rng, fmt, live } = kit;
  const body = frame(root, { title: "Two dice and their outcomes" });
  const say = live(body);
  const EV = { sum: (a, b, k) => a + b === k, dbl: (a, b) => a === b, six: (a, b) => a === 6 || b === 6, big: (a, b) => a + b >= 10 };
  let ev = "sum", k = 7, last = null, r = rng(Date.now() % 9973 + 1);
  const ch = choice("Event", [["sum", "sum equals k"], ["dbl", "doubles"], ["six", "at least one six"], ["big", "sum is 10 or more"]], ev, (v) => { ev = v; update(); });
  const sk = slider({ label: "k (for the sum)", min: 2, max: 12, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  const cv = canvas(body, { aspect: 0.75, maxH: 420, label: "A six by six grid of the outcomes of two dice" });
  const st = stats([["n", "outcomes in the event"], ["p", "probability"], ["roll", "last roll"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sk.el), h("div", { class: "bench-row" }, button("Roll the dice", () => { last = [1 + r.int(6), 1 + r.int(6)]; update(); })));
  cv.onDraw((ctx, w, hh, p) => {
    const cell = Math.min((w - 30) / 6, (hh - 30) / 6), ox = 26, oy = 6;
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = p.muted;
    for (let i = 1; i <= 6; i++) { ctx.fillText(String(i), ox + (i - 0.5) * cell, oy + 6 * cell + 14); ctx.fillText(String(i), ox - 12, oy + (i - 0.5) * cell + 4); }
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) { const on = EV[ev](a, b, k), x = ox + (a - 1) * cell, y = oy + (b - 1) * cell; ctx.fillStyle = on ? p.accent : p.soft; ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2); ctx.fillStyle = on ? p.white : p.muted; ctx.fillText(String(a + b), x + cell / 2, y + cell / 2 + 4); if (last && last[0] === a && last[1] === b) { ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4); } }
    ctx.fillStyle = p.muted; ctx.fillText("first die →", ox + 3 * cell, oy + 6 * cell + 28 > hh ? hh - 2 : oy + 6 * cell + 28);
  });
  function update() { let n = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (EV[ev](a, b, k)) n++; st.set("n", `${n} of 36`); st.set("p", `${n}/36 = ${fmt(n / 36, 4)}`); st.set("roll", last ? `${last[0]} and ${last[1]} (sum ${last[0] + last[1]}) — ${EV[ev](last[0], last[1], k) ? "in the event" : "not in the event"}` : "none yet"); say(`${n} of 36 outcomes`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
