// Bench: build a causal mask, a padding mask, and their combination, shown as an allowed/blocked grid.
import { causalMask, paddingMask, combineMasks } from "./tfkit.js";

const N = 4;

export default function mount(root, kit) {
  const { frame, canvas, slider, toggles, stats, live } = kit;
  const body = frame(root, { title: "Building and combining attention masks" });
  const say = live(body);
  let validLength = 2, useCausal = true;

  const cv = canvas(body, { aspect: 1, label: "Allowed (filled) and blocked (empty) query/key pairs" });
  const st = stats([["allowed", "allowed pairs"], ["blocked", "blocked pairs"]]);
  const sl = slider({ label: "valid length", min: 1, max: N, step: 1, value: validLength, format: (v) => String(v), onInput: (v) => { validLength = v; update(); } });
  const tg = toggles([["causal", "Causal masking", useCausal]], (v) => { useCausal = v.causal; update(); });
  body.append(cv.box, st.el, sl.el, tg.el);

  let mask;
  cv.onDraw((ctx, w, hh, p) => {
    const cell = Math.min(w, hh) / N;
    const ox = (w - cell * N) / 2, oy = (hh - cell * N) / 2;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      ctx.fillStyle = mask[i][j] ? p.good : p.soft;
      ctx.fillRect(ox + j * cell + 1, oy + i * cell + 1, cell - 2, cell - 2);
    }
    ctx.strokeStyle = p.muted;
    for (let i = 0; i <= N; i++) { ctx.beginPath(); ctx.moveTo(ox, oy + i * cell); ctx.lineTo(ox + N * cell, oy + i * cell); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + N * cell); ctx.stroke(); }
  });

  function update() {
    const pad = paddingMask([validLength], N)[0];
    const padMatrix = Array.from({ length: N }, () => pad);
    mask = useCausal ? combineMasks(causalMask(N), padMatrix) : padMatrix;
    const allowed = mask.flat().filter(Boolean).length;
    st.set("allowed", String(allowed));
    st.set("blocked", String(N * N - allowed));
    say(`valid length ${validLength}, causal ${useCausal ? "on" : "off"}: ${allowed} allowed pairs, ${N * N - allowed} blocked`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
