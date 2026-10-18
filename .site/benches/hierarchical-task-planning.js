// Bench: compare the branching factor a flat planner faces against a hierarchical (HTN-style) one.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One huge choice, or several small ones" });
  const say = live(body);
  let top = 3, sub = 4, prim = 3;

  const cv = canvas(body, { aspect: 0.45, label: "Branching factor by planning style" });
  const st = stats([["total", "total primitive actions"], ["flat", "flat planner's branching factor"], ["hier", "hierarchical planner's widest choice"]]);
  const sTop = slider({ label: "Top-level tasks", min: 1, max: 5, step: 1, value: top, onInput: (v) => { top = v; update(); } });
  const sSub = slider({ label: "Sub-tasks per top-level task", min: 1, max: 6, step: 1, value: sub, onInput: (v) => { sub = v; update(); } });
  const sPrim = slider({ label: "Primitive actions per sub-task", min: 1, max: 6, step: 1, value: prim, onInput: (v) => { prim = v; update(); } });
  body.append(cv.box, st.el, sTop.el, sSub.el, sPrim.el);

  function compute() {
    const totalPrimitives = top * sub * prim;
    return { totalPrimitives, flat: totalPrimitives, hier: Math.max(top, sub, prim) };
  }
  cv.onDraw((ctx, w, hh, p) => {
    const { flat, hier } = compute();
    const maxV = Math.max(flat, hier);
    const bw = w / 3;
    [["flat planner", flat, p.warm], ["hierarchical planner", hier, p.accent]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 24 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(v), bw * (i + 0.6) + bw * 0.35, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.35, hh - 6);
    });
  });

  function update() {
    const { totalPrimitives, flat, hier } = compute();
    st.set("total", String(totalPrimitives));
    st.set("flat", String(flat));
    st.set("hier", String(hier));
    say(`${totalPrimitives} total primitive actions: flat planner faces ${flat} at once, hierarchical planner faces at most ${hier} at any level`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
