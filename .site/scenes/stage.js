import * as THREE from "three";

// One WebGL renderer shared by every 3D scene. A scene is { scene, camera, update(dt, t), resize(w, h) }.
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let active = null;
  const clock = new THREE.Clock();

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    if (active) active.resize(innerWidth, innerHeight);
  }
  addEventListener("resize", resize);
  resize();

  (function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!active) return;
    active.update(dt, clock.elapsedTime);
    renderer.render(active.scene, active.camera);
  })();

  return {
    renderer,
    setActive(s) { active = s; if (s) { s.resize(innerWidth, innerHeight); clock.getDelta(); } }
  };
}
