import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const BLUE = 0x1a3dff;

function envFor(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x1c1c1c, side: THREE.BackSide })));
  const panel = (w, h, x, y, z, c, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
  };
  panel(10, 4, 0, 9, 0, 0xffffff, 3);
  panel(4, 9, -9, 1, 3, 0xffffff, 1.8);
  panel(5, 7, 9, 0, -2, BLUE, 2.4);
  panel(7, 3, 2, -1, 9, 0xffffff, 1.3);
  const tex = pmrem.fromScene(s, 0.03).texture;
  pmrem.dispose();
  return tex;
}


function paperBumpTexture() {
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d'); x.fillStyle = '#808080'; x.fillRect(0, 0, N, N);
  for (let k = 0; k < 2600; k++) {
    const px = Math.random() * N, py = Math.random() * N, l = 4 + Math.random() * 18, a = Math.random() * Math.PI;
    x.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.16)'; x.lineWidth = 0.6 + Math.random();
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t;
}

function makePaperBag() {
  const W = 0.62, H = 0.74, D = 0.3;
  const bump = paperBumpTexture();
  const paper = new THREE.MeshPhysicalMaterial({ color: 0xf6f4ef, roughness: 0.78, bumpMap: bump, bumpScale: 0.9, sheen: 0.25 });
  const inner = new THREE.MeshPhysicalMaterial({ color: 0xd9d5cc, roughness: 0.85, bumpMap: bump, bumpScale: 0.7, side: THREE.BackSide });
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(W, H, D, 28, 36, 14);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const v = y / H + 0.5;
    if (Math.abs(Math.abs(x) - W / 2) < 1e-4) {
      const k = 1 - Math.abs(z) / (D / 2);
      x -= Math.sign(x) * 0.07 * k * (0.35 + 0.65 * v);
    }
    if (Math.abs(Math.abs(z) - D / 2) < 1e-4) {
      const e = Math.sin(Math.PI * (x / W + 0.5));
      z += Math.sign(z) * e * (0.006 + Math.sin(x * 23 + y * 17) * 0.004 + Math.sin(x * 51 - y * 39) * 0.0025);
    }
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  const body = new THREE.Mesh(geo, [paper, paper, hidden, paper, paper, paper]);
  body.castShadow = true; g.add(body);
  const lin = new THREE.Mesh(new THREE.BoxGeometry(W * 0.985, H * 0.998, D * 0.96), [inner, inner, hidden, inner, inner, inner]);
  g.add(lin);
  const foldMat = new THREE.MeshPhysicalMaterial({ color: 0xf1eee8, roughness: 0.8, bumpMap: bump, bumpScale: 0.6, side: THREE.DoubleSide });
  [[W * 0.98, D / 2 - 0.004, 0], [W * 0.98, -(D / 2 - 0.004), 0]].forEach(([w, z]) => {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.07), foldMat); f.position.set(0, H / 2 - 0.035, z); g.add(f);
  });
  const ropeMat = new THREE.MeshPhysicalMaterial({ color: 0xefece5, roughness: 0.7, bumpMap: bump, bumpScale: 1.2 });
  [1, -1].forEach(side => {
    const z = side * (D / 2 - 0.03);
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.13, H / 2 - 0.06, z), new THREE.Vector3(-0.135, H / 2 + 0.06, z),
      new THREE.Vector3(-0.08, H / 2 + 0.22, z), new THREE.Vector3(0, H / 2 + 0.26, z),
      new THREE.Vector3(0.08, H / 2 + 0.22, z), new THREE.Vector3(0.135, H / 2 + 0.06, z), new THREE.Vector3(0.13, H / 2 - 0.06, z)
    ]);
    const rope = new THREE.Mesh(new THREE.TubeGeometry(c, 90, 0.012, 10, false), ropeMat);
    rope.castShadow = true; g.add(rope);
  });
  return g;
}

const persp = (fov, pos, look) => {
  const c = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  c.position.set(...pos); c.lookAt(...look); return c;
};
const shadowLight = (scene, intensity, pos, size = 4) => {
  const d = new THREE.DirectionalLight(0xffffff, intensity);
  d.position.set(...pos); d.castShadow = true;
  d.shadow.mapSize.set(1024, 1024); d.shadow.radius = 6;
  Object.assign(d.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 0.5, far: 30 });
  scene.add(d); return d;
};
const shadowGround = (scene, opacity = 0.16, y = 0) => {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity }));
  g.rotation.x = -Math.PI / 2; g.position.y = y; g.receiveShadow = true; scene.add(g); return g;
};

