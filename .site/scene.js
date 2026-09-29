import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);

export function start({ stages, onSelect, onActive, onProgress }) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("scene");
  const labelsEl = document.getElementById("labels");
  const N = stages.length;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---- Sky: a soft vertical gradient that stays fixed to the screen
  const sky = document.createElement("canvas");
  sky.width = 2; sky.height = 256;
  {
    const c = sky.getContext("2d");
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#d6e6ff");
    g.addColorStop(0.55, "#f3ecff");
    g.addColorStop(1, "#ffe6e1");
    c.fillStyle = g; c.fillRect(0, 0, 2, 256);
  }
  const skyTex = new THREE.CanvasTexture(sky);
  skyTex.colorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = skyTex;
  scene.fog = new THREE.FogExp2(0xf1eafd, 0.0085);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700);

  // ---- Clay material factory: matte, slightly glossy, soft sheen
  const clay = (color, extra = {}) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.62, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.55,
    sheen: 1, sheenRoughness: 0.7, sheenColor: new THREE.Color(0xffffff), ...extra
  });
  const tint = (hex, amount) => new THREE.Color(hex).lerp(new THREE.Color(0xffffff), amount);
  const cream = 0xfff3e2;

  // ---- Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8ccfa, 1.9));
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -55; sun.shadow.camera.right = 55;
  sun.shadow.camera.top = 55; sun.shadow.camera.bottom = -55;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 200;
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.05; sun.shadow.radius = 5;
  scene.add(sun, sun.target);

  // ---- Path: a fat clay rope winding through the world
  const pts = [];
  for (let i = -1; i <= N; i++) {
    pts.push(new THREE.Vector3(Math.sin(i * 0.95) * 16, Math.cos(i * 0.6) * 4 + i * 1.6, -(i + 1) * 30));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  const uOf = (i) => (i + 1) / (N + 1);

  const SEG = 700, RAD = 20;
  const baseTube = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG, 0.95, RAD, false), clay(cream));
  baseTube.castShadow = baseTube.receiveShadow = true;
  scene.add(baseTube);

  const stageColors = stages.map((s) => new THREE.Color(s.color));
  const colorAt = (u) => {
    const f = u * (N + 1) - 1;
    const i0 = clamp(Math.floor(f), 0, N - 1);
    const i1 = Math.min(i0 + 1, N - 1);
    return stageColors[i0].clone().lerp(stageColors[i1], clamp(f - i0, 0, 1));
  };
  const litGeo = new THREE.TubeGeometry(curve, SEG, 1.08, RAD, false);
  {
    const count = litGeo.attributes.position.count, arr = new Float32Array(count * 3);
    for (let v = 0; v < count; v++) {
      const c = colorAt(Math.floor(v / (RAD + 1)) / SEG);
      arr.set([c.r, c.g, c.b], v * 3);
    }
    litGeo.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  }
  const lit = new THREE.Mesh(litGeo, clay(0xffffff, { vertexColors: true }));
  lit.castShadow = true;
  litGeo.setDrawRange(0, 0);
  scene.add(lit);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(1.08, 32, 24), clay(0xffffff));
  tip.castShadow = true;
  scene.add(tip);
  const idxPerSeg = RAD * 6;

  // ---- Milestones, placed alternately left/right of the path
  const up = new THREE.Vector3(0, 1, 0);
  const shapes = [
    () => new THREE.SphereGeometry(2.1, 48, 32),
    () => new RoundedBoxGeometry(3.4, 3.4, 3.4, 8, 1.1),
    () => new THREE.CapsuleGeometry(1.5, 1.8, 16, 32),
    () => new THREE.TorusGeometry(1.7, 0.85, 32, 64)
  ];
  const nodes = [], pickables = [];

  stages.forEach((s, i) => {
    const u = uOf(i);
    const p = curve.getPointAt(u);
    const side = new THREE.Vector3().crossVectors(curve.getTangentAt(u), up).normalize().multiplyScalar(i % 2 ? -13 : 13);
    const base = p.clone().add(side).add(new THREE.Vector3(0, -2.2, 0));
    const planned = s.status === "planned";
    const color = planned ? tint(s.color, 0.5) : new THREE.Color(s.color);

    const g = new THREE.Group();
    g.position.copy(base);

    const pedestal = new THREE.Mesh(new THREE.SphereGeometry(4.2, 40, 24), clay(cream));
    pedestal.scale.set(1, 0.3, 1);
    pedestal.castShadow = pedestal.receiveShadow = true;
    g.add(pedestal);

    const body = new THREE.Group();
    body.position.y = 4;
    g.add(body);

    const core = new THREE.Mesh(shapes[i % shapes.length](), clay(color));
    core.castShadow = true;
    if (i % 4 === 3) core.rotation.x = Math.PI / 2.4;
    core.userData.i = i;
    body.add(core);
    pickables.push(core);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.2, 16, 96), clay(0xffffff, { roughness: 0.7 }));
    ring.rotation.x = Math.PI / 2.4;
    ring.castShadow = true;
    body.add(ring);

    const moons = [];
    const m = Math.min(s.groups.length, 6);
    for (let k = 0; k < m; k++) {
      const pivot = new THREE.Group();
      pivot.rotation.set(k * 0.7, k * 1.1, 0);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), clay(tint(s.color, 0.25)));
      moon.position.x = 4.9 + (k % 2) * 0.8;
      moon.castShadow = true;
      pivot.add(moon);
      pivot.userData.speed = 0.25 + k * 0.05;
      body.add(pivot);
      moons.push(pivot);
    }
    scene.add(g);

    // stalk from the path to the pedestal, plus a bead on the path
    const stalkCurve = new THREE.QuadraticBezierCurve3(p, p.clone().add(side.clone().multiplyScalar(0.5)).add(new THREE.Vector3(0, -3, 0)), base);
    const stalk = new THREE.Mesh(new THREE.TubeGeometry(stalkCurve, 24, 0.34, 12, false), clay(cream));
    stalk.castShadow = true;
    scene.add(stalk);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 24), clay(color));
    bead.position.copy(p);
    bead.castShadow = true;
    scene.add(bead);

    const label = document.createElement("button");
    label.className = "label" + (planned ? " planned" : "");
    label.style.setProperty("--c", s.color);
    label.tabIndex = -1;
    label.innerHTML = `<span>${s.id}</span>${s.title}`;
    label.addEventListener("click", () => { node.bounce = 1; onSelect(i); });
    labelsEl.appendChild(label);

    const node = { g, body, core, ring, moons, label, pos: base.clone().add(new THREE.Vector3(0, 4, 0)), scale: 1, bounce: 0, phase: i * 1.3 };
    nodes.push(node);
  });

  // ---- Decor: clay clouds and floating blobs
  const cloudMat = clay(0xffffff, { roughness: 0.9, clearcoat: 0 });
  const clouds = [];
  for (let k = 0; k < 30; k++) {
    const grp = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < puffs; j++) {
      const r = rand(2, 4);
      const pf = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), cloudMat);
      pf.position.set(j * 3.2 - puffs * 1.5, rand(-0.6, 0.6), rand(-1, 1));
      pf.scale.y = 0.75;
      pf.castShadow = true;
      grp.add(pf);
    }
    const u = Math.random();
    const p = curve.getPointAt(u);
    const sgn = Math.random() < 0.5 ? -1 : 1;
    grp.position.set(p.x + sgn * rand(20, 46), p.y + rand(-14, 20), p.z + rand(-12, 12));
    grp.userData = { y: grp.position.y, ph: Math.random() * 6, sp: rand(0.15, 0.35) };
    scene.add(grp);
    clouds.push(grp);
  }
  const blobs = [];
  const blobGeos = [
    new THREE.SphereGeometry(1, 24, 16),
    new THREE.TorusGeometry(0.9, 0.42, 16, 32),
    new RoundedBoxGeometry(1.6, 1.6, 1.6, 5, 0.5)
  ];
  for (let k = 0; k < 44; k++) {
    const c = stages[k % N].color;
    const mesh = new THREE.Mesh(blobGeos[k % 3], clay(tint(c, 0.15)));
    const p = curve.getPointAt(Math.random());
    const sgn = Math.random() < 0.5 ? -1 : 1;
    mesh.position.set(p.x + sgn * rand(11, 30), p.y + rand(-9, 12), p.z + rand(-10, 10));
    mesh.scale.setScalar(rand(0.8, 1.9));
    mesh.rotation.set(rand(0, 3), rand(0, 3), 0);
    mesh.castShadow = true;
    mesh.userData = { y: mesh.position.y, ph: Math.random() * 6, sp: rand(0.2, 0.6) };
    scene.add(mesh);
    blobs.push(mesh);
  }

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 78 : 60;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  // ---- Scroll → position along the path
  let target = 0, cur = 0;
  const readScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    target = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
  };
  addEventListener("scroll", readScroll, { passive: true });
  readScroll();
  cur = target;

  function jumpTo(i) {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: uOf(i) * max, behavior: reduce ? "auto" : "smooth" });
    nodes[i].bounce = 1;
  }

  // ---- Picking
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down = null;
  const pick = (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    return hit ? hit.object.userData.i : -1;
  };
  canvas.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener("pointerup", (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
    down = null;
    if (moved < 6) { const i = pick(e); if (i >= 0) { nodes[i].bounce = 1; onSelect(i); } }
  });
  canvas.addEventListener("pointermove", (e) => { canvas.style.cursor = pick(e) >= 0 ? "pointer" : "default"; });

  let mx = 0, my = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  // ---- Loop
  const clock = new THREE.Clock();
  const v = new THREE.Vector3();
  const off = new THREE.Vector3();
  let active = -2;

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    cur += (target - cur) * (reduce ? 1 : 1 - Math.pow(0.001, dt));

    const back = curve.getPointAt(clamp(cur - 0.02, 0, 1));
    const ahead = curve.getPointAt(clamp(cur + 0.025, 0, 1));
    camera.position.copy(back).add(off.set(0, 4.8, 0));
    if (!reduce) camera.position.add(off.set(mx * 2, -my * 1.2, 0));
    camera.lookAt(ahead);

    sun.position.copy(camera.position).add(off.set(26, 46, 18));
    sun.target.position.copy(ahead);

    litGeo.setDrawRange(0, Math.floor(cur * SEG) * idxPerSeg);
    tip.position.copy(curve.getPointAt(cur));
    tip.material.color.copy(colorAt(cur));

    const idx = clamp(Math.round(cur * (N + 1)) - 1, 0, N - 1);
    const now = cur < 0.5 / (N + 1) ? -1 : idx;
    if (now !== active) { active = now; onActive(active); }

    nodes.forEach((n, i) => {
      if (!reduce) {
        n.body.position.y = 4 + Math.sin(t * 1.1 + n.phase) * 0.35;
        n.core.rotation.y += dt * 0.35;
        n.ring.rotation.z += dt * 0.45;
        n.moons.forEach((m) => { m.rotation.y += dt * m.userData.speed; });
        n.bounce = Math.max(0, n.bounce - dt * 1.4);
      } else n.bounce = 0;
      const want = i === active ? 1.18 : 1;
      n.scale += (want - n.scale) * Math.min(1, dt * 7);
      const sq = 1 + Math.sin(n.bounce * Math.PI * 3) * n.bounce * 0.2;
      const xz = n.scale * (1 - (sq - 1) * 0.5);
      n.g.scale.set(xz, n.scale * sq, xz);

      v.copy(n.pos).add(off.set(0, 6.4, 0)).project(camera);
      const d = camera.position.distanceTo(n.pos);
      const visible = v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15;
      const o = visible ? clamp(1 - (d - 30) / 90, 0, 1) : 0;
      n.label.style.opacity = o.toFixed(3);
      n.label.style.pointerEvents = o > 0.3 ? "auto" : "none";
      n.label.tabIndex = o > 0.3 ? 0 : -1;
      n.label.style.transform = `translate(-50%,-50%) translate(${((v.x + 1) / 2) * innerWidth}px,${((1 - v.y) / 2) * innerHeight}px)`;
      n.label.classList.toggle("active", i === active);
    });

    if (!reduce) {
      clouds.forEach((c) => { c.position.y = c.userData.y + Math.sin(t * c.userData.sp + c.userData.ph) * 1.4; c.position.x += Math.sin(t * 0.1 + c.userData.ph) * dt * 0.4; });
      blobs.forEach((b) => { b.position.y = b.userData.y + Math.sin(t * b.userData.sp + b.userData.ph) * 1.2; b.rotation.x += dt * 0.2; b.rotation.y += dt * 0.25; });
    }

    onProgress(cur);
    renderer.render(scene, camera);
  }
  frame();

  return { jumpTo };
}
