// Bench: independent choices multiply; draw the tree of outcomes.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, live } = kit;
  const body = frame(root, { title: "A tree of choices" });
  const say = live(body);
  const n = [3, 4, 2];
  const names = ["shirts", "trousers", "shoes"];
  const sl = names.map((nm, i) => slider({ label: nm, min: 1, max: 5, step: 1, value: n[i], onInput: (v) => { n[i] = v; update(); } }));
  const cv = canvas(body, { aspect: 0.6, label: "A branching tree with one level per choice" });
  const st = stats([["tot", "total outcomes"], ["calc", "product"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el)));
  cv.onDraw((ctx, w, hh, p) => {
    const leaves = n[0] * n[1] * n[2], X = (lvl) => 20 + (lvl / 3) * (w - 60), pos = [[hh / 2]];
    // y of each node at each level, spread evenly at the last level and averaged upward
    const ys = [[], [], [], []];
    for (let i = 0; i < leaves; i++) ys[3].push(14 + ((i + 0.5) / leaves) * (hh - 28));
    for (let l = 2; l >= 0; l--) { const per = n[l]; for (let i = 0; i < ys[l + 1].length / per; i++) ys[l].push(ys[l + 1].slice(i * per, (i + 1) * per).reduce((a, b) => a + b, 0) / per); }
    ctx.lineWidth = 1.4;
    for (let l = 0; l < 3; l++) { const per = n[l]; ctx.strokeStyle = [p.accent, p.warm, p.good][l]; ys[l + 1].forEach((y, i) => { const py = ys[l][Math.floor(i / per)]; ctx.beginPath(); ctx.moveTo(X(l), py); ctx.lineTo(X(l + 1), y); ctx.stroke(); }); }
    ctx.fillStyle = p.ink; for (let l = 0; l <= 3; l++) ys[l].forEach((y) => { ctx.beginPath(); ctx.arc(X(l), y, l === 3 ? 2.6 : 4, 0, 7); ctx.fill(); });
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = p.muted; ["start", ...names].forEach((t, l) => ctx.fillText(t, X(l), hh - 2));
  });
  function update() { const t = n[0] * n[1] * n[2]; st.set("tot", String(t)); st.set("calc", `${n[0]} × ${n[1]} × ${n[2]} = ${t}`); say(`${t} outcomes`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
