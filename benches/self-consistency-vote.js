// Bench: sample several toy answers and take a majority vote, watching accuracy rise with N.
import { majorityVote } from "./gakit.js";
import { rng } from "./kit.js";

const ANSWERS = ["4", "3", "5", "22"];
const PROBS = [0.5, 0.25, 0.15, 0.10];
const CORRECT = "4";

function sampleAnswer(rand) {
  const r = rand();
  let cum = 0;
  for (let i = 0; i < PROBS.length; i++) { cum += PROBS[i]; if (r < cum) return ANSWERS[i]; }
  return ANSWERS[ANSWERS.length - 1];
}

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One sample vs. a vote over many" });
  const say = live(body);
  let n = 1;

  const cv = canvas(body, { aspect: 0.5, label: "Accuracy across 2,000 simulated trials" });
  const st = stats([["accuracy", "majority-vote accuracy"]]);
  const sl = slider({ label: "samples per question (N)", min: 1, max: 15, step: 2, value: n, format: (v) => String(v), onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function accuracyFor(nn) {
    const rand = rng(7);
    let correct = 0; const trials = 2000;
    for (let t = 0; t < trials; t++) {
      const samples = Array.from({ length: nn }, () => sampleAnswer(rand));
      const { winner } = majorityVote(samples);
      if (winner === CORRECT) correct++;
    }
    return correct / trials;
  }

  let curve = [];
  cv.onDraw((ctx, w, hh, p) => {
    const ns = [1, 3, 5, 7, 9, 11, 13, 15];
    const bw = w / (ns.length + 1);
    ns.forEach((nn, i) => {
      const acc = curve[i];
      const bh = acc * (hh - 40);
      ctx.fillStyle = nn === n ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`N=${nn}`, bw * (i + 0.5) + bw * 0.3, hh - 6);
    });
  });

  function update() {
    const ns = [1, 3, 5, 7, 9, 11, 13, 15];
    curve = ns.map(accuracyFor);
    const acc = accuracyFor(n);
    st.set("accuracy", `${(acc * 100).toFixed(1)}%`);
    say(`with ${n} samples, majority-vote accuracy is ${(acc * 100).toFixed(1)} percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
