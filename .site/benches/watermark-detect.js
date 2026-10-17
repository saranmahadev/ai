// Bench: generate with/without a green-list watermark bias and detect it from the green-token fraction.
import { greenListIds, biasGreenLogits } from "./gakit.js";
import { rng } from "./kit.js";

const VOCAB_SIZE = 50, GAMMA = 0.5, LENGTH = 200;

export default function mount(root, kit) {
  const { frame, canvas, slider, toggles, stats, live } = kit;
  const body = frame(root, { title: "A hidden bias that's easy to detect, if you know the rule" });
  const say = live(body);
  let watermark = true, delta = 4;

  const cv = canvas(body, { aspect: 0.4, label: "Green-token fraction across the generated text" });
  const st = stats([["fraction", "green-token fraction"]]);
  const tg = toggles([["watermark", "apply watermark bias", watermark]], (v) => { watermark = v.watermark; update(); });
  const sl = slider({ label: "bias strength (δ)", min: 0, max: 8, step: 0.5, value: delta, format: (v) => v.toFixed(1), onInput: (v) => { delta = v; update(); } });
  body.append(cv.box, st.el, tg.el, sl.el);

  let frac = 0.5;
  cv.onDraw((ctx, w, hh, p) => {
    const bh = frac * (hh - 30);
    ctx.fillStyle = p.accent;
    ctx.fillRect(w / 2 - 30, hh - 15 - bh, 60, bh);
    ctx.strokeStyle = p.soft; ctx.beginPath(); ctx.moveTo(0, hh - 15 - 0.5 * (hh - 30)); ctx.lineTo(w, hh - 15 - 0.5 * (hh - 30)); ctx.stroke();
  });

  function generate() {
    const rand = rng(999);
    const tokens = [Math.floor(rand() * VOCAB_SIZE)];
    for (let i = 1; i < LENGTH; i++) {
      const prev = tokens[tokens.length - 1];
      let logits = Array.from({ length: VOCAB_SIZE }, () => rand() * 2 - 1);
      if (watermark) logits = biasGreenLogits(logits, greenListIds(prev, VOCAB_SIZE, GAMMA), delta);
      tokens.push(logits.indexOf(Math.max(...logits)));
    }
    return tokens;
  }

  function detect(tokens) {
    let green = 0;
    for (let i = 1; i < tokens.length; i++) if (greenListIds(tokens[i - 1], VOCAB_SIZE, GAMMA).has(tokens[i])) green++;
    return green / (tokens.length - 1);
  }

  function update() {
    frac = detect(generate());
    st.set("fraction", `${(frac * 100).toFixed(1)}%`);
    say(`${watermark ? "watermarked" : "unwatermarked"}: ${(frac * 100).toFixed(1)} percent green tokens (null expectation ~50%)`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
