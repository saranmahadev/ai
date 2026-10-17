// Bench: step through simulated pairwise human judgments and watch Elo ratings converge to a true ranking.
import { eloUpdate } from "./gakit.js";
import { rng } from "./kit.js";

const MODELS = ["A", "B", "C"];
const TRUE_QUALITY = { A: 0.9, B: 0.6, C: 0.3 };

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "Pairwise judgments converge to a ranking" });
  const say = live(body);
  let ratings = { A: 1000, B: 1000, C: 1000 }, rounds = 0, rand;

  const out = h("p", { class: "isai-readout" });
  const st = stats([["rounds", "comparisons so far"], ["ranking", "current ranking"]]);

  function report() {
    out.textContent = MODELS.map((m) => `${m}: ${ratings[m].toFixed(1)}`).join("   ");
    st.set("rounds", String(rounds));
    const ranking = [...MODELS].sort((a, b) => ratings[b] - ratings[a]).join(" > ");
    st.set("ranking", ranking);
    say(`after ${rounds} comparisons: ${ranking}`);
  }
  const sp = stepper({
    stepLabel: "Judge 20 more",
    onStep: () => {
      if (rounds >= 300) return false;
      for (let k = 0; k < 20; k++) {
        const i = rand.int(3), j = (i + 1 + rand.int(2)) % 3;
        const a = MODELS[i], b = MODELS[j];
        const pAwins = TRUE_QUALITY[a] / (TRUE_QUALITY[a] + TRUE_QUALITY[b]);
        const winner = rand() < pAwins ? a : b, loser = winner === a ? b : a;
        eloUpdate(ratings, winner, loser);
      }
      rounds += 20;
      report();
    },
    onReset: () => { ratings = { A: 1000, B: 1000, C: 1000 }; rounds = 0; rand = rng(21); report(); },
  });
  body.append(out, st.el, sp.el);
  rand = rng(21);
  report();
  return () => {};
}
