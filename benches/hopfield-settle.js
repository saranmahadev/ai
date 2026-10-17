// Bench: store two patterns in a Hopfield network, corrupt one, and step through asynchronous settling.
import { hopfieldWeights, hopfieldUpdateUnit, hopfieldEnergy, hammingDistance, corrupt } from "./nnkit.js";
import { rng } from "./kit.js";

const SIZE = 5;
const PATTERNS = {
  X: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1].map((b) => (b ? 1 : -1)),
  O: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0].map((b) => (b ? 1 : -1))
};
const N = SIZE * SIZE;

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, button, stats, live } = kit;
  const body = frame(root, { title: "Store, corrupt and settle" });
  const say = live(body);
  const rand = rng(7);

  const W = hopfieldWeights([PATTERNS.X, PATTERNS.O]);
  let target = "X";
  let bits = 3;
  let s = corrupt(PATTERNS[target], bits, rand);
  let order = Array.from({ length: N }, (_, i) => i);
  let cursor = 0;
  let changedThisSweep = false;

  const cv = canvas(body, { aspect: 1, label: "The network's current state, as a 5-by-5 grid of units" });
  const st = stats([["dist0", "stored pattern X"], ["disto", "stored pattern O"], ["energy", "energy"], ["unit", "next unit to update"]]);
  const chTarget = choice("Pattern to corrupt", [["X", "X"], ["O", "O"]], target, (v) => { target = v; recorrupt(); });
  const sb = slider({ label: "bits to flip", min: 0, max: 10, step: 1, value: bits, format: (v) => String(v), onInput: (v) => { bits = v; recorrupt(); } });
  const stepBtn = button("Update one unit", () => step());
  const resetBtn = button("Re-corrupt", () => recorrupt());
  body.append(cv.box, st.el, chTarget.el, sb.el, stepBtn, resetBtn);

  function recorrupt() {
    s = corrupt(PATTERNS[target], bits, rand);
    cursor = 0;
    changedThisSweep = false;
    update();
  }

  function step() {
    const i = order[cursor];
    const v = hopfieldUpdateUnit(W, s, i);
    if (v !== s[i]) { s[i] = v; changedThisSweep = true; }
    cursor++;
    if (cursor >= order.length) {
      cursor = 0;
      if (!changedThisSweep) say("settled: a full sweep changed nothing");
      changedThisSweep = false;
    }
    update();
  }

  cv.onDraw((ctx, w, hh, p) => {
    const cell = Math.min(w, hh) / SIZE;
    const ox = (w - cell * SIZE) / 2, oy = (hh - cell * SIZE) / 2;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      const i = r * SIZE + c;
      ctx.fillStyle = s[i] === 1 ? p.good : p.soft;
      ctx.fillRect(ox + c * cell + 1, oy + r * cell + 1, cell - 2, cell - 2);
      if (i === order[cursor]) { ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.strokeRect(ox + c * cell + 1, oy + r * cell + 1, cell - 2, cell - 2); }
    }
  });

  function update() {
    const dX = hammingDistance(s, PATTERNS.X), dO = hammingDistance(s, PATTERNS.O);
    st.set("dist0", String(dX));
    st.set("disto", String(dO));
    st.set("energy", hopfieldEnergy(W, s).toFixed(1));
    st.set("unit", String(order[cursor]));
    say(`${bits} bits corrupted on pattern ${target}; distance ${dX} from X, ${dO} from O; energy ${hopfieldEnergy(W, s).toFixed(1)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
