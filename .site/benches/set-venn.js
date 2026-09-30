// Bench: place twelve numbers in sets A and B and see union, intersection, difference and complement.
export default function mount(root, kit) {
  const { h, frame, choice, canvas, stats, live } = kit;
  const body = frame(root, { title: "Sets and their overlaps" });
  const say = live(body);
  const N = 12, m = [1, 1, 3, 3, 2, 0, 1, 2, 3, 0, 2, 0]; // bit 1 = in A, bit 2 = in B
  let op = "union";
  const cv = canvas(body, { aspect: 0.62, label: "A Venn diagram of two sets with numbers placed in their regions" });
  const st = stats([["a", "|A|"], ["b", "|B|"], ["ab", "|A ∩ B|"], ["u", "|A ∪ B|"], ["chk", "|A| + |B| − |A ∩ B|"], ["res", "selected region"]]);
  const grid = h("div", { class: "bench-row", role: "group", "aria-label": "Numbers; press to cycle: neither, A, B, both" });
  const btns = m.map((_, i) => { const b = h("button", { type: "button", class: "bench-btn", onClick: () => { m[i] = (m[i] + 1) % 4; update(); } }, String(i + 1)); grid.append(b); return b; });
  const ch = choice("Show", [["union", "A ∪ B"], ["inter", "A ∩ B"], ["diff", "A \\ B"], ["comp", "Aᶜ"]], op, (v) => { op = v; update(); });
  body.append(cv.box, st.el, h("p", { class: "bench-line" }, "Press a number to move it: neither → A → B → both."), grid, ch.el);
  const inSel = (v) => (op === "union" ? v !== 0 : op === "inter" ? v === 3 : op === "diff" ? v === 1 : (v & 1) === 0);
  cv.onDraw((ctx, w, hh, p) => {
    const R = Math.min(hh / 2 - 18, w / 4), cy = hh / 2, ax = w / 2 - R * 0.55, bx = w / 2 + R * 0.55;
    for (const [cx, col] of [[ax, p.accent], [bx, p.warm]]) { ctx.fillStyle = col; ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); }
    ctx.fillStyle = p.ink; ctx.font = "800 14px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("A", ax - R * 0.75, cy - R - 4 + 16); ctx.fillText("B", bx + R * 0.75, cy - R - 4 + 16);
    const regions = { 1: [ax - R * 0.5, cy], 2: [bx + R * 0.5, cy], 3: [w / 2, cy], 0: [w * 0.12, hh - 36] }, count = { 0: 0, 1: 0, 2: 0, 3: 0 };
    m.forEach((v, i) => { const [rx, ry] = regions[v], k = count[v]++, col = k % 2, row = Math.floor(k / 2), x = rx + (v === 0 ? k * 34 : (col - 0.5) * 30), y = v === 0 ? ry : ry - R * 0.5 + row * 30 + 14, on = inSel(v);
      ctx.fillStyle = on ? p.accent : p.soft; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.fillStyle = on ? p.white : p.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.fillText(String(i + 1), x, y + 4); });
  });
  function update() {
    const A = m.filter((v) => v & 1).length, B = m.filter((v) => v & 2).length, AB = m.filter((v) => v === 3).length, U = m.filter((v) => v !== 0).length, sel = m.map((v, i) => (inSel(v) ? i + 1 : 0)).filter(Boolean);
    st.set("a", String(A)); st.set("b", String(B)); st.set("ab", String(AB)); st.set("u", String(U)); st.set("chk", `${A} + ${B} − ${AB} = ${A + B - AB}`); st.set("res", `{${sel.join(", ")}}`);
    btns.forEach((b, i) => { b.textContent = `${i + 1}: ${["–", "A", "B", "A+B"][m[i]]}`; });
    say(`Union has ${U} elements`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
