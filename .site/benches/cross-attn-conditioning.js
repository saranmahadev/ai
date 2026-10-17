// Bench: watch image-latent queries attend over text-conditioning tokens, pulling toward the closest one.
import { crossAttention } from "./tfkit.js";

const TEXT_LABELS = ["a", "cat", "red"];
const TEXT_TOKENS = [[1, 0.2, 0, 0], [0, 1, 0.1, 0], [0.5, 0.5, 0, 0]];
function eye(n) { return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))); }

export default function mount(root, kit) {
  const { frame, h, choice, canvas, stats, live } = kit;
  const body = frame(root, { title: "An image latent attends over the prompt" });
  const say = live(body);
  let latentIdx = 0;
  const LATENTS = [[1, 0, 0, 0], [0, 1, 0, 0], [0.3, 0.3, 0, 0]];
  const LATENT_LABELS = ["latent ≈ 'a'", "latent ≈ 'cat'", "latent ≈ blend"];

  const cv = canvas(body, { aspect: 0.45, label: "Attention weight onto each text token" });
  const st = stats([["top", "token attended to most"]]);
  const ch = choice("Latent position", LATENT_LABELS.map((l, i) => [String(i), l]), "0", (v) => { latentIdx = +v; update(); });
  body.append(cv.box, st.el, ch.el);

  let weightsRow = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (TEXT_LABELS.length + 1);
    weightsRow.forEach((wt, i) => {
      const bh = wt * (hh - 50);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(TEXT_LABELS[i], bw * (i + 0.5) + bw * 0.3, hh - 8);
    });
  });

  function update() {
    const { weights } = crossAttention([LATENTS[latentIdx]], TEXT_TOKENS, { Wq: eye(4), Wk: eye(4), Wv: eye(4) });
    weightsRow = weights[0];
    const top = weightsRow.indexOf(Math.max(...weightsRow));
    st.set("top", `${TEXT_LABELS[top]} (${weightsRow[top].toFixed(3)})`);
    say(`${LATENT_LABELS[latentIdx]}: attends most to "${TEXT_LABELS[top]}" at weight ${weightsRow[top].toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
