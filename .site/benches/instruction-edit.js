// Bench: localize an edit instruction's effect across image patches using cross-attention weights.
import { crossAttention } from "./tfkit.js";

const LABELS = ["background", "cat-face", "cat-body", "sky"];
const PATCHES = [[0, 0, 1, 0], [1, 0.2, 0, 0], [0.9, 0.3, 0, 0], [0, 0, 0, 1]];
const RED = [5, 5, 0, 0];
function eye(n) { return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))); }

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "An instruction edits what it attends to" });
  const say = live(body);
  let instruction = "cat";
  const INSTRUCTIONS = { cat: [1, 0.1, 0, 0], sky: [0, 0, 0.2, 1] };

  const cv = canvas(body, { aspect: 0.45, label: "Edit strength applied to each patch" });
  const st = stats([["strongest", "most-edited patch"]]);
  const ch = choice("Instruction", [["cat", "“make the cat red”"], ["sky", "“make the sky red”"]], instruction, (v) => { instruction = v; update(); });
  body.append(cv.box, st.el, ch.el);

  let weightsRow = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (LABELS.length + 1);
    weightsRow.forEach((wt, i) => {
      const bh = wt * (hh - 50);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(LABELS[i], bw * (i + 0.5) + bw * 0.3, hh - 8);
    });
  });

  function update() {
    const { weights } = crossAttention([INSTRUCTIONS[instruction]], PATCHES, { Wq: eye(4), Wk: eye(4), Wv: eye(4) });
    weightsRow = weights[0];
    const top = weightsRow.indexOf(Math.max(...weightsRow));
    st.set("strongest", `${LABELS[top]} (${weightsRow[top].toFixed(3)})`);
    say(`"${instruction}" edit lands strongest on ${LABELS[top]} at weight ${weightsRow[top].toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
