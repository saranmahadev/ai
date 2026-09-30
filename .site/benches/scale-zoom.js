// Bench: move across powers of ten and see what lives at each scale.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, live } = kit;
  const body = frame(root, { title: "Zoom across orders of magnitude" });
  const say = live(body);
  const EX = [[-15, "a proton (about 10⁻¹⁵ m across)"], [-10, "an atom (about 10⁻¹⁰ m)"], [-7, "a virus (about 10⁻⁷ m)"], [-4, "the width of a human hair (about 10⁻⁴ m)"], [-2, "a fingernail (about 10⁻² m)"], [0, "a big step (about 1 m)"], [3, "a ten-minute walk (about 10³ m)"], [7, "the Earth's width (about 1.3 × 10⁷ m)"], [9, "the Sun's width (about 1.4 × 10⁹ m)"], [11, "the Earth to Sun distance (1.5 × 10¹¹ m)"], [16, "one light-year (about 9.5 × 10¹⁵ m)"], [21, "the Milky Way's width (about 10²¹ m)"], [26, "the observable universe (about 9 × 10²⁶ m)"]];
  let e = 0;
  const se = slider({ label: "power of ten (metres)", min: -15, max: 26, step: 1, value: e, format: (v) => "10^" + v, onInput: (v) => { e = v; update(); } });
  const cv = canvas(body, { aspect: 0.22, maxH: 130, label: "A ruler of powers of ten with a marker" });
  const st = stats([["sci", "scientific notation"], ["plain", "plain digits"], ["near", "closest thing at or below"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, se.el));
  cv.onDraw((ctx, w, hh, p) => {
    const x0 = 20, x1 = w - 20, X = (v) => x0 + ((v + 15) / 41) * (x1 - x0), y = hh / 2;
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillStyle = p.muted; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    for (let v = -15; v <= 26; v += 1) { const big = v % 5 === 0; ctx.beginPath(); ctx.moveTo(X(v), y - (big ? 9 : 4)); ctx.lineTo(X(v), y + (big ? 9 : 4)); ctx.stroke(); if (big) ctx.fillText(String(v), X(v), y + 24); }
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(X(e), y, 9, 0, 7); ctx.fill();
  });
  function update() {
    let near = EX[0]; for (const x of EX) if (x[0] <= e) near = x;
    st.set("sci", `1 × 10^${e}`);
    st.set("plain", e >= 0 ? (e <= 12 ? "1" + "0".repeat(e) : "1 followed by " + e + " zeros") : (e >= -9 ? "0." + "0".repeat(-e - 1) + "1" : "0." + "0".repeat(3) + "… (" + (-e - 1) + " zeros)"));
    st.set("near", near[1]); say(`ten to the ${e}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
