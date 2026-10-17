// Bench: track the residual stream's norm across layers under pre-norm vs post-norm placement.
import { matvec, vecAdd, vecNorm, layerNorm } from "./tfkit.js";
import { rng, plot } from "./kit.js";

const START = [1, 0.5, -0.3, 0.8];
const D = START.length;

function randMat(rand, scale) { return Array.from({ length: D }, () => Array.from({ length: D }, () => (rand() * 2 - 1) * scale)); }

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Does the residual stream stay put, or grow?" });
  const say = live(body);
  let layers = 8, scale = 0.5;

  const cv = canvas(body, { aspect: 0.5, label: "Residual stream norm after each layer, pre-norm vs post-norm" });
  const st = stats([["post", "post-norm final ‖x‖"], ["pre", "pre-norm final ‖x‖"]]);
  const slL = slider({ label: "layers", min: 1, max: 16, step: 1, value: layers, format: (v) => String(v), onInput: (v) => { layers = v; update(); } });
  const slS = slider({ label: "layer weight scale", min: 0.1, max: 1, step: 0.05, value: scale, format: (v) => v.toFixed(2), onInput: (v) => { scale = v; update(); } });
  body.append(cv.box, st.el, slL.el, slS.el);

  let postHist = [], preHist = [];
  cv.onDraw((ctx, w, hh, p) => {
    const maxV = Math.max(...postHist, ...preHist, 2);
    const m = plot(w, hh, [0, Math.max(5, layers)], [0, maxV * 1.1]);
    m.axes(ctx, p, { xlabel: "layer", ylabel: "‖x‖" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    preHist.forEach((v, i) => { const x = m.X(i), y = m.Y(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.strokeStyle = p.warm; ctx.beginPath();
    postHist.forEach((v, i) => { const x = m.X(i), y = m.Y(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
    ctx.fillStyle = p.accent; ctx.fillText("pre-norm", m.pad.l + 6, 16);
    ctx.fillStyle = p.warm; ctx.fillText("post-norm", m.pad.l + 6, 30);
  });

  function update() {
    const rand = rng(5);
    const Ws = Array.from({ length: layers }, () => randMat(rand, scale));
    let xPost = START.slice(), xPre = START.slice();
    postHist = [vecNorm(xPost)]; preHist = [vecNorm(xPre)];
    for (const W of Ws) {
      xPost = layerNorm(vecAdd(xPost, matvec(W, xPost)));
      xPre = vecAdd(xPre, matvec(W, layerNorm(xPre)));
      postHist.push(vecNorm(xPost));
      preHist.push(vecNorm(xPre));
    }
    st.set("post", postHist[postHist.length - 1].toFixed(4));
    st.set("pre", preHist[preHist.length - 1].toFixed(4));
    say(`after ${layers} layers: post-norm ${postHist[postHist.length - 1].toFixed(2)}, pre-norm ${preHist[preHist.length - 1].toFixed(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
