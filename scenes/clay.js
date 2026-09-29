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
