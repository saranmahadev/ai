import * as RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";

type UniverseOptions = {
  story: HTMLElement;
  canvas: HTMLCanvasElement;
};

type KnowledgeNode = {
  mesh: THREE.Mesh;
  rest: THREE.Vector3;
  garden: THREE.Vector3;
  neural: THREE.Vector3;
  orbitalAngle: number;
  tone: THREE.Color;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (start: number, end: number, value: number) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};

const phaseForProgress = (progress: number) => {
  if (progress < 0.1) return ["00", "The void"];
  if (progress < 0.23) return ["01", "Gravity awakens"];
  if (progress < 0.48) return ["02", "Matter gathers"];
  if (progress < 0.66) return ["03", "Connections form"];
  if (progress < 0.8) return ["04", "Knowledge grows"];
  if (progress < 0.94) return ["05", "Intelligence emerges"];
  return ["06", "LEARN"];
};

class AmbientSound {
  private context?: AudioContext;
  private gain?: GainNode;
  private pan?: StereoPannerNode;
  private active = false;

  toggle() {
    if (this.active) {
      this.active = false;
      this.gain?.gain.exponentialRampToValueAtTime(0.0001, this.context!.currentTime + 0.25);
      return false;
    }

    this.context ??= new AudioContext();
    this.gain ??= this.createSound();
    this.context.resume();
    this.active = true;
    this.gain.gain.exponentialRampToValueAtTime(0.045, this.context.currentTime + 0.35);
    return true;
  }

  update(pointerX: number, energy: number) {
    if (!this.context || !this.gain || !this.pan || !this.active) return;
    const now = this.context.currentTime;
    this.pan.pan.setTargetAtTime(pointerX * 0.45, now, 0.2);
    this.gain.gain.setTargetAtTime(0.026 + energy * 0.025, now, 0.25);
  }

  dispose() {
    this.context?.close();
  }

  private createSound() {
    const gain = this.context!.createGain();
    const filter = this.context!.createBiquadFilter();
    const oscillator = this.context!.createOscillator();
    const harmonic = this.context!.createOscillator();
    this.pan = this.context!.createStereoPanner();

    oscillator.type = "sine";
    oscillator.frequency.value = 55;
    harmonic.type = "sine";
    harmonic.frequency.value = 82.5;
    filter.type = "lowpass";
    filter.frequency.value = 440;
    gain.gain.value = 0.0001;

    oscillator.connect(filter);
    harmonic.connect(filter);
    filter.connect(this.pan);
    this.pan.connect(gain);
    gain.connect(this.context!.destination);
    oscillator.start();
    harmonic.start();
    return gain;
  }
}

