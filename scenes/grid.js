// The knowledge grid: light arcs between topics whose notes link to each other (a visible map of how ideas connect),
// and a radar minimap that shows the streets around you, which lodges you have read, and where the next unread one is.
import * as THREE from "three";

const V3 = THREE.Vector3;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ---------- connection beams
// signs: [{ idx, topic, beamAt: V3 }], content: the site content index
export function buildGrid({ world, Rp, base, signs, content }) {
  const idxOf = new Map(signs.map((s) => [s.topic.id, s.idx]));
  const seen = new Set(), arcs = [];
  for (const s of signs) {
    const links = (content.topics[s.topic.id] && content.topics[s.topic.id].links) || [];
    for (const l of links) {
      const j = idxOf.get(l);
      if (j === undefined || j === s.idx) continue;
      const a = Math.min(s.idx, j), b = Math.max(s.idx, j), key = a + "-" + b;
      if (seen.has(key)) continue;
      seen.add(key); arcs.push([a, b]);
    }
  }
  const SEG = 16, pos = new Float32Array(arcs.length * SEG * 2 * 3), colors = new Float32Array(pos.length);
  const q = new V3(), c = new V3(), mid = new V3();
  arcs.forEach(([a, b], i) => {
    const A = signs[a].beamAt, B = signs[b].beamAt, chord = A.distanceTo(B);
    const peak = 4 + Math.min(chord * 0.26, 26);
    mid.copy(A).add(B).normalize();
    c.copy(mid).multiplyScalar(Rp + 2 * peak - 3.6);
    let prev = A.clone();
    for (let k = 1; k <= SEG; k++) {
      const t = k / SEG, u = 1 - t;
      q.set(0, 0, 0).addScaledVector(A, u * u).addScaledVector(c, 2 * u * t).addScaledVector(B, t * t);
      const o = (i * SEG + (k - 1)) * 6;
      pos.set([prev.x, prev.y, prev.z, q.x, q.y, q.z], o);
      prev.copy(q);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  world.add(lines);

  const dim = base.clone().multiplyScalar(0.75), bright = base.clone().lerp(new THREE.Color(0xffffff), 0.75);
  let hi = -2;
  function paint(hiIdx) {
    hi = hiIdx;
    arcs.forEach(([a, b], i) => {
      const on = hiIdx >= 0 && (a === hiIdx || b === hiIdx), col = on ? bright : dim;
      for (let v = 0; v < SEG * 2; v++) colors.set([col.r, col.g, col.b], (i * SEG * 2 + v) * 3);
    });
    geo.attributes.color.needsUpdate = true;
  }
  paint(-1);
  return {
    count: arcs.length,
    setVisible(v) { lines.visible = !!v; },
    setNear(idx) { if (idx !== hi) paint(idx); }
  };
}

// ---------- radar minimap
// A 2D canvas centred on the walker with the heading pointing up. Positions use an azimuthal projection, so distances
// from the walker are true (in world units) and directions are true.
export function createRadar(canvas, { Rp }) {
  const g = canvas.getContext("2d"), L = new V3(), t = new V3();
  const RANGE = 70;
  let size = 0;
  const fit = () => {
    const css = canvas.clientWidth || 168, dpr = Math.min(2, devicePixelRatio || 1), px = Math.round(css * dpr);
    if (canvas.width !== px) { canvas.width = canvas.height = px; size = px; }
    return { px, dpr };
  };
  function project(dir, P, H, out) {
    const cosT = clamp(dir.dot(P), -1, 1), th = Math.acos(cosT);
    t.copy(dir).addScaledVector(P, -cosT);
    const len = t.length();
    if (len < 1e-7) { out.x = out.y = out.r = 0; return out; }
    out.r = th * Rp;
    out.x = (-t.dot(L) / len) * out.r;
    out.y = (-t.dot(H) / len) * out.r;
    return out;
  }
  const pt = { x: 0, y: 0, r: 0 };
  return {
    // s: { P, H, samples, signs (with dir, laneDirs, read), gates (dir, color), nextIdx, now }
    draw(s) {
      const { px, dpr } = fit(), R = px / 2 - 5 * dpr, k = R / RANGE, cx = px / 2, cy = px / 2;
      L.crossVectors(s.P, s.H);
      g.clearRect(0, 0, px, px);
      g.fillStyle = "rgba(22, 18, 54, 0.62)"; g.beginPath(); g.arc(cx, cy, px / 2 - 1, 0, 7); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.14)"; g.lineWidth = dpr;
      for (const f of [0.34, 0.67, 1]) { g.beginPath(); g.arc(cx, cy, R * f, 0, 7); g.stroke(); }
      g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
      const cosLim = Math.cos((RANGE * 1.15) / Rp);
      // the main road
      g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 3 * dpr; g.lineCap = "round"; g.lineJoin = "round";
      let open = false;
      g.beginPath();
      for (let i = 0; i < s.samples.length; i += 2) {
        if (s.samples[i].dot(s.P) < cosLim) { open = false; continue; }
        project(s.samples[i], s.P, s.H, pt);
        if (open) g.lineTo(cx + pt.x * k, cy + pt.y * k); else { g.moveTo(cx + pt.x * k, cy + pt.y * k); open = true; }
      }
      g.stroke();
      // streets
      g.strokeStyle = "rgba(255,255,255,0.32)"; g.lineWidth = 2 * dpr;
      for (const sg of s.signs) {
        if (!sg.laneDirs || sg.laneDirs[sg.laneDirs.length - 1].dot(s.P) < cosLim - 0.02 && sg.laneDirs[0].dot(s.P) < cosLim) continue;
        g.beginPath();
        sg.laneDirs.forEach((d, i) => { project(d, s.P, s.H, pt); if (i) g.lineTo(cx + pt.x * k, cy + pt.y * k); else g.moveTo(cx + pt.x * k, cy + pt.y * k); });
        g.stroke();
      }
      // arches
      for (const gt of s.gates) {
        project(gt.dir, s.P, s.H, pt);
        g.fillStyle = gt.color; g.beginPath(); g.moveTo(cx + pt.x * k, cy + pt.y * k - 5 * dpr); g.lineTo(cx + pt.x * k + 4 * dpr, cy + pt.y * k); g.lineTo(cx + pt.x * k, cy + pt.y * k + 5 * dpr); g.lineTo(cx + pt.x * k - 4 * dpr, cy + pt.y * k); g.fill();
      }
      // lodges and kiosks: filled = read, ring = unread
      for (const sg of s.signs) {
        project(sg.dir, s.P, s.H, pt);
        const x = cx + pt.x * k, y = cy + pt.y * k, r = (sg.laneDirs ? 3.2 : 2.6) * dpr;
        g.beginPath(); g.arc(x, y, r, 0, 7);
        if (sg.read) { g.fillStyle = "#9ff5d2"; g.fill(); } else { g.strokeStyle = sg.color; g.lineWidth = 1.6 * dpr; g.stroke(); }
      }
      g.restore();
      // the next unread lodge: a pulsing ring, or an arrow at the edge when it is out of range
      const nx = s.signs[s.nextIdx];
      if (nx) {
        project(nx.dir, s.P, s.H, pt);
        const pulse = 0.5 + 0.5 * Math.sin(s.now * 0.004);
        if (pt.r <= RANGE) {
          g.strokeStyle = "#ffe3a3"; g.lineWidth = 1.8 * dpr; g.beginPath(); g.arc(cx + pt.x * k, cy + pt.y * k, (5.5 + pulse * 2.5) * dpr, 0, 7); g.stroke();
        } else {
          const a = Math.atan2(pt.y, pt.x), ex = cx + Math.cos(a) * (R - 4 * dpr), ey = cy + Math.sin(a) * (R - 4 * dpr);
          g.fillStyle = "#ffe3a3"; g.save(); g.translate(ex, ey); g.rotate(a);
          g.beginPath(); g.moveTo(5 * dpr, 0); g.lineTo(-4 * dpr, -4.5 * dpr); g.lineTo(-4 * dpr, 4.5 * dpr); g.closePath(); g.fill(); g.restore();
        }
      }
      // you
      g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(cx, cy - 6 * dpr); g.lineTo(cx + 4.5 * dpr, cy + 5 * dpr); g.lineTo(cx, cy + 2.5 * dpr); g.lineTo(cx - 4.5 * dpr, cy + 5 * dpr); g.closePath(); g.fill();
      void size;
    }
  };
}
