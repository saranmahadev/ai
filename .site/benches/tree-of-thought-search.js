// Bench: compare a greedy single reasoning path against a beam that keeps several candidate branches alive.
import { treeSearchSurvives } from "./llmkit.js";
import { rng } from "./kit.js";

const STEP_OPTIONS = [[0.5, 0.3, 0.2], [0.5, 0.3, 0.2], [0.5, 0.3, 0.2]];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Keeping more than one reasoning branch alive" });
  const say = live(body);
  let beamWidth = 1;

  const cv = canvas(body, { aspect: 0.45, label: "Success rate over 5,000 simulated trials" });
  const st = stats([["success", "success rate"]]);
  const sl = slider({ label: "beam width", min: 1, max: 3, step: 1, value: beamWidth, format: (v) => String(v), onInput: (v) => { beamWidth = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let curve = [];
  cv.onDraw((ctx, w, hh, p) => {
    const ws = [1, 2, 3], bw = w / (ws.length + 1);
    ws.forEach((wv, i) => {
      const bh = curve[i] * (hh - 30);
      ctx.fillStyle = wv === beamWidth ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`w=${wv}`, bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });

  function successRateFor(w) {
    const rand = rng(9);
    let correct = 0; const trials = 5000;
    for (let t = 0; t < trials; t++) if (treeSearchSurvives(STEP_OPTIONS, w, rand)) correct++;
    return correct / trials;
  }

  function update() {
    curve = [1, 2, 3].map(successRateFor);
    const rate = successRateFor(beamWidth);
    st.set("success", `${(rate * 100).toFixed(1)}%`);
    say(`beam width ${beamWidth}: success rate ${(rate * 100).toFixed(1)}%`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
