import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function start({ stages, onSelect, onActive, onProgress }) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("scene");
  const labelsEl = document.getElementById("labels");
  const N = stages.length;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const BG = 0x05060d;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.011);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700);

  // ---- Path: a winding road with a runway before the first and after the last stage
  const pts = [];
  for (let i = -1; i <= N; i++) {
    pts.push(new THREE.Vector3(Math.sin(i * 0.95) * 16, Math.cos(i * 0.6) * 4 + i * 1.6, -(i + 1) * 30));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);

  const SEG = 900, RAD = 8;
  const dimGeo = new THREE.TubeGeometry(curve, SEG, 0.16, RAD, false);
  scene.add(new THREE.Mesh(dimGeo, new THREE.MeshBasicMaterial({ color: 0x27305a })));
  const litGeo = new THREE.TubeGeometry(curve, SEG, 0.26, RAD, false);
  const lit = new THREE.Mesh(litGeo, new THREE.MeshBasicMaterial({ color: 0x8be9ff }));
  lit.geometry.setDrawRange(0, 0);
  scene.add(lit);
  const idxPerSeg = RAD * 6;

  // ---- Lights
  scene.add(new THREE.HemisphereLight(0x8fa0ff, 0x120a24, 1.1));
  const follow = new THREE.PointLight(0xffffff, 900, 0, 2);
  scene.add(follow);

  // ---- Stars
  {
    const n = 3000, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 220;
      arr[i * 3 + 1] = (Math.random() - 0.3) * 120 + 10;
      arr[i * 3 + 2] = -Math.random() * (N + 3) * 30 + 30;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.45, color: 0xaebbff, transparent: true, opacity: 0.8, depthWrite: false })));
  }

  // ---- Milestones, placed alternately left/right of the path
  const up = new THREE.Vector3(0, 1, 0);
  const nodes = [];
  const pickables = [];
  const uOf = (i) => (i + 1) / (N + 1);

  stages.forEach((s, i) => {
    const u = uOf(i);
    const p = curve.getPointAt(u);
    const side = new THREE.Vector3().crossVectors(curve.getTangentAt(u), up).normalize().multiplyScalar(i % 2 ? -7 : 7);
    const pos = p.clone().add(side).add(new THREE.Vector3(0, 1.5, 0));
    const color = new THREE.Color(s.color);
    const dim = s.status === "planned" ? 0.45 : 1;

    const g = new THREE.Group();
    g.position.copy(pos);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 1),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55 * dim, roughness: 0.35, metalness: 0.2, flatShading: true })
    );
    core.userData.i = i;
    g.add(core);
    pickables.push(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.4, 1),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.3 * dim })
    );
    g.add(shell);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.05, 8, 96),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 * dim })
    );
    ring.rotation.x = Math.PI / 2.4;
    g.add(ring);

    const moons = [];
    const m = Math.min(s.groups.length, 6);
    for (let k = 0; k < m; k++) {
      const pivot = new THREE.Group();
      pivot.rotation.set(k * 0.7, k * 1.1, 0);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), new THREE.MeshBasicMaterial({ color }));
      moon.position.x = 4.6 + (k % 2) * 0.7;
      pivot.add(moon);
      pivot.userData.speed = 0.25 + k * 0.05;
      g.add(pivot);
      moons.push(pivot);
    }
    scene.add(g);

    // stub connecting the path to the milestone
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([p, pos]),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 * dim })
    ));
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshBasicMaterial({ color }));
    beacon.position.copy(p);
    scene.add(beacon);

    // DOM label
    const label = document.createElement("button");
    label.className = "label" + (s.status === "planned" ? " planned" : "");
    label.style.setProperty("--c", s.color);
    label.tabIndex = -1;
    label.innerHTML = `<span>${s.id}</span>${s.title}`;
    label.addEventListener("click", () => onSelect(i));
    labelsEl.appendChild(label);

    nodes.push({ g, core, shell, ring, moons, label, pos, scale: 1 });
  });

  // ---- Post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.7, 0.2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(Math.min(devicePixelRatio, 2));
    composer.setSize(w, h);
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
    if (moved < 6) { const i = pick(e); if (i >= 0) onSelect(i); }
  });
  canvas.addEventListener("pointermove", (e) => { canvas.style.cursor = pick(e) >= 0 ? "pointer" : "default"; });

  let mx = 0, my = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  // ---- Loop
  const clock = new THREE.Clock();
  const v = new THREE.Vector3();
  const tan = new THREE.Vector3();
  let active = -2;

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    cur += (target - cur) * (reduce ? 1 : 1 - Math.pow(0.001, dt));

    const back = curve.getPointAt(clamp(cur - 0.02, 0, 1));
    const ahead = curve.getPointAt(clamp(cur + 0.025, 0, 1));
    camera.position.copy(back).add(v.set(0, 3.2, 0));
    if (!reduce) camera.position.add(v.set(mx * 2, -my * 1.2, 0));
    camera.lookAt(ahead);
    tan.copy(camera.position);
    follow.position.copy(camera.position);

    lit.geometry.setDrawRange(0, Math.floor(cur * SEG) * idxPerSeg);

    const idx = clamp(Math.round(cur * (N + 1)) - 1, 0, N - 1);
    const idxOrNone = cur < 0.5 / (N + 1) ? -1 : idx;
    if (idxOrNone !== active) { active = idxOrNone; onActive(active); }

    nodes.forEach((n, i) => {
      if (!reduce) {
        n.core.rotation.y += dt * 0.4;
        n.core.rotation.x += dt * 0.15;
        n.shell.rotation.y -= dt * 0.2;
        n.ring.rotation.z += dt * 0.5;
        n.moons.forEach((m) => { m.rotation.y += dt * m.userData.speed; });
      }
      const want = i === active ? 1.3 : 1;
      n.scale += (want - n.scale) * Math.min(1, dt * 6);
      n.g.scale.setScalar(n.scale);

      v.copy(n.pos).add(new THREE.Vector3(0, 4.6, 0)).project(camera);
      const d = camera.position.distanceTo(n.pos);
      const visible = v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15;
      const o = visible ? clamp(1 - (d - 25) / 90, 0, 1) : 0;
      n.label.style.opacity = o.toFixed(3);
      n.label.style.pointerEvents = o > 0.3 ? "auto" : "none";
      n.label.tabIndex = o > 0.3 ? 0 : -1;
      n.label.style.transform = `translate(-50%,-50%) translate(${((v.x + 1) / 2) * innerWidth}px,${((1 - v.y) / 2) * innerHeight}px)`;
      n.label.classList.toggle("active", i === active);
    });

    onProgress(cur);
    composer.render();
  }
  frame();

  return { jumpTo };
}
