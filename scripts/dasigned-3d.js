// Hero blob: a fluid glass shell over a textured core. Loaded lazily by site.js;
// if WebGL or the CDN is unavailable the hero simply shows without it.
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

// Shared organic displacement, injected into both materials so shell and core deform together.
const displace = uT => sh => {
  sh.uniforms.uT = uT;
  sh.vertexShader = `uniform float uT;
float dsp(vec3 p){vec3 q = p + vec3(sin(p.y*1.3+uT*.7), sin(p.z*1.1+uT*.6), sin(p.x*1.2+uT*.8))*.38; return sin(q.x*1.7+uT*.9)*sin(q.y*1.9+uT*.7)*sin(q.z*1.6+uT*.8)*.34 + sin(q.x*3.1+q.z*2.3-uT*1.1)*.06 + sin(q.y*2.7-q.x*1.9+uT*.95)*.05;}
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
`).replace('#include <begin_vertex>', 'vec3 transformed = dpos(position);');
};

function heroScene(cv) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x080808);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4); camera.lookAt(0, 0, 0);
  const uT = { value: 0 };

  const tex = new THREE.TextureLoader().load(new URL(cv.dataset.texture, document.baseURI).href);
  tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping; tex.anisotropy = 8;
  const coreMat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.9 });
  coreMat.onBeforeCompile = displace(uT);
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.22, 192, 128), coreMat);
  core.scale.setScalar(0.76); scene.add(core);

  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 1.4, ior: 1.42, roughness: 0.03, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0.5, iridescenceIOR: 1.3, attenuationColor: 0xa9b9ff, attenuationDistance: 3.5, envMapIntensity: 1.7, specularIntensity: 1 });
  glass.onBeforeCompile = displace(uT);
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.22, 48), glass);
  scene.add(blob);

  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(BLUE, 3); rim.position.set(-5, -1.5, -2); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));

  return {
    scene, camera,
    update(t, p, s) {
      uT.value = t * 0.45;
      blob.rotation.y = t * 0.06 + p.x * 0.35;
      blob.rotation.x = p.y * 0.25 + s * 0.0007;
      core.rotation.set(p.y * 0.2, -t * 0.07 + p.x * 0.5, 0);
      camera.position.y = -s * 0.0012;
      camera.lookAt(0, 0, 0);
    }
  };
}

export function mount(canvas, { anim = true } = {}) {
  const pointer = { x: 0, y: 0 }, sp = { x: 0, y: 0 };
  const onMove = e => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; };
  addEventListener('mousemove', onMove, { passive: true });

  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.setClearColor(0x080808, 1);
  const s = heroScene(canvas);
  s.scene.environment = envFor(r);

  let visible = true, shown = false, w = 0, h = 0, t = 2 + Math.random() * 6;
  const io = new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; }), { rootMargin: '120px' });
  io.observe(canvas);

  let last = performance.now(), raf = 0, dead = false;
  const frame = now => {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    sp.x += (pointer.x - sp.x) * 0.05; sp.y += (pointer.y - sp.y) * 0.05;
    if (!visible) return;
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return;
    if (cw !== w || ch !== h) { w = cw; h = ch; r.setSize(w, h, false); s.camera.aspect = w / h; s.camera.updateProjectionMatrix(); }
    if (anim) t += dt; else if (shown) return;
    s.update(t, anim ? sp : { x: 0, y: 0 }, anim ? window.scrollY : 0);
    r.render(s.scene, s.camera);
    if (!shown) { shown = true; canvas.style.opacity = '1'; }
  };
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      dead = true; cancelAnimationFrame(raf); io.disconnect();
      removeEventListener('mousemove', onMove);
      r.dispose();
    }
  };
}
