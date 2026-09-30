// Weather for the planet scene: fog, light, clouds, rain, snow, wet surfaces, snow cover and storm lightning.
// The sky rig owns the time-of-day colours; weather scales them (call `reapply()` after every `sky.apply`).
import * as THREE from "three";
import { hashString, mulberry32 } from "./city.js";

const V3 = THREE.Vector3;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const KEY = "ai-base-weather";
export const MODES = ["auto", "clear", "cloudy", "mist", "rain", "snow", "storm"];

// what each kind of weather does: fog density x, fog greyed, light x, sky dimmed, cloud cover, cloud darkness, rain, snow, wet, snow cover, lightning
const TABLE = {
  clear:  { fog: 1,   grey: 0,    light: 1,    sky: 1,    cover: 0.35, dark: 0,    rain: 0, snow: 0, wet: 0, cap: 0,    bolt: 0 },
  cloudy: { fog: 1.3, grey: 0.25, light: 0.82, sky: 0.85, cover: 1,    dark: 0.3,  rain: 0, snow: 0, wet: 0, cap: 0,    bolt: 0 },
  mist:   { fog: 3.4, grey: 0.6,  light: 0.85, sky: 0.7,  cover: 0.6,  dark: 0.15, rain: 0, snow: 0, wet: 0, cap: 0,    bolt: 0 },
  rain:   { fog: 1.9, grey: 0.5,  light: 0.66, sky: 0.6,  cover: 1,    dark: 0.55, rain: 1, snow: 0, wet: 1, cap: 0,    bolt: 0 },
  snow:   { fog: 2.1, grey: 0.4,  light: 0.9,  sky: 0.8,  cover: 1,    dark: 0.1,  rain: 0, snow: 1, wet: 0, cap: 0.8,  bolt: 0 },
  storm:  { fog: 2.3, grey: 0.6,  light: 0.5,  sky: 0.45, cover: 1,    dark: 0.8,  rain: 1, snow: 0, wet: 1, cap: 0,    bolt: 1 }
};
const CHANCE = [["clear", 0.38], ["cloudy", 0.25], ["mist", 0.1], ["rain", 0.15], ["snow", 0.06], ["storm", 0.06]];

// the weather "Auto" shows: seeded by planet, date and a six-hour block, so it is the same for everyone and changes slowly
export function autoWeather(planetId, now = new Date()) {
  const key = `${planetId}|${now.getFullYear()}-${now.getMonth()}-${now.getDate()}|${Math.floor(now.getHours() / 6)}`;
  let r = mulberry32(hashString(key))();
  for (const [m, p] of CHANCE) { if (r < p) return m; r -= p; }
  return "clear";
}

export function loadWeatherMode() {
  try { const m = localStorage.getItem(KEY); return MODES.includes(m) ? m : "auto"; } catch { return "auto"; }
}

