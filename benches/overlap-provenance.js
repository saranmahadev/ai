// Bench: detect verbatim overlap between generated text and a training-corpus snippet, at different n-gram lengths.
import { overlapFraction } from "./gakit.js";

const TRAINING = "it was the best of times it was the worst of times".split(" ");
const CANDIDATES = {
  "verbatim copy": "it was the best of times it was the worst of times".split(" "),
  "original text": "it was a cold and difficult winter that year".split(" "),
};

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Checking for verbatim training-data overlap" });
  const say = live(body);
  let key = "verbatim copy", n = 5;

  const cv = canvas(body, { aspect: 0.4, label: "Overlap fraction at this n-gram length" });
  const st = stats([["overlap", "n-gram overlap"]]);
  const ch = choice("Candidate", Object.keys(CANDIDATES).map((k) => [k, k]), key, (v) => { key = v; update(); });
  const sl = slider({ label: "n-gram length", min: 2, max: 8, step: 1, value: n, format: (v) => String(v), onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, ch.el, sl.el);

  let frac = 0;
  cv.onDraw((ctx, w, hh, p) => {
    const bh = frac * (hh - 30);
    ctx.fillStyle = p.accent;
    ctx.fillRect(w / 2 - 30, hh - 15 - bh, 60, bh);
  });

  function update() {
    frac = overlapFraction(CANDIDATES[key], TRAINING, n);
    st.set("overlap", `${(frac * 100).toFixed(0)}%`);
    say(`"${key}" at n=${n}: ${(frac * 100).toFixed(0)} percent overlap with the training snippet`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
