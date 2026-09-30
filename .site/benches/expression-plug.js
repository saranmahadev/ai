// Bench: substitute numbers into an expression.
export default function mount(root, kit) {
  const { h, frame, slider, choice, stats, fmt, live } = kit;
  const body = frame(root, { title: "Plug numbers into an expression" });
  const say = live(body);
  const F = {
    area: { name: "Rectangle area", vars: [["w", "width", 1, 12, 1, 4], ["hh", "height", 1, 12, 1, 3]], text: (v) => `area = w × h = ${v.w} × ${v.hh}`, val: (v) => v.w * v.hh },
    plan: { name: "Phone plan", vars: [["g", "gigabytes used", 0, 40, 1, 10]], text: (v) => `cost = 12 + 0.5 × g = 12 + 0.5 × ${v.g}`, val: (v) => 12 + 0.5 * v.g },
    wsum: { name: "Weighted sum", vars: [["x1", "x₁", 0, 10, 1, 4], ["x2", "x₂", 0, 10, 1, 3], ["w1", "w₁", -3, 3, 0.5, 2], ["w2", "w₂", -3, 3, 0.5, 1]], text: (v) => `ŷ = w₁x₁ + w₂x₂ + 1 = ${v.w1}×${v.x1} + ${v.w2}×${v.x2} + 1`, val: (v) => v.w1 * v.x1 + v.w2 * v.x2 + 1 }
  };
  let key = "area", vals = {};
  const sliders = h("div", { class: "bench-controls" });
  const st = stats([["sub", "substitution"], ["res", "result"]]);
  const which = choice("Formula", Object.entries(F).map(([k, f]) => [k, f.name]), key, (k) => { key = k; build(); });
  body.append(st.el, sliders, which.el);
  function build() {
    sliders.textContent = ""; vals = {};
    for (const [id, label, min, max, step, val] of F[key].vars) { vals[id] = val; sliders.append(slider({ label, min, max, step, value: val, format: (v) => fmt(v, 1), onInput: (v) => { vals[id] = v; update(); } }).el); }
    update();
  }
  function update() { const f = F[key]; st.set("sub", f.text(vals)); st.set("res", fmt(f.val(vals), 2)); say(`Result ${fmt(f.val(vals), 2)}`); }
  build();
  return () => {};
}
