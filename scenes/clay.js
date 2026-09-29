import * as THREE from "three";

// Shared clay look: matte, slightly glossy, soft sheen.
export const clay = (color, extra = {}) => new THREE.MeshPhysicalMaterial({
  color, roughness: 0.62, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.55,
  sheen: 1, sheenRoughness: 0.7, sheenColor: new THREE.Color(0xffffff), ...extra
});

export const tint = (hex, amount) => new THREE.Color(hex).lerp(new THREE.Color(0xffffff), amount);

export function skyTexture(stops) {
  const c = document.createElement("canvas");
  c.width = 2; c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Sky rig: owns the background, fog, lights, stars and moon of a scene and re-tints them for the time of day.
// base = the scene's daytime intensities, e.g. { hemi: 2.0, sun: 2.4 }
export function createSkyRig(scene, { hemi, sun, base, moonAt = [-40, 45, -200] }) {
  const stars = new THREE.Points(
    (() => {
      const n = 900, a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
        a.set([Math.cos(th) * r * 240, u * 240, Math.sin(th) * r * 240], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(a, 3));
      return g;
    })(),
    new THREE.PointsMaterial({ color: 0xfff6e0, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })
  );
  const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 20), new THREE.MeshBasicMaterial({ color: 0xfff3d6, fog: false }));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 20), new THREE.MeshBasicMaterial({ color: 0xfff3d6, fog: false, transparent: true, opacity: 0.07, depthWrite: false }));
  moon.add(halo);
  moon.position.set(...moonAt);
  const rig = new THREE.Group();
  rig.add(stars, moon);
  scene.add(rig);
  stars.frustumCulled = false;

  const density = scene.fog ? scene.fog.density : 0.006;
  scene.fog = new THREE.FogExp2(0xffffff, density);

  return {
    glow: [], // materials that should light up at night: { m, color }
    apply(t) {
      const old = scene.background;
      scene.background = skyTexture([[0, t.top], [0.55, t.mid], [1, t.bot]]);
      if (old && old.dispose) old.dispose();
      scene.fog.color.set(t.fog);
      if (hemi) { hemi.color.set(t.hSky); hemi.groundColor.set(t.hGround); hemi.intensity = base.hemi * t.hemiK; }
      if (sun) { sun.color.set(t.sun); sun.intensity = base.sun * t.sunK; }
      stars.material.opacity = Math.max(0, (t.night - 0.35) / 0.65);
      moon.visible = t.night > 0.5;
      moon.material.opacity = 1;
      this.night = t.night;
      for (const g of this.glow) g.m.emissiveIntensity = g.k * t.night;
    },
    // keep the sky centred on the camera so stars and moon never get closer
    follow(camera) { rig.position.copy(camera.position); },
    addGlow(m, color, k = 0.55) { m.emissive = new THREE.Color(color); m.emissiveIntensity = k * (this.night || 0); this.glow.push({ m, k }); }
  };
}
