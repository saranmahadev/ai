import * as THREE from "three";
import { clay, createSkyRig } from "./clay.js";
import { createRocket } from "../models/rocket.js";

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// The home scene: a rocket on a launch pad. launch() lifts it off and resolves once it has left the sky.
export function create({ onWhiteout }) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf1eafd, 0.012);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8ccfa, 1.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.4);
  sun.position.set(-12, 22, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(matchMedia("(pointer: coarse)").matches ? 1024 : 2048, matchMedia("(pointer: coarse)").matches ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 });
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04; sun.shadow.radius = 5;
  scene.add(sun);
  const sky = createSkyRig(scene, { hemi, sun, base: { hemi: 1.9, sun: 2.4 }, moonAt: [75, 62, -200] });

  // ground hill + pad
  const hill = new THREE.Mesh(new THREE.SphereGeometry(40, 64, 32), clay(0xbfeedd));
  hill.scale.y = 0.11; hill.position.y = -4.4; hill.receiveShadow = true;
  scene.add(hill);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.6, 0.6, 56), clay(0xfff3e2));
  pad.position.y = -0.05; pad.castShadow = pad.receiveShadow = true;
  scene.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.1, 12, 64), clay(0xb39cf5));
  padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.26;
  scene.add(padRing);

  const { group: rocket, flame } = createRocket();
  rocket.position.y = 0.25;
  scene.add(rocket);

  // clouds
  const cloudMat = clay(0xffffff, { roughness: 0.9, clearcoat: 0 });
  const clouds = [];
  for (let k = 0; k < 14; k++) {
    const grp = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < puffs; j++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(rand(1.6, 3), 24, 16), cloudMat);
      p.position.set(j * 2.6 - puffs * 1.2, rand(-0.5, 0.5), rand(-1, 1));
      p.scale.y = 0.75; p.castShadow = true;
      grp.add(p);
    }
    grp.position.set(rand(-45, 45), rand(4, 60), rand(-40, -8));
    if (grp.position.x < 6 && grp.position.y < 26) grp.position.y += 26; // keep clouds off the headline
    grp.userData = { y: grp.position.y, ph: Math.random() * 6, sp: rand(0.1, 0.3) };
    scene.add(grp);
    clouds.push(grp);
  }

  // smoke pool for lift-off
  const smokeMat = () => clay(0xffffff, { roughness: 1, clearcoat: 0, transparent: true, opacity: 0 });
  const smoke = Array.from({ length: 26 }, () => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 14), smokeMat());
    m.visible = false; m.userData = { life: 0, v: new THREE.Vector3() };
    scene.add(m);
    return m;
  });
  let smokeIdx = 0;
  const puff = () => {
    const m = smoke[smokeIdx++ % smoke.length];
    m.position.set(rocket.position.x + rand(-0.7, 0.7), 0.6, rand(-0.7, 0.7));
    m.userData.v.set(rand(-3, 3), rand(0.4, 1.4), rand(-1.5, 3));
    m.userData.life = 1; m.visible = true; m.scale.setScalar(0.6);
  };

  let baseX = 0, aspect = 1, lookBase = 5.6;
  function resize(w, h) {
    aspect = w / h;
    camera.aspect = aspect;
    camera.fov = aspect < 0.85 ? 58 : 38;
    camera.updateProjectionMatrix();
    baseX = aspect > 1.1 ? 3.6 : 0;
    pad.position.x = padRing.position.x = baseX; // the pad always sits under the rocket
    lookBase = aspect < 0.85 ? 0.4 : 5.6;
    camera.position.set(0, 5, aspect < 0.85 ? 30 : 21);
  }

  let mx = 0, my = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  let launching = false, lt = 0, resolveLaunch = null, whited = false;
  const look = new THREE.Vector3();

  function update(rawDt, t) {
    sky.follow(camera);
    const dt = Math.min(rawDt, launching ? 0.1 : 0.05);

    let camY = 5, lookY = lookBase;
    if (!launching) {
      rocket.position.x = baseX;
      rocket.position.y = 0.25 + (reduce ? 0 : Math.sin(t * 1.2) * 0.12);
      rocket.rotation.set(0, reduce ? 0 : t * 0.25, reduce ? 0 : Math.sin(t * 0.9) * 0.02);
    } else {
      lt += dt;
      const shake = clamp(lt / 0.8, 0, 1);
      const rise = Math.max(0, lt - 0.8);
      const y = 0.25 + 4.5 * rise * rise;
      rocket.position.set(baseX + (rise < 0.4 ? (Math.random() - 0.5) * 0.12 * shake : 0), y, 0);
      rocket.rotation.set(0, rocket.rotation.y * 0.96, 0);
      flame.scale.setScalar(clamp(shake * 1.1, 0.001, 1.1) * (0.9 + Math.random() * 0.25));
      if (lt > 0.3 && lt < 2.6 && Math.random() < dt * 40) puff();
      camY = 5 + y * 0.5;
      lookY = lookBase + y * 0.72;
      if (y > 16 && !whited) { whited = true; onWhiteout && onWhiteout(); }
      if (y > 44 && resolveLaunch) { resolveLaunch(); resolveLaunch = null; }
    }
    camera.position.y += (camY + (reduce ? 0 : -my * 0.6) - camera.position.y) * Math.min(1, dt * 6);
    camera.position.x += ((reduce ? 0 : mx * 1.4) - camera.position.x) * Math.min(1, dt * 3);
    look.set(baseX * 0.35, lookY, 0);
    camera.lookAt(look);

    smoke.forEach((m) => {
      if (!m.visible) return;
      const u = m.userData;
      u.life -= dt * 0.6;
      if (u.life <= 0) { m.visible = false; return; }
      m.position.addScaledVector(u.v, dt);
      m.scale.setScalar(0.6 + (1 - u.life) * 4);
      m.material.opacity = clamp(u.life, 0, 1) * 0.85;
    });
    if (!reduce) clouds.forEach((c) => { c.position.y = c.userData.y + Math.sin(t * c.userData.sp + c.userData.ph) * 0.8; });
  }

  return {
    scene, camera, update, resize,
    applyTheme: (t) => sky.apply(t),
    launch() {
      if (reduce) return Promise.resolve();
      return new Promise((res) => { launching = true; lt = 0; whited = false; resolveLaunch = res; });
    },
    reset() {
      launching = false; whited = false; flame.scale.setScalar(0.001);
      rocket.rotation.set(0, 0, 0);
      smoke.forEach((m) => { m.visible = false; });
    },
  };
}
