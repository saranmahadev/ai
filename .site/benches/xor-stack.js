// Bench: a single linear unit vs a hand-built two-layer network on the XOR points.
import { regions, scatter } from "./mlkit.js";
import { step } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, choice, stats, live } = kit;
  const body = frame(root, { title: "One line vs two layers" });
  const say = live(body);
  const pts = [{ x: 0, y: 0, c: 0 }, { x: 0, y: 1, c: 1 }, { x: 1, y: 0, c: 1 }, { x: 1, y: 1, c: 0 }];

  const singleLine = (x, y) => step(x + y - 0.5); // the best a single line can do: plain OR
  const twoLayer = (x, y) => {
    const hOR = step(x + y - 0.5);
    const hAND = step(x + y - 1.5);
    return step(hOR - hAND - 0.5);
  };
  let mode = "single";
  const predict = (x, y) => (mode === "single" ? singleLine(x, y) : twoLayer(x, y));

  const cv = canvas(body, { aspect: 0.85, label: "The four XOR points and the current decision region" });
  const st = stats([["acc", "points correct"]]);
  const ch = choice("Model", [["single", "Single linear unit"], ["two", "Two-layer network"]], mode, (v) => { mode = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-0.5, 1.5], [-0.5, 1.5]);
    m.axes(ctx, p, { xlabel: "x1", ylabel: "x2", ticks: 2 });
    regions(ctx, m, (x, y) => predict(x, y), p, { block: 7 });
    scatter(ctx, m, pts, p, { r: 10 });
  });

  function update() {
    const correct = pts.filter((q) => predict(q.x, q.y) === q.c).length;
    st.set("acc", `${correct} of 4`);
    say(`${correct} of 4 points correct`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
