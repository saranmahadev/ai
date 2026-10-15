// Bench: total compute used by successive halving vs naive search, as candidate count and keep-fraction vary.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Stopping weak candidates early" });
  const say = live(body);
  let candidates = 8, fullEpochs = 100, keepFraction = 0.5;

  const cv = canvas(body, { aspect: 0.5, label: "Total compute budget: naive search vs successive halving" });
  const st = stats([["naive", "naive total (epoch-units)"], ["halving", "successive halving total (epoch-units)"], ["savings", "savings"]]);
  const sc = slider({ label: "starting candidates", min: 2, max: 32, step: 1, value: candidates, onInput: (v) => { candidates = v; update(); } });
  const sk = slider({ label: "fraction kept each round", min: 0.25, max: 0.75, step: 0.05, value: keepFraction, format: (v) => (v * 100).toFixed(0) + "%", onInput: (v) => { keepFraction = v; update(); } });
  body.append(cv.box, st.el, sc.el, sk.el);

  function compute() {
    const naive = candidates * fullEpochs;
    let n = candidates, trainedSoFar = 0, total = 0, rounds = [];
    const numRounds = Math.ceil(Math.log(candidates) / Math.log(1 / keepFraction)) || 1;
    const budgetPerRound = fullEpochs / numRounds;
    for (let r = 0; r < numRounds && n >= 1; r++) {
      total += n * budgetPerRound;
      rounds.push({ n, budget: budgetPerRound });
      n = Math.max(1, Math.round(n * keepFraction));
    }
    return { naive, halving: total, rounds };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { naive, halving } = compute();
    const maxV = Math.max(naive, halving, 1);
    const bars = [["naive", naive, p.warm], ["successive halving", halving, p.accent]];
    const bw = w / 3;
    bars.forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 36);
      ctx.fillStyle = color; ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 4);
      ctx.fillText(v.toFixed(0), bw * (i + 1), hh - 24 - bh);
    });
  });

  function update() {
    const { naive, halving } = compute();
    st.set("naive", naive.toFixed(0));
    st.set("halving", halving.toFixed(0));
    st.set("savings", `${((1 - halving / naive) * 100).toFixed(1)}%`);
    say(`successive halving uses ${halving.toFixed(0)} epoch-units versus ${naive.toFixed(0)} for naive search`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
