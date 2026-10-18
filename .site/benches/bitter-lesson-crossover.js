// Bench: compare a scaled generic method against a hand-engineered one as compute grows.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "General and scaled beats clever and fixed" });
  const say = live(body);
  let logC = 6;

  const cv = canvas(body, { aspect: 0.45, label: "Performance vs. compute" });
  const st = stats([["generic", "scaled-generic"], ["handEng", "hand-engineered"]]);
  const sl = slider({ label: "log₁₀(compute)", min: 2, max: 12, step: 0.5, value: logC, format: (v) => `10^${v}`, onInput: (v) => { logC = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function generic(x) { return 20 + 70 * (1 - Math.exp(-x / 6)); }
  function handEng(x) { return 55 + 10 * (1 - Math.exp(-x / 3)); }

  cv.onDraw((ctx, w, hh, p) => {
    const steps = 60;
    const draw = (fn, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = 2 + (i / steps) * 10;
        const px = ((x - 2) / 10) * w, py = hh - 15 - (fn(x) / 100) * (hh - 30);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    draw(generic, p.accent); draw(handEng, p.warm);
  });

  function update() {
    st.set("generic", `${generic(logC).toFixed(1)}%`);
    st.set("handEng", `${handEng(logC).toFixed(1)}%`);
    say(`at compute 10^${logC}: scaled-generic ${generic(logC).toFixed(1)}%, hand-engineered ${handEng(logC).toFixed(1)}%`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
