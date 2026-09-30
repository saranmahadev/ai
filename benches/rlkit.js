// Canvas drawing for the reinforcement-learning grid world (the maths lives in mlkit.js).
export function gridLayout(m, w, hh) { const cell = Math.floor(Math.min((w - 8) / m.w, (hh - 8) / m.h)), x0 = Math.round((w - cell * m.w) / 2), y0 = Math.round((hh - cell * m.h) / 2); return { cell, x0, y0, at: (s) => ({ x: x0 + (s % m.w) * cell, y: y0 + ((s / m.w) | 0) * cell }), hit: (px, py) => { const cx = Math.floor((px - x0) / cell), cy = Math.floor((py - y0) / cell); return cx >= 0 && cy >= 0 && cx < m.w && cy < m.h ? cy * m.w + cx : -1; } }; }
const ARROW = [[0, -1], [1, 0], [0, 1], [-1, 0]];
export function drawGrid(ctx, m, w, hh, p, { values = null, pol = null, agent = null, vmax = 1, labels = true } = {}) {
  const L = gridLayout(m, w, hh);
  for (let s = 0; s < m.S; s++) {
    const { x, y } = L.at(s), c = L.cell;
    if (m.isWall(s)) { ctx.fillStyle = p.muted; ctx.globalAlpha = 0.5; ctx.fillRect(x + 2, y + 2, c - 4, c - 4); ctx.globalAlpha = 1; continue; }
    ctx.fillStyle = s === m.goal ? p.good : s === m.pit ? p.warm : p.soft2; ctx.globalAlpha = s === m.goal || s === m.pit ? 0.55 : 0.5;
    if (values && !m.isTerm(s)) { const v = Math.max(-1, Math.min(1, values[s] / vmax)); ctx.fillStyle = v >= 0 ? p.good : p.warm; ctx.globalAlpha = 0.12 + 0.6 * Math.abs(v); }
    ctx.fillRect(x + 2, y + 2, c - 4, c - 4); ctx.globalAlpha = 1;
    ctx.fillStyle = p.ink; ctx.font = "800 12px Nunito, system-ui"; ctx.textAlign = "center";
    if (s === m.goal) ctx.fillText("+1", x + c / 2, y + c / 2 + 4); else if (s === m.pit) ctx.fillText("−1", x + c / 2, y + c / 2 + 4);
    else { if (labels && values) ctx.fillText(values[s].toFixed(2), x + c / 2, y + c - 8); if (pol && pol[s] >= 0) { const [dx, dy] = ARROW[pol[s]], cx = x + c / 2, cy = y + c / 2 - (values && labels ? 6 : 0), len = c * 0.26; ctx.strokeStyle = p.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - dx * len, cy - dy * len); ctx.lineTo(cx + dx * len, cy + dy * len); ctx.stroke(); ctx.fillStyle = p.ink; ctx.beginPath(); ctx.moveTo(cx + dx * len, cy + dy * len); ctx.lineTo(cx + dx * len - dx * 6 - dy * 5, cy + dy * len - dy * 6 + dx * 5); ctx.lineTo(cx + dx * len - dx * 6 + dy * 5, cy + dy * len - dy * 6 - dx * 5); ctx.fill(); } else if (pol && pol[s] === -1) { ctx.fillText("?", x + c / 2, y + c / 2 + 4); } }
  }
  if (agent != null) { const { x, y } = L.at(agent); ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(x + L.cell / 2, y + L.cell / 2, L.cell * 0.14, 0, 7); ctx.fill(); }
  ctx.fillStyle = p.muted; ctx.font = "700 10px Nunito, system-ui"; ctx.textAlign = "left"; const st = L.at(m.start); ctx.fillText("start", st.x + 5, st.y + 13);
  return L;
}
