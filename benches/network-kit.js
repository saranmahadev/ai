// Shared by the two tiny-network benches: the forward and backward maths of a 2-2-1 network and its diagram.
export const sg = (z) => 1 / (1 + Math.exp(-z));
export function forward(net, x) {
  const z1 = net.W1.map((r, i) => r[0] * x[0] + r[1] * x[1] + net.b1[i]), a1 = z1.map((v) => Math.max(0, v)), z2 = a1[0] * net.w2[0] + a1[1] * net.w2[1] + net.b2, y = sg(z2);
  return { z1, a1, z2, y, L: -Math.log(Math.max(1e-12, y)) };
}
export function backward(net, x, f, t = 1) {
  const dz2 = f.y - t, dw2 = f.a1.map((a) => dz2 * a), da1 = net.w2.map((w) => dz2 * w), dz1 = f.z1.map((z, i) => (z > 0 ? da1[i] : 0));
  return { dz2, dw2, db2: dz2, da1, dz1, dW1: dz1.map((g) => [g * x[0], g * x[1]]), db1: dz1 };
}
export function drawNet(ctx, w, hh, p, { x, net, f, g, show }) {
  const fmt = (v) => (Math.abs(v) < 0.0005 ? "0" : (Math.round(v * 1000) / 1000).toString());
  const pos = { x1: [0.1, 0.3], x2: [0.1, 0.7], h1: [0.42, 0.3], h2: [0.42, 0.7], o: [0.8, 0.5] }, P = (k) => [pos[k][0] * w, pos[k][1] * hh];
  const edges = [["x1", "h1", net.W1[0][0]], ["x2", "h1", net.W1[0][1]], ["x1", "h2", net.W1[1][0]], ["x2", "h2", net.W1[1][1]], ["h1", "o", net.w2[0]], ["h2", "o", net.w2[1]]];
  ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
  for (const [a, b, wt] of edges) { const A = P(a), B = P(b); ctx.strokeStyle = wt >= 0 ? p.accent : p.warm; ctx.globalAlpha = 0.55; ctx.lineWidth = 1 + Math.min(4, Math.abs(wt) * 2); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.globalAlpha = 1; ctx.fillStyle = p.muted; ctx.fillText(fmt(wt), (A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 5); }
  const nodes = [["x1", "x₁", x[0], null, 0], ["x2", "x₂", x[1], null, 0], ["h1", "h₁", f && show >= 2 ? f.a1[0] : null, f && show >= 1 ? f.z1[0] : null, 1], ["h2", "h₂", f && show >= 2 ? f.a1[1] : null, f && show >= 1 ? f.z1[1] : null, 1], ["o", "ŷ", f && show >= 4 ? f.y : null, f && show >= 3 ? f.z2 : null, 2]];
  for (const [k, name, val, pre, layer] of nodes) { const [cx, cy] = P(k); ctx.fillStyle = val !== null || pre !== null || layer === 0 ? p.accent : p.soft; ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = p.ink; ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.fillText(name, cx, cy - 8); ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.fillText(val !== null ? fmt(val) : "?", cx, cy + 8);
    if (pre !== null && layer > 0) { ctx.fillStyle = p.muted; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.fillText("z = " + fmt(pre), cx, cy + 40); }
    if (g && g[k] !== undefined && g[k] !== null) { ctx.fillStyle = p.warm; ctx.font = "800 10px Nunito, system-ui, sans-serif"; ctx.fillText("∂L/∂z = " + fmt(g[k]), cx, cy - 34); } }
}
