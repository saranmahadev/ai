// Bench: compare success rates of different adversarial attack strategies against a model's guardrails.
const ATTACKS = {
  "direct request": 0.02,
  "role-play framing": 0.35,
  "multi-step encoding/obfuscation": 0.48,
  "many-shot priming": 0.55,
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Not every attack is equally effective" });
  const say = live(body);
  let key = Object.keys(ATTACKS)[0];

  const cv = canvas(body, { aspect: 0.45, label: "Attack success rate" });
  const st = stats([["rate", "success rate"]]);
  const ch = choice("Attack strategy", Object.keys(ATTACKS).map((k) => [k, k]), key, (v) => { key = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const labels = Object.keys(ATTACKS), bw = w / (labels.length + 1);
    labels.forEach((l, i) => {
      const bh = ATTACKS[l] * (hh - 30);
      ctx.fillStyle = l === key ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    st.set("rate", `${(ATTACKS[key] * 100).toFixed(0)}%`);
    say(`"${key}": ${(ATTACKS[key] * 100).toFixed(0)} percent success rate`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
