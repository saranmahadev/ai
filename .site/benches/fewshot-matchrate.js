// Bench: show how often an induction-style completion has a matching example to copy from, as the number of shots grows.
import { rng } from "./kit.js";

const CATS = ["cat", "dog", "fox", "owl", "bee"];

function trial(k, rand) {
  const demoCats = Array.from({ length: k }, () => CATS[rand.int(CATS.length)]);
  const query = CATS[rand.int(CATS.length)];
  return demoCats.includes(query);
}

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Shots in the prompt vs. chance of a match to copy" });
  const say = live(body);
  let k = 0;

  const cv = canvas(body, { aspect: 0.5, label: "Match rate across 5,000 simulated prompts" });
  const st = stats([["rate", "match rate"], ["theory", "1 − (4/5)ᵏ"]]);
  const sl = slider({ label: "shots (k)", min: 0, max: 8, step: 1, value: k, format: (v) => String(v), onInput: (v) => { k = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function rateFor(kk) {
    const rand = rng(11);
    let hits = 0; const trials = 5000;
    for (let t = 0; t < trials; t++) if (trial(kk, rand)) hits++;
    return hits / trials;
  }

  let curve = [];
  cv.onDraw((ctx, w, hh, p) => {
    const ks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const bw = w / (ks.length + 1);
    ks.forEach((kk, i) => {
      const bh = curve[i] * (hh - 40);
      ctx.fillStyle = kk === k ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`k=${kk}`, bw * (i + 0.5) + bw * 0.3, hh - 6);
    });
  });

  function update() {
    const ks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    curve = ks.map(rateFor);
    const rate = rateFor(k);
    st.set("rate", `${(rate * 100).toFixed(1)}%`);
    st.set("theory", `${((1 - Math.pow(0.8, k)) * 100).toFixed(1)}%`);
    say(`${k} shots: matched ${(rate * 100).toFixed(1)} percent of the time`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
