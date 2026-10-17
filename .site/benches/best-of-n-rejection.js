// Bench: sample N candidates and keep the reward model's best pick, watching mean reward improve with N.
import { rng } from "./kit.js";

function sampleReward(rand) { return rand() * 0.6 + rand() * 0.4 * 0.5; }
function bestOfN(N, rand) {
  let best = -Infinity;
  for (let i = 0; i < N; i++) { const r = sampleReward(rand); if (r > best) best = r; }
  return best;
}

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Keeping only the best of N samples" });
  const say = live(body);
  let n = 1;

  const cv = canvas(body, { aspect: 0.45, label: "Mean reward of the kept sample, over 3,000 trials" });
  const st = stats([["reward", "mean reward"]]);
  const ch = choice("Samples per prompt (N)", [1, 2, 4, 8, 16].map((v) => [String(v), `N=${v}`]), "1", (v) => { n = +v; update(); });
  body.append(cv.box, st.el, ch.el);

  function meanRewardFor(nn) {
    const rand = rng(44);
    let sum = 0;
    const trials = 3000;
    for (let t = 0; t < trials; t++) sum += bestOfN(nn, rand);
    return sum / trials;
  }
  let curve = [];
  cv.onDraw((ctx, w, hh, p) => {
    const ns = [1, 2, 4, 8, 16], bw = w / (ns.length + 1);
    ns.forEach((nn, i) => {
      const bh = curve[i] * (hh - 30);
      ctx.fillStyle = nn === n ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`N=${nn}`, bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const ns = [1, 2, 4, 8, 16];
    curve = ns.map(meanRewardFor);
    const reward = meanRewardFor(n);
    st.set("reward", reward.toFixed(4));
    say(`N=${n}: mean reward of the kept sample is ${reward.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
