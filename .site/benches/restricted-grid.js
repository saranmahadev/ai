// Bench: conditional probability shrinks the sample space to B.
export default function mount(root, kit) {
  const { h, frame, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Shrink the world to what you know" });
  const say = live(body);
  const EA = { big: ["sum ≥ 10", (a, b) => a + b >= 10], seven: ["sum is 7", (a, b) => a + b === 7], dbl: ["doubles", (a, b) => a === b], even: ["sum is even", (a, b) => (a + b) % 2 === 0] };
  const EB = { first6: ["first die is 6", (a) => a === 6], even: ["sum is even", (a, b) => (a + b) % 2 === 0], six: ["at least one 6", (a, b) => a === 6 || b === 6], dbl: ["doubles", (a, b) => a === b] };
  let ka = "big", kb = "first6";
  const ca = choice("Event A", Object.entries(EA).map(([k, v]) => [k, v[0]]), ka, (k) => { ka = k; update(); });
  const cb = choice("Condition B (what you know)", Object.entries(EB).map(([k, v]) => [k, v[0]]), kb, (k) => { kb = k; update(); });
  const cv = canvas(body, { aspect: 0.75, maxH: 420, label: "The dice grid with outcomes outside B dimmed" });
  const st = stats([["a", "P(A)"], ["b", "P(B)"], ["ab", "P(A and B)"], ["c", "P(A given B) = P(A and B) / P(B)"]]);
  body.append(cv.box, st.el, ca.el, cb.el);
  cv.onDraw((ctx, w, hh, p) => {
    const cell = Math.min((w - 30) / 6, (hh - 20) / 6), ox = 26, oy = 6; ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) { const inB = EB[kb][1](a, b), inA = EA[ka][1](a, b), x = ox + (a - 1) * cell, y = oy + (b - 1) * cell; ctx.globalAlpha = inB ? 1 : 0.25; ctx.fillStyle = inA && inB ? p.accent : inB ? p.warm : inA ? p.accent : p.soft; ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2); ctx.fillStyle = p.white; ctx.fillText(String(a + b), x + cell / 2, y + cell / 2 + 4); }
    ctx.globalAlpha = 1;
  });
  function update() { let A = 0, B = 0, AB = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) { const x = EA[ka][1](a, b), y = EB[kb][1](a, b); if (x) A++; if (y) B++; if (x && y) AB++; } st.set("a", `${A}/36 = ${fmt(A / 36, 3)}`); st.set("b", `${B}/36 = ${fmt(B / 36, 3)}`); st.set("ab", `${AB}/36 = ${fmt(AB / 36, 3)}`); st.set("c", `${AB}/${B} = ${fmt(AB / B, 3)}   (blue cells in B ÷ all bright cells)`); say(`P of A given B is ${fmt(AB / B, 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
