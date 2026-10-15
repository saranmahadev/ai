// Bench: step through a training/validation curve to find the best early-stopping epoch, and average several model predictions.
import { curve, clip, dot } from "./mathkit.js";

const B = 0.001;
const trainLoss = (e) => 2 * Math.exp(-e / 5) + 0.1;
const valLoss = (e) => trainLoss(e) + B * e * e;
const PREDS = [0.62, 0.71, 0.55, 0.68, 0.59];
const TRUE = 0.65;

export default function mount(root, kit) {
  const { frame, canvas, plot, choice, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "Stopping at the best epoch, and averaging several models" });
  const say = live(body);
  let mode = "stop", epoch = 0, best = { e: 0, v: Infinity }, k = 1;

  const cv = canvas(body, { aspect: 0.55, label: "Training and validation loss over epochs, or the ensembling view" });
  const st = stats([["a", "value A"], ["b", "value B"]]);
  const ch = choice("View", [["stop", "Early stopping"], ["ens", "Ensembling"]], mode, (v) => { mode = v; update(); });
  const sp = stepper({ onStep: stepEpoch, onReset: resetEpoch, interval: 250, stepLabel: "Step epoch" });
  const sk = slider({ label: "models averaged (k)", min: 1, max: 5, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  body.append(cv.box, st.el, ch.el, sp.el, sk.el);

  function resetEpoch() { epoch = 0; best = { e: 0, v: valLoss(0) }; update(); }
  function stepEpoch() {
    if (epoch >= 30) return false;
    epoch++;
    const v = valLoss(epoch);
    if (v < best.v) best = { e: epoch, v };
    update();
    return epoch < 30;
  }

  cv.onDraw((ctx, w, hh, p) => {
    if (mode === "stop") {
      const m = plot(w, hh, [0, 30], [0, 2.2]);
      m.axes(ctx, p, { xlabel: "epoch", ylabel: "loss" });
      curve(ctx, m, trainLoss, 0, 30, { color: p.muted, width: 2.5, clip: clip(m) });
      curve(ctx, m, valLoss, 0, 30, { color: p.accent, width: 3, clip: clip(m) });
      dot(ctx, m.X(epoch), m.Y(valLoss(epoch)), 6, p.ink);
      dot(ctx, m.X(best.e), m.Y(best.v), 7, p.good);
    } else {
      const m = plot(w, hh, [-0.5, 5.5], [0.4, 0.8]);
      m.axes(ctx, p, { xlabel: "model", ylabel: "prediction" });
      PREDS.forEach((v, i) => dot(ctx, m.X(i + 1), m.Y(v), i < k ? 7 : 4, i < k ? p.accent : p.soft2));
      const avg = PREDS.slice(0, k).reduce((a, b) => a + b, 0) / k;
      ctx.strokeStyle = p.muted; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(m.pad.l, m.Y(TRUE)); ctx.lineTo(m.pad.l + m.iw, m.Y(TRUE)); ctx.stroke(); ctx.setLineDash([]);
      dot(ctx, m.X(5.3), m.Y(avg), 8, p.good);
    }
  });

  function update() {
    if (mode === "stop") {
      st.set("a", `epoch ${epoch}, val loss ${valLoss(epoch).toFixed(4)}`);
      st.set("b", `best so far: epoch ${best.e}, val loss ${best.v.toFixed(4)}`);
      say(`epoch ${epoch}, validation loss ${valLoss(epoch).toFixed(3)}, best epoch ${best.e}`);
    } else {
      const avg = PREDS.slice(0, k).reduce((a, b) => a + b, 0) / k;
      const avgErr = PREDS.slice(0, k).reduce((s, v) => s + (v - TRUE) ** 2, 0) / k;
      const ensErr = (avg - TRUE) ** 2;
      st.set("a", `average individual error: ${avgErr.toFixed(4)}`);
      st.set("b", `ensemble (average) error: ${ensErr.toFixed(4)}`);
      say(`averaging ${k} models: ensemble error ${ensErr.toFixed(4)}`);
    }
    cv.redraw();
  }
  resetEpoch();
  update();
  return () => { cv.destroy(); sp.stop(); };
}
