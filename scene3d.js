/**
 * Escena 3D geotérmica (Three.js) — terreno estable con corte didáctico
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function tex(draw, size = 256) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export function createGeoScene(container) {
  // Limpia canvas previos si se reinicia
  container.querySelectorAll("canvas.view3d-canvas").forEach((el) => el.remove());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa8cfc2);
  scene.fog = new THREE.Fog(0xa8cfc2, 20, 45);

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0xa8cfc2, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = "view3d-canvas";
  container.insertBefore(renderer.domElement, container.firstChild);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 80);
  camera.position.set(7.2, 4.0, 8.5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.minDistance = 5;
  controls.maxDistance = 20;
  controls.target.set(1.2, 0.6, 1.0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.25;

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  scene.add(new THREE.HemisphereLight(0xeaf7ff, 0x7a5a30, 0.55));

  const sun = new THREE.DirectionalLight(0xfff3dd, 1.25);
  sun.position.set(6, 12, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  sun.shadow.bias = -0.0003;
  scene.add(sun);

  const root = new THREE.Group();
  scene.add(root);

  // ——— Texturas simples ———
  const mapGrass = tex((g, s) => {
    g.fillStyle = "#3f914d";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = i % 2 ? "#4ea85a" : "#337a3f";
      g.fillRect(Math.random() * s, Math.random() * s, 2, 3 + Math.random() * 4);
    }
  }, 256);
  mapGrass.wrapS = mapGrass.wrapT = THREE.RepeatWrapping;
  mapGrass.repeat.set(6, 6);

  const mapSoil = tex((g, s) => {
    g.fillStyle = "#8b6914";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 500; i++) {
      g.fillStyle = "rgba(196,165,116,0.35)";
      g.fillRect(Math.random() * s, Math.random() * s, 3, 3);
    }
  });
  const mapDeep = tex((g, s) => {
    g.fillStyle = "#5c4012";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = "rgba(120,80,30,0.4)";
      g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
  });
  const mapRock = tex((g, s) => {
    g.fillStyle = "#6e6358";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 350; i++) {
      g.fillStyle = "rgba(160,150,140,0.3)";
      g.fillRect(Math.random() * s, Math.random() * s, 4, 3);
    }
  });
  const mapWood = tex((g, s) => {
    g.fillStyle = "#e2d2b8";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 14; i++) {
      g.strokeStyle = "rgba(120,80,40,0.2)";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(0, (i + 0.5) * (s / 14));
      g.lineTo(s, (i + 0.5) * (s / 14) + (i % 2 ? 4 : -4));
      g.stroke();
    }
  });

  const matGrass = new THREE.MeshStandardMaterial({
    map: mapGrass,
    roughness: 0.95,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const matSoil = new THREE.MeshStandardMaterial({
    map: mapSoil,
    color: 0xc4a35a,
    roughness: 0.92,
  });
  const matDeep = new THREE.MeshStandardMaterial({
    map: mapDeep,
    color: 0x8a5a22,
    roughness: 0.95,
  });
  const matRock = new THREE.MeshStandardMaterial({
    map: mapRock,
    color: 0x7a736a,
    roughness: 0.9,
  });
  const matWall = new THREE.MeshStandardMaterial({ map: mapWood, roughness: 0.8 });
  const matRoof = new THREE.MeshStandardMaterial({ color: 0x8b3a28, roughness: 0.7, metalness: 0.1 });
  const matMetal = new THREE.MeshStandardMaterial({ color: 0x90a0b0, roughness: 0.35, metalness: 0.85 });
  const matPump = new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    emissive: 0x0f766e,
    emissiveIntensity: 0.2,
    roughness: 0.4,
    metalness: 0.45,
  });
  const matWindow = new THREE.MeshStandardMaterial({
    color: 0xa8e0d0,
    emissive: 0xff9955,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.4,
  });
  const matConv = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.55 });

  // ——— Césped sólido + diorama de corte al frente (siempre legible) ———
  const ground = new THREE.Mesh(new THREE.CircleGeometry(12, 64), matGrass);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  // Diorama elevado: capas siempre visibles (sin oclusión del césped)
  const CUT = { x: 2.2, z: 2.1, w: 3.8, d: 1.2 };
  const cut = new THREE.Group();
  cut.position.set(CUT.x, 1.55, CUT.z);
  root.add(cut);

  // Pedestal
  const pedestal = new THREE.Mesh(
    new THREE.BoxGeometry(CUT.w + 0.35, 0.12, CUT.d + 0.35),
    new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.8, metalness: 0.2 })
  );
  pedestal.position.set(0, -2.4, 0);
  pedestal.castShadow = true;
  cut.add(pedestal);

  function layer(h, y, color) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(CUT.w, h, CUT.d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0.05 })
    );
    m.position.set(0, y, 0);
    m.castShadow = true;
    m.receiveShadow = true;
    cut.add(m);
    return m;
  }
  // Tres estratos con gap de 0.06 para evitar z-fighting
  layer(0.5, 0.0, 0xe0b87a);
  const deepLayer = layer(0.85, -0.74, 0xa05a2c);
  layer(1.05, -1.75, 0x78818c);

  // ——— Casa ———
  const house = new THREE.Group();
  house.position.set(-3.1, 0.12, -0.35);
  root.add(house);

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 2.1), matWall);
  body.position.y = 0.9;
  body.castShadow = true;
  body.receiveShadow = true;
  house.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.95, 1.0, 4), matRoof);
  roof.position.y = 2.3;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  house.add(roof);

  const glasses = [];
  function addWin(x, z) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.06), new THREE.MeshStandardMaterial({ color: 0x3b2a1c }));
    f.position.set(x, 1.05, z);
    house.add(f);
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), matWindow.clone());
    g.position.set(x, 1.05, z + (z > 0 ? 0.02 : -0.02));
    house.add(g);
    glasses.push(g);
  }
  addWin(-0.55, 1.07);
  addWin(0.55, 1.07);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 1.0, 0.07),
    new THREE.MeshStandardMaterial({ color: 0x5a3422, roughness: 0.7 })
  );
  door.position.set(0, 0.5, 1.08);
  house.add(door);

  // ——— Bomba de calor ———
  const heatPump = new THREE.Group();
  heatPump.position.set(-1.35, 0.12, 1.4);
  root.add(heatPump);
  const pumpBody = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.0, 0.55), matPump);
  pumpBody.position.y = 0.5;
  pumpBody.castShadow = true;
  heatPump.add(pumpBody);
  const grill = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 24), matMetal);
  grill.rotation.x = Math.PI / 2;
  grill.position.set(0, 0.55, 0.3);
  heatPump.add(grill);
  const pumpLight = new THREE.PointLight(0x2dd4bf, 0.65, 4.5);
  pumpLight.position.set(0, 0.85, 0);
  heatPump.add(pumpLight);

  // ——— Convencional ———
  const conv = new THREE.Group();
  conv.position.set(4.4, 0.12, -1.5);
  root.add(conv);
  const convBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.7, 0.55), matConv);
  convBody.position.y = 0.35;
  convBody.castShadow = true;
  conv.add(convBody);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 20), matMetal);
  fan.rotation.x = Math.PI / 2;
  fan.position.set(0.22, 0.4, 0.3);
  conv.add(fan);
  const convLight = new THREE.PointLight(0x94a3b8, 0.3, 3);
  convLight.position.set(0, 0.7, 0);
  conv.add(convLight);

  // ——— Sondeos U-pipe (atravesando las capas del diorama) ———
  const pipeHot = [];
  const pipeCold = [];
  [-1.1, 0, 1.1].forEach((x) => {
    const hot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.2, 12),
      new THREE.MeshStandardMaterial({
        color: 0xe07a3d,
        emissive: 0xc45c26,
        emissiveIntensity: 0.7,
        roughness: 0.3,
        metalness: 0.5,
      })
    );
    hot.position.set(x - 0.05, -1.05, 0.25);
    hot.castShadow = true;
    cut.add(hot);
    pipeHot.push(hot);

    const cold = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.2, 12),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.5,
      })
    );
    cold.position.set(x + 0.05, -1.05, 0.25);
    cut.add(cold);
    pipeCold.push(cold);

    const u = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.03, 8, 16, Math.PI), matMetal);
    u.rotation.y = Math.PI / 2;
    u.position.set(x, -2.12, 0.25);
    cut.add(u);

    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.1, 14), matMetal);
    head.position.set(x, 0.28, 0.25);
    cut.add(head);
  });

  function makeTube(points, color, emissive) {
    const curve = new THREE.CatmullRomCurve3(points);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.045, 10, false),
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.5,
        roughness: 0.35,
        metalness: 0.5,
      })
    );
    mesh.castShadow = true;
    root.add(mesh);
    return { mesh, curve };
  }

  // De la bomba al diorama elevado
  const feed = makeTube(
    [
      new THREE.Vector3(-1.35, 0.4, 1.2),
      new THREE.Vector3(0.3, 0.9, 1.55),
      new THREE.Vector3(CUT.x - 1.1, 1.7, CUT.z + 0.15),
    ],
    0xe07a3d,
    0xc45c26
  );
  const ret = makeTube(
    [
      new THREE.Vector3(CUT.x + 1.1, 1.7, CUT.z + 0.15),
      new THREE.Vector3(1.4, 0.95, 1.55),
      new THREE.Vector3(-1.0, 0.4, 1.35),
    ],
    0x38bdf8,
    0x0284c7
  );
  const toHouse = makeTube(
    [
      new THREE.Vector3(-1.55, 0.45, 1.35),
      new THREE.Vector3(-2.2, 0.65, 0.5),
      new THREE.Vector3(-2.55, 0.85, 0.0),
    ],
    0xe07a3d,
    0xc45c26
  );

  // Partículas
  const pGeo = new THREE.SphereGeometry(0.055, 10, 10);
  const particles = [];
  for (let i = 0; i < 42; i++) {
    const mesh = new THREE.Mesh(
      pGeo,
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.95,
        roughness: 0.3,
      })
    );
    mesh.visible = false;
    root.add(mesh);
    particles.push({
      mesh,
      t: i / 42,
      path: i % 3 === 0 ? feed.curve : i % 3 === 1 ? ret.curve : toHouse.curve,
      speed: 0.12 + (i % 5) * 0.02,
    });
  }

  function makeLabel(text) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext("2d");
    const texture = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    );
    sprite.scale.set(1.8, 0.45, 1);
    const label = { sprite, ctx, texture };
    setLabel(label, text);
    return label;
  }

  function setLabel(label, text) {
    const g = label.ctx;
    g.clearRect(0, 0, 256, 64);
    g.fillStyle = "rgba(12,36,28,0.8)";
    g.beginPath();
    if (g.roundRect) g.roundRect(10, 10, 236, 44, 12);
    else g.rect(10, 10, 236, 44);
    g.fill();
    g.fillStyle = "#ecfdf5";
    g.font = "bold 20px sans-serif";
    g.textAlign = "center";
    g.fillText(text, 128, 40);
    label.texture.needsUpdate = true;
  }

  const labelQ = makeLabel("Q edificio");
  labelQ.sprite.position.set(-3.1, 2.7, -0.35);
  root.add(labelQ.sprite);
  const labelP = makeLabel("Bomba");
  labelP.sprite.position.set(-1.35, 1.5, 1.4);
  root.add(labelP.sprite);
  const labelSoil = makeLabel("Corte del terreno");
  labelSoil.sprite.position.set(CUT.x, 2.15, CUT.z + 0.9);
  root.add(labelSoil.sprite);

  // Árboles
  function tree(x, z, s = 1) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * s, 0.11 * s, 0.65 * s, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.9 })
    );
    trunk.position.y = 0.32 * s;
    trunk.castShadow = true;
    g.add(trunk);
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.5 * s, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0x2f7a3e, roughness: 0.85 })
    );
    leaf.position.y = 0.9 * s;
    leaf.castShadow = true;
    g.add(leaf);
    g.position.set(x, 0, z);
    root.add(g);
  }
  tree(-5.4, 2.4, 1.1);
  tree(-5.0, -2.6, 0.95);
  tree(5.8, 2.8, 1.05);

  const clock = new THREE.Clock();
  let sim = {
    geoOk: true,
    heating: true,
    demanda: 8,
    copGeo: 4,
    consumoGeo: 2,
    consumoConv: 8,
    tempTerreno: 18,
  };

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function setState(next) {
    Object.assign(sim, next);
    const tNorm = (sim.tempTerreno - 8) / 20;
    // Oscurece un poco el subsuelo con más temperatura (didáctico)
    deepLayer.material.color.setRGB(0.55 + tNorm * 0.1, 0.27 + tNorm * 0.05, 0.07);
    glasses.forEach((glass) => {
      glass.material.emissiveIntensity = sim.heating
        ? 0.3 + sim.demanda * 0.018
        : 0.12 + sim.demanda * 0.01;
      glass.material.emissive.setHex(sim.heating ? 0xff9955 : 0x44aacc);
    });
    pumpLight.intensity = sim.geoOk ? 0.5 + sim.copGeo * 0.1 : 0.05;
    convLight.intensity = sim.geoOk ? 0.15 + Math.min(1, sim.consumoConv / 12) * 0.5 : 0.05;
    setLabel(labelQ, "Q " + sim.demanda.toFixed(1) + " kW");
    setLabel(labelP, sim.geoOk ? "P " + sim.consumoGeo.toFixed(2) + " kW" : "COP inválido");
    setLabel(labelSoil, "Terreno " + sim.tempTerreno + " °C");

    const hot = sim.heating ? 0xe07a3d : 0x38bdf8;
    const cold = sim.heating ? 0x38bdf8 : 0xe07a3d;
    const inten = sim.geoOk ? 0.65 : 0.05;
    pipeHot.forEach((m) => {
      m.material.color.setHex(hot);
      m.material.emissive.setHex(hot);
      m.material.emissiveIntensity = inten;
    });
    pipeCold.forEach((m) => {
      m.material.color.setHex(cold);
      m.material.emissive.setHex(cold);
      m.material.emissiveIntensity = inten;
    });
    [feed, toHouse].forEach((t) => {
      t.mesh.material.color.setHex(hot);
      t.mesh.material.emissive.setHex(hot);
      t.mesh.material.emissiveIntensity = inten;
    });
    ret.mesh.material.color.setHex(cold);
    ret.mesh.material.emissive.setHex(cold);
    ret.mesh.material.emissiveIntensity = inten;
  }

  let alive = true;
  function animate() {
    if (!alive) return;
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    controls.update();
    grill.rotation.z += dt * (sim.geoOk ? 5 + sim.demanda * 0.25 : 0.2);
    fan.rotation.z += dt * (1.2 + sim.consumoConv * 0.35);
    heatPump.position.y = 0.12 + Math.sin(t * 2.2) * 0.01;
    pumpBody.material.emissiveIntensity = sim.geoOk ? 0.18 + Math.sin(t * 3) * 0.08 : 0.02;

    const boost = sim.geoOk ? 0.55 + sim.demanda * 0.045 + sim.copGeo * 0.04 : 0;
    particles.forEach((p) => {
      if (!sim.geoOk) {
        p.mesh.visible = false;
        return;
      }
      p.mesh.visible = true;
      const dir = sim.heating ? 1 : -1;
      p.t = (p.t + dt * p.speed * boost * dir + 1) % 1;
      const u = ((p.t % 1) + 1) % 1;
      p.mesh.position.copy(p.path.getPointAt(u));
      p.mesh.material.color.setHex(sim.heating ? 0xfbbf24 : 0x7dd3fc);
      p.mesh.material.emissive.setHex(sim.heating ? 0xf59e0b : 0x0284c7);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function resetCamera() {
    camera.position.set(7.2, 4.0, 8.5);
    controls.target.set(1.2, 0.6, 1.0);
    controls.update();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  setState(sim);
  requestAnimationFrame(animate);

  return {
    setState,
    resetCamera,
    setAutoRotate(v) {
      controls.autoRotate = !!v;
    },
    dispose() {
      alive = false;
      ro.disconnect();
      renderer.dispose();
    },
  };
}
