import * as THREE from "three";
import { clay, tint, skyTexture } from "./clay.js";
import { createRocket } from "../models/rocket.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const UP = new THREE.Vector3(0, 1, 0);

// The galaxy: planets on an orbit around a small sun. Rotate the ring to focus a planet; select() flies the rocket to it.
export function create({ planets, labelsEl, onFocus, onSelect, onSun, onWhiteout }) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const N = planets.length, STEP = (Math.PI * 2) / N, R = 14, PR = 2.5;

  const scene = new THREE.Scene();
  scene.background = skyTexture([[0, "#b7c6ff"], [0.55, "#dccdff"], [1, "#ffd9e6"]]);
  scene.fog = new THREE.FogExp2(0xdccdff, 0.006);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
  scene.add(camera);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcdbdf5, 2.0));
  const sunLight = new THREE.DirectionalLight(0xfff4e6, 2.0);
  sunLight.position.set(-14, 26, 30);
  scene.add(sunLight);

  const orbit = new THREE.Mesh(new THREE.TorusGeometry(R, 0.07, 8, 200), clay(0xfff3e2));
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 40, 28), clay(0xffd66b));
  scene.add(sun);
  const sunRing = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.12, 12, 64), clay(0xfff3e2));
  sunRing.rotation.x = Math.PI / 2.3;
  scene.add(sunRing);

  // ---- planets
  const bodies = [], pickables = [sun];
  sun.userData.sun = true;
  planets.forEach((p, i) => {
    const planned = p.status === "planned";
    const color = planned ? tint(p.color, 0.55) : new THREE.Color(p.color);
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(PR, 48, 32), clay(color));
    body.userData.i = i;
    g.add(body);
    pickables.push(body);

    const kind = i % 4;
    const accent = tint(p.color, 0.45);
    const dark = new THREE.Color(p.color).multiplyScalar(0.82);
    const extras = [];
    if (kind === 0) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.24, 16, 90), clay(accent));
      ring.rotation.set(1.2, 0.15, 0.3);
      g.add(ring);
    } else if (kind === 1) {
      const pivot = new THREE.Group();
      pivot.rotation.z = 0.4;
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 16), clay(accent));
      moon.position.x = 4.4;
      pivot.add(moon);
      g.add(pivot);
      extras.push(pivot);
    } else if (kind === 2) {
      for (let k = 0; k < 6; k++) {
        const dir = new THREE.Vector3(rand(-1, 1), rand(-0.6, 1), rand(-0.2, 1)).normalize();
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 12), clay(dark));
        c.position.copy(dir).multiplyScalar(PR - 0.06);
        c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        c.scale.set(1, 1, 0.28);
        g.add(c);
      }
    } else {
      for (const [y, rad] of [[0, PR + 0.02], [1.3, Math.sqrt(PR * PR - 1.3 * 1.3) + 0.02]]) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.22, 12, 64), clay(dark));
        band.rotation.x = Math.PI / 2; band.position.y = y;
        g.add(band);
      }
    }
    if (p.status === "explored") { // a flag marks planets that have written notes
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.7, 10), clay(0xfff3e2));
      pole.position.set(0, PR + 0.75, 0);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.08), clay(0xff8f8f));
      flag.position.set(0.5, PR + 1.3, 0);
      g.add(pole, flag);
    }
    scene.add(g);

    const label = document.createElement("button");
    label.className = "glabel" + (planned ? " planned" : "");
    label.style.setProperty("--c", p.color);
    label.tabIndex = -1;
    label.innerHTML = `<span></span>${p.title}`;
    label.addEventListener("click", () => onSelect(i));
    labelsEl.appendChild(label);
    bodies.push({ g, body, label, extras, phase: i * 1.7 });
  });

  // ---- decor: small clay blobs drifting in the distance
  const blobGeos = [new THREE.SphereGeometry(1, 20, 14), new THREE.TorusGeometry(0.8, 0.36, 12, 24), new THREE.OctahedronGeometry(1.1, 1)];
  const blobs = [];
  for (let k = 0; k < 40; k++) {
    const m = new THREE.Mesh(blobGeos[k % 3], clay(tint(planets[k % N].color, 0.35)));
    const a = Math.random() * Math.PI * 2, d = rand(30, 75);
    m.position.set(Math.sin(a) * d, rand(-14, 26), -Math.abs(Math.cos(a)) * d - 6); // always behind the ring, never between camera and planets
    m.scale.setScalar(rand(0.5, 1.5));
    m.userData = { y: m.position.y, ph: Math.random() * 6, sp: rand(0.2, 0.6) };
    scene.add(m);
    blobs.push(m);
  }

  // ---- rocket, parked in front of the camera until it flies
  const restPos = new THREE.Vector3(-7, -3.6, -13);
  const { group: rocket, flame } = createRocket();
  const rocketRoot = new THREE.Group();
  rocketRoot.add(rocket);
  rocket.position.y = -2;
  const REST_SCALE = 0.42;
  rocketRoot.scale.setScalar(REST_SCALE);
  rocketRoot.position.copy(restPos);
  camera.add(rocketRoot);
  flame.scale.setScalar(0.45);

  // ---- ring rotation state
  let angle = 0, target = 0, dragging = false, moved = false, downX = 0, downAngle = 0, lastX = 0, vx = 0;
  let focus = 0, reported = -1, pendingFly = null, active = false, wheelAt = 0;
  const focusOf = (a) => ((Math.round(-a / STEP) % N) + N) % N;
  let baseCam = new THREE.Vector3(0, 12, 40), baseLook = new THREE.Vector3(0, -3, 8);
  let flight = null;

  function resize(w, h) {
    camera.aspect = w / h;
    const portrait = w / h < 0.85;
    camera.fov = portrait ? 54 : 40;
    camera.updateProjectionMatrix();
    baseCam.set(0, portrait ? 13 : 12, portrait ? 52 : 40);
    baseLook.set(0, portrait ? -2 : -3, 8);
    restPos.set(portrait ? -2.6 : -7, portrait ? 0.5 : -3.6, -13);
  }

  // ---- input
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pick = (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    return hit ? hit.object : null;
  };
  const canvas = document.getElementById("scene");
  canvas.addEventListener("pointerdown", (e) => {
    if (!active || flight) return;
    dragging = true; moved = false; downX = lastX = e.clientX; downAngle = angle; vx = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!active) return;
    if (dragging) {
      const dx = e.clientX - downX;
      if (Math.abs(dx) > 6) moved = true;
      if (moved) { angle = target = downAngle + dx * 0.007; vx = (e.clientX - lastX) * 0.007; }
      lastX = e.clientX;
      return;
    }
    canvas.style.cursor = pick(e) ? "pointer" : "grab";
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!active || !dragging) return;
    dragging = false;
    if (moved) {
      target = Math.round((angle + vx * 6) / STEP) * STEP;
      reportFocus();
    } else {
      const hit = pick(e);
      if (hit && hit.userData.sun) onSun && onSun();
      else if (hit) onSelect(hit.userData.i);
    }
  });
  addEventListener("wheel", (e) => {
    if (!active || flight) return;
    const now = performance.now();
    if (now - wheelAt < 260 || Math.abs(e.deltaY + e.deltaX) < 8) return;
    wheelAt = now;
    api.step((e.deltaY + e.deltaX) > 0 ? 1 : -1);
  }, { passive: true });

  function reportFocus() {
    focus = focusOf(target);
    if (focus !== reported) { reported = focus; onFocus && onFocus(focus); }
  }

  // ---- flight
  function startFlight(i) {
    const end = new THREE.Vector3();
    bodies[i].g.getWorldPosition(end);
    const start = new THREE.Vector3(), q = new THREE.Quaternion();
    rocketRoot.getWorldPosition(start);
    rocketRoot.getWorldQuaternion(q);
    camera.remove(rocketRoot);
    scene.add(rocketRoot);
    rocketRoot.position.copy(start);
    rocketRoot.quaternion.copy(q);
    const stop = end.clone().add(camera.position.clone().sub(end).normalize().multiplyScalar(PR * 1.15 + 0.6));
    const mid = start.clone().lerp(stop, 0.45).add(new THREE.Vector3(end.x > 0 ? -7 : 7, 6, 0));
    flight = { t: 0, i, end, curve: new THREE.QuadraticBezierCurve3(start, mid, stop), q0: q, whited: false, resolve: null, camFrom: camera.position.clone() };
    flame.scale.setScalar(1);
    return new Promise((res) => { flight.resolve = res; });
  }

  const tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), look = new THREE.Vector3();

  function update(dt, t) {
    // ring
    if (!dragging) angle += (target - angle) * (reduce ? 1 : 1 - Math.exp(-dt * 6));
    reportFocus();
    if (pendingFly !== null && !flight && Math.abs(angle - target) < 0.04) {
      const i = pendingFly; pendingFly = null;
      pendingResolve && startFlight(i).then(pendingResolve);
      pendingResolve = null;
    }

    bodies.forEach((b, i) => {
      const th = i * STEP + angle;
      const c = Math.cos(th);
      b.g.position.set(Math.sin(th) * R, (reduce ? 0 : Math.sin(t * 0.8 + b.phase) * 0.35), c * R);
      if (!reduce) { b.body.rotation.y += dt * 0.15; b.extras.forEach((e) => { e.rotation.y += dt * 0.5; }); }
      const s = 1 + 0.22 * Math.pow(Math.max(0, c), 4);
      b.g.scale.setScalar(s);
      b._cos = c;
    });
    if (!reduce) { sun.rotation.y += dt * 0.2; sunRing.rotation.z += dt * 0.3; }

    // camera
    if (flight) {
      flight.t = Math.min(1, flight.t + dt / 2.5);
      const e = easeInOut(flight.t);
      rocketRoot.position.copy(flight.curve.getPoint(e));
      tmpV.copy(flight.curve.getTangent(e));
      tmpQ.setFromUnitVectors(UP, tmpV);
      rocketRoot.quaternion.copy(flight.q0).slerp(tmpQ, clamp(e * 4, 0, 1));
      rocketRoot.scale.setScalar(REST_SCALE * (1 - 0.35 * e));
      flame.scale.setScalar(0.9 + Math.random() * 0.25);
      camera.position.copy(flight.camFrom).lerp(tmpV.copy(flight.end).sub(flight.camFrom).multiplyScalar(0.3).add(flight.camFrom), e);
      look.copy(baseLook).lerp(flight.end, e * 0.85);
      camera.lookAt(look);
      if (flight.t > 0.8 && !flight.whited) { flight.whited = true; onWhiteout && onWhiteout(); }
      if (flight.t >= 1 && flight.resolve) { flight.resolve(); flight.resolve = null; }
    } else {
      camera.position.set(baseCam.x + (reduce ? 0 : mx * 2.5), baseCam.y + (reduce ? 0 : -my * 1.2), baseCam.z);
      camera.lookAt(baseLook);
      rocketRoot.position.set(restPos.x, restPos.y + (reduce ? 0 : Math.sin(t * 1.3) * 0.18), restPos.z);
      rocket.rotation.y = reduce ? 0 : Math.sin(t * 0.7) * 0.5;
      flame.scale.setScalar(0.4 + (reduce ? 0 : Math.random() * 0.08));
    }
    blobs.forEach((m) => { if (!reduce) { m.position.y = m.userData.y + Math.sin(t * m.userData.sp + m.userData.ph) * 1.2; m.rotation.x += dt * 0.2; m.rotation.y += dt * 0.25; } });

    // labels
    camera.updateMatrixWorld();
    const place = (label, pos, o) => {
      tmpV.copy(pos).project(camera);
      const vis = tmpV.z < 1 && o > 0.05 && !flight;
      label.style.opacity = vis ? o.toFixed(3) : "0";
      label.style.pointerEvents = vis && o > 0.4 ? "auto" : "none";
      label.tabIndex = vis && o > 0.4 ? 0 : -1;
      label.style.transform = `translate(-50%,-50%) translate(${((tmpV.x + 1) / 2) * innerWidth}px,${((1 - tmpV.y) / 2) * innerHeight}px)`;
    };
    bodies.forEach((b, i) => {
      const o = clamp((b._cos + 0.25) / 0.9, 0, 1);
      place(b.label, tmpV2.copy(b.g.position).add(tmpV3.set(0, PR * b.g.scale.x + 0.9, 0)), o);
      b.label.classList.toggle("focus", i === focus);
    });
  }
  const tmpV2 = new THREE.Vector3(), tmpV3 = new THREE.Vector3();
  let mx = 0, my = 0, pendingResolve = null;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  const api = {
    scene, camera, update, resize,
    enter(i) {
      active = true; flight = null; pendingFly = null; pendingResolve = null;
      if (rocketRoot.parent !== camera) { scene.remove(rocketRoot); camera.add(rocketRoot); }
      rocketRoot.position.copy(restPos);
      rocketRoot.quaternion.identity();
      rocketRoot.scale.setScalar(REST_SCALE);
      if (typeof i === "number") { target = angle = -i * STEP; }
      reported = -1; reportFocus();
      labelsEl.hidden = false;
    },
    leave() { active = false; labelsEl.hidden = true; },
    focus: () => focus,
    setFocus(i) {
      const cur = Math.round(-target / STEP);
      const diff = (((i - cur) % N) + N) % N;
      target = -(cur + (diff > N / 2 ? diff - N : diff)) * STEP;
      reportFocus();
    },
    step(d) { target = (Math.round(target / STEP) - d) * STEP; reportFocus(); },
    // rotates the planet to the front, then flies the rocket to it; resolves when the flight is over
    select(i) {
      if (flight) return Promise.resolve();
      api.setFocus(i);
      if (reduce) return Promise.resolve();
      return new Promise((res) => { pendingFly = i; pendingResolve = res; });
    }
  };
  return api;
}
