import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { clay } from "../scenes/clay.js";

// A chunky clay rocket built from primitives. Origin is at the base of the engine; +y is up, +z is the front.
export function createRocket() {
  const g = new THREE.Group();
  const cream = 0xfff3e2, coral = 0xff8f8f, lilac = 0xb39cf5, sky = 0x9fd4ff;
  const add = (mesh, x = 0, y = 0, z = 0) => { mesh.position.set(x, y, z); mesh.castShadow = true; g.add(mesh); return mesh; };

  add(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 3.2, 40), clay(cream)), 0, 2.4, 0);
  const nose = add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), clay(coral)), 0, 4, 0);
  nose.scale.y = 1.9;
  add(new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.22, 20, 48), clay(coral)), 0, 0.85, 0).rotation.x = Math.PI / 2;
  add(new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.09, 12, 48), clay(lilac)), 0, 3.6, 0).rotation.x = Math.PI / 2;

  // porthole
  const ring = add(new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.14, 16, 40), clay(lilac)), 0, 2.7, 1.1);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 20), clay(sky, { roughness: 0.25, clearcoat: 0.9 })), 0, 2.7, 1.02).scale.z = 0.55;
  ring.rotation.y = 0;

  // fins
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.rotation.y = a;
    const fin = new THREE.Mesh(new RoundedBoxGeometry(0.34, 1.7, 1.3, 5, 0.16), clay(coral));
    fin.position.set(0, 1.2, 1.35);
    fin.rotation.x = -0.35;
    fin.castShadow = true;
    pivot.add(fin);
    g.add(pivot);
  }

  // engine
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.85, 0.55, 32), clay(lilac)), 0, 0.3, 0);

  // flame (hidden until launch)
  const flame = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.ConeGeometry(0.62, 2.4, 24), new THREE.MeshBasicMaterial({ color: 0xffa64d }));
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.6, 24), new THREE.MeshBasicMaterial({ color: 0xffe08a }));
  outer.rotation.x = inner.rotation.x = Math.PI;
  outer.position.y = -1.2; inner.position.y = -0.8;
  flame.add(outer, inner);
  flame.position.y = 0.05;
  flame.scale.setScalar(0.001);
  g.add(flame);

  return { group: g, flame };
}