export function createWeather({ scene, sky, hemi, sun, reduce }) {
  let mode = loadWeatherMode(), resolved = "clear", lite = false;
  const cur = { ...TABLE.clear }, keys = Object.keys(TABLE.clear);
  const baseFog = scene.fog.density;
  let baseFogColor = new THREE.Color(), baseHemi = 1, baseSun = 1;
  let att = null, planetId = "";

  // particles ride in a rig that sits on the walker, +y = up from the planet
  const rig = new THREE.Group(); rig.visible = false;
  scene.add(rig);
  const RAIN = 1400, SNOW = 1000, BOX = 26, TOP = 22;
  const mk = (n, fn) => { const a = new Float32Array(n * fn.stride); for (let i = 0; i < n; i++) fn.init(a, i); return a; };
  const rr = mulberry32(777);
  const rainPos = mk(RAIN, { stride: 6, init: (a, i) => { const x = (rr() * 2 - 1) * BOX, z = (rr() * 2 - 1) * BOX, y = rr() * TOP; a.set([x, y, z, x - 0.12, y + 1.1, z], i * 6); } });
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xcfe4ff, transparent: true, opacity: 0.5, fog: false, depthWrite: false }));
  rain.frustumCulled = false;
  const snowPos = mk(SNOW, { stride: 3, init: (a, i) => a.set([(rr() * 2 - 1) * BOX, rr() * TOP, (rr() * 2 - 1) * BOX], i * 3) });
  const snowGeo = new THREE.BufferGeometry(); snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, transparent: true, opacity: 0.9, fog: false, depthWrite: false }));
  snow.frustumCulled = false;
  rig.add(rain, snow);
  const phase = new Float32Array(SNOW); for (let i = 0; i < SNOW; i++) phase[i] = rr() * 6.28;

  // lightning
  const boltGeo = new THREE.BufferGeometry(); boltGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12 * 3), 3));
  const bolt = new THREE.Line(boltGeo, new THREE.LineBasicMaterial({ color: 0xf4f0ff, fog: false, toneMapped: false }));
  bolt.visible = false; bolt.frustumCulled = false; rig.add(bolt);
  let flash = 0, nextBolt = 4, boltT = 0;

  const grey = new THREE.Color(), tmpC = new THREE.Color();

  function resolve() { resolved = mode === "auto" ? autoWeather(planetId || "x") : mode; }
  function applyNow() {
    const boost = 1 + flash * 1.6;
    hemi.intensity = baseHemi * cur.light * boost;
    sun.intensity = baseSun * cur.light * boost;
    scene.fog.density = baseFog * cur.fog;
    grey.setRGB(1, 1, 1).multiplyScalar(0.3 * baseFogColor.r + 0.59 * baseFogColor.g + 0.11 * baseFogColor.b);
    scene.fog.color.copy(baseFogColor).lerp(grey, cur.grey);
    scene.backgroundIntensity = clamp(cur.sky * (1 + flash * 1.4), 0, 2.5);
    if (att) {
      att.cloudMat.color.setRGB(1, 1, 1).lerp(tmpC.setRGB(0.42, 0.44, 0.52), cur.dark);
      const n = att.clouds.length, show = Math.round(n * cur.cover);
      att.clouds.forEach((c, i) => { c.visible = i < show; });
      att.groundMat.color.copy(att.groundBase).lerp(tmpC.setRGB(0.96, 0.98, 1), cur.cap);
      for (const w of att.wet) { w.m.roughness = w.r + (0.22 - w.r) * cur.wet; w.m.clearcoat = w.c + (0.9 - w.c) * cur.wet; }
    }
  }

  return {
    get mode() { return mode; },
    get resolved() { return resolved; },
    // clouds: groups sharing cloudMat; wetMats: materials that get glossy in rain; ground: the planet body material
    attach({ clouds, cloudMat, cloudRoot, wetMats, groundMat, Rp, id }) {
      planetId = id;
      att = { clouds, cloudMat, cloudRoot, groundMat, groundBase: groundMat.color.clone(), wet: wetMats.map((m) => ({ m, r: m.roughness, c: m.clearcoat })), Rp };
      resolve();
      Object.assign(cur, TABLE[resolved]); // start in the right weather; changes after that ease in
      this.reapply();
    },
    detach() { att = null; rig.visible = false; },
    reapply() {
      baseFogColor.copy(scene.fog.color);
      // sky.apply has just reset lights, fog colour and (via intensity in the sky rig) the background
      baseHemi = hemi.intensity; baseSun = sun.intensity;
      applyNow();
    },
    setMode(m) {
      if (!MODES.includes(m)) return;
      mode = m; try { localStorage.setItem(KEY, m); } catch { /* private mode */ }
      resolve();
      if (reduce) { Object.assign(cur, TABLE[resolved]); applyNow(); }
    },
    setDetail(level) { lite = level === "lite"; },
    update(dt, t, P, H) {
      if (!att) return;
      const tgt = TABLE[resolved], k = reduce ? 1 : 1 - Math.exp(-dt * 0.9);
      for (const key of keys) cur[key] += (tgt[key] - cur[key]) * k;
      // lightning (never under reduced motion)
      if (!reduce && cur.bolt > 0.6) {
        nextBolt -= dt;
        if (nextBolt <= 0) {
          nextBolt = 3 + Math.random() * 7; flash = 1; boltT = 0.16;
          const pa = boltGeo.attributes.position, a = Math.random() * 6.28, dist = 30 + Math.random() * 30;
          let x = Math.cos(a) * dist, z = Math.sin(a) * dist, y = 46;
          for (let i = 0; i < 12; i++) { pa.setXYZ(i, x, y, z); x += (Math.random() - 0.5) * 5; z += (Math.random() - 0.5) * 5; y -= 46 / 11; }
          pa.needsUpdate = true; bolt.visible = true;
        }
      }
      if (flash > 0) flash = Math.max(0, flash - dt * 6);
      if (boltT > 0) { boltT -= dt; if (boltT <= 0) bolt.visible = false; }
      applyNow();
      if (att.cloudRoot && !reduce) att.cloudRoot.rotation.y += dt * 0.012;

      // precipitation follows the walker
      const wantRain = cur.rain > 0.05 && !reduce, wantSnow = cur.snow > 0.05 && !reduce;
      rig.visible = wantRain || wantSnow || bolt.visible;
      rain.visible = wantRain; snow.visible = wantSnow;
      if (!rig.visible) return;
      const R = att.Rp;
      rig.position.copy(P).multiplyScalar(R);
      const r = new V3().crossVectors(P, H).normalize().negate();
      rig.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(r, P, H));
      const frac = lite ? 0.5 : 1;
      if (wantRain) {
        const n = Math.round(RAIN * frac * cur.rain), fall = 26 * dt, a = rainPos;
        rainGeo.setDrawRange(0, n * 2);
        for (let i = 0; i < n; i++) {
          const o = i * 6; a[o + 1] -= fall; a[o + 4] -= fall;
          if (a[o + 1] < -1) { const x = (Math.random() * 2 - 1) * BOX, z = (Math.random() * 2 - 1) * BOX; a[o] = x; a[o + 1] = TOP; a[o + 2] = z; a[o + 3] = x - 0.12; a[o + 4] = TOP + 1.1; a[o + 5] = z; }
        }
        rainGeo.attributes.position.needsUpdate = true;
        rain.material.opacity = 0.5 * cur.rain;
      }
      if (wantSnow) {
        const n = Math.round(SNOW * frac * cur.snow), a = snowPos, fall = 2.6 * dt;
        snowGeo.setDrawRange(0, n);
        for (let i = 0; i < n; i++) {
          const o = i * 3; a[o + 1] -= fall; a[o] += Math.sin(t * 0.8 + phase[i]) * dt * 0.7; a[o + 2] += Math.cos(t * 0.6 + phase[i]) * dt * 0.5;
          if (a[o + 1] < -1) { a[o] = (Math.random() * 2 - 1) * BOX; a[o + 1] = TOP; a[o + 2] = (Math.random() * 2 - 1) * BOX; }
        }
        snowGeo.attributes.position.needsUpdate = true;
        snow.material.opacity = 0.9 * cur.snow;
      }
    }
  };
}