const builders = {
  hero(cv) {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x080808);
    const camera = persp(30, [0, 0, 6.7], [0, 0, 0]);
    const uT = { value: 0 };
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.5, iridescence: 0.35, iridescenceIOR: 1.4, specularIntensity: 1 });
    const displace = (gradient, phase) => sh => {
      sh.uniforms.uT = uT;
      sh.vertexShader = 'varying vec3 vGPos;\n' + sh.vertexShader;
      if (gradient) sh.fragmentShader = 'uniform float uT;\nvarying vec3 vGPos;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
float gk = clamp(dot(normalize(vGPos), normalize(vec3(-0.55, -0.7, 0.45))) * 0.5 + 0.5 + sin(uT * 0.3) * 0.06, 0.0, 1.0);
vec3 gA = vec3(0.012, 0.016, 0.06);
vec3 gB = vec3(0.10, 0.24, 1.0);
vec3 gC = vec3(0.38, 0.48, 1.0);
vec3 grad = gk < 0.55 ? mix(gA, gB, smoothstep(0.0, 0.55, gk)) : mix(gB, gC, smoothstep(0.55, 1.0, gk));
diffuseColor.rgb = grad;`);
      sh.vertexShader = `uniform float uT;
float dsp(vec3 p){float uT = uT + ` + phase.toFixed(2) + `; vec3 q = p + vec3(sin(p.y*1.3+uT*.7), sin(p.z*1.1+uT*.6), sin(p.x*1.2+uT*.8))*.38; return sin(q.x*1.7+uT*.9)*sin(q.y*1.9+uT*.7)*sin(q.z*1.6+uT*.8)*.34 + sin(q.x*3.1+q.z*2.3-uT*1.1)*.06 + sin(q.y*2.7-q.x*1.9+uT*.95)*.05;}
vec3 dpos(vec3 p){return p*(1.+dsp(p));}
` + sh.vertexShader;
      sh.vertexShader = sh.vertexShader.replace('#include <beginnormal_vertex>', `
vec3 nrm0 = normalize(normal);
vec3 tng = normalize(cross(nrm0, abs(nrm0.y) < .99 ? vec3(0.,1.,0.) : vec3(1.,0.,0.)));
vec3 btg = cross(nrm0, tng);
float rl = length(position);
vec3 p0 = dpos(position);
vec3 p1 = dpos(normalize(position + tng*.01)*rl);
vec3 p2 = dpos(normalize(position + btg*.01)*rl);
vec3 objectNormal = normalize(cross(p1 - p0, p2 - p0));
#ifdef USE_TANGENT
vec3 objectTangent = vec3(tangent.xyz);
#endif
`).replace('#include <begin_vertex>', 'vec3 transformed = dpos(position); vGPos = position;');
    };
    const loader = new THREE.TextureLoader();
    const texPath = () => { const v = cv && cv.getAttribute('data-texture'); return v && !v.includes('{{') ? v : 'assets/blob-texture.png'; };
    const loadTex = p => { const t = loader.load(new URL(p, document.baseURI).href); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
    let curPath = texPath();
    const tex = loadTex(curPath);
    if (cv) new MutationObserver(() => { const p = texPath(); if (p === curPath) return; curPath = p; const old = coreMat.map; coreMat.map = loadTex(p); coreMat.needsUpdate = true; if (old) old.dispose(); }).observe(cv, { attributes: true, attributeFilter: ['data-texture'] });
    const coreMat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.9 });
    coreMat.onBeforeCompile = displace(false, 0);
    const geoB = new THREE.IcosahedronGeometry(1.22, 48);
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.22, 192, 128), coreMat); core.scale.setScalar(0.76); scene.add(core);
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 1.4, ior: 1.42, roughness: 0.03, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0.5, iridescenceIOR: 1.3, attenuationColor: 0xa9b9ff, attenuationDistance: 3.5, envMapIntensity: 1.7, specularIntensity: 1 });
    glass.onBeforeCompile = displace(false, 0);
    const blob = new THREE.Mesh(geoB, glass);
    scene.add(blob);
    const beads = [[0.16, BLUE, 0.92, 0.3], [0.1, 0xffffff, 0.98, -0.45], [0.12, 0x5c78ff, 0.86, 0.6]].map(([r, c, d, sp], i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.15, clearcoat: 1 }));
      m.userData = { d, sp, ph: i * 2.1 }; return m;
    });
    const orbit = new THREE.Group(); orbit.rotation.set(1.18, 0.25, 0); scene.add(orbit);
    blob.receiveShadow = true;
    const FIN = {
      'Clear glass': { transmission: 1, metalness: 0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], roughness: 0.03, thickness: 1.4, iridescence: 0.5, clearcoat: 1, clearcoatRoughness: 0.02, attenuationDistance: 3.5, envMapIntensity: 1.7 },
      'Frosted glass': { transmission: 1, metalness: 0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], roughness: 0.42, thickness: 2.4, iridescence: 0.12, clearcoat: 0.6, clearcoatRoughness: 0.35, attenuationDistance: 2.2, envMapIntensity: 1.2 },
      'Iridescent': { transmission: 0.35, metalness: 0.6, roughness: 0.08, thickness: 0.8, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [180, 900], clearcoat: 1, clearcoatRoughness: 0.03, attenuationDistance: 3.5, envMapIntensity: 2 },
      'Liquid chrome': { transmission: 0, metalness: 1, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], roughness: 0.04, thickness: 0, iridescence: 0.08, clearcoat: 1, clearcoatRoughness: 0.02, attenuationDistance: 3.5, envMapIntensity: 2.2 }
    };
    const finAttr = () => { const v = cv && cv.getAttribute('data-finish'); return v && FIN[v] ? v : 'Clear glass'; };
    let curFin = '';
    const applyFin = () => { const f = finAttr(); if (f === curFin) return; curFin = f; Object.assign(glass, FIN[f]); glass.needsUpdate = true; };
    applyFin();
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x6f8bff, wireframe: true, transparent: true, opacity: 0.55, depthWrite: false });
    wireMat.onBeforeCompile = displace(false, 0);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.226, 14), wireMat);
    blob.add(wire);
    const applyWire = () => { wire.visible = !!cv && cv.getAttribute('data-wire') === 'true'; };
    applyWire();
    if (cv) new MutationObserver(applyWire).observe(cv, { attributes: true, attributeFilter: ['data-wire'] });
    if (cv) new MutationObserver(applyFin).observe(cv, { attributes: true, attributeFilter: ['data-finish'] });
    const stuck = new THREE.Group(); scene.add(stuck);
    const bag = makePaperBag();
    const n = new THREE.Vector3(0.5, 0.48, 0.72).normalize();
    bag.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    bag.rotateY(0.55); bag.rotateZ(0.08);
    bag.position.copy(n).multiplyScalar(1.24);

    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); scene.add(key);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 5; key.shadow.bias = -0.0015;
    Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 20 });
    const rim = new THREE.DirectionalLight(BLUE, 3); rim.position.set(-5, -1.5, -2); scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    return {
      scene, camera, update(t, p, s) {
        uT.value = t * 0.45;
        blob.rotation.y = t * 0.06 + p.x * 0.35;
        blob.rotation.x = p.y * 0.25 + s * 0.0007;
        core.rotation.set(p.y * 0.2, -t * 0.07 + p.x * 0.5, 0);
        beads.forEach(b => { const u = b.userData, a = t * u.sp + u.ph; b.position.set(Math.cos(a) * u.d, Math.sin(a * 1.3) * u.d * 0.5, Math.sin(a) * u.d); });
        orbit.rotation.z = t * 0.06;
        stuck.rotation.set(blob.rotation.x * 0.6 + Math.sin(t * 0.4) * 0.05, p.x * 0.35 + Math.sin(t * 0.3) * 0.12, 0);
        stuck.position.copy(n).multiplyScalar(Math.sin(t * 0.6) * 0.015);
        camera.position.y = -s * 0.0012;
        camera.lookAt(0, 0, 0);
      }
    };
  },

  halden() {
    const scene = new THREE.Scene();
    const camera = persp(30, [0, 2.4, 7.2], [0, 0.55, 0]);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x777770, 0.7));
    shadowLight(scene, 2.2, [3, 6, 4]);
    shadowGround(scene, 0.45);
    const lathe = pts => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 128);
    const vase = lathe([[0, 0], [0.3, 0], [0.36, 0.04], [0.43, 0.3], [0.47, 0.62], [0.42, 0.92], [0.28, 1.2], [0.19, 1.4], [0.18, 1.55], [0.23, 1.68], [0.21, 1.7]]);
    const bowl = lathe([[0, 0], [0.26, 0], [0.3, 0.03], [0.52, 0.12], [0.7, 0.3], [0.8, 0.48], [0.78, 0.5]]);
    const cup = lathe([[0, 0], [0.27, 0], [0.31, 0.04], [0.33, 0.4], [0.36, 0.72], [0.35, 0.74]]);
    const matte = new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.62, side: THREE.DoubleSide });
    const glaze = new THREE.MeshPhysicalMaterial({ color: BLUE, roughness: 0.12, clearcoat: 1, side: THREE.DoubleSide });
    const ink = new THREE.MeshPhysicalMaterial({ color: 0x2e2e2c, roughness: 0.28, clearcoat: 1, side: THREE.DoubleSide });
    const g = new THREE.Group(); scene.add(g);
    const items = [[vase, matte, -0.85, 0, 0, 1.2], [bowl, glaze, 1.0, 0, 0.55, 1], [cup, ink, 0.45, 0, -0.95, 1.1]].map(([geo, m, x, y, z, sc]) => {
      const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); mesh.scale.setScalar(sc);
      mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh;
    });
    return { scene, camera, update(t, p) { g.rotation.y = t * 0.14 + p.x * 0.25; items.forEach((m, i) => { m.rotation.y = t * (0.2 + i * 0.1); }); } };
  },

  tessera() {
    const scene = new THREE.Scene();
    const camera = persp(34, [0, 0, 13], [0, 0, 0]);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a3dff, 0.9));
    const d = new THREE.DirectionalLight(0xffffff, 1.6); d.position.set(-4, 6, 8); scene.add(d);
    const cols = 7, rows = 10, sp = 1.08, cells = [];
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (rnd() > 0.2) cells.push([c - (cols - 1) / 2, r - (rows - 1) / 2, rnd()]);
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.94, 0.94, 0.16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, clearcoat: 0.6 }), cells.length);
    const col = new THREE.Color();
    cells.forEach((cl, i) => mesh.setColorAt(i, col.set(cl[2] > 0.82 ? 0x0b0b0b : cl[2] > 0.62 ? 0xb9c5ff : 0xffffff)));
    const g = new THREE.Group(); g.add(mesh); g.rotation.set(-0.62, 0.32, 0.18); g.position.set(1.1, 0.6, 0); scene.add(g);
    const dummy = new THREE.Object3D();
    return {
      scene, camera, update(t, p) {
        cells.forEach(([x, y, k], i) => {
          const w = Math.sin(x * 0.7 + t * 0.9) * Math.cos(y * 0.5 + t * 0.6);
          dummy.position.set(x * sp, y * sp, w * 0.45 + k * 0.2);
          dummy.rotation.set(w * 0.25, Math.sin(t * 0.5 + k * 6) * 0.15, 0);
          dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        g.rotation.y = 0.32 + p.x * 0.12; g.rotation.x = -0.62 + p.y * 0.08;
      }
    };
  },

  salt() {
    const scene = new THREE.Scene();
    const camera = persp(32, [0, 0, 6.8], [0, 0, 0]);
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.95, 0.33, 360, 56, 2, 3),
      new THREE.MeshPhysicalMaterial({ color: 0xeeeeec, roughness: 0.78, sheen: 1, sheenRoughness: 0.35, sheenColor: 0xffffff, envMapIntensity: 0.6 }));
    knot.position.y = 0.45; scene.add(knot);
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 3, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(BLUE, 5); rim.position.set(4, -2, -3); scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.08));
    return { scene, camera, update(t, p) { knot.rotation.set(t * 0.18 + p.y * 0.2, t * 0.12 + p.x * 0.3, 0); } };
  },

  lowlight() {
    const scene = new THREE.Scene();
    const camera = persp(30, [0, 0, 8.5], [0, 0, 0]);
    const g = new THREE.Group(); g.position.x = 1.45; scene.add(g);
    const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.22 });
    const blue = new THREE.MeshBasicMaterial({ color: BLUE });
    const rings = [0.55, 0.85, 1.15, 1.5, 1.85, 2.25, 2.7].map((r, i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, i % 2 ? 0.014 : 0.03, 16, 240), i % 2 ? blue : chrome);
      m.userData = { bx: Math.sin(i * 1.7) * 1.2, by: Math.cos(i * 2.3) * 0.9, sx: 0.05 + (i % 3) * 0.04, sy: 0.08 - (i % 2) * 0.13 };
      g.add(m); return m;
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 32), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    g.add(core);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    return {
      scene, camera, update(t, p, s, hv) {
        rings.forEach(m => { const u = m.userData; m.rotation.set(u.bx + t * u.sx, u.by + t * u.sy, 0); });
        const pulse = 1 + Math.sin(t * 2.2) * 0.08 * (0.4 + hv);
        core.scale.setScalar(pulse);
        g.rotation.y = p.x * 0.15; g.rotation.x = p.y * 0.1;
      }
    };
  },

  morrow() {
    const scene = new THREE.Scene();
    const camera = persp(28, [0, 1.6, 8.2], [0, 0.35, 0]);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x333331, 0.6));
    shadowLight(scene, 2.2, [-3, 6, 4]);
    const g = new THREE.Group(); g.position.y = -0.55; scene.add(g);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.08, 1.3), new THREE.MeshStandardMaterial({ color: 0x2a2a28, roughness: 0.6 }));
    shelf.position.y = -0.04; g.add(shelf);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.3), new THREE.ShadowMaterial({ opacity: 0.5 }));
    top.rotation.x = -Math.PI / 2; top.position.y = 0.002; top.receiveShadow = true;
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.3), new THREE.MeshStandardMaterial({ color: 0x2f2f2d, roughness: 0.8 }));
    surface.rotation.x = -Math.PI / 2; surface.position.y = 0.001; surface.receiveShadow = true; g.add(surface); g.add(top);
    const flask = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.1, 12, 48), new THREE.MeshPhysicalMaterial({ color: 0xd8d8d6, metalness: 0.9, roughness: 0.3 }));
    flask.position.set(-0.95, 0.85, 0);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.95, 0.52), new THREE.MeshPhysicalMaterial({ color: BLUE, roughness: 0.4, clearcoat: 0.3 }));
    box.position.set(0.02, 0.475, 0.12);
    const tin = new THREE.Group(); tin.position.set(0.95, 0, -0.05);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.15, 64), new THREE.MeshStandardMaterial({ color: 0xfafaf8, roughness: 0.35 }));
    body.position.y = 0.575;
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.315, 0.315, 0.14, 64), new THREE.MeshStandardMaterial({ color: 0xcfcfcf, metalness: 1, roughness: 0.28 }));
    lid.position.y = 1.2; tin.add(body, lid);
    [flask, box, body, lid].forEach(m => { m.castShadow = true; });
    g.add(flask, box, tin);
    return {
      scene, camera, update(t, p) {
        g.rotation.y = Math.sin(t * 0.3) * 0.28 + p.x * 0.2;
        box.rotation.y = Math.sin(t * 0.5) * 0.35; tin.rotation.y = t * 0.4; flask.rotation.z = Math.sin(t * 0.6) * 0.03;
      }
    };
  },

  atlas() {
    const scene = new THREE.Scene();
    const camera = persp(34, [0, 4.4, 6.6], [0, 0, 0]);
    const gauss = (x, z, cx, cz, s, a) => a * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / s);
    const H = (x, z) => gauss(x, z, -1.7, 0.7, 1.9, 1.5) + gauss(x, z, 2.3, -1.1, 1.2, 1.1) + gauss(x, z, 0.4, -2.2, 3.2, 0.55) + 0.07 * Math.sin(x * 1.3) * Math.cos(z * 1.7);
    const geo = new THREE.PlaneGeometry(13, 8, 260, 160); geo.rotateX(-Math.PI / 2);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) pa.setY(i, H(pa.getX(i), pa.getZ(i)));
    const uT = { value: 0 };
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uT, uBlue: { value: new THREE.Color(BLUE) }, uInk: { value: new THREE.Color(0xf2f2f0) } },
      vertexShader: 'varying float vH; varying vec2 vXZ; void main(){ vH = position.y; vXZ = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uT; uniform vec3 uBlue; uniform vec3 uInk; varying float vH; varying vec2 vXZ;
void main(){
  float h = vH * 11.0 - uT * 0.25;
  float f = fract(h); float dist = min(f, 1.0 - f);
  float line = 1.0 - smoothstep(0.0, fwidth(h) * 1.3, dist);
  bool major = mod(floor(h + 0.5), 5.0) == 0.0;
  float fade = 1.0 - smoothstep(3.0, 6.2, length(vXZ * vec2(0.85, 1.2)));
  vec3 col = major ? uInk : uBlue;
  gl_FragColor = vec4(col, line * fade * (major ? 0.75 : 0.9));
}`
    });
    scene.add(new THREE.Mesh(geo, mat));
    const pin = (x, z, c) => {
      const y = H(x, z);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), new THREE.MeshBasicMaterial({ color: c }));
      head.position.set(x, y + 0.55, z);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 8), new THREE.MeshBasicMaterial({ color: c }));
      stem.position.set(x, y + 0.275, z);
      scene.add(head, stem);
    };
    pin(-1.7, 0.7, 0xf2f2f0); pin(2.3, -1.1, BLUE);
    return {
      scene, camera, update(t, p) {
        uT.value = t;
        camera.position.x = Math.sin(t * 0.12) * 0.7 + p.x * 0.4;
        camera.position.y = 4.4 + p.y * 0.25;
        camera.lookAt(0.2, 0, -0.2);
      }
    };
  }
};

