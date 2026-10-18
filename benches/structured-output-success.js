// Bench: compare free-form generation's parse success rate against grammar-masked decoding's.
import { rng } from "./kit.js";

const TRIALS = 1000;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Guaranteed valid, instead of hopefully valid" });
  const say = live(body);
  let failProb = 0.23;

  const cv = canvas(body, { aspect: 0.4, label: `Valid-output rate over ${TRIALS} simulated requests` });
  const st = stats([["freeForm", "free-form parse success"], ["masked", "grammar-masked success"]]);
  const sl = slider({ label: "free-form malformed-output rate", min: 0, max: 0.6, step: 0.01, value: failProb, format: (v) => `${(v * 100).toFixed(0)}%`, onInput: (v) => { failProb = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function freeFormSuccess() {
    const rand = rng(1);
    let failures = 0;
    for (let i = 0; i < TRIALS; i++) if (rand.chance(failProb)) failures++;
    return (TRIALS - failures) / TRIALS;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 3;
    [["free-form", freeFormSuccess(), p.warm], ["grammar-masked", 1, p.accent]].forEach(([label, v, color], i) => {
      const bh = v * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(`${(v * 100).toFixed(1)}%`, bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    const success = freeFormSuccess();
    st.set("freeForm", `${(success * 100).toFixed(1)}%`);
    st.set("masked", "100%");
    say(`at a ${(failProb * 100).toFixed(0)} percent malformed-output rate, over ${TRIALS} simulated requests: free-form parsing succeeded ${(success * 100).toFixed(1)} percent of the time, grammar-masked decoding succeeded 100 percent of the time by construction`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
