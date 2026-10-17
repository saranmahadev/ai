// Bench: measure differential association between attribute-coded embeddings and target concepts.
import { cosineSim } from "./gakit.js";

const MALE = [[1, 0.1], [0.9, 0.0]];
const FEMALE = [[-1, 0.1], [-0.9, 0.0]];
const TARGETS = { career: [0.8, 0.9], family: [-0.8, 0.9] };

function meanAssoc(attrSet, target) { return attrSet.reduce((s, a) => s + cosineSim(a, target), 0) / attrSet.length; }

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Which group associates more with which concept?" });
  const say = live(body);
  let target = "career";

  const cv = canvas(body, { aspect: 0.45, label: "Mean association by group" });
  const st = stats([["diff", "association gap"]]);
  const ch = choice("Target concept", Object.keys(TARGETS).map((k) => [k, k]), target, (v) => { target = v; update(); });
  body.append(cv.box, st.el, ch.el);

  let assocs = {};
  cv.onDraw((ctx, w, hh, p) => {
    const labels = Object.keys(assocs), bw = w / (labels.length + 1);
    labels.forEach((l, i) => {
      const v = assocs[l], bh = Math.abs(v) * (hh - 50);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), v >= 0 ? hh / 2 - bh : hh / 2, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(l, bw * (i + 0.5) + bw * 0.3, hh - 6);
    });
  });

  function update() {
    assocs = { "male-coded": meanAssoc(MALE, TARGETS[target]), "female-coded": meanAssoc(FEMALE, TARGETS[target]) };
    const diff = assocs["male-coded"] - assocs["female-coded"];
    st.set("diff", diff.toFixed(4));
    say(`"${target}": male-coded association ${assocs["male-coded"].toFixed(3)}, female-coded ${assocs["female-coded"].toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
