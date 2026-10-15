// Bench: a power-law loss curve, linear scale vs log-log scale, with an adjustable exponent.
import { curve, clip } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Diminishing returns on a log-log scale" });
  const say = live(body);
  let alpha = 0.3, view = "linear";

  const cv = canvas(body, { aspect: 0.55, label: "Loss vs scale N, linear or log-log view" });
  const st = stats([["l6", "loss at N=10⁶"], ["l10", "loss at N=10¹⁰"]]);
  const ch = choice("View", [["linear", "Linear scale"], ["loglog", "Log-log scale"]], view, (v) => { view = v; update(); });
  const sa = slider({ label: "exponent α", min: 0.1, max: 0.6, step: 0.05, value: alpha, format: (v) => v.toFixed(2), onInput: (v) => { alpha = v; update(); } });
  body.append(cv.box, st.el, ch.el, sa.el);

  const A = 10, C = 1.5;
  const loss = (N) => A * N ** -alpha + C;

  cv.onDraw((ctx, w, hh, p) => {
    if (view === "linear") {
      const m = plot(w, hh, [0, 1e10], [1.4, 1.8]);
      m.axes(ctx, p, { xlabel: "N (parameters)", ylabel: "loss" });
      curve(ctx, m, loss, 1e6, 1e10, { color: p.accent, width: 3, clip: clip(m), steps: 300 });
    } else {
      const m = plot(w, hh, [6, 10], [-3, 0]);
      m.axes(ctx, p, { xlabel: "log10(N)", ylabel: "log10(loss − C)" });
      curve(ctx, m, (logN) => Math.log10(loss(10 ** logN) - C), 6, 10, { color: p.accent, width: 3, clip: clip(m), steps: 200 });
    }
  });

  function update() {
    st.set("l6", loss(1e6).toFixed(4));
    st.set("l10", loss(1e10).toFixed(4));
    say(`loss at N=10^6 is ${loss(1e6).toFixed(3)}, at N=10^10 is ${loss(1e10).toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
