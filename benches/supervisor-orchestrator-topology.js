// Bench: compare a supervisor's hub-and-spoke communication edges against a fully connected peer mesh of the same agents.
import { starEdges, meshEdges } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Routing through one hub, or everyone to everyone" });
  const say = live(body);
  let n = 4;

  const cv = canvas(body, { aspect: 0.42, label: "Communication edges by topology" });
  const st = stats([["star", "supervisor topology edges"], ["mesh", "full peer mesh edges"]]);
  const sN = slider({ label: "Specialist agents", min: 2, max: 8, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, sN.el);

  cv.onDraw((ctx, w, hh, p) => {
    const star = starEdges(n), mesh = meshEdges(n);
    const maxV = Math.max(star, mesh) * 1.1;
    const bw = w / 3;
    [["supervisor (star)", star, p.good], ["peer mesh", mesh, p.warm]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 24 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(v), bw * (i + 0.6) + bw * 0.35, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.35, hh - 6);
    });
  });

  function update() {
    const star = starEdges(n), mesh = meshEdges(n);
    st.set("star", String(star));
    st.set("mesh", String(mesh));
    say(`${n} specialists: supervisor topology needs ${star} links, a full peer mesh needs ${mesh}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
