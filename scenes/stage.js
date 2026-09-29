import * as THREE from "three";

// One WebGL renderer shared by every 3D scene. A scene is { scene, camera, update(dt, t), resize(w, h) }.
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let active = null;
  const clock = new THREE.Clock();
  // adaptive quality: phones start lighter, and any device that runs slowly drops to 1x pixels
  let ratio = Math.min(devicePixelRatio, matchMedia("(pointer: coarse)").matches ? 1.5 : 2);
  renderer.setPixelRatio(ratio);
  let slowFrames = 0, frames = 0, watch = 0;

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
    if (watch < 240) { // watch the first ~4s of frames; if most are slow, lower the resolution
      watch++; frames++; if (dt > 1 / 28) slowFrames++;
      if (watch === 240 && ratio > 1 && slowFrames / frames > 0.6) { ratio = 1; renderer.setPixelRatio(1); resize(); }
    }
    active.update(dt, clock.elapsedTime);
    renderer.render(active.scene, active.camera);
  })();

  return {
    renderer,
    setActive(s) { active = s; if (s) { s.resize(innerWidth, innerHeight); clock.getDelta(); } }
  };
}
