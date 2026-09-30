// Bench: shade the solutions of a·x + b (op) c on a number line.
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Shade the solution region" });
  const say = live(body);
  let a = 2, b = 1, c = 9, op = "<";
  const sa = slider({ label: "a", min: -5, max: 5, step: 1, value: a, onInput: (v) => { a = v; update(); } });
  const sb = slider({ label: "b", min: -10, max: 10, step: 1, value: b, onInput: (v) => { b = v; update(); } });
  const sc = slider({ label: "c", min: -10, max: 10, step: 1, value: c, onInput: (v) => { c = v; update(); } });
  const ch = choice("Comparison", [["<", "<"], ["<=", "≤"], [">", ">"], [">=", "≥"]], op, (v) => { op = v; update(); });
  const cv = canvas(body, { aspect: 0.2, maxH: 120, label: "Number line with the solution region shaded" });
  const st = stats([["eq", "inequality"], ["sol", "solved"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sa.el, sb.el, sc.el), ch.el);
  const sym = { "<": "<", "<=": "≤", ">": ">", ">=": "≥" }, flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=" };
  let sol = null;
  cv.onDraw((ctx, w, hh, p) => {
    const X = (v) => 20 + ((v + 12) / 24) * (w - 40), y = hh / 2;
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(w - 20, y); ctx.stroke();
    ctx.fillStyle = p.muted; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    for (let v = -12; v <= 12; v += 2) { ctx.beginPath(); ctx.moveTo(X(v), y - 5); ctx.lineTo(X(v), y + 5); ctx.stroke(); ctx.fillText(String(v), X(v), y + 20); }
    if (!sol) return;
    ctx.fillStyle = p.accent; ctx.globalAlpha = 0.45;
    if (sol.all) ctx.fillRect(20, y - 10, w - 40, 20);
    else if (!sol.none) { const e = X(sol.at); if (sol.dir === "<") ctx.fillRect(20, y - 10, e - 20, 20); else ctx.fillRect(e, y - 10, w - 20 - e, 20); }
    ctx.globalAlpha = 1;
    if (sol.at !== undefined) { ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.fillStyle = sol.closed ? p.accent : p.white; ctx.beginPath(); ctx.arc(X(sol.at), y, 8, 0, 7); ctx.fill(); ctx.stroke(); }
  });
  function update() {
    st.set("eq", `${a}x + ${b} ${sym[op]} ${c}`);
    if (a === 0) { const ok = { "<": b < c, "<=": b <= c, ">": b > c, ">=": b >= c }[op]; sol = ok ? { all: true } : { none: true }; st.set("sol", ok ? "every x works" : "no x works"); }
    else { const at = (c - b) / a, dir = a < 0 ? flip[op] : op; sol = { at, dir: dir[0], closed: dir.includes("="), all: false }; st.set("sol", `x ${sym[dir]} ${fmt(at, 3)}${a < 0 ? "  (flipped: divided by a negative)" : ""}`); }
    say(`Solution updated`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
