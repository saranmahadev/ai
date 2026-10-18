// Bench: compare a reward model's preferred response against the one true quality actually favors.
const CANDIDATES = [
  { style: "sycophantic, long, flattering", rewardModelScore: 0.85, trueQuality: 0.45 },
  { style: "terse, accurate, direct", rewardModelScore: 0.55, trueQuality: 0.80 },
];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "What the reward model likes vs. what's actually good" });
  const say = live(body);
  let optimizeFor = "rewardModelScore";

  const cv = canvas(body, { aspect: 0.45, label: "Reward-model score vs. true quality" });
  const st = stats([["picked", "selected by this metric"], ["otherMetric", "its score on the other metric"]]);
  const ch = choice("Optimize for", [["rewardModelScore", "reward-model score"], ["trueQuality", "true quality"]], optimizeFor, (v) => { optimizeFor = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (CANDIDATES.length + 1);
    const picked = CANDIDATES.reduce((a, b) => (a[optimizeFor] > b[optimizeFor] ? a : b));
    CANDIDATES.forEach((c, i) => {
      const rmH = c.rewardModelScore * (hh / 2 - 15), tqH = c.trueQuality * (hh / 2 - 15);
      ctx.fillStyle = c === picked ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh / 2 - rmH, bw * 0.25, rmH);
      ctx.fillStyle = c === picked ? p.warm : p.soft;
      ctx.fillRect(bw * (i + 0.5) + bw * 0.3, hh / 2 - tqH, bw * 0.25, tqH);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(c.style, bw * (i + 0.5) + bw * 0.3, hh / 2 + 16);
    });
  });

  function update() {
    const picked = CANDIDATES.reduce((a, b) => (a[optimizeFor] > b[optimizeFor] ? a : b));
    const other = optimizeFor === "rewardModelScore" ? "trueQuality" : "rewardModelScore";
    st.set("picked", picked.style);
    st.set("otherMetric", picked[other].toFixed(2));
    say(`optimizing for ${optimizeFor === "rewardModelScore" ? "reward-model score" : "true quality"} selects "${picked.style}"`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
