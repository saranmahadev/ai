// Bench: scale verifier-guided best-of-N at inference time and watch accuracy climb.
import { verifierBestOfN } from "./llmkit.js";
import { rng } from "./kit.js";

const CORRECT_P = 0.4;
const NS = [1, 2, 4, 8, 16, 32];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Spending more compute at answer time" });
  const say = live(body);
  let n = 1;

  const cv = canvas(body, { aspect: 0.45, label: "Accuracy over 4,000 simulated trials" });
  const st = stats([["accuracy", "accuracy"]]);
  const ch = choice("Samples at inference (N)", NS.map((v) => [String(v), `N=${v}`]), "1", (v) => { n = +v; update(); });
  body.append(cv.box, st.el, ch.el);

  function accuracyFor(nn) {
    const rand = rng(13);
    let correct = 0; const trials = 4000;
    for (let t = 0; t < trials; t++) if (verifierBestOfN(nn, CORRECT_P, rand)) correct++;
    return correct / trials;
  }
  let curve = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (NS.length + 1);
    NS.forEach((nn, i) => {
      const bh = curve[i] * (hh - 30);
      ctx.fillStyle = nn === n ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`N=${nn}`, bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    curve = NS.map(accuracyFor);
    const acc = accuracyFor(n);
    st.set("accuracy", `${(acc * 100).toFixed(1)}%`);
    say(`N=${n}: accuracy ${(acc * 100).toFixed(1)} percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
