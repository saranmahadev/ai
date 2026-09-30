// The tech layer of a planet's city: luminous accents on top of the clay look. Everything is procedural (no assets) and
// mostly instanced. `createTech` makes shared materials while the planet is built; `buildCity` adds landmarks, rooftop
// tech and the animated layers (data pulses, a maglev pod, drones, billboards) and returns an object to update each frame.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { clay, tint } from "./clay.js";

const V3 = THREE.Vector3;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ---------- generated textures (built once, shared by every planet)
function canvasTexture(w, h, draw, repeat = false) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

let TEX = null;
function textures() {
  if (TEX) return TEX;
  // circuit traces for the road surface: the colour map is faint, the mask glows at night
  const r = mulberry32(20240501), traces = [];
  for (let i = 0; i < 14; i++) {
    let x = 16 + Math.floor(r() * 14) * 16, y = 16 + Math.floor(r() * 14) * 16;
    const pts = [[x, y]];
    for (let k = 0; k < 2 + Math.floor(r() * 3); k++) {
      const dir = [[1, 0], [0, 1], [1, 1], [-1, 1], [-1, 0], [0, -1]][Math.floor(r() * 6)], len = 16 * (1 + Math.floor(r() * 3));
      x = clamp(x + dir[0] * len, 12, 244); y = clamp(y + dir[1] * len, 12, 244);
      pts.push([x, y]);
    }
    traces.push(pts);
  }
  const drawTraces = (ctx, stroke, width) => {
    ctx.strokeStyle = stroke; ctx.fillStyle = stroke; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.lineCap = "round";
    for (const pts of traces) {
      ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
      for (const [px, py] of [pts[0], pts[pts.length - 1]]) { ctx.beginPath(); ctx.arc(px, py, width * 1.6, 0, 7); ctx.fill(); }
    }
  };
  const circuitColor = canvasTexture(256, 256, (ctx, w, h) => { ctx.fillStyle = "#fff3e2"; ctx.fillRect(0, 0, w, h); drawTraces(ctx, "#ead6bf", 3); }, true);
  const circuitMask = canvasTexture(256, 256, (ctx, w, h) => { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h); drawTraces(ctx, "#fff", 3); }, true);

  // windows for the houses (2 x 2 on every face)
  const wins = [[22, 26], [74, 26], [22, 74], [74, 74]], lit = [1, 0.5, 0.8, 0.3];
  const houseColor = canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
    wins.forEach(([x, y]) => { ctx.fillStyle = "#a9b9d9"; ctx.beginPath(); ctx.roundRect(x, y, 32, 30, 5); ctx.fill(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.stroke(); });
  });
  const houseMask = canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
    wins.forEach(([x, y], i) => { ctx.fillStyle = `rgba(255,255,255,${lit[i]})`; ctx.beginPath(); ctx.roundRect(x + 3, y + 3, 26, 24, 4); ctx.fill(); });
  });
  TEX = { circuitColor, circuitMask, houseColor, houseMask, panels: new Map() };
  return TEX;
}

// a holographic status panel: what a lodge shows above its door
function panelTexture(status, read) {
  const T = textures(), key = status + read;
  if (T.panels.has(key)) return T.panels.get(key);
  const tex = canvasTexture(256, 96, (ctx, w, h) => {
    const col = read ? "#9ff5d2" : status === "index" ? "#8fe6ff" : status === "outlined" ? "#c9c4ea" : "#ffe3a3";
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 4;
    if (status === "outlined") ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.roundRect(4, 4, w - 8, h - 8, 14); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 0.9;
    if (status === "index") { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(34 + i * 20, 26 + j * 20, 5, 0, 7); ctx.fill(); } }
    else if (status === "outlined") { ctx.lineWidth = 3; ctx.strokeRect(24, 24, 52, 48); }
    else { for (let i = 0; i < 4; i++) ctx.fillRect(24, 22 + i * 14, i % 2 ? 40 : 54, 7); }
    ctx.font = "800 34px Nunito, system-ui, sans-serif"; ctx.textBaseline = "middle"; ctx.globalAlpha = 1;
    ctx.fillText(read ? "READ" : status === "index" ? "HUB" : status === "outlined" ? "SOON" : "NEW", 104, h / 2 + 2);
    if (read) { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(214, 48); ctx.lineTo(226, 60); ctx.lineTo(244, 34); ctx.stroke(); }
  });
  T.panels.set(key, tex);
  return tex;
}

