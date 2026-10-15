// Bench: predict a masked pixel as the average of its orthogonal neighbours; compare to the true value.
import { toyImage } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Guessing a masked pixel from its neighbours" });
  const say = live(body);
  let kind = "corner", mr = 2, mc = 2;
  const N = 4;

  const cv = canvas(body, { aspect: 0.6, label: "The image with one pixel masked; click a cell via the position choices to mask it" });
  const st = stats([["true", "true value"], ["pred", "predicted value"], ["err", "error"]]);
  const ch = choice("Image", [["edge", "Edge"], ["corner", "Corner"], ["blob", "Blob"]], kind, (v) => { kind = v; update(); });
  const chPos = choice("Mask position", [["1,1", "row 1, col 1"], ["2,2", "row 2, col 2"], ["0,2", "row 0, col 2"], ["2,0", "row 2, col 0"]], "2,2", (v) => { [mr, mc] = v.split(",").map(Number); update(); });
  body.append(cv.box, st.el, ch.el, chPos.el);

  function predict(img) {
    const neigh = [];
    if (mr > 0) neigh.push(img[mr - 1][mc]);
    if (mr < N - 1) neigh.push(img[mr + 1][mc]);
    if (mc > 0) neigh.push(img[mr][mc - 1]);
    if (mc < N - 1) neigh.push(img[mr][mc + 1]);
    return neigh.reduce((a, b) => a + b, 0) / neigh.length;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const img = toyImage(kind, N);
    const cell = Math.min(w, hh) / N;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const isMask = i === mr && j === mc;
      ctx.fillStyle = isMask ? p.warm : img[i][j] ? p.accent : p.soft2;
      ctx.fillRect(j * cell + 2, i * cell + 2, cell - 4, cell - 4);
      if (isMask) { ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", j * cell + cell / 2, i * cell + cell / 2); }
    }
  });

  function update() {
    const img = toyImage(kind, N);
    const truth = img[mr][mc];
    const pred = predict(img);
    st.set("true", truth.toFixed(2));
    st.set("pred", pred.toFixed(3));
    st.set("err", Math.abs(truth - pred).toFixed(3));
    say(`true ${truth.toFixed(2)}, predicted ${pred.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
