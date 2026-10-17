// Bench: fit scalar reward scores from pairwise comparisons and watch them converge to the true ranking.
import { bradleyTerryStep } from "./llmkit.js";
import { rng } from "./kit.js";

const TRUE_QUALITY = { A: 2.0, B: 0.5, C: -1.0 };
const ITEMS = Object.keys(TRUE_QUALITY);

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Learning a scalar score from “which is better”" });
  const say = live(body);
  let scores = { A: 0, B: 0, C: 0 }, comparisons = 0, rand;

  const cv = canvas(body, { aspect: 0.4, label: "Learned reward scores" });
  const st = stats([["comparisons", "comparisons seen"], ["ranking", "learned ranking"]]);

  function report() {
    const ranking = [...ITEMS].sort((a, b) => scores[b] - scores[a]).join(" > ");
    st.set("comparisons", String(comparisons));
    st.set("ranking", ranking);
    say(`after ${comparisons} comparisons: ${ranking}`);
    cv.redraw();
  }
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (ITEMS.length + 1);
    const max = 3;
    ITEMS.forEach((item, i) => {
      const v = scores[item], bh = (Math.abs(v) / max) * (hh / 2 - 10);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh / 2 - (v >= 0 ? bh : 0), bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(item, bw * (i + 0.5) + bw * 0.3, hh / 2 + 16);
    });
  });
  const sp = stepper({
    stepLabel: "See 50 more",
    onStep: () => {
      if (comparisons >= 1000) return false;
      for (let k = 0; k < 50; k++) {
        const a = ITEMS[rand.int(3)], b = ITEMS[(ITEMS.indexOf(a) + 1 + rand.int(2)) % 3];
        const pAwins = 1 / (1 + Math.exp(-(TRUE_QUALITY[a] - TRUE_QUALITY[b])));
        const [winner, loser] = rand() < pAwins ? [a, b] : [b, a];
        bradleyTerryStep(scores, winner, loser);
      }
      comparisons += 50;
      report();
    },
    onReset: () => { scores = { A: 0, B: 0, C: 0 }; comparisons = 0; rand = rng(31); report(); },
  });
  body.append(cv.box, st.el, sp.el);
  rand = rng(31);
  report();
  return () => cv.destroy();
}