export function mount(root, { anim = true } = {}) {
  const pointer = { x: 0, y: 0 }, sp = { x: 0, y: 0 };
  const onMove = e => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; };
  addEventListener('mousemove', onMove, { passive: true });
  const items = [];
  root.querySelectorAll('canvas[data-scene]').forEach(c => {
    const b = builders[c.getAttribute('data-scene')]; if (!b) return;
    try {
      const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, powerPreference: 'high-performance' });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
      if (c.getAttribute('data-scene') === 'hero') r.setClearColor(0x080808, 1);
      const s = b(c); s.scene.environment = envFor(r);
      items.push({ c, r, ...s, visible: false, t: 2 + Math.random() * 6, hv: 0, host: c.closest('[data-tilt]'), shown: false, w: 0, h: 0 });
    } catch (e) { console.warn('[dasigned-3d] scene failed', e); }
  });
  const size = it => {
    const w = it.c.clientWidth, h = it.c.clientHeight;
    if (!w || !h) return false;
    if (w !== it.w || h !== it.h) { it.w = w; it.h = h; it.r.setSize(w, h, false); it.camera.aspect = w / h; it.camera.updateProjectionMatrix(); }
    return true;
  };
  const io = new IntersectionObserver(es => es.forEach(e => { const it = items.find(i => i.c === e.target); if (it) it.visible = e.isIntersecting; }), { rootMargin: '120px' });
  items.forEach(it => io.observe(it.c));
  let last = performance.now(), raf = 0, dead = false;
  const frame = now => {
    if (dead) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    sp.x += (pointer.x - sp.x) * 0.05; sp.y += (pointer.y - sp.y) * 0.05;
    for (const it of items) {
      if (!it.visible || !size(it)) continue;
      const hov = it.host && it.host.matches(':hover') ? 1 : 0;
      it.hv += (hov - it.hv) * 0.06;
      if (anim) it.t += dt * (1 + it.hv * 0.8);
      else if (it.shown) continue;
      it.update(it.t, anim ? sp : { x: 0, y: 0 }, anim ? window.scrollY : 0, it.hv);
      it.r.render(it.scene, it.camera);
      if (!it.shown) {
        it.shown = true; it.c.style.opacity = '1';
        it.c.parentElement.querySelectorAll('[data-flat]').forEach(el => { el.style.transition = 'opacity .9s ease'; el.style.opacity = '0'; });
      }
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return {
    destroy() {
      dead = true; cancelAnimationFrame(raf); io.disconnect();
      removeEventListener('mousemove', onMove);
      items.forEach(it => it.r.dispose());
    }
  };
}
