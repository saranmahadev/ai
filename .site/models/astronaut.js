import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { clay } from "../scenes/clay.js";

// A small clay astronaut. Origin at the feet, +y up, +z forward (the visor faces +z).
export function createAstronaut() {
  const g = new THREE.Group();
  const cream = 0xfff3e2, coral = 0xff8f8f, lilac = 0xb39cf5;
  const part = (geo, mat, x = 0, y = 0, z = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.castShadow = true; parent.add(m);
    return m;
  };

  part(new THREE.CapsuleGeometry(0.5, 0.55, 12, 24), clay(cream), 0, 1.05, 0);            // torso
  part(new THREE.TorusGeometry(0.5, 0.08, 10, 32), clay(coral), 0, 0.85, 0).rotation.x = Math.PI / 2; // belt
  part(new THREE.SphereGeometry(0.62, 32, 24), clay(cream), 0, 1.95, 0.02);                 // helmet
  const visor = part(new THREE.SphereGeometry(0.47, 28, 20), clay(0x5b6cc0, { roughness: 0.2, clearcoat: 1 }), 0, 1.95, 0.3);
  visor.scale.set(1.05, 0.85, 0.7);
  part(new RoundedBoxGeometry(0.75, 0.95, 0.4, 5, 0.15), clay(coral), 0, 1.15, -0.6);       // backpack
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), clay(lilac), 0.25, 2.75, -0.05);     // antenna
  part(new THREE.SphereGeometry(0.09, 12, 10), clay(coral), 0.25, 2.98, -0.05);

  // limbs hang from pivots at the hips/shoulders so they can swing
  const limb = (x, y, len, r, color) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    part(new THREE.CapsuleGeometry(r, len, 8, 16), clay(color), 0, -len / 2 - r * 0.4, 0, pivot);
    g.add(pivot);
    return pivot;
  };
  const legL = limb(-0.24, 0.62, 0.35, 0.2, lilac), legR = limb(0.24, 0.62, 0.35, 0.2, lilac);
  const armL = limb(-0.68, 1.4, 0.45, 0.17, cream), armR = limb(0.68, 1.4, 0.45, 0.17, cream);
  armL.rotation.z = 0.25; armR.rotation.z = -0.25;

  let phase = 0;
  return {
    group: g,
    // speed: 0..1 (how fast the astronaut is moving); dt in seconds
    animate(speed, dt) {
      phase += dt * (4 + speed * 8);
      const s = Math.sin(phase) * 0.9 * Math.min(1, speed * 2);
      legL.rotation.x = s; legR.rotation.x = -s;
      armL.rotation.x = -s * 0.8; armR.rotation.x = s * 0.8;
      g.children[0].position.y = 1.05 + Math.abs(Math.sin(phase)) * 0.06 * Math.min(1, speed * 2);
    }
  };
}
