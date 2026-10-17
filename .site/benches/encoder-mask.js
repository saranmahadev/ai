// Bench: mask one token in a short sentence and compare how much context is visible, bidirectional vs causal.
import { causalMask } from "./tfkit.js";

const WORDS = ["The", "cat", "sat", "on", "the", "mat"];
const N = WORDS.length;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "How much context is available to fill a gap" });
  const say = live(body);
  let maskPos = 2;

  const cv = canvas(body, { aspect: 0.5, label: "Which words are visible to predict the masked word, each way" });
  const st = stats([["bidir", "bidirectional: visible tokens"], ["causal", "causal: visible tokens"]]);
  const sl = slider({ label: "masked word position", min: 0, max: N - 1, step: 1, value: maskPos, format: (v) => WORDS[v], onInput: (v) => { maskPos = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let bidirRow, causalRow;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / N;
    const rows = [["bidirectional", bidirRow], ["causal", causalRow]];
    const rowH = hh / (rows.length + 1);
    rows.forEach(([label, row], r) => {
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(label, 4, (r + 0.5) * rowH - rowH / 2 + 14);
      WORDS.forEach((word, i) => {
        const x = bw * i, y = (r + 1) * rowH - 8;
        ctx.fillStyle = i === maskPos ? p.warm : row[i] ? p.good : p.soft;
        ctx.fillRect(x + 2, y - 18, bw - 4, 22);
        ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(i === maskPos ? "[MASK]" : word, x + bw / 2, y - 3);
      });
    });
  });

  function update() {
    const cm = causalMask(N);
    causalRow = cm[maskPos].map((v, i) => (i === maskPos ? false : v));
    bidirRow = Array.from({ length: N }, (_, i) => i !== maskPos);
    st.set("bidir", String(bidirRow.filter(Boolean).length));
    st.set("causal", String(causalRow.filter(Boolean).length));
    say(`masking "${WORDS[maskPos]}": bidirectional sees ${bidirRow.filter(Boolean).length} words, causal sees ${causalRow.filter(Boolean).length}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