// ---------- materials shared while a planet is built
export function createTech({ sky }) {
  const T = textures(), cache = new Map();
  const once = (key, make) => { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); };
  const panelMats = [];
  return {
    // the cream road with a faint circuit pattern that lights up at night in the planet's colour
    roadMat(color) {
      return once("road", () => { const m = clay(0xffffff, { map: T.circuitColor, emissiveMap: T.circuitMask }); sky.addGlow(m, color, 1.0); return m; });
    },
    edgeMat(color, base) { return once("edge", () => { const m = clay(base); sky.addGlow(m, color, 1.3); return m; }); },
    houseMat() { return once("house", () => { const m = clay(0xffffff, { map: T.houseColor, emissiveMap: T.houseMask }); sky.addGlow(m, 0xffd28a, 1.0); return m; }); },
    // lodge doors: written and read glow mint, unread written glow warm, hubs glow cyan, outlined stay dark
    doorMat(status, read) {
      return once("door" + status + read, () => {
        const m = clay(read ? 0x6fd4b0 : status === "index" ? 0x5fb8d9 : status === "outlined" ? 0x8a86a8 : 0x6a5aa0);
        if (status !== "outlined") sky.addGlow(m, read ? 0x9ff5d2 : status === "index" ? 0x8fe6ff : 0xffd479, read ? 1.7 : 1.1);
        return m;
      });
    },
    panelMat(status, read) {
      return once("panel" + status + read, () => {
        const m = new THREE.MeshBasicMaterial({ map: panelTexture(status, read), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0.6 });
        panelMats.push(m);
        return m;
      });
    },
    panelMats
  };
}

// ---------- a polyline path you can sample by distance
function makePath(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const len = cum[cum.length - 1] || 1;
  return {
    len,
    at(d, outPos, outDir) {
      d = clamp(d, 0, len - 1e-4);
      let lo = 0, hi = cum.length - 1;
      while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid; }
      const f = (d - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]);
      outPos.copy(pts[lo]).lerp(pts[hi], f);
      if (outDir) outDir.copy(pts[hi]).sub(pts[lo]).normalize();
    }
  };
}