export async function createKnowledgeUniverse({ story, canvas }: UniverseOptions) {
  if (!window.WebGLRenderingContext) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = window.innerWidth > 700;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  story.classList.add("is-rendered");

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#1a2423", 9, 20);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.1, 7.2);
  const clock = new THREE.Clock();
  const world = new THREE.Group();
  scene.add(world);

  const ambient = new THREE.HemisphereLight("#f9ecdc", "#274147", 1.8);
  const keyLight = new THREE.DirectionalLight("#ffe9d0", 3.4);
  keyLight.position.set(-4, 6, 5);
  keyLight.castShadow = renderer.shadowMap.enabled;
  keyLight.shadow.mapSize.set(1024, 1024);
  const rimLight = new THREE.PointLight("#9ccfcb", 20, 12, 2);
  rimLight.position.set(3, 1, 3);
  scene.add(ambient, keyLight, rimLight);

  const clayMaterial = (color: string) => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.79,
    metalness: 0.01,
    emissive: new THREE.Color(color).multiplyScalar(0.025),
  });
  const seedMaterial = clayMaterial("#b8d4bd");
  const glassMaterial = new THREE.LineBasicMaterial({ color: "#d8ece8", transparent: true, opacity: 0.42 });
  const basin = new THREE.Mesh(
    new THREE.SphereGeometry(4.6, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: "#d8cfc2", roughness: 0.92, metalness: 0 }),
  );
  basin.scale.y = 0.18;
  basin.position.y = -2.15;
  basin.receiveShadow = true;
  world.add(basin);

  const seed = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 4), seedMaterial);
  seed.castShadow = true;
  seed.position.set(0, 0.05, 0);
  world.add(seed);

  const core = new THREE.Group();
  const coreShell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 5), clayMaterial("#b8d4bd"));
  const coreGlass = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.49, 3),
    new THREE.MeshPhysicalMaterial({ color: "#f5d87e", transparent: true, opacity: 0.48, roughness: 0.08, transmission: 0.25 }),
  );
  const coreLight = new THREE.PointLight("#f5d87e", 0, 5, 2);
  coreShell.castShadow = true;
  core.add(coreShell, coreGlass, coreLight);
  core.scale.setScalar(0.001);
  world.add(core);

  const nodeDefinitions = [
    { color: "#b8d4bd", rest: [-2.1, 0.4, 0.1], garden: [-2.2, 0.25, 0.2], neural: [-2.35, 0.6, 0] },
    { color: "#f2bc9d", rest: [-0.75, 1.05, -0.1], garden: [-0.95, 1.15, 0], neural: [-0.9, 1.35, 0.1] },
    { color: "#c9b9e6", rest: [0.75, 0.65, 0.15], garden: [0.5, 1.5, -0.1], neural: [0.65, 0.35, 0] },
    { color: "#f3d879", rest: [2.05, 0.15, -0.1], garden: [1.85, 0.2, 0.1], neural: [2.25, 1.12, 0] },
    { color: "#a8d7e5", rest: [0, -1.12, 0.2], garden: [0.05, -0.9, 0], neural: [0.1, -1.25, 0] },
  ];
  const geometries = [
    new THREE.IcosahedronGeometry(0.46, 3),
    new THREE.CapsuleGeometry(0.27, 0.38, 8, 16),
    new THREE.DodecahedronGeometry(0.48, 2),
    new THREE.TorusGeometry(0.37, 0.16, 12, 32),
    new THREE.SphereGeometry(0.45, 24, 18),
  ];
  const nodes: KnowledgeNode[] = nodeDefinitions.map((definition, index) => {
    const mesh = new THREE.Mesh(geometries[index], clayMaterial(definition.color));
    mesh.position.set(0, 3.2 + index * 0.4, -0.1);
    mesh.rotation.set(index, index * 1.2, 0);
    mesh.castShadow = true;
    world.add(mesh);
    return {
      mesh,
      rest: new THREE.Vector3(...definition.rest),
      garden: new THREE.Vector3(...definition.garden),
      neural: new THREE.Vector3(...definition.neural),
      orbitalAngle: index / nodeDefinitions.length * Math.PI * 2,
      tone: new THREE.Color(definition.color),
    };
  });

  const connectionPairs = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 2], [4, 3]];
  const connections = connectionPairs.map(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(geometry, glassMaterial.clone());
    line.visible = false;
    world.add(line);
    return line;
  });
  const gardenStems = nodes.map(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const stem = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#87ad8d", transparent: true, opacity: 0 }));
    stem.visible = false;
    world.add(stem);
    return stem;
  });
  const orbitRings = nodes.map((node, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.67 + index * 0.06, 0.017, 8, 48),
      new THREE.MeshBasicMaterial({ color: node.tone, transparent: true, opacity: 0.42 }),
    );
    ring.visible = false;
    world.add(ring);
    return ring;
  });
  const energyPulses = connectionPairs.map(() => {
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 12),
      new THREE.MeshBasicMaterial({ color: "#fff0b8", transparent: true, opacity: 0.94 }),
    );
    pulse.visible = false;
    world.add(pulse);
    return pulse;
  });

  const moteCount = window.innerWidth < 700 ? 64 : 180;
  const moteGeometry = new THREE.IcosahedronGeometry(0.045, 1);
  const moteMaterial = new THREE.MeshStandardMaterial({ color: "#f4e7db", roughness: 0.72, transparent: true, opacity: 0.9 });
  const motes = new THREE.InstancedMesh(moteGeometry, moteMaterial, moteCount);
  const moteData = Array.from({ length: moteCount }, (_, index) => {
    const angle = index * 2.399;
    const radius = 0.7 + (index % 17) * 0.11;
    return {
      start: new THREE.Vector3(Math.sin(angle) * radius, 4.5 + (index % 11) * 0.28, Math.cos(angle) * radius * 0.45),
      cluster: new THREE.Vector3(Math.sin(angle) * (1.4 + (index % 5) * 0.22), ((index % 9) - 4) * 0.24, Math.cos(angle) * 0.75),
      scale: 0.35 + (index % 4) * 0.16,
    };
  });
  motes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  world.add(motes);

  const rapierReady = RAPIER.init().then(() => {
    const physics = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    const floor = physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1.92, 0));
    physics.createCollider(RAPIER.ColliderDesc.cuboid(4.5, 0.1, 2), floor);
    const seedBody = physics.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 2.8, 0).setLinearDamping(1.8));
    physics.createCollider(RAPIER.ColliderDesc.ball(0.28).setRestitution(0.44).setFriction(1.15), seedBody);
    seedBody.setEnabled(false);
    return { physics, seedBody };
  });
  let physicsState: Awaited<typeof rapierReady> | undefined;
  rapierReady.then((state) => { physicsState = state; });

  const phaseIndex = story.querySelector<HTMLElement>(".universe-phase-index");
  const phaseName = story.querySelector<HTMLElement>(".universe-phase-name");
  const soundButton = story.querySelector<HTMLButtonElement>(".sound-toggle");
  const sound = new AmbientSound();
  let currentPhase = "";
  let pointerX = 0;
  let pointerY = 0;
  let impulse = 0;
  let active = true;
  let seedReleased = false;
  let lastTime = 0;

  const resize = () => {
    const bounds = story.getBoundingClientRect();
    camera.aspect = bounds.width / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(bounds.width, window.innerHeight, false);
  };
  const progress = () => {
    const bounds = story.getBoundingClientRect();
    return clamp(-bounds.top / Math.max(1, bounds.height - window.innerHeight));
  };
  const onPointerMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  };
  const onPointerDown = () => { impulse = 1; };

  soundButton?.addEventListener("click", () => {
    const enabled = sound.toggle();
    soundButton.ariaPressed = String(enabled);
    soundButton.textContent = enabled ? "Sound on" : "Sound off";
    soundButton.setAttribute("aria-label", enabled ? "Mute ambient sound" : "Enable ambient sound");
  });
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("resize", resize);
  resize();

  const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { threshold: 0.05 });
  observer.observe(story);

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();

  const render = (time: number) => {
    requestAnimationFrame(render);
    if (!active) return;
    const delta = Math.min(0.04, (time - lastTime) / 1000 || 0.016);
    lastTime = time;
    const storyProgress = reduceMotion ? 0.89 : progress();
    const elapsed = reduceMotion ? 0 : clock.getElapsedTime();
    const [phaseNumber, phaseLabel] = phaseForProgress(storyProgress);
    const phaseKey = `${phaseNumber}-${phaseLabel}`;
    if (phaseKey !== currentPhase) {
      currentPhase = phaseKey;
      if (phaseIndex) phaseIndex.textContent = phaseNumber;
      if (phaseName) phaseName.textContent = phaseLabel;
    }

    const emergence = smooth(0.19, 0.42, storyProgress);
    const connected = smooth(0.42, 0.61, storyProgress);
    const garden = smooth(0.6, 0.76, storyProgress);
    const planet = smooth(0.74, 0.87, storyProgress);
    const neural = smooth(0.84, 0.96, storyProgress);
    const finale = smooth(0.94, 1, storyProgress);
    story.classList.toggle("is-final", finale > 0.45);

    if (physicsState && storyProgress > 0.12 && !seedReleased) {
      physicsState.seedBody.setEnabled(true);
      seedReleased = true;
    }
    if (seedReleased && physicsState) {
      physicsState.physics.timestep = delta;
      physicsState.physics.step();
      const translation = physicsState.seedBody.translation();
      seed.position.set(translation.x, translation.y, translation.z);
      const speed = physicsState.seedBody.linvel().length();
      seed.scale.set(1 + speed * 0.025, 1 - Math.min(speed * 0.022, 0.12), 1 + speed * 0.025);
    }
    if (storyProgress < 0.12) {
      seed.position.set(0, Math.sin(elapsed * 1.6) * 0.05, 0);
      seed.rotation.y += delta * 0.25;
    }
    seed.visible = finale < 0.72;

    const orbitalCenter = new THREE.Vector3(0, 0, 0);
    nodes.forEach((node, index) => {
      const fallPosition = new THREE.Vector3(node.rest.x, 2.7 - index * 0.18, node.rest.z);
      const orbitalPosition = new THREE.Vector3(
        Math.cos(elapsed * 0.35 + node.orbitalAngle) * (1.65 + index * 0.12),
        Math.sin(elapsed * 0.46 + node.orbitalAngle) * 0.7,
        Math.sin(elapsed * 0.35 + node.orbitalAngle) * 0.5,
      );
      const target = fallPosition.lerp(node.rest, connected).lerp(node.garden, garden).lerp(orbitalPosition, planet).lerp(node.neural, neural);
      target.lerp(orbitalCenter, finale);
      node.mesh.position.lerp(target, 1 - Math.exp(-delta * 3.2));
      const pulse = 1 + Math.sin(elapsed * 1.5 + index) * 0.035 + impulse * 0.08;
      const nodeScale = (0.72 + planet * 0.42) * (1 - finale * 0.95) * pulse;
      node.mesh.scale.setScalar(Math.max(0.001, nodeScale));
      node.mesh.rotation.x += delta * (0.16 + index * 0.012);
      node.mesh.rotation.y += delta * (0.22 + index * 0.01);
    });

    connectionPairs.forEach(([from, to], index) => {
      const line = connections[index];
      const visible = connected > 0.02 && finale < 0.92;
      line.visible = visible;
      if (!visible) return;
      const midpoint = nodes[from].mesh.position.clone().lerp(nodes[to].mesh.position, 0.5);
      midpoint.z += 0.2 + Math.sin(elapsed * 1.2 + index) * 0.06;
      line.geometry.setFromPoints([nodes[from].mesh.position, midpoint, nodes[to].mesh.position]);
      (line.material as THREE.LineBasicMaterial).opacity = 0.1 + connected * 0.46;

      const pulse = energyPulses[index];
      const travel = (elapsed * 0.28 + index * 0.17) % 1;
      pulse.position.copy(nodes[from].mesh.position).lerp(nodes[to].mesh.position, travel);
      pulse.position.z += Math.sin(travel * Math.PI) * 0.22;
      pulse.scale.setScalar(0.55 + Math.sin(travel * Math.PI) * 0.8);
      pulse.visible = visible && travel < connected;
    });

    nodes.forEach((node, index) => {
      const stem = gardenStems[index];
      const stemVisible = garden > 0.04 && planet < 0.92 && finale < 0.2;
      stem.visible = stemVisible;
      if (stemVisible) {
        const root = node.mesh.position.clone();
        root.y = -1.78 + Math.sin(index * 2.2) * 0.12;
        stem.geometry.setFromPoints([root, node.mesh.position]);
        (stem.material as THREE.LineBasicMaterial).opacity = garden * (1 - planet) * 0.56;
      }

      const ring = orbitRings[index];
      ring.visible = planet > 0.04 && neural < 0.92 && finale < 0.2;
      if (ring.visible) {
        ring.position.copy(node.mesh.position);
        ring.rotation.z = elapsed * (0.42 + index * 0.06) + index;
        ring.rotation.x = 0.2 + Math.sin(elapsed * 0.35 + index) * 0.2;
        ring.scale.setScalar(planet * (1 - neural * 0.65));
      }
    });

    const visibleMotes = Math.floor(moteCount * emergence * (1 - finale));
    motes.count = visibleMotes;
    for (let index = 0; index < visibleMotes; index += 1) {
      const mote = moteData[index];
      position.copy(mote.start).lerp(mote.cluster, connected);
      position.y += Math.sin(elapsed * 1.3 + index) * 0.05;
      position.lerp(orbitalCenter, finale * 0.9);
      const pointerDistance = Math.hypot(position.x - pointerX * 2.5, position.y + pointerY * 1.5);
      if (pointerDistance < 1.2) position.z += (1.2 - pointerDistance) * 0.12;
      scale.setScalar(mote.scale * (1 + impulse * 0.3));
      quaternion.setFromEuler(new THREE.Euler(elapsed * 0.15 + index, elapsed * 0.12, 0));
      matrix.compose(position, quaternion, scale);
      motes.setMatrixAt(index, matrix);
    }
    motes.instanceMatrix.needsUpdate = true;

    const coreScale = smooth(0.86, 0.97, storyProgress) * (1 - finale * 0.2);
    core.scale.setScalar(coreScale);
    core.rotation.y += delta * 0.32;
    core.rotation.z = Math.sin(elapsed * 0.5) * 0.12;
    coreLight.intensity = 4 + coreScale * 25 + impulse * 14;
    coreShell.scale.set(1 + Math.sin(elapsed * 1.8) * 0.045, 1 - Math.sin(elapsed * 1.8) * 0.025, 1 + Math.sin(elapsed * 1.8) * 0.045);
    impulse = Math.max(0, impulse - delta * 1.8);

    camera.position.x += (pointerX * 0.28 - camera.position.x) * delta * 1.2;
    camera.position.y += (-pointerY * 0.2 - camera.position.y) * delta * 1.2;
    camera.position.z = 7.2 - storyProgress * 1.65;
    camera.lookAt(0, -0.1, 0);
    world.rotation.y = Math.sin(elapsed * 0.13) * 0.05 + pointerX * 0.045;
    scene.fog!.color.setHSL(0.47, 0.17, 0.12 + finale * 0.56);
    renderer.render(scene, camera);
    sound.update(pointerX, coreScale + impulse);
  };

  requestAnimationFrame(render);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", resize);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDown);
    renderer.dispose();
    sound.dispose();
  };
}
