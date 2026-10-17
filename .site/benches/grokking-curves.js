// Bench: step through training epochs and watch test accuracy lag far behind train accuracy, then suddenly catch up.
import { sigmoid } from "./llmkit.js";

function trainAcc(epoch) { return 1 - Math.exp(-epoch / 15); }
function testAcc(epoch) { return 0.1 + 0.85 * sigmoid((epoch - 900) / 120); }
const EPOCHS = [10, 50, 100, 300, 600, 1000, 1500, 2000];

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Memorized long before it generalizes" });
  const say = live(body);
  let shown = 0;

  const cv = canvas(body, { aspect: 0.45, label: "Train vs. test accuracy over epochs" });
  const st = stats([["epoch", "epoch"], ["train", "train accuracy"], ["test", "test accuracy"]]);

  function report() {
    const e = EPOCHS[shown];
    st.set("epoch", String(e));
    st.set("train", `${(trainAcc(e) * 100).toFixed(1)}%`);
    st.set("test", `${(testAcc(e) * 100).toFixed(1)}%`);
    say(`epoch ${e}: train ${(trainAcc(e) * 100).toFixed(1)}%, test ${(testAcc(e) * 100).toFixed(1)}%`);
    cv.redraw();
  }
  const sp = stepper({
    stepLabel: "Next epoch",
    onStep: () => { if (shown >= EPOCHS.length - 1) return false; shown++; report(); },
    onReset: () => { shown = 0; report(); },
  });
  body.append(cv.box, st.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (EPOCHS.length + 1);
    EPOCHS.forEach((e, i) => {
      const trH = trainAcc(e) * (hh - 30), teH = testAcc(e) * (hh - 30);
      ctx.fillStyle = i <= shown ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - trH, bw * 0.25, trH);
      ctx.fillStyle = i <= shown ? p.warm : p.soft;
      ctx.fillRect(bw * (i + 0.5) + bw * 0.3, hh - 15 - teH, bw * 0.25, teH);
    });
  });
  report();
  return () => cv.destroy();
}
