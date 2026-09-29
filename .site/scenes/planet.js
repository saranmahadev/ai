import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { clay, tint, skyTexture } from "./clay.js";
import { createRocket } from "../models/rocket.js";
import { createAstronaut } from "../models/astronaut.js";

const V3 = THREE.Vector3;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const UP = new V3(0, 1, 0);

const SHADOW = matchMedia("(pointer: coarse)").matches ? 1024 : 2048; // lighter shadows on phones
const NEAR = 7.5;          // how close (world units) you must be to a signpost to interact with it
const SPACING = 9;         // road distance between signposts
const GATE_GAP = 12;       // road distance around a district gate
const ROAD_W = 2.7;        // road half width

let lastVisit = null;      // { planetId, topicId }: the last topic you opened, so you come back to its signpost

// A small clay planet you walk around. The road winds over its surface; districts are gates, topics are signposts.
export function create({ content, labelsEl, onNear, onProgress, onOpen, onBack }) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.background = skyTexture([[0, "#bfe0ff"], [0.55, "#f1ecff"], [1, "#ffe9e0"]]);
  scene.fog = new THREE.FogExp2(0xf1ecff, 0.0045);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 900);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8ccfa, 2.0);
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(SHADOW, SHADOW);
  Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 140 });
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.05; sun.shadow.radius = 5;
  scene.add(hemi, sun, sun.target);

  const astro = createAstronaut();
  const char = astro.group;
  char.scale.setScalar(1.15);
  scene.add(char);
  const { group: rocket, flame } = createRocket();
  scene.add(rocket);

  // smoke used for the landing
  const smoke = Array.from({ length: 18 }, () => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), clay(0xffffff, { roughness: 1, clearcoat: 0, transparent: true, opacity: 0 }));
    m.visible = false; m.userData = { life: 0, v: new V3() };
    scene.add(m);
    return m;
  });
  let smokeIdx = 0;

  // ---- per-planet state
  let world = null, planet = null, Rp = 40, active = false;
  let samples = [], cum = [], total = 0;
  let signs = [], gates = [], rocketInfo = null, topicList = [], obstacles = [];
  let P = new V3(1, 0, 0), H = new V3(0, 0, 1);
  let opening = null;
  let mode = "walk", landT = 0, popT = 1, cam0 = new V3(), padDir = new V3();
  let target = null, near = null, reportedNear = undefined, reportedIdx = -1, frame = 0;
  const keys = {}, stick = { x: 0, y: 0 };
  let showLabels = true;

  // ---------- geometry helpers
  const sph = (lat, lon) => new V3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));
  const pathPoint = (u, turns) => {
    const phiMax = Math.min(0.8, turns * 0.45);
    return sph(phiMax * (1 - 2 * u) + 0.07 * Math.sin(u * turns * Math.PI * 2 * 2.3), u * turns * Math.PI * 2);
  };
  const measure = (turns, radius) => {
    let len = 0, prev = pathPoint(0, turns);
    for (let i = 1; i <= 300; i++) { const p = pathPoint(i / 300, turns); len += p.distanceTo(prev) * radius; prev = p; }
    return len;
  };

  function frameAt(s) {
    s = clamp(s, 0, total - 0.01);
    let lo = 0, hi = cum.length - 1;
    while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
    const f = (s - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]);
    const p = samples[lo].clone().lerp(samples[hi], f).normalize();
    const t = samples[hi].clone().sub(samples[lo]);
    t.addScaledVector(p, -t.dot(p)).normalize();
    return { p, t, r: new V3().crossVectors(p, t) };
  }
  const surfacePoint = (fr, side, lift) => fr.p.clone().multiplyScalar(Rp).addScaledVector(fr.r, side).normalize().multiplyScalar(Rp + lift);
  const basisQuat = (r, u, f) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(r, u, f));
  // orient an object so +y is the surface normal and +z runs along the road
  function stand(obj, pos, fwd) {
    const up = pos.clone().normalize();
    const f = fwd.clone().addScaledVector(up, -fwd.dot(up)).normalize();
    obj.position.copy(pos);
    obj.quaternion.copy(basisQuat(new V3().crossVectors(up, f), up, f));
  }

  function ribbon(s0, s1, off, halfW, lift, material) {
    const pos = [], nrm = [], idx = [];
    let n = 0;
    for (let s = s0; s <= s1 + 0.001; s += 1.2) {
      const fr = frameAt(Math.min(s, s1));
      for (const side of [off - halfW, off + halfW]) {
        const v = surfacePoint(fr, side, lift);
        pos.push(v.x, v.y, v.z); nrm.push(fr.p.x, fr.p.y, fr.p.z);
      }
      if (n > 0) { const a = (n - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      n++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
    g.setIndex(idx);
    material.side = THREE.DoubleSide;
    const m = new THREE.Mesh(g, material);
    m.receiveShadow = true;
    return m;
  }

  // ---------- building a planet
  function labelFor(text, cls, color) {
    const el = document.createElement("button");
    el.className = `tlabel ${cls}`;
    el.style.setProperty("--c", color);
    el.tabIndex = -1;
    el.textContent = text;
    el.style.opacity = "0";
    labelsEl.appendChild(el);
    return el;
  }

  function build(p) {
    planet = p;
    world = new THREE.Group();
    scene.add(world);
    signs = []; gates = []; topicList = []; obstacles = [];
    const base = new THREE.Color(p.color);

    const districts = p.districts.map((d, k) => ({
      id: d.id, title: d.title, color: base.clone().offsetHSL(k * 0.06, 0.02, 0), topics: d.topics.map((id) => content.topics[id]).filter(Boolean)
    }));
    const N = districts.reduce((n, d) => n + d.topics.length, 0);
    Rp = clamp(24 + N * 0.95, 30, 72);

    // road length needed: pad + (gate + topics per district) + finish
    const showGates = districts.length > 1;
    const need = 26 + districts.reduce((n, d) => n + (showGates ? GATE_GAP : 0) + d.topics.length * SPACING, 0) + 22;
    let lo = 0.05, hi = 5;
    for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (measure(mid, Rp) < need) lo = mid; else hi = mid; }
    const turns = hi;
    const M = 900;
    samples = []; cum = [0];
    for (let i = 0; i <= M; i++) samples.push(pathPoint(i / M, turns));
    for (let i = 1; i <= M; i++) cum.push(cum[i - 1] + samples[i].distanceTo(samples[i - 1]) * Rp);
    total = cum[M];

    // planet body
    const body = new THREE.Mesh(new THREE.SphereGeometry(Rp, 128, 96), clay(tint(p.color, 0.6)));
    body.receiveShadow = true;
    body.userData.ground = true;
    world.add(body);

    // road: cream track with coloured edges
    world.add(ribbon(0, total, 0, ROAD_W, 0.06, clay(0xfff3e2)));
    world.add(ribbon(0, total, -ROAD_W - 0.15, 0.32, 0.1, clay(base.clone().multiplyScalar(0.88))));
    world.add(ribbon(0, total, ROAD_W + 0.15, 0.32, 0.1, clay(base.clone().multiplyScalar(0.88))));

    // gates, signposts
    let s = 26;
    districts.forEach((d, k) => {
      if (showGates) {
        s += GATE_GAP / 2;
        const fr = frameAt(s);
        const gate = new THREE.Group();
        const mat = clay(d.color);
        for (const x of [-ROAD_W - 1.4, ROAD_W + 1.4]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 5, 16), mat);
          post.position.set(x, 2.5, 0); post.castShadow = true; gate.add(post);
        }
        const arch = new THREE.Mesh(new THREE.TorusGeometry(ROAD_W + 1.4, 0.3, 14, 40, Math.PI), mat);
        arch.position.y = 5; arch.castShadow = true; gate.add(arch);
        for (const x of [-ROAD_W - 1.4, ROAD_W + 1.4]) obstacles.push({ d: surfacePoint(fr, x, 0).normalize(), r: 0.5 });
        stand(gate, fr.p.clone().multiplyScalar(Rp + 0.05), fr.t);
        world.add(gate);
        const lbl = labelFor(d.title, "gate", d.color.getStyle());
        gates.push({ pos: fr.p.clone().multiplyScalar(Rp + 8), label: lbl });
        s += GATE_GAP / 2;
      }
      d.topics.forEach((t, j) => {
        const fr = frameAt(s);
        const side = (signs.length % 2 ? -1 : 1) * 4.6;
        const g = new THREE.Group();
        const c = clay(d.color);
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.05, 0.2, 24), clay(0xfff3e2));
        disc.position.y = 0.1;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.8, 12), clay(0xfff3e2));
        pole.position.y = 1.4;
        let head;
        if (t.status === "outlined") {
          head = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.22, 16, 32), clay(tint(d.color.getHex(), 0.55)));
        } else if (t.status === "index") {
          head = new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.3, 1.3, 5, 0.4), c);
          head.rotation.set(0.6, 0.6, 0);
        } else {
          head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 24), c);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.07, 10, 40), clay(0xfff3e2));
          ring.rotation.x = 1.2; head.add(ring);
        }
        head.position.y = 3.5;
        head.castShadow = pole.castShadow = disc.castShadow = true;
        head.userData.sign = signs.length;
        g.add(disc, pole, head);
        stand(g, surfacePoint(fr, side, 0.06), fr.t);
        obstacles.push({ d: surfacePoint(fr, side, 0).normalize(), r: 0.9 });
        world.add(g);
        const lbl = labelFor(t.title, `topic ${t.status}`, d.color.getStyle());
        lbl.addEventListener("click", () => walkTo(signs.find((x) => x.label === lbl), true));
        const idx = signs.length;
        signs.push({ idx, topic: t, district: d.title, group: g, head, label: lbl, s, roadPos: fr.p.clone().multiplyScalar(Rp), pos: new V3() });
        topicList.push(t.id);
        s += SPACING;
      });
    });

    // finish flag
    {
      const fr = frameAt(total - 6);
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4, 10), clay(0xfff3e2));
      pole.position.y = 2;
      const flag = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.1), clay(0xff8f8f));
      flag.position.set(1, 3.4, 0);
      g.add(pole, flag);
      g.traverse((o) => { o.castShadow = true; });
      stand(g, surfacePoint(fr, 0, 0.06), fr.t);
      world.add(g);
    }

    // decor: trees, rocks and clouds away from the road
    const roadDirs = samples.filter((_, i) => i % 6 === 0);
    const nearRoad = (d, clearance) => roadDirs.some((q) => q.dot(d) > Math.cos(clearance / Rp));
    const tmp = new THREE.Object3D();
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.6, 8), leafGeo = new THREE.SphereGeometry(1.4, 14, 10), rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const nTrees = Math.min(170, Math.floor((Rp * Rp) / 38));
    const trunks = new THREE.InstancedMesh(trunkGeo, clay(0xd9b38c), nTrees);
    const leaves = new THREE.InstancedMesh(leafGeo, clay(0xffffff), nTrees);
    const palette = [0x9fe3b4, 0xb8e6a0, 0xffc9d9, 0xc9b8ff, 0xa8dcf5].map((h) => new THREE.Color(h));
    let placed = 0;
    for (let tries = 0; tries < nTrees * 6 && placed < nTrees; tries++) {
      const d = new V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
      if (nearRoad(d, 9)) continue;
      const sc = rand(0.8, 1.6);
      const q = new THREE.Quaternion().setFromUnitVectors(UP, d);
      tmp.quaternion.copy(q); tmp.scale.setScalar(sc);
      tmp.position.copy(d).multiplyScalar(Rp + 0.8 * sc); tmp.updateMatrix(); trunks.setMatrixAt(placed, tmp.matrix);
      tmp.position.copy(d).multiplyScalar(Rp + 2.4 * sc); tmp.updateMatrix(); leaves.setMatrixAt(placed, tmp.matrix);
      leaves.setColorAt(placed, palette[placed % palette.length]);
      obstacles.push({ d, r: 0.4 * sc + 0.15 });
      placed++;
    }
    trunks.count = leaves.count = placed;
    trunks.castShadow = leaves.castShadow = true;
    world.add(trunks, leaves);
    const rocks = new THREE.InstancedMesh(rockGeo, clay(0xcfc4e6), 46);
    let rp = 0;
    for (let tries = 0; tries < 300 && rp < 46; tries++) {
      const d = new V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
      if (nearRoad(d, 6)) continue;
      tmp.position.copy(d).multiplyScalar(Rp + 0.2);
      tmp.quaternion.setFromUnitVectors(UP, d);
      const rx = rand(0.5, 1.4), rz = rand(0.5, 1.4);
      tmp.scale.set(rx, rand(0.4, 0.8), rz);
      obstacles.push({ d, r: Math.max(rx, rz) * 0.85 });
      tmp.updateMatrix(); rocks.setMatrixAt(rp++, tmp.matrix);
    }
    rocks.count = rp; rocks.castShadow = true;
    world.add(rocks);
    const cloudMat = clay(0xffffff, { roughness: 0.9, clearcoat: 0 });
    for (let k = 0; k < 26; k++) {
      const grp = new THREE.Group();
      const puffs = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < puffs; j++) {
        const pf = new THREE.Mesh(new THREE.SphereGeometry(rand(2, 3.6), 20, 14), cloudMat);
        pf.position.set(j * 3 - puffs * 1.4, rand(-0.5, 0.5), rand(-1, 1)); pf.scale.y = 0.75; grp.add(pf);
      }
      const d = new V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
      stand(grp, d.multiplyScalar(Rp + rand(20, 40)), new V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)));
      world.add(grp);
    }

    // rocket pad and starting frame
    const padFr = frameAt(5);
    padDir = surfacePoint(padFr, 8, 0).normalize();
    const padMat = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.3, 40), clay(0xfff3e2));
    padMat.castShadow = padMat.receiveShadow = true;
    stand(padMat, padDir.clone().multiplyScalar(Rp + 0.1), padFr.t);
    world.add(padMat);
    rocketInfo = { pos: padDir.clone().multiplyScalar(Rp + 4), fr: padFr };
    obstacles.push({ d: padDir.clone(), r: 1.8 });
    rocket.scale.setScalar(1.15);
  }

  function dispose() {
    if (world) {
      scene.remove(world);
      world.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
      world = null;
    }
    labelsEl.innerHTML = "";
    signs = []; gates = []; target = null; near = null; reportedNear = undefined; reportedIdx = -1;
  }

  // ---------- movement
  const q = new THREE.Quaternion(), axis = new V3();
  function move(dist) {
    axis.crossVectors(P, H).normalize();
    q.setFromAxisAngle(axis, dist / Rp);
    P.applyQuaternion(q).normalize(); H.applyQuaternion(q);
  }
  // keep the walker out of trees, rocks, gate posts, signposts and the rocket: slide along whatever is in the way
  const push = new V3();
  function collide() {
    for (const o of obstacles) {
      const dist = Math.acos(clamp(P.dot(o.d), -1, 1)) * Rp, min = o.r + 0.55;
      if (dist >= min) continue;
      push.copy(P).sub(o.d);
      push.addScaledVector(P, -push.dot(P));
      if (push.lengthSq() < 1e-12) push.copy(H);
      push.normalize();
      P.addScaledVector(push, (min - dist) / Rp).normalize();
    }
  }
  function turn(a) { q.setFromAxisAngle(P, a); H.applyQuaternion(q); }
  const fixHeading = () => { H.addScaledVector(P, -H.dot(P)).normalize(); };

  function walkTo(sign, open) {
    if (!sign || mode !== "walk") return;
    target = { dir: sign.roadPos.clone().normalize(), open: !!open, stop: 2.5, idx: sign.idx };
  }

  // ---------- update
  const camPos = new V3(), look = new V3(), right = new V3(), tv = new V3(), tv2 = new V3();
  function update(dt, t) {
    if (!world || !active) return;
    frame++;
    const charPos = tv2.copy(P).multiplyScalar(Rp + 0.1);

    if (mode === "landing") {
      landT = Math.min(1, landT + dt / 3);
      const e = easeInOut(landT);
      const alt = 80 * (1 - e);
      const pos = rocketInfo.pos.clone().normalize().multiplyScalar(Rp + 0.15 + alt);
      stand(rocket, pos, rocketInfo.fr.t);
      flame.scale.setScalar(clamp(0.4 + (1 - e) * 1.2 + Math.random() * 0.2, 0.01, 1.7));
      if (landT > 0.9 && Math.random() < dt * 30) puff(rocket.position);
      camera.position.copy(cam0);
      camera.up.copy(padDir);
      look.copy(padDir).multiplyScalar(Rp + 6 + alt * 0.55);
      camera.lookAt(look);
      char.visible = false;
      if (landT >= 1) { flame.scale.setScalar(0.001); mode = "pop"; popT = 0; char.visible = true; }
    } else if (mode === "opening") {
      // dive into the signpost's orb while the warp starts over the top
      opening.t = Math.min(1, opening.t + dt / 1.0);
      const e = easeInOut(opening.t), sg = opening.sign;
      sg.head.getWorldPosition(sg.pos);
      tv.copy(camera.position).sub(sg.pos).normalize();
      camPos.copy(sg.pos).addScaledVector(tv, 5.5 - e * 3.2);
      camera.position.lerp(camPos, 1 - Math.exp(-dt * 6));
      camera.lookAt(sg.pos);
      sg.head.scale.setScalar(1.25 + e * 2.4);
      sg.head.rotation.y += dt * (2 + e * 14);
      astro.animate(0, dt);
    } else {
      if (mode === "pop") { popT = Math.min(1, popT + dt / 0.7); char.scale.setScalar(1.15 * (1 - Math.pow(1 - popT, 3) * Math.cos(popT * 9))); if (popT >= 1) mode = "walk"; }

      // input → forward / turn
      let f = 0, tn = 0;
      if (mode === "walk") {
        f = (keys.ArrowUp || keys.w || keys.W ? 1 : 0) - (keys.ArrowDown || keys.s || keys.S ? 1 : 0);
        tn = (keys.ArrowLeft || keys.a || keys.A ? 1 : 0) - (keys.ArrowRight || keys.d || keys.D ? 1 : 0);
        f += -stick.y; tn += -stick.x;
        f = clamp(f, -1, 1); tn = clamp(tn, -1, 1);
        if (f || tn) target = null;
        else if (target) {
          tv.copy(target.dir).addScaledVector(P, -target.dir.dot(P));
          const dist = Math.acos(clamp(P.dot(target.dir), -1, 1)) * Rp;
          if (dist < (target.stop || 1.4)) {
            const wasOpen = target.open; target = null;
            if (wasOpen && near && near.kind !== "none") api.interact();
          } else {
            tv.normalize();
            right.crossVectors(P, H);
            const ang = Math.atan2(tv.dot(right), tv.dot(H)); // right = P×H points to the walker's left, so >0 means turn left
            tn = clamp(ang * 3.5, -1, 1);
            f = Math.abs(ang) < 1.1 ? 1 : 0.15;
          }
        }
      }
      const run = keys.Shift ? 1.6 : 1;
      const speed = 8.5 * run;
      turn(tn * 2.4 * dt);
      move(f * speed * dt);
      collide();
      fixHeading();

      right.crossVectors(P, H);
      char.position.copy(charPos.copy(P).multiplyScalar(Rp + 0.1));
      char.quaternion.copy(basisQuat(right, P, H));
      astro.animate(Math.abs(f) * run / 1.6, dt);

      // follow camera
      camPos.copy(P).multiplyScalar(Rp + 5.4).addScaledVector(H, -11 * (f < 0 ? -0.2 : 1));
      camera.position.lerp(camPos, 1 - Math.exp(-dt * 4.5));
      camera.up.copy(P);
      look.copy(P).multiplyScalar(Rp + 1.8).addScaledVector(H, 4);
      camera.lookAt(look);
    }

    // light follows the walker so the world is always lit from above
    hemi.position.copy(P);
    sun.position.copy(charPos).addScaledVector(P, 34).addScaledVector(H, -10).addScaledVector(right.crossVectors(P, H), 20);
    sun.target.position.copy(charPos);

    // signposts bob; work out which one is near
    let nearest = null, nd = Infinity, nearestAny = null, ad = Infinity;
    signs.forEach((sg) => {
      sg.group.updateMatrixWorld();
      sg.head.getWorldPosition(sg.pos);
      if (!reduce) sg.head.position.y = 3.5 + Math.sin(t * 1.6 + sg.idx) * 0.12;
      const d = sg.pos.distanceTo(charPos);
      if (d < nd) { nd = d; nearest = sg; }
      const arcd = Math.abs(sg.roadPos.dot(P));
      if (-arcd < ad) { ad = -arcd; nearestAny = sg; }
    });
    const rd = rocketInfo && mode !== "landing" ? rocketInfo.pos.distanceTo(charPos) : Infinity;
    let info = null;
    if (mode === "walk") {
      if (rd < NEAR && rd <= nd) info = { kind: "rocket", title: "Board the rocket", sub: "Back to the galaxy" };
      else if (nearest && nd < NEAR) info = { kind: "topic", idx: nearest.idx, id: nearest.topic.id, title: nearest.topic.title, status: nearest.topic.status, district: nearest.district };
    }
    const key = info ? `${info.kind}:${info.id || ""}` : "none";
    if (key !== reportedNear) { reportedNear = key; near = info || { kind: "none" }; onNear(info); }
    if (nearest && nearest.idx !== reportedIdx && frame % 6 === 0) { reportedIdx = nearest.idx; onProgress(nearest.idx + 1, signs.length); }
    if (mode !== "opening") signs.forEach((sg) => { sg.head.scale.setScalar(near && near.idx === sg.idx ? 1.25 : 1); });

    // labels
    camera.updateMatrixWorld();
    const place = (el, pos, maxD) => {
      const d = pos.distanceTo(camera.position);
      tv.copy(pos).project(camera);
      const vis = showLabels && mode !== "landing" && mode !== "opening" && d < maxD && tv.z < 1 && Math.abs(tv.x) < 1.1 && Math.abs(tv.y) < 1.1;
      el.style.opacity = vis ? clamp(1.4 - d / maxD, 0.2, 1).toFixed(2) : "0";
      el.style.pointerEvents = vis ? "auto" : "none";
      el.tabIndex = vis ? 0 : -1;
      if (vis) el.style.transform = `translate(-50%,-50%) translate(${((tv.x + 1) / 2) * innerWidth}px,${((1 - tv.y) / 2) * innerHeight}px)`;
    };
    signs.forEach((sg) => { place(sg.label, tv2.copy(sg.pos).addScaledVector(sg.pos.clone().normalize(), 1.8), 46); sg.label.classList.toggle("near", near && near.idx === sg.idx); });
    gates.forEach((gt) => place(gt.label, gt.pos, 70));

    // smoke
    smoke.forEach((m) => {
      if (!m.visible) return;
      const u = m.userData; u.life -= dt * 0.7;
      if (u.life <= 0) { m.visible = false; return; }
      m.position.addScaledVector(u.v, dt);
      m.scale.setScalar(0.6 + (1 - u.life) * 3.5);
      m.material.opacity = clamp(u.life, 0, 1) * 0.8;
    });
  }
  function puff(at) {
    const m = smoke[smokeIdx++ % smoke.length];
    m.position.copy(at).addScaledVector(padDir, 0.4);
    m.userData.v.set(rand(-3, 3), rand(-3, 3), rand(-3, 3)).addScaledVector(padDir, 1.2);
    m.userData.life = 1; m.visible = true; m.scale.setScalar(0.6);
  }

  // ---------- input
  addEventListener("keydown", (e) => {
    if (!active || e.target.closest("input, textarea")) return;
    keys[e.key] = true;
    if (e.key === "e" || e.key === "E" || (e.key === "Enter" && !e.target.closest("button, a"))) api.interact();
  });
  addEventListener("keyup", (e) => { keys[e.key] = false; });
  addEventListener("blur", () => { for (const k in keys) keys[k] = false; });

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const canvas = document.getElementById("scene");
  let down = null;
  canvas.addEventListener("pointerdown", (e) => { if (active) down = [e.clientX, e.clientY]; });
  canvas.addEventListener("pointerup", (e) => {
    if (!active || !down || mode !== "walk") return;
    const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null;
    if (moved > 6) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const heads = signs.map((s) => s.head);
    const hit = ray.intersectObjects(heads, false)[0];
    if (hit) return walkTo(signs[hit.object.userData.sign], true);
    const rhit = ray.intersectObjects(rocket.children, true)[0];
    if (rhit && rocketInfo) { target = { dir: rocketInfo.pos.clone().normalize(), open: true, stop: 3 }; return; }
    const ground = ray.intersectObjects(world.children.filter((o) => o.userData.ground), false)[0];
    if (ground) target = { dir: ground.point.clone().normalize(), open: false, stop: 1.4 };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!active || mode !== "walk") return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    canvas.style.cursor = ray.intersectObjects(signs.map((s) => s.head), false).length ? "pointer" : "default";
  });

  function resize(w, h) {
    camera.aspect = w / h;
    camera.fov = w / h < 0.85 ? 68 : 55;
    camera.updateProjectionMatrix();
  }

  const api = {
    scene, camera, update, resize,
    enter(p, { resume = true } = {}) {
      dispose();
      build(p);
      active = true; mode = "walk"; target = null; opening = null; char.scale.setScalar(1.15); char.visible = true;
      const resumeIdx = resume && lastVisit && lastVisit.planetId === p.id ? signs.findIndex((s) => s.topic.id === lastVisit.topicId) : -1;
      // start pose: on the road by the pad, facing along it (or back at the signpost you left)
      const startS = resumeIdx >= 0 && signs[resumeIdx] ? Math.max(0, signs[resumeIdx].s - 4) : 12;
      const fr = frameAt(startS);
      P.copy(fr.p); H.copy(fr.t);
      const padFr = rocketInfo.fr;
      stand(rocket, rocketInfo.pos.clone().normalize().multiplyScalar(Rp + 0.15), padFr.t);
      flame.scale.setScalar(0.001);
      camera.up.copy(P);
      camera.position.copy(P).multiplyScalar(Rp + 5.4).addScaledVector(H, -11);
      if (resumeIdx < 0 && !reduce) {
        mode = "landing"; landT = 0;
        cam0.copy(padDir).multiplyScalar(Rp + 6).addScaledVector(padFr.t, -20).addScaledVector(new V3().crossVectors(padDir, padFr.t), -10);
      }
      reportedNear = undefined; reportedIdx = -1;
      labelsEl.hidden = false;
    },
    leave() { active = false; labelsEl.hidden = true; for (const k in keys) keys[k] = false; stick.x = stick.y = 0; },
    setStick(x, y) { stick.x = x; stick.y = y; },
    setLabels(v) { showLabels = v; },
    // called by the page whenever a topic is shown, so "back to the road" returns to that signpost
    remember(planetId, topicId) { lastVisit = { planetId, topicId }; },
    // press E / Enter / the prompt button
    interact() {
      if (!near || near.kind === "none" || mode !== "walk") return;
      if (near.kind === "rocket") return onBack();
      lastVisit = { planetId: planet.id, topicId: near.id };
      const sg = signs[near.idx];
      opening = { sign: sg, t: 0 };
      mode = "opening";
      target = null;
      onOpen(near.id);
    },
    // walk to the next/previous signpost along the road
    step(d) {
      if (mode !== "walk" || !signs.length) return;
      let cur = reportedIdx < 0 ? 0 : reportedIdx;
      const here = signs[cur];
      // if we're already at this signpost, move on; otherwise go to it first
      const atIt = here && here.pos.distanceTo(tv2.copy(P).multiplyScalar(Rp + 0.1)) < NEAR;
      const next = clamp(atIt ? cur + d : cur, 0, signs.length - 1);
      walkTo(signs[next], false);
    },
    get signCount() { return signs.length; }
  };
  return api;
}
