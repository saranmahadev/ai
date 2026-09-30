import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { clay, tint, createSkyRig } from "./clay.js";
import { createRocket } from "../models/rocket.js";
import { createAstronaut } from "../models/astronaut.js";
import { createTech, buildCity, mulberry32, hashString } from "./city.js";
import { buildGrid, createRadar } from "./grid.js";
import { createWeather } from "./weather.js";
import { readSet } from "../reader.js";

const V3 = THREE.Vector3;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const UP = new V3(0, 1, 0);

const SHADOW = matchMedia("(pointer: coarse)").matches ? 1024 : 2048; // lighter shadows on phones
const NEAR = 8.5;          // how close (world units) you must be to a signpost to interact with it
const SPACING = 15;        // road distance between the streets of neighbouring topics
const KIOSK_GAP = 9;       // road distance a district's kiosk takes up
const GATE_GAP = 16;       // road distance around a district arch and its plaza
const ROAD_W = 2.7;        // road half width
const STREET_LEN = 28;     // length of a topic's street, from the main road to its reading lodge
const STREET_W = 1.9;      // street half width

const COARSE = matchMedia("(pointer: coarse)").matches;
const HUD_KEY = "ai-base-hud";     // { conn, detail, radar } preferences
const loadHud = () => { try { return JSON.parse(localStorage.getItem(HUD_KEY) || "{}"); } catch { return {}; } };
const saveHud = (o) => { try { localStorage.setItem(HUD_KEY, JSON.stringify(o)); } catch { /* private mode */ } };
const urlParam = (k) => new URLSearchParams(location.search).get(k);

let lastVisit = null;      // { planetId, topicId }: the last topic you opened, so you come back to its signpost

