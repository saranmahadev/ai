// Bench: push a vector through several small random linear layers, with and without residual connections.
import { matvec, vecAdd, vecNorm } from "./tfkit.js";
import { rng } from "./kit.js";

const D = 3;

function randMat(rand, scale) { return Array.from({ length: D }, () => Array.from({ length: D }, () => (rand() * 2 - 1) * scale)); }

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "What survives six layers, with and without residuals" });
  const say = live(body);
  let layers = 6, scale = 0.3;

  const cv = canvas(body, { aspect: 0.5, label: "Output vector norm as layers stack, with and without residuals" });
  const st = stats([["noRes", "no-residual output norm"], ["res", "residual output norm"]]);
  const slL = slider({ label: "layers", min: 1, max: 12, step: 1, value: layers, format: (v) => String(v), onInput: (v) => { layers = v; update(); } });
  const slS = slider({ label: "layer weight scale", min: 0.05, max: 0.6, step: 0.05, value: scale, format: (v) => v.toFixed(2), onInput: (v) => { scale = v; update(); } });
  body.append(cv.box, st.el, slL.el, slS.el);

  let history = [];
  cv.onDraw((ctx, w, hh, p) => {
    const maxV = Math.max(...history.map((h) => Math.max(h.noRes, h.res)), 2);
    const colW = w / (history.length + 1);
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    history.forEach((h, i) => { const x = colW * (i + 1), y = hh - 20 - (h.res / maxV) * (hh - 40); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.strokeStyle = p.warm; ctx.beginPath();
    history.forEach((h, i) => { const x = colW * (i + 1), y = hh - 20 - (h.noRes / maxV) * (hh - 40); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
    ctx.fillStyle = p.accent; ctx.fillText("residual", 8, 16);
    ctx.fillStyle = p.warm; ctx.fillText("no residual", 8, 30);
  });

  function update() {
    const rand = rng(3);
    const Ws = Array.from({ length: layers }, () => randMat(rand, scale));
    let yNo = [1, 1, 1], yRes = [1, 1, 1];
    history = [{ noRes: vecNorm(yNo), res: vecNorm(yRes) }];
    for (const W of Ws) {
      yNo = matvec(W, yNo);
      yRes = vecAdd(yRes, matvec(W, yRes));
      history.push({ noRes: vecNorm(yNo), res: vecNorm(yRes) });
    }
    const last = history[history.length - 1];
    st.set("noRes", last.noRes.toFixed(5));
    st.set("res", last.res.toFixed(4));
    say(`after ${layers} layers: no-residual norm ${last.noRes.toFixed(4)}, residual norm ${last.res.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
