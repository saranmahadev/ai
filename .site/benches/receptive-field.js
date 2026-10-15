// Bench: build a stack of conv/pool layers and watch the receptive field grow, step by step.
export default function mount(root, kit) {
  const { frame, canvas, stats, live, button, h } = kit;
  const body = frame(root, { title: "How far back does this unit see?" });
  const say = live(body);
  let layers = [{ k: 3, stride: 1, pool: false }];

  const cv = canvas(body, { aspect: 0.4, label: "The receptive field after each layer in the stack" });
  const st = stats([["rf", "receptive field after the last layer"]]);
  const row = h("div", { class: "bench-row" },
    button("Add 3×3 conv", () => { layers.push({ k: 3, stride: 1, pool: false }); update(); }),
    button("Add 2×2 pool (stride 2)", () => { layers.push({ k: 2, stride: 2, pool: true }); update(); }),
    button("Remove last", () => { if (layers.length > 1) layers.pop(); update(); }),
    button("Reset", () => { layers = [{ k: 3, stride: 1, pool: false }]; update(); }));
  body.append(cv.box, st.el, row);

  function compute() {
    let rf = 1, jump = 1;
    const table = [];
    for (const L of layers) { rf += (L.k - 1) * jump; jump *= L.stride; table.push({ rf, pool: L.pool }); }
    return table;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const table = compute();
    const n = table.length, colW = w / Math.max(n, 1);
    const maxRf = Math.max(...table.map((t) => t.rf), 1);
    table.forEach((t, i) => {
      const bh = (t.rf / maxRf) * (hh - 30);
      ctx.fillStyle = t.pool ? p.warm : p.accent;
      ctx.fillRect(i * colW + colW * 0.15, hh - 24 - bh, colW * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(t.rf), i * colW + colW / 2, hh - 24 - bh - 6);
      ctx.fillText(t.pool ? "pool" : "conv", i * colW + colW / 2, hh - 8);
    });
  });

  function update() {
    const table = compute();
    st.set("rf", String(table[table.length - 1].rf));
    say(`${layers.length} layers, receptive field ${table[table.length - 1].rf} pixels`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