// A small clay planet you walk around. The road winds over its surface; districts are gates, topics are signposts.
export function create({ content, labelsEl, radarEl, onDetail, onNear, onProgress, onOpen, onBack }) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf1ecff, 0.0045);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 900);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8ccfa, 2.0);
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(SHADOW, SHADOW);
  Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 140 });
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.05; sun.shadow.radius = 5;
  scene.add(hemi, sun, sun.target);
  const sky = createSkyRig(scene, { hemi, sun, base: { hemi: 2.0, sun: 2.4 }, moonAt: [-60, 70, -180] });
  const weather = createWeather({ scene, sky, hemi, sun, reduce });
  let lastTheme = null;

  // detail level: Full, or Lite (fewer moving parts and particles). Lite is the default on touch screens, and the scene drops
  // to Lite by itself if the first seconds run slowly, unless you (or ?detail=) chose.
  const hud = loadHud();
  const forced = urlParam("detail") === "full" || urlParam("detail") === "lite" ? urlParam("detail") : null;
  let detail = forced || hud.detail || (COARSE ? "lite" : "full"), detailChosen = !!(forced || hud.detail);
  let showConn = hud.conn !== false, showRadar = hud.radar !== false;
  let city = null, grid = null, tech = null, radar = null, nextUnread = -1, perf = null, sceneryHash = 0;

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
  let signs = [], gates = [], gateDirs = [], rocketInfo = null, topicList = [], obstacles = [];
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

  // a ribbon along any path: frameFn(s) gives { p, r } (a surface direction and the sideways direction there)
  function ribbonBy(frameFn, s0, s1, off, halfW, lift, material) {
    const pos = [], nrm = [], uv = [], idx = [];
    let n = 0;
    for (let s = s0; s <= s1 + 0.001; s += 1.2) {
      const fr = frameFn(Math.min(s, s1));
      [off - halfW, off + halfW].forEach((side, k) => {
        const v = surfacePoint(fr, side, lift);
        pos.push(v.x, v.y, v.z); nrm.push(fr.p.x, fr.p.y, fr.p.z); uv.push(k, (Math.min(s, s1) - s0) / (2 * halfW));
      });
      if (n > 0) { const a = (n - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      n++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    material.side = THREE.DoubleSide;
    const m = new THREE.Mesh(g, material);
    m.receiveShadow = true;
    return m;
  }
  const ribbon = (s0, s1, off, halfW, lift, material) => ribbonBy(frameAt, s0, s1, off, halfW, lift, material);

  // a street leaves the main road at right angles: a great-circle line from the road point `fr`, to the left (side 1) or right (-1)
  function laneFrame(fr, side, u) {
    const a = u / Rp, D = fr.r.clone().multiplyScalar(side);
    const p = fr.p.clone().multiplyScalar(Math.cos(a)).addScaledVector(D, Math.sin(a)).normalize();
    const t = fr.p.clone().multiplyScalar(-Math.sin(a)).addScaledVector(D, Math.cos(a));
    return { p, t, r: new V3().crossVectors(p, t) };
  }
  const lanePos = (lf, lateral, lift) => lf.p.clone().multiplyScalar(Rp).addScaledVector(lf.r, lateral).normalize().multiplyScalar(Rp + lift);
  // a flat disc that follows the planet's curve
  function cap(radius, lift, material) {
    const g = new THREE.SphereGeometry(Rp + lift, 64, 4, 0, Math.PI * 2, 0, radius / Rp);
    g.translate(0, -Rp, 0);
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
    signs = []; gates = []; gateDirs = []; topicList = []; obstacles = [];
    const base = new THREE.Color(p.color);
    // scenery is seeded by the planet id, so a planet looks the same every visit; the city layers use their own stream
    const sr = mulberry32(hashString(p.id)), rnd = mulberry32(hashString(p.id + ":city"));
    const rr = (a, b) => a + sr() * (b - a);
    tech = createTech({ sky });
    const read = readSet();
    const houseList = [], lampList = [], lodgeList = [];

    const districts = p.districts.map((d, k) => ({
      id: d.id, title: d.title, color: base.clone().offsetHSL(k * 0.06, 0.02, 0), topics: d.topics.map((id) => content.topics[id]).filter(Boolean)
    }));
    const N = districts.reduce((n, d) => n + d.topics.length, 0);
    const showGates = districts.length > 1;
    // a district's landing note is a kiosk on its plaza; every other topic gets a street of its own
    const isKiosk = (d, t) => showGates && t.id === `${p.id}/${d.id}`;

    // where everything sits along the main road, before any geometry exists
    const plan = [];
    let cursor = 26, streetNo = 0;
    districts.forEach((d) => {
      if (showGates) { plan.push({ kind: "gate", d, s: cursor + GATE_GAP / 2 }); cursor += GATE_GAP; }
      d.topics.forEach((t) => {
        if (isKiosk(d, t)) { plan.push({ kind: "kiosk", d, t, s: cursor }); cursor += KIOSK_GAP; }
        else { plan.push({ kind: "street", d, t, s: cursor, side: streetNo++ % 2 ? -1 : 1 }); cursor += SPACING; }
      });
    });
    const need = cursor + 22; // road length needed

    // the road's length is fixed by the content; a bigger planet spreads its turns apart
    const lay = (R) => {
      Rp = R;
      let lo = 0.05, hi = 5;
      for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (measure(mid, R) < need) lo = mid; else hi = mid; }
      const M = 900;
      samples = []; cum = [0];
      for (let i = 0; i <= M; i++) samples.push(pathPoint(i / M, hi));
      for (let i = 1; i <= M; i++) cum.push(cum[i - 1] + samples[i].distanceTo(samples[i - 1]) * R);
      total = cum[M];
    };
    // streets must not run into other stretches of the road or into each other, so grow the planet until they have room
    const CLEAR = 12;
    const roomy = () => {
      const pts = [];
      for (const e of plan) if (e.kind === "street") { const fr = frameAt(e.s); for (let u = 10; u <= STREET_LEN + 6; u += 4) pts.push({ e, d: laneFrame(fr, e.side, u).p }); }
      for (const q of pts) {
        for (let i = 0; i < samples.length; i += 3) {
          if (Math.abs(cum[i] - q.e.s) < 34) continue;
          if (Math.acos(clamp(samples[i].dot(q.d), -1, 1)) * Rp < CLEAR) return false;
        }
        for (const o of pts) if (o.e !== q.e && Math.acos(clamp(o.d.dot(q.d), -1, 1)) * Rp < CLEAR) return false;
      }
      return true;
    };
    let R0 = clamp(24 + N * 0.95, 30, 72);
    lay(R0);
    while (R0 < 160 && !roomy()) { R0 += 4; lay(R0); }

    // planet body
    const groundMat = clay(tint(p.color, 0.6));
    const body = new THREE.Mesh(new THREE.SphereGeometry(Rp, 128, 96), groundMat);
    body.receiveShadow = true;
    body.userData.ground = true;
    world.add(body);

    // main road: cream track with coloured edges
    const edgeMat = tech.edgeMat(p.color, base.clone().multiplyScalar(0.88)), laneMat = tech.roadMat(p.color);
    world.add(ribbon(0, total, 0, ROAD_W, 0.06, laneMat));
    world.add(ribbon(0, total, -ROAD_W - 0.15, 0.32, 0.1, edgeMat));
    world.add(ribbon(0, total, ROAD_W + 0.15, 0.32, 0.1, edgeMat));

    // a topic's signpost: a plaque whose head shows its status (solid orb = written, ring = outlined, cube = index)
    // (the disc and pole are instanced below; only the head is its own mesh, since it bobs and can be clicked)
    const headMats = new Map(), headGeos = {
      outlined: new THREE.TorusGeometry(0.75, 0.22, 16, 32), index: new RoundedBoxGeometry(1.3, 1.3, 1.3, 5, 0.4),
      written: new THREE.SphereGeometry(0.85, 32, 24), ring: new THREE.TorusGeometry(1.25, 0.07, 10, 40)
    }, ringMat = clay(0xfff3e2);
    const headMat = (t, d) => {
      const key = `${d.id}|${t.status === "outlined" ? "o" : "c"}`;
      if (!headMats.has(key)) { const m = clay(t.status === "outlined" ? tint(d.color.getHex(), 0.55) : d.color); if (t.status !== "outlined") sky.addGlow(m, d.color, 0.7); headMats.set(key, m); }
      return headMats.get(key);
    };
    const plaque = (t, d) => {
      const g = new THREE.Group();
      let head;
      if (t.status === "outlined") head = new THREE.Mesh(headGeos.outlined, headMat(t, d));
      else if (t.status === "index") { head = new THREE.Mesh(headGeos.index, headMat(t, d)); head.rotation.set(0.6, 0.6, 0); }
      else { head = new THREE.Mesh(headGeos.written, headMat(t, d)); const ring = new THREE.Mesh(headGeos.ring, ringMat); ring.rotation.x = 1.2; head.add(ring); }
      head.position.y = 3.5; head.castShadow = true;
      g.add(head);
      return { g, head };
    };
    const addSign = (e, pl, extra) => {
      const idx = signs.length;
      pl.head.userData.sign = idx;
      const lbl = labelFor(e.t.title, `topic ${e.t.status}`, e.d.color.getStyle());
      const sign = { idx, topic: e.t, district: e.d.title, group: pl.g, head: pl.head, label: lbl, s: e.s, pos: new V3(), ...extra };
      lbl.addEventListener("click", () => walkTo(sign, true));
      signs.push(sign);
      topicList.push(e.t.id);
      return sign;
    };

    // shared furniture for the streets: houses, roofs, lamp posts and bulbs are instanced
    const nStreets = plan.filter((e) => e.kind === "street").length;
    const houses = new THREE.InstancedMesh(new RoundedBoxGeometry(3.2, 2.4, 3.2, 3, 0.25), tech.houseMat(), Math.max(1, nStreets * 4));
    const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(2.7, 1.6, 4), clay(0xffffff), Math.max(1, nStreets * 4));
    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.11, 2.6, 8), clay(0xfff3e2), Math.max(1, nStreets * 4));
    const bulbMat = clay(0xfff2c2);
    sky.addGlow(bulbMat, 0xffe08a, 1.6);
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.32, 12, 10), bulbMat, Math.max(1, nStreets * 4));
    let hn = 0, ln = 0;
    // signposts, street-name posts and lodges are instanced too: a big planet has well over a hundred of each
    const nSign = Math.max(1, plan.filter((e) => e.kind !== "gate").length), cream = clay(0xfff3e2), streetsN = Math.max(1, nStreets);
    const pDisc = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.9, 1.05, 0.2, 24), cream, nSign);
    const pPole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 2.8, 12), cream, nSign);
    const sPole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.13, 2.4, 10), cream, streetsN);
    const sBoard = new THREE.InstancedMesh(new RoundedBoxGeometry(1.7, 0.7, 0.2, 3, 0.1), clay(0xffffff), streetsN);
    const lBody = new THREE.InstancedMesh(new RoundedBoxGeometry(6, 4.2, 5.2, 4, 0.35), clay(0xffffff), streetsN);
    const lRoof = new THREE.InstancedMesh(new THREE.ConeGeometry(4.9, 2.6, 4), clay(0xffffff), streetsN);
    const doorGeo = new RoundedBoxGeometry(1.6, 2.5, 0.3, 3, 0.12), doors = new Map();
    let np = 0, nsp = 0, nl = 0;
    const mtx = new THREE.Matrix4(), loc = new THREE.Matrix4();
    const put = (mesh, i, g, x, y, z, rotY = 0) => { g.updateMatrix(); loc.makeRotationY(rotY); loc.setPosition(x, y, z); mtx.multiplyMatrices(g.matrix, loc); mesh.setMatrixAt(i, mtx); };
    const putPlaque = (g) => { put(pDisc, np, g, 0, 0.1, 0); put(pPole, np, g, 0, 1.4, 0); np++; };
    const laneParts = [], edgeParts = [];
    const inst = new THREE.Object3D();
    const setInst = (mesh, i, pos, fwd, lift, rotY = 0) => {
      stand(inst, pos, fwd); inst.translateY(lift); inst.rotateY(rotY); inst.updateMatrix(); mesh.setMatrixAt(i, inst.matrix);
    };

    plan.forEach((e) => {
      const { d } = e;
      if (e.kind === "gate") {
        // a big district arch over the road, on a round plaza
        const fr = frameAt(e.s);
        const gate = new THREE.Group(), mat = clay(d.color), half = ROAD_W + 2.4;
        for (const x of [-half, half]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 7.5, 16), mat);
          post.position.set(x, 3.75, 0); post.castShadow = true; gate.add(post);
          obstacles.push({ d: surfacePoint(fr, x, 0).normalize(), r: 0.6 });
        }
        const arch = new THREE.Mesh(new THREE.TorusGeometry(half, 0.42, 14, 40, Math.PI), mat);
        arch.position.y = 7.5; arch.castShadow = true; gate.add(arch);
        stand(gate, fr.p.clone().multiplyScalar(Rp + 0.05), fr.t);
        world.add(gate);
        const plazaRim = cap(12, 0.04, clay(d.color)), plazaTop = cap(10.4, 0.07, clay(0xfff3e2));
        for (const m of [plazaRim, plazaTop]) { stand(m, fr.p.clone().multiplyScalar(Rp), fr.t); world.add(m); }
        const lbl = labelFor(d.title, "gate", d.color.getStyle());
        gates.push({ pos: fr.p.clone().multiplyScalar(Rp + 10), label: lbl });
        gateDirs.push({ dir: fr.p.clone(), color: d.color.getStyle() });
      } else if (e.kind === "kiosk") {
        // the district's landing note stands on its plaza
        const fr = frameAt(e.s), side = (signs.length % 2 ? -1 : 1) * 5.4;
        const pl = plaque(e.t, d);
        e.lat = side;
        stand(pl.g, surfacePoint(fr, side, 0.09), fr.t); putPlaque(pl.g);
        obstacles.push({ d: surfacePoint(fr, side, 0).normalize(), r: 0.9 });
        world.add(pl.g);
        addSign(e, pl, { roadPos: fr.p.clone().multiplyScalar(Rp), lane: null, dir: surfacePoint(fr, side, 0).normalize(), beamAt: surfacePoint(fr, side, 5.2), color: d.color.getStyle(), read: read.has(e.t.id) });
      } else {
        // a street of its own for this topic: lamps, houses, and a reading lodge at the end
        const fr = frameAt(e.s), lf = (u) => laneFrame(fr, e.side, u);
        laneParts.push(ribbonBy(lf, ROAD_W - 0.5, STREET_LEN + 4, 0, STREET_W, 0.075, laneMat));
        edgeParts.push(ribbonBy(lf, ROAD_W - 0.5, STREET_LEN + 4, -STREET_W - 0.12, 0.25, 0.1, edgeMat), ribbonBy(lf, ROAD_W - 0.5, STREET_LEN + 4, STREET_W + 0.12, 0.25, 0.1, edgeMat));

        // street-name post at the entrance
        const entU = ROAD_W + 1.8, ef = lf(entU);
        const post = new THREE.Object3D();
        stand(post, lanePos(ef, STREET_W + 1.2, 0.09), ef.t);
        put(sPole, nsp, post, 0, 1.2, 0); put(sBoard, nsp, post, 0, 2.5, 0); sBoard.setColorAt(nsp, d.color); nsp++;
        obstacles.push({ d: lanePos(ef, STREET_W + 1.2, 0).normalize(), r: 0.25 });

        // lamps, alternating sides
        [8, 15, 22].forEach((u, i) => {
          const lfu = lf(u), lat = (i % 2 ? -1 : 1) * (STREET_W + 0.9);
          const at = lanePos(lfu, lat, 0.06);
          setInst(poles, ln, at, lfu.t, 1.3); setInst(bulbs, ln, at, lfu.t, 2.75); ln++;
          lampList.push({ at, fwd: lfu.t });
          obstacles.push({ d: at.clone().normalize(), r: 0.25 });
        });
        // houses on both sides, doors facing the street
        const wall = tint(d.color.getHex(), 0.7);
        [11, 20].forEach((u) => {
          for (const sgn of [1, -1]) {
            const lfu = lf(u), at = lanePos(lfu, sgn * (STREET_W + 3.6), 0.06), fwd = lfu.r.clone().multiplyScalar(-sgn);
            setInst(houses, hn, at, fwd, 1.2); setInst(roofs, hn, at, fwd, 3.2, Math.PI / 4);
            houses.setColorAt(hn, wall); roofs.setColorAt(hn, d.color); hn++;
            houseList.push({ at, fwd });
            obstacles.push({ d: at.clone().normalize(), r: 2.1 });
          }
        });

        // the reading lodge at the end of the street
        const lodgeU = STREET_LEN + 3.6, lgf = lf(lodgeU);
        const lodge = new THREE.Object3D(), isRead = read.has(e.t.id), doorMat = tech.doorMat(e.t.status, isRead);
        stand(lodge, lanePos(lgf, 0, 0.05), lgf.t.clone().negate());
        put(lBody, nl, lodge, 0, 2.1, 0); lBody.setColorAt(nl, tint(d.color.getHex(), 0.55));
        put(lRoof, nl, lodge, 0, 5.5, 0, Math.PI / 4); lRoof.setColorAt(nl, d.color); nl++;
        if (!doors.has(doorMat)) { const dm = new THREE.InstancedMesh(doorGeo, doorMat, streetsN); dm.count = 0; doors.set(doorMat, dm); }
        { const dm = doors.get(doorMat); put(dm, dm.count, lodge, 0, 1.25, 2.68); dm.count++; }
        lodgeList.push({ pos: lanePos(lf(lodgeU - 2.75), 0, 3.3), fwd: lgf.t.clone().negate(), panelMat: tech.panelMat(e.t.status, isRead) });
        obstacles.push({ d: lanePos(lgf, 0, 0).normalize(), r: 3.2 });

        // the plaque you open the topic from, just before the lodge
        const plU = STREET_LEN - 0.4, plf = lf(plU), pl = plaque(e.t, d);
        stand(pl.g, lanePos(plf, 1.4, 0.09), plf.t); putPlaque(pl.g);
        obstacles.push({ d: lanePos(plf, 1.4, 0).normalize(), r: 0.9 });
        world.add(pl.g);
        const focus = lanePos(lf(lodgeU - 2.9), 0, 1.6);
        const streetLabel = labelFor(e.t.title, `street ${e.t.status}`, d.color.getStyle());
        const sign = addSign(e, pl, { roadPos: lanePos(plf, 0, 0), lane: { fr, side: e.side }, focus, entrance: lanePos(ef, STREET_W + 1.2, 3.6), streetLabel,
          dir: lanePos(lgf, 0, 0).normalize(), beamAt: lanePos(lgf, 0, 7.6), color: d.color.getStyle(), read: isRead,
          laneDirs: Array.from({ length: 8 }, (_, i) => lf(ROAD_W + ((lodgeU - ROAD_W) * i) / 7).p) });
        streetLabel.addEventListener("click", () => walkTo(sign, true));
      }
    });
    const mergeRibbons = (parts, material) => {
      if (!parts.length) return;
      let vc = 0, ic = 0; for (const q of parts) { vc += q.geometry.attributes.position.count; ic += q.geometry.index.count; }
      const pos = new Float32Array(vc * 3), nrm = new Float32Array(vc * 3), uv = new Float32Array(vc * 2), idx = new Uint32Array(ic);
      let vo = 0, io = 0;
      for (const q of parts) { const g = q.geometry, n = g.attributes.position.count; pos.set(g.attributes.position.array, vo * 3); nrm.set(g.attributes.normal.array, vo * 3); uv.set(g.attributes.uv.array, vo * 2); for (let k = 0; k < g.index.count; k++) idx[io + k] = g.index.array[k] + vo; vo += n; io += g.index.count; g.dispose(); }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nrm, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1));
      const m = new THREE.Mesh(g, material); m.receiveShadow = true; world.add(m);
    };
    mergeRibbons(laneParts, laneMat); mergeRibbons(edgeParts, edgeMat);
    for (const [m, n] of [[pDisc, np], [pPole, np], [sPole, nsp], [sBoard, nsp], [lBody, nl], [lRoof, nl], ...[...doors.values()].map((dm) => [dm, dm.count])]) { m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.castShadow = true; m.frustumCulled = false; world.add(m); }
    for (const m of [houses, roofs, poles, bulbs]) { m.count = m === bulbs || m === poles ? ln : hn; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.castShadow = m !== bulbs; world.add(m); }

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
    const laneDirs = [];
    for (const sg of signs) if (sg.lane) for (let u = 4; u <= STREET_LEN + 8; u += 3) laneDirs.push(laneFrame(sg.lane.fr, sg.lane.side, u).p);
    const roadDirs = [...samples.filter((_, i) => i % 6 === 0), ...laneDirs];
    const nearRoad = (d, clearance) => roadDirs.some((q) => q.dot(d) > Math.cos(clearance / Rp));
    const tmp = new THREE.Object3D();
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.6, 8), leafGeo = new THREE.SphereGeometry(1.4, 14, 10), rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const nTrees = Math.min(170, Math.floor((Rp * Rp) / 38));
    const trunks = new THREE.InstancedMesh(trunkGeo, clay(0xd9b38c), nTrees);
    const leaves = new THREE.InstancedMesh(leafGeo, clay(0xffffff), nTrees);
    const palette = [0x9fe3b4, 0xb8e6a0, 0xffc9d9, 0xc9b8ff, 0xa8dcf5].map((h) => new THREE.Color(h));
    let placed = 0, chk = 0;
    for (let tries = 0; tries < nTrees * 6 && placed < nTrees; tries++) {
      const d = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
      if (nearRoad(d, 9)) continue;
      const sc = rr(0.8, 1.6);
      const q = new THREE.Quaternion().setFromUnitVectors(UP, d);
      tmp.quaternion.copy(q); tmp.scale.setScalar(sc);
      tmp.position.copy(d).multiplyScalar(Rp + 0.8 * sc); tmp.updateMatrix(); trunks.setMatrixAt(placed, tmp.matrix);
      tmp.position.copy(d).multiplyScalar(Rp + 2.4 * sc); tmp.updateMatrix(); leaves.setMatrixAt(placed, tmp.matrix);
      leaves.setColorAt(placed, palette[placed % palette.length]);
      obstacles.push({ d, r: 0.4 * sc + 0.15 });
      chk += d.x * 7 + d.y * 13 + d.z * 17 + sc;
      placed++;
    }
    trunks.count = leaves.count = placed;
    trunks.castShadow = leaves.castShadow = true;
    world.add(trunks, leaves);
    const rocks = new THREE.InstancedMesh(rockGeo, clay(0xcfc4e6), 46);
    let rp = 0;
    for (let tries = 0; tries < 300 && rp < 46; tries++) {
      const d = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
      if (nearRoad(d, 6)) continue;
      tmp.position.copy(d).multiplyScalar(Rp + 0.2);
      tmp.quaternion.setFromUnitVectors(UP, d);
      const rx = rr(0.5, 1.4), rz = rr(0.5, 1.4);
      tmp.scale.set(rx, rr(0.4, 0.8), rz);
      obstacles.push({ d, r: Math.max(rx, rz) * 0.85 });
      chk += d.x * 5 + d.y * 3 + d.z * 11 + rx;
      tmp.updateMatrix(); rocks.setMatrixAt(rp++, tmp.matrix);
    }
    rocks.count = rp; rocks.castShadow = true;
    world.add(rocks);
    const cloudMat = clay(0xffffff, { roughness: 0.9, clearcoat: 0 });
    const cloudRoot = new THREE.Group(), clouds = [];
    world.add(cloudRoot);
    for (let k = 0; k < 26; k++) {
      const grp = new THREE.Group();
      const puffs = 3 + Math.floor(sr() * 3);
      for (let j = 0; j < puffs; j++) {
        const pf = new THREE.Mesh(new THREE.SphereGeometry(rr(2, 3.6), 20, 14), cloudMat);
        pf.position.set(j * 3 - puffs * 1.4, rr(-0.5, 0.5), rr(-1, 1)); pf.scale.y = 0.75; grp.add(pf);
      }
      const d = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
      stand(grp, d.multiplyScalar(Rp + rr(20, 40)), new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)));
      cloudRoot.add(grp); clouds.push(grp);
    }

    sceneryHash = hashString(`${p.id}|${placed}|${rp}|${chk.toFixed(4)}`);

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

    // the tech layer, the knowledge grid and the weather
    city = buildCity({ world, sky, base, Rp, frameAt, laneFrame, lanePos, surfacePoint, stand, obstacles, plan, total, houseList, lampList, lodgeList, rnd, reduce, ROAD_W, STREET_LEN });
    city.setDetail(detail);
    grid = buildGrid({ world, Rp, base, signs, content });
    grid.setVisible(showConn);
    radar = radarEl ? createRadar(radarEl, { Rp }) : null;
    const wet = [laneMat, tech.houseMat(), groundMat];
    weather.setDetail(detail);
    if (lastTheme) sky.apply(lastTheme); // back to the plain time-of-day values before weather scales them
    weather.attach({ clouds, cloudMat, cloudRoot, wetMats: wet, groundMat, Rp, id: p.id });
    perf = detailChosen || detail === "lite" ? null : { t: 0, n: 0 };
  }

  function dispose() {
    if (world) {
      scene.remove(world);
      world.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
      world = null;
    }
    weather.detach();
    city = grid = radar = null;
    labelsEl.innerHTML = "";
    sky.glow.length = 0;
    signs = []; gates = []; target = null; near = null; reportedNear = undefined; reportedIdx = -1;
  }

  // where the walker is along the road, in road units (nearest sample of the spiral)
  function roadS() {
    let best = 0, bd = -2;
    for (let i = 0; i < samples.length; i++) { const d = samples[i].dot(P); if (d > bd) { bd = d; best = i; } }
    return cum[best];
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

  // waypoints from where you stand to a topic: along the main road to its junction, then down its street
  function routeTo(sign) {
    const wp = [];
    const s0 = roadS(), s1 = sign.s;
    let uNow = -1;
    if (sign.lane && Math.abs(s0 - s1) < 3) { // already in this street: keep going
      const fr = frameAt(s1), D = fr.r.clone().multiplyScalar(sign.lane.side);
      uNow = Math.atan2(P.dot(D), P.dot(fr.p)) * Rp;
    }
    if (uNow < ROAD_W) {
      const dir = s1 >= s0 ? 1 : -1;
      wp.push(frameAt(s0).p.clone()); // get back onto the road first
      for (let x = s0 + dir * 9; dir > 0 ? x < s1 : x > s1; x += dir * 9) wp.push(frameAt(x).p.clone());
      wp.push(frameAt(s1).p.clone());
    }
    if (sign.lane) for (let u = ROAD_W + 3; u < STREET_LEN - 2; u += 6) if (u > uNow + 2) wp.push(laneFrame(sign.lane.fr, sign.lane.side, u).p.clone());
    wp.push(sign.roadPos.clone().normalize());
    return wp;
  }
  function walkTo(sign, open) {
    if (!sign || mode !== "walk") return;
    target = { wp: routeTo(sign), dir: null, open: !!open, stop: 2.4, idx: sign.idx };
  }

  // ---------- update
  const camPos = new V3(), look = new V3(), right = new V3(), tv = new V3(), tv2 = new V3();
  function update(dt, t) {
    if (!world || !active) return;
    frame++;
    sky.follow(camera);
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
      // glide to the lodge door (or the plaque) while the page fades to the article
      opening.t = Math.min(1, opening.t + dt / 0.8);
      const e = easeInOut(opening.t), sg = opening.sign;
      const aim = sg.focus || sg.head.getWorldPosition(sg.pos);
      tv.copy(camera.position).sub(aim).normalize();
      camPos.copy(aim).addScaledVector(tv, 9 - e * 5.5);
      camera.position.lerp(camPos, 1 - Math.exp(-dt * 5));
      camera.lookAt(aim);
      sg.head.scale.setScalar(1.25 + e * 0.5);
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
          if (target.wp && target.wp.length) target.dir = target.wp[0];
          tv.copy(target.dir).addScaledVector(P, -target.dir.dot(P));
          const dist = Math.acos(clamp(P.dot(target.dir), -1, 1)) * Rp;
          const last = !target.wp || target.wp.length <= 1;
          if (dist < (last ? target.stop || 1.4 : 2.6)) {
            if (!last) target.wp.shift();
            else {
              const wasOpen = target.open; target = null;
              if (wasOpen && near && near.kind !== "none") api.interact();
            }
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
      move(f * speed * (f < 0 ? 0.55 : 1) * dt); // backing up is slower
      collide();
      fixHeading();

      right.crossVectors(P, H);
      char.position.copy(charPos.copy(P).multiplyScalar(Rp + 0.1));
      char.quaternion.copy(basisQuat(right, P, H));
      astro.animate(Math.abs(f) * run / 1.6, dt);

      // follow camera
      camPos.copy(P).multiplyScalar(Rp + 5.4).addScaledVector(H, -11); // the camera always stays behind the astronaut, even when reversing
      camera.position.lerp(camPos, 1 - Math.exp(-dt * 4.5));
      camera.up.copy(P);
      look.copy(P).multiplyScalar(Rp + 1.8).addScaledVector(H, 4);
      camera.lookAt(look);
    }

    // the city's moving parts, the grid highlight, the weather and the radar
    if (perf && mode !== "landing") {
      perf.t += Math.min(dt, 0.25); perf.n++;
      if (perf.t > 3.2) { if (perf.n / perf.t < 24) api.setDetail("lite", false); perf = null; }
    }
    if (city) city.update(dt, t, sky.night || 0, tech.panelMats);
    weather.update(dt, t, P, H);

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
    if (frame % 8 === 0 && signs.length) {
      const s = roadS() + 2; // topics you have reached or passed
      let n = 0; for (const sg of signs) if (sg.s <= s) n++;
      if (n !== reportedIdx) { reportedIdx = n; onProgress(n, signs.length); }
    }
    if (grid) grid.setNear(info && info.kind === "topic" ? info.idx : -1);
    if (radar && showRadar && frame % 3 === 0) {
      let nu = -1, best = -2;
      for (const sg of signs) if (!sg.read && sg.topic.status !== "outlined") { const d = sg.dir.dot(P); if (d > best) { best = d; nu = sg.idx; } }
      radar.draw({ P, H, samples, signs, gates: gateDirs, nextIdx: nu, now: performance.now() });
    }
    if (mode !== "opening") signs.forEach((sg) => { sg.head.scale.setScalar(near && near.idx === sg.idx ? 1.25 : 1); });

    // labels
    camera.updateMatrixWorld();
    const place = (el, pos, maxD, ok = true) => {
      const d = pos.distanceTo(camera.position);
      tv.copy(pos).project(camera);
      const vis = ok && showLabels && mode !== "landing" && mode !== "opening" && d < maxD && tv.z < 1 && Math.abs(tv.x) < 1.1 && Math.abs(tv.y) < 1.1;
      el.style.opacity = vis ? clamp(1.4 - d / maxD, 0.2, 1).toFixed(2) : "0";
      el.style.pointerEvents = vis ? "auto" : "none";
      el.tabIndex = vis ? 0 : -1;
      if (vis) el.style.transform = `translate(-50%,-50%) translate(${((tv.x + 1) / 2) * innerWidth}px,${((1 - tv.y) / 2) * innerHeight}px)`;
    };
    signs.forEach((sg) => {
      const nearPlaque = sg.pos.distanceTo(charPos) < 16;
      place(sg.label, tv2.copy(sg.pos).addScaledVector(sg.pos.clone().normalize(), 1.8), sg.lane ? 24 : 34, sg.lane ? nearPlaque : true);
      sg.label.classList.toggle("near", near && near.idx === sg.idx);
      if (sg.streetLabel) place(sg.streetLabel, sg.entrance, 36, !nearPlaque);
    });
    gates.forEach((gt) => place(gt.label, gt.pos, 110));

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
    applyTheme: (t) => { lastTheme = t; sky.apply(t); weather.reapply(); },
    // HUD controls
    setWeather(m) { weather.setMode(m); },
    get weather() { return { mode: weather.mode, resolved: weather.resolved }; },
    setConnections(v) { showConn = !!v; if (grid) grid.setVisible(showConn); saveHud({ ...loadHud(), conn: showConn }); },
    setRadar(v) { showRadar = !!v; saveHud({ ...loadHud(), radar: showRadar }); },
    get hud() { return { conn: showConn, radar: showRadar, detail }; },
    setDetail(level, chosen = true) {
      detail = level === "lite" ? "lite" : "full";
      if (chosen) { detailChosen = true; perf = null; saveHud({ ...loadHud(), detail }); }
      if (city) city.setDetail(detail);
      weather.setDetail(detail);
      if (onDetail) onDetail(detail);
    },
    stats: () => ({ sceneryHash, signs: signs.length, beams: grid ? grid.count : 0, detail, weather: weather.resolved }),
    enter(p, { resume = true } = {}) {
      dispose();
      build(p);
      active = true; mode = "walk"; target = null; opening = null; char.scale.setScalar(1.15); char.visible = true;
      const resumeIdx = resume && lastVisit && lastVisit.planetId === p.id ? signs.findIndex((s) => s.topic.id === lastVisit.topicId) : -1;
      // start pose: on the road by the pad, facing along it (or back at the signpost you left)
      const rs = resumeIdx >= 0 ? signs[resumeIdx] : null;
      if (rs && rs.lane) { // back on the street you read, heading for the road
        const lf = laneFrame(rs.lane.fr, rs.lane.side, STREET_LEN - 12); // far enough that the follow camera stays in the street
        P.copy(lf.p); H.copy(lf.t).negate();
      } else {
        const fr = frameAt(rs ? Math.max(0, rs.s - 2) : 12);
        P.copy(fr.p); H.copy(fr.t);
      }
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
    // walk to the previous / next signpost along the road, measured from where you stand on it
    step(d) {
      if (mode !== "walk" || !signs.length) return;
      const s = roadS();
      let pick;
      if (d > 0) pick = signs.find((x) => x.s > s + 3) || signs[signs.length - 1];
      else pick = [...signs].reverse().find((x) => x.s < s - 3) || signs[0];
      walkTo(pick, false);
    },
    get signCount() { return signs.length; }
  };
  return api;
}