export function buildCity(ctx) {
  const { world, sky, base, frameAt, laneFrame, lanePos, surfacePoint, stand, obstacles, plan, total, houseList, lampList, lodgeList, rnd, reduce, ROAD_W, STREET_LEN } = ctx;
  const Rp = ctx.Rp;
  const glowOf = (color, k = 1) => { const m = clay(color); sky.addGlow(m, color, k); return m; };
  const dummy = new THREE.Object3D();
  const animated = [], groups = { lite: [], pulses: null, cones: null };

  // ---------- T1: smart-lamp light cones (instanced, additive, pulse at night)
  let coneMat = null;
  if (lampList.length) {
    coneMat = new THREE.MeshBasicMaterial({ color: 0xffe9b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const geo = new THREE.ConeGeometry(1.5, 3.4, 14, 1, true); geo.translate(0, -1.7, 0);
    const cones = new THREE.InstancedMesh(geo, coneMat, lampList.length);
    lampList.forEach((l, i) => { stand(dummy, l.at, l.fwd); dummy.translateY(2.75); dummy.updateMatrix(); cones.setMatrixAt(i, dummy.matrix); });
    cones.instanceMatrix.needsUpdate = true; cones.frustumCulled = false;
    world.add(cones); groups.cones = cones;
  }

  // ---------- T1: lodge terminals, instanced per panel material
  {
    const byMat = new Map();
    for (const l of lodgeList) { if (!byMat.has(l.panelMat)) byMat.set(l.panelMat, []); byMat.get(l.panelMat).push(l); }
    for (const [mat, list] of byMat) {
      const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(3.4, 1.28), mat, list.length);
      list.forEach((l, i) => { stand(dummy, l.pos, l.fwd); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
      im.instanceMatrix.needsUpdate = true; im.frustumCulled = false;
      world.add(im);
    }
  }

  // ---------- T2: district landmarks, sized by how many topics the district holds
  const gates = plan.filter((e) => e.kind === "gate");
  const billboards = [];
  gates.forEach((e, k) => {
    const fr = frameAt(e.s), side = k % 2 ? -1 : 1, d = e.d, count = d.topics.length;
    const H = 7 + Math.min(10, count * 0.9), col = d.color, type = k % 4;
    const g = new THREE.Group(), body = clay(tint(col.getHex(), 0.5)), accent = glowOf(col.getHex(), 1.3), pale = clay(0xfff3e2);
    const add = (mesh, y = 0) => { mesh.position.y += y; mesh.castShadow = true; g.add(mesh); return mesh; };
    add(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.7, 24), pale), 0.35);
    if (type === 0) { // server spire
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.75, H, 12), body), H / 2);
      for (let i = 0; i < 3; i++) { const ring = add(new THREE.Mesh(new THREE.TorusGeometry(1.0 - i * 0.18, 0.09, 8, 28), accent), H * (0.35 + i * 0.22)); ring.rotation.x = Math.PI / 2; animated.push({ o: ring, kind: "bob", ph: i, base: ring.position.y }); }
      add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), accent), H + 0.3);
    } else if (type === 1) { // radar dish
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, H * 0.7, 10), body), H * 0.35);
      const pivot = new THREE.Group(); pivot.position.y = H * 0.7; g.add(pivot);
      const dish = new THREE.Mesh(new THREE.SphereGeometry(2.3, 24, 12, 0, Math.PI * 2, 0, 0.85), body); dish.rotation.x = -Math.PI / 2 + 0.5; dish.material.side = THREE.DoubleSide; dish.castShadow = true; pivot.add(dish);
      const feed = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), accent); feed.position.set(0, 1.0, 1.0); pivot.add(feed);
      animated.push({ o: pivot, kind: "spin", speed: 0.35 });
    } else if (type === 2) { // antenna array
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2, h = H * (0.55 + 0.12 * ((i * 7) % 5)), x = Math.cos(a) * 1.3, z = Math.sin(a) * 1.3;
        const pole = add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, h, 8), body), h / 2); pole.position.x = x; pole.position.z = z;
        const tip = add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), accent), h + 0.1); tip.position.x = x; tip.position.z = z;
        animated.push({ o: tip, kind: "blink", ph: i * 1.3 });
      }
    } else { // energy core
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, H * 0.45, 12), body), H * 0.225);
      const core = add(new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 16), accent), H * 0.62);
      for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55 + i * 0.4, 0.07, 8, 32), accent); ring.position.y = H * 0.62; ring.castShadow = true; g.add(ring); animated.push({ o: ring, kind: "tumble", speed: 0.7 + i * 0.4, ph: i * 1.7 }); }
      animated.push({ o: core, kind: "pulse", ph: 0 });
    }
    const at = surfacePoint(fr, side * 9.6, 0.08);
    stand(g, at, fr.t);
    world.add(g);
    obstacles.push({ d: at.clone().normalize(), r: 1.8 });

    // a holo billboard above the plaza, on the opposite rim, facing whoever walks up the road
    const bb = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.3), new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, opacity: 0.7 }));
    const draw = () => {
      bb.material.map = canvasTexture(512, 132, (ctx, w, h) => {
        const hex = "#" + col.getHexString();
        ctx.strokeStyle = hex; ctx.fillStyle = hex; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(5, 5, w - 10, h - 10, 22); ctx.stroke();
        ctx.font = "800 62px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffffff"; ctx.fillText(d.title, w / 2, h / 2 + 3);
      });
      bb.material.needsUpdate = true;
    };
    draw();
    if (document.fonts && document.fonts.load) document.fonts.load("800 62px Nunito").then(draw).catch(() => {});
    stand(bb, surfacePoint(fr, -side * 9.6, 10.5), fr.t.clone().negate());
    world.add(bb);
    billboards.push(bb);
    groups.lite.push(bb);
  });

  // ---------- T2: rooftop masts and dishes on some houses
  {
    const picks = houseList.filter(() => rnd() < 0.45);
    if (picks.length) {
      const mastGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.1, 6), dishGeo = new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, 0.9);
      const masts = new THREE.InstancedMesh(mastGeo, clay(0xfff3e2), picks.length), dishes = new THREE.InstancedMesh(dishGeo, clay(0xe8e2f7), picks.length);
      dishes.material.side = THREE.DoubleSide;
      picks.forEach((h, i) => {
        stand(dummy, h.at, h.fwd); dummy.translateY(4.55); dummy.updateMatrix(); masts.setMatrixAt(i, dummy.matrix);
        stand(dummy, h.at, h.fwd); dummy.translateY(5.0); dummy.rotateX(-1.1); dummy.updateMatrix(); dishes.setMatrixAt(i, dummy.matrix);
      });
      masts.castShadow = dishes.castShadow = true;
      world.add(masts, dishes);
    }
  }

  // ---------- T2: a terminal beside each district kiosk
  for (const e of plan.filter((p) => p.kind === "kiosk")) {
    const fr = frameAt(e.s), sgn = Math.sign(e.lat || 1);
    const t = new THREE.Group();
    const post = new THREE.Mesh(new RoundedBoxGeometry(0.9, 2.2, 0.7, 3, 0.15), clay(tint(e.d.color.getHex(), 0.45))); post.position.y = 1.1;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.9), new THREE.MeshBasicMaterial({ map: panelTexture("index", false), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0.85 }));
    screen.position.set(0, 1.45, 0.36); post.castShadow = true;
    t.add(post, screen);
    const at = surfacePoint(fr, e.lat + sgn * 2.4, 0.1);
    stand(t, at, fr.r.clone().multiplyScalar(-sgn));
    world.add(t);
    obstacles.push({ d: at.clone().normalize(), r: 0.75 });
  }

  // ---------- T3: paths for pulses, the pod and the drones
  const roadPts = [];
  for (let s = 0; s <= total - 0.6; s += 3) roadPts.push(surfacePoint(frameAt(s), 0, 0.55));
  const roadPath = makePath(roadPts);
  const streets = plan.filter((e) => e.kind === "street").map((e) => {
    const fr = frameAt(e.s), pts = [];
    for (let u = ROAD_W; u <= STREET_LEN + 1; u += 3) pts.push(lanePos(laneFrame(fr, e.side, u), 0, 0.55));
    return { e, path: makePath(pts) };
  });

  // data pulses: light packets running along the road and down each street to its lodge
  const roadPulses = Math.max(8, Math.min(22, Math.round(roadPath.len / 28)));
  const pulses = [];
  for (let i = 0; i < roadPulses; i++) pulses.push({ path: roadPath, off: (i / roadPulses) * roadPath.len, speed: 8, color: base });
  streets.forEach((s, i) => pulses.push({ path: s.path, off: rnd() * s.path.len, speed: 5.5, color: s.e.d.color }));
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const pulseMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 8, 6), pulseMat, pulses.length);
  pulses.forEach((p, i) => pulseMesh.setColorAt(i, new THREE.Color(p.color).lerp(new THREE.Color(0xffffff), 0.35)));
  pulseMesh.frustumCulled = false;
  world.add(pulseMesh);
  groups.pulses = { mesh: pulseMesh, all: pulses.length };

  // maglev pod gliding above the road, high enough to pass through every arch
  const pod = new THREE.Group();
  const podBody = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), clay(0xffffff)); podBody.scale.set(0.85, 0.5, 2.3); podBody.castShadow = true;
  const podGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 20), glowOf(base.getHex(), 1.6)); podGlow.position.y = -0.5;
  const podFin = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.5, 1.0, 2, 0.04), clay(base.getHex())); podFin.position.set(0, 0.45, -1.2);
  pod.add(podBody, podGlow, podFin);
  world.add(pod);
  groups.pod = pod;

  // drones patrolling the streets
  const drones = [];
  const droneCount = Math.min(6, streets.length);
  for (let i = 0; i < droneCount; i++) {
    const s = streets[(i * 5 + 1) % streets.length], g = new THREE.Group();
    const bodyM = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.26, 0.75, 3, 0.1), clay(0xffffff)); bodyM.castShadow = true;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), glowOf(s.e.d.color.getHex(), 1.6)); eye.position.set(0, -0.12, 0.34);
    const rotors = [];
    for (const [x, z] of [[0.5, 0.5], [-0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12), clay(0xe8e2f7)); r.position.set(x, 0.18, z); g.add(r); rotors.push(r); }
    g.add(bodyM, eye);
    world.add(g);
    drones.push({ g, rotors, path: s.path, off: rnd() * s.path.len * 2, speed: 3.2 + rnd() * 1.6, ph: rnd() * 6 });
    groups.lite.push(g);
  }

  // ---------- per-frame update
  const pos = new V3(), dir = new V3(), out = new V3();
  let lite = false;
  return {
    setDetail(level) {
      lite = level === "lite";
      groups.lite.forEach((o) => { o.visible = !lite; });
      if (groups.cones) groups.cones.visible = !lite;
      groups.pulses.mesh.count = lite ? Math.ceil(groups.pulses.all / 2) : groups.pulses.all;
    },
    update(dt, t, night, panelMats) {
      const move = reduce ? 0 : 1, tt = t * move;
      if (coneMat) coneMat.opacity = 0.2 * night * (0.85 + 0.15 * Math.sin(t * 1.3));
      for (const m of panelMats) m.opacity = 0.5 + 0.4 * night;
      for (const a of animated) {
        if (!move) continue;
        if (a.kind === "spin") a.o.rotation.y = tt * a.speed;
        else if (a.kind === "tumble") { a.o.rotation.x = tt * a.speed + a.ph; a.o.rotation.z = tt * a.speed * 0.6; }
        else if (a.kind === "bob") a.o.position.y = a.base + Math.sin(tt * 1.2 + a.ph) * 0.25;
        else if (a.kind === "blink") a.o.scale.setScalar(0.7 + 0.5 * (0.5 + 0.5 * Math.sin(tt * 3 + a.ph)));
        else if (a.kind === "pulse") a.o.scale.setScalar(1 + 0.08 * Math.sin(tt * 2.4));
      }
      // pulses
      const n = groups.pulses.mesh.count, scale = 0.8 + 0.6 * night;
      for (let i = 0; i < n; i++) {
        const p = pulses[i];
        p.path.at(((p.off + tt * p.speed) % p.path.len + p.path.len) % p.path.len, pos, null);
        dummy.position.copy(pos); dummy.quaternion.identity(); dummy.scale.setScalar(scale); dummy.updateMatrix();
        groups.pulses.mesh.setMatrixAt(i, dummy.matrix);
      }
      groups.pulses.mesh.instanceMatrix.needsUpdate = true;
      // pod: back and forth along the road
      { const L = roadPath.len, ph = ((tt * 9) % (2 * L)), d = ph < L ? ph : 2 * L - ph, fwd = ph < L ? 1 : -1;
        roadPath.at(d, pos, dir); pos.normalize().multiplyScalar(Rp + 6.6); dir.multiplyScalar(fwd);
        stand(pod, pos, dir); }
      // drones
      if (!lite) for (const dr of drones) {
        const L = dr.path.len, ph = ((dr.off + tt * dr.speed) % (2 * L)), d = ph < L ? ph : 2 * L - ph, fwd = ph < L ? 1 : -1;
        dr.path.at(d, pos, dir); out.copy(pos).normalize().multiplyScalar(Rp + 5 + Math.sin(tt * 1.7 + dr.ph) * 0.9); dir.multiplyScalar(fwd);
        stand(dr.g, out, dir);
        if (move) for (const r of dr.rotors) r.rotation.y = tt * 40;
      }
    }
  };
}
