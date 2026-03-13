"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import * as THREE from "three";

const MSGS = [
  "Devril ama kalkmayı biliyorsun, tıpkı sen gibi.",
  "Bu his geçecek. Söz.",
  "Bugün zor, ama yarın hâlâ oradasın.",
  "Bazen denemeler bizi dener. Sen kazanacaksın.",
  "Duygularını hissetmek güçlü olduğunun kanıtı.",
  "Bir adım geri, iki adım ileri.",
  "Her vuruş bir nefes. Her nefes bir başlangıç.",
  "Kötü gün, kötü hayat değil.",
  "Sen bu sınavdan büyüksün.",
  "Hacıyatmaz gibi: ne kadar vururlarsa o kadar kalkarsın.",
];

const SKINS = [
  { key: "clown",  label: "Palyaço", emoji: "🤡" },
  { key: "devil",  label: "Şeytan",  emoji: "👹" },
  { key: "bear",   label: "Ayı",     emoji: "🐻" },
  { key: "bomb",   label: "Bomba",   emoji: "💣" },
];

type SkinConfig = {
  bodyColor: number; bodyRough: number; bodyMetal: number;
  headColor: number; headRough: number;
  baseColor: number; baseMetal: number;
  noseColor: number; eyeColor: number;
  detailFn: string;
};

const SKIN_CONFIGS: SkinConfig[] = [
  { bodyColor:0xe83030, bodyRough:0.3, bodyMetal:0.1, headColor:0xffd0a0, headRough:0.5, baseColor:0xcc2020, baseMetal:0.3, noseColor:0xff3030, eyeColor:0x1a1a2e, detailFn:"clown" },
  { bodyColor:0xcc1818, bodyRough:0.4, bodyMetal:0.2, headColor:0xaa1010, headRough:0.3, baseColor:0x880808, baseMetal:0.5, noseColor:0xff2200, eyeColor:0xff4400, detailFn:"devil" },
  { bodyColor:0x8b5e3c, bodyRough:0.9, bodyMetal:0.0, headColor:0xa07050, headRough:0.85, baseColor:0x6b4020, baseMetal:0.0, noseColor:0x1a0a00, eyeColor:0x0a0500, detailFn:"bear" },
  { bodyColor:0x181818, bodyRough:0.15, bodyMetal:0.8, headColor:0x202020, headRough:0.15, baseColor:0x101010, baseMetal:0.9, noseColor:0xcc2222, eyeColor:0xcc2222, detailFn:"bomb" },
];

const HIT_DIRS: [number, number][] = [
  [0.8, 0], [-0.8, 0], [0.7, 0.3], [-0.7, 0.3],
  [0.5, -0.4], [-0.5, -0.4], [0.9, 0.1], [-0.9, 0.1],
];

const W = 260, H = 360;

export default function HaciyatmazPage() {
  const [skin, setSkinState] = useState(0);
  const [label, setLabel] = useState("Vur beni!");
  const [inputVal, setInputVal] = useState("");
  const [hits, setHits] = useState(0);
  const [mesaj, setMesaj] = useState("Bir karakter seç, bir şey yapıştır — sonra vur!");
  const [mesajKey, setMesajKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gloveLayerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dollRef = useRef<THREE.Group | null>(null);
  const pivotRef = useRef<THREE.Group | null>(null);
  const blobRef = useRef<THREE.Mesh | null>(null);
  const labelMeshRef = useRef<THREE.Mesh | null>(null);
  const animIdRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const tiltZ = useRef(0);
  const tiltX_ = useRef(0);
  const busyRef = useRef(false);
  const fuseSparkRefs = useRef<THREE.Mesh[]>([]);
  const labelRef_ = useRef("Vur beni!");
  const skinRef = useRef(0);

  // ── Three.js init ──────────────────────────────────────────
  const initThree = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2e4a);
    scene.fog = new THREE.FogExp2(0x1a2e4a, 0.08);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 1.2, 6.5);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffeedd, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4; key.shadow.camera.right = 4;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.001;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x4488ff, 0.5);
    fill.position.set(-3, 2, -2); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffa040, 0.4);
    rim.position.set(0, -1, -4); scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3, 64),
      new THREE.MeshStandardMaterial({ color: 0x0f1d30, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.55;
    floor.receiveShadow = true;
    scene.add(floor);

    const blob = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = -1.54;
    scene.add(blob);
    blobRef.current = blob;
  }, []);

  // ── Build doll ─────────────────────────────────────────────
  const buildLabel = useCallback(() => {
    if (!dollRef.current) return;
    if (labelMeshRef.current) { dollRef.current.remove(labelMeshRef.current); labelMeshRef.current = null; }
    const lc = document.createElement("canvas"); lc.width = 256; lc.height = 64;
    const lx = lc.getContext("2d")!;
    lx.fillStyle = "rgba(14,22,42,0.9)";
    lx.beginPath(); (lx as any).roundRect(2, 2, 252, 60, 10); lx.fill();
    lx.strokeStyle = "rgba(245,166,35,0.8)"; lx.lineWidth = 3;
    lx.beginPath(); (lx as any).roundRect(2, 2, 252, 60, 10); lx.stroke();
    lx.fillStyle = "rgba(245,166,35,0.6)";
    lx.beginPath(); lx.moveTo(14, 2); lx.lineTo(22, -4); lx.lineTo(30, 2); lx.fill();
    const txt = labelRef_.current.length > 14 ? labelRef_.current.slice(0, 13) + "…" : labelRef_.current;
    lx.font = "bold 22px Sora, sans-serif";
    lx.textAlign = "center"; lx.textBaseline = "middle";
    lx.fillStyle = "white"; lx.fillText(txt, 128, 34);
    const tex = new THREE.CanvasTexture(lc);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.28),
      new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, side: THREE.DoubleSide })
    );
    mesh.position.set(0, 0.28, 0.92); mesh.rotation.x = -0.15;
    dollRef.current.add(mesh);
    labelMeshRef.current = mesh;
  }, []);

  const buildDoll = useCallback((skinIdx: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (pivotRef.current) { scene.remove(pivotRef.current); }
    fuseSparkRefs.current = [];
    const cfg = SKIN_CONFIGS[skinIdx];
    const pivot = new THREE.Group(); pivot.position.y = -0.5; scene.add(pivot);
    const doll = new THREE.Group(); pivot.add(doll);
    pivotRef.current = pivot; dollRef.current = doll;

    const baseMat = new THREE.MeshStandardMaterial({ color: cfg.baseColor, roughness: 0.25, metalness: cfg.baseMetal + 0.3 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 0.6, 32), baseMat);
    base.position.y = -1.1; base.castShadow = true; doll.add(base);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.04, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.1 }));
    rim.rotation.x = Math.PI / 2; rim.position.y = -0.82; doll.add(rim);

    const bodyGeo = new THREE.SphereGeometry(1.0, 32, 32);
    bodyGeo.applyMatrix4(new THREE.Matrix4().makeScale(0.88, 1.4, 0.88));
    const bodyMat = new THREE.MeshStandardMaterial({ color: cfg.bodyColor, roughness: cfg.bodyRough, metalness: cfg.bodyMetal });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -0.15; body.castShadow = true; doll.add(body);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.35, 24), bodyMat);
    neck.position.y = 1.1; doll.add(neck);

    const headMat = new THREE.MeshStandardMaterial({ color: cfg.headColor, roughness: cfg.headRough, metalness: 0.05 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 32), headMat);
    head.position.y = 1.62; head.castShadow = true; doll.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: cfg.eyeColor, roughness: 0.1, metalness: 0.3 });
    const ewGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const ewMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    [-0.22, 0.22].forEach(x => {
      const w = new THREE.Mesh(ewGeo, ewMat); w.position.set(x, 1.7, 0.5); w.scale.z = 0.5; doll.add(w);
      const e = new THREE.Mesh(eyeGeo, eyeMat); e.position.set(x, 1.7, 0.56); e.scale.z = 0.4; doll.add(e);
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      sh.position.set(x + 0.03, 1.73, 0.6); doll.add(sh);
    });

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({ color: cfg.noseColor, roughness: 0.3, metalness: 0.1 }));
    nose.position.set(0, 1.6, 0.58); nose.scale.set(1.2, 0.9, 0.7); doll.add(nose);

    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 24, Math.PI * 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.8 }));
    smile.position.set(0, 1.44, 0.54); smile.rotation.z = Math.PI / 2 + Math.PI * 0.1; smile.rotation.y = Math.PI; doll.add(smile);

    if (skinIdx === 0) buildClown(doll);
    else if (skinIdx === 1) buildDevil(doll, cfg);
    else if (skinIdx === 2) buildBear(doll, cfg);
    else if (skinIdx === 3) buildBomb(doll);

    buildLabel();
  }, [buildLabel]);

  function buildClown(group: THREE.Group) {
    [0xff3030, 0xffaa00, 0x30cc30, 0x3080ff, 0xcc30cc].forEach((c, i) => {
      const s = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.04, 8, 64),
        new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }));
      s.rotation.x = Math.PI / 2; s.position.y = 0.5 - i * 0.38; group.add(s);
    });
    const bn = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xff1111, roughness: 0.2 }));
    bn.position.set(0, 1.58, 0.62); group.add(bn);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x1a1a8a, roughness: 0.5 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 32), hatMat);
    brim.position.y = 2.14; group.add(brim);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.7, 32), hatMat);
    top.position.y = 2.55; group.add(top);
    const pomp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffee00, roughness: 0.9 }));
    pomp.position.y = 2.95; group.add(pomp);
  }

  function buildDevil(group: THREE.Group, cfg: SkinConfig) {
    [-0.3, 0.3].forEach(x => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: 0x880000, roughness: 0.3, metalness: 0.3 }));
      horn.position.set(x, 2.14, 0.12); horn.rotation.z = x < 0 ? 0.25 : -0.25; horn.rotation.x = -0.2; group.add(horn);
    });
    const penta = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 5),
      new THREE.MeshStandardMaterial({ color: 0xff4400, roughness: 0.3, emissive: new THREE.Color(0xff2200), emissiveIntensity: 0.4 }));
    penta.position.set(0, 0.2, 0.88); group.add(penta);
    const eMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: new THREE.Color(0xff3300), emissiveIntensity: 1.2, roughness: 0.1 });
    [-0.22, 0.22].forEach(x => {
      const eg = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eMat);
      eg.position.set(x, 1.7, 0.54); group.add(eg);
    });
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const fMat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0xff6600 : 0xffcc00, emissive: new THREE.Color(i % 2 ? 0xff3300 : 0xffaa00), emissiveIntensity: 0.8, roughness: 0.3, transparent: true, opacity: 0.85 });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 8), fMat);
      flame.position.set(Math.cos(a) * 0.9, -0.82, Math.sin(a) * 0.9);
      flame.rotation.x = -0.3; flame.rotation.z = Math.atan2(Math.sin(a), Math.cos(a));
      (flame as any).userData = { isFlame: true, phase: i / 8 * Math.PI * 2 };
      group.add(flame);
    }
  }

  function buildBear(group: THREE.Group, cfg: SkinConfig) {
    [-0.46, 0.46].forEach(x => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: cfg.bodyColor, roughness: 0.9 }));
      ear.position.set(x, 2.12, 0); ear.scale.z = 0.6; group.add(ear);
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xd4a870, roughness: 0.9 }));
      inner.position.set(x, 2.12, 0.06); inner.scale.z = 0.4; group.add(inner);
    });
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xd4a870, roughness: 0.85 }));
    snout.position.set(0, 1.55, 0.55); snout.scale.set(1.1, 0.85, 0.7); group.add(snout);
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2, h = Math.random() * 2 - 0.8;
      const bump = new THREE.Mesh(new THREE.SphereGeometry(0.04 + Math.random() * 0.03, 8, 8),
        new THREE.MeshStandardMaterial({ color: cfg.bodyColor, roughness: 1.0 }));
      bump.position.set(Math.cos(a) * 0.88, h, Math.sin(a) * 0.88); group.add(bump);
    }
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xf5d090, roughness: 0.9, transparent: true, opacity: 0.9 }));
    belly.position.set(0, 0.1, 0.78); belly.scale.set(0.9, 1.0, 0.3); group.add(belly);
  }

  function buildBomb(group: THREE.Group) {
    [-0.22, 0.22].forEach(x => {
      const sk = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, emissive: new THREE.Color(0x220000) }));
      sk.position.set(x, 1.72, 0.52); sk.scale.z = 0.5; group.add(sk);
      const gw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xcc2222, emissive: new THREE.Color(0xff0000), emissiveIntensity: 1.5, roughness: 0.1 }));
      gw.position.set(x, 1.72, 0.56); gw.scale.z = 0.4; group.add(gw);
    });
    const fusePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.24, 0), new THREE.Vector3(0.18, 2.4, 0.1),
      new THREE.Vector3(0.32, 2.3, -0.05), new THREE.Vector3(0.28, 2.15, 0.08),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(fusePath, 12, 0.025, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8 })));
    (group as any).userData.fuseEnd = new THREE.Vector3(0.28, 2.15, 0.08);
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff8800 : 0xffee00 }));
      (sp as any).userData = { isSpark: true, phase: i / 8 * Math.PI * 2 };
      group.add(sp); fuseSparkRefs.current.push(sp);
    }
    for (let i = 0; i < 6; i++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xeeeedd, roughness: 0.4 }));
      tooth.position.set(-0.2 + i * 0.08, 1.46, 0.54); group.add(tooth);
    }
  }

  // ── Render loop ────────────────────────────────────────────
  const startLoop = useCallback(() => {
    const loop = () => {
      animIdRef.current = requestAnimationFrame(loop);
      frameRef.current++;
      const t = frameRef.current * 0.016;
      const doll = dollRef.current;
      if (doll) {
        doll.children.forEach((c: any) => {
          if (c.userData?.isFlame) { c.scale.y = 0.85 + Math.sin(t * 4 + c.userData.phase) * 0.2; }
          if (c.userData?.isSpark) {
            const fe = (doll as any).userData?.fuseEnd ?? new THREE.Vector3(0.28, 2.15, 0.08);
            const a = c.userData.phase + t * 8, r = 0.06 + Math.sin(t * 5 + c.userData.phase) * 0.04;
            c.position.set(fe.x + Math.cos(a) * r, fe.y + 0.04 + Math.abs(Math.sin(t * 6 + c.userData.phase)) * 0.08, fe.z + Math.sin(a) * r);
            c.visible = Math.sin(t * 10 + c.userData.phase) > -0.3;
          }
        });
        if (Math.abs(tiltZ.current) > 0.003 || Math.abs(tiltX_.current) > 0.003) {
          tiltZ.current *= 0.82; tiltX_.current *= 0.82;
          doll.rotation.z = tiltZ.current; doll.rotation.x = tiltX_.current;
          if (blobRef.current) {
            blobRef.current.scale.x = 1 - Math.abs(tiltZ.current) * 0.15;
            (blobRef.current.material as THREE.MeshBasicMaterial).opacity = 0.45 - Math.abs(tiltZ.current) * 0.1;
          }
        } else if (tiltZ.current !== 0) {
          tiltZ.current = 0; tiltX_.current = 0;
          doll.rotation.z = 0; doll.rotation.x = 0;
          busyRef.current = false;
        }
        if (Math.abs(tiltZ.current) < 0.02) doll.rotation.y = Math.sin(t * 0.4) * 0.03;
      }
      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
    };
    loop();
  }, []);

  useEffect(() => {
    initThree();
    buildDoll(0);
    startLoop();
    return () => { if (animIdRef.current) cancelAnimationFrame(animIdRef.current); };
  }, [initThree, buildDoll, startLoop]);

  useEffect(() => {
    try { const s = localStorage.getItem("haciyatmaz_etiket"); if (s) { labelRef_.current = s; setLabel(s); buildLabel(); } } catch (_) {}
  }, [buildLabel]);

  useEffect(() => { labelRef_.current = label; buildLabel(); }, [label, buildLabel]);

  function handleHit() {
    if (busyRef.current) return;
    busyRef.current = true;
    const newHits = hits + 1;
    setHits(newHits);
    setMesaj(MSGS[Math.floor(Math.random() * MSGS.length)]);
    setMesajKey(k => k + 1);
    const d = HIT_DIRS[Math.floor(Math.random() * HIT_DIRS.length)];
    tiltZ.current = d[0] * 0.52; tiltX_.current = d[1] * 0.35;
    if (dollRef.current) { dollRef.current.rotation.z = tiltZ.current; dollRef.current.rotation.x = tiltX_.current; }
    spawnGlove(d[0] > 0);
    setTimeout(spawnImpact, 130);
  }

  function spawnGlove(fromLeft: boolean) {
    const layer = gloveLayerRef.current; if (!layer) return;
    const gc = document.createElement("canvas"); gc.width = 110; gc.height = 90;
    gc.style.cssText = `position:absolute;top:85px;${fromLeft ? "left:-20px" : "right:-20px"};pointer-events:none;animation:gloveHit .55s ease-out forwards;`;
    const g = gc.getContext("2d")!;
    g.save(); g.translate(fromLeft ? 20 : 90, 45); g.scale(fromLeft ? 1 : -1, 1);
    const gg = g.createRadialGradient(-6, -6, 4, 0, 0, 36);
    gg.addColorStop(0, "#ee4444"); gg.addColorStop(0.5, "#bb1818"); gg.addColorStop(1, "#6a0808");
    g.beginPath(); g.ellipse(0, 6, 30, 26, 0, 0, Math.PI * 2); g.fillStyle = gg; g.fill();
    g.beginPath(); g.ellipse(26, -8, 11, 9, Math.PI * 0.3, 0, Math.PI * 2); g.fillStyle = "#cc2020"; g.fill();
    g.strokeStyle = "rgba(0,0,0,0.2)"; g.lineWidth = 2;
    [-13, -4, 5, 14].forEach(x => { g.beginPath(); g.moveTo(x, -20); g.lineTo(x, -8); g.stroke(); });
    g.fillStyle = "white"; g.beginPath(); (g as any).roundRect(-30, 22, 60, 20, 5); g.fill();
    g.fillStyle = "#cc2020"; g.beginPath(); (g as any).roundRect(-30, 24, 60, 10, 4); g.fill();
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.ellipse(-9, -4, 9, 6, Math.PI * 0.2, 0, Math.PI * 2); g.fill();
    g.restore(); layer.appendChild(gc); setTimeout(() => gc.remove(), 600);
  }

  function spawnImpact() {
    const layer = gloveLayerRef.current; if (!layer) return;
    const ic = document.createElement("canvas"); ic.width = 90; ic.height = 90;
    ic.style.cssText = "position:absolute;top:70px;left:70px;pointer-events:none;animation:impactBurst .45s ease-out forwards;";
    const g = ic.getContext("2d")!;
    g.save(); g.translate(45, 45);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2, r = i % 2 ? 14 : 30;
      g.beginPath(); g.moveTo(Math.cos(a) * 7, Math.sin(a) * 7); g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      g.strokeStyle = i % 3 === 0 ? "#ff4400" : i % 3 === 1 ? "#ffaa00" : "#ffffff";
      g.lineWidth = 3; g.lineCap = "round"; g.stroke();
    }
    g.restore(); layer.appendChild(ic); setTimeout(() => ic.remove(), 500);
  }

  function handleSkinChange(i: number) {
    skinRef.current = i; setSkinState(i);
    tiltZ.current = 0; tiltX_.current = 0; busyRef.current = false;
    buildDoll(i);
  }

  function handleYapistir() {
    const v = inputVal.trim(); if (!v) return;
    labelRef_.current = v; setLabel(v); setInputVal("");
    try { localStorage.setItem("haciyatmaz_etiket", v); } catch (_) {}
  }

  function handleTemizle() {
    labelRef_.current = "Vur beni!"; setLabel("Vur beni!"); setHits(0); setInputVal("");
    setMesaj("Bir karakter seç, bir şey yapıştır — sonra vur!"); setMesajKey(k => k + 1);
    tiltZ.current = 0; tiltX_.current = 0; busyRef.current = false;
    try { localStorage.removeItem("haciyatmaz_etiket"); } catch (_) {}
  }

  return (
    <>
      <Navbar />
      <style>{`
        @keyframes msgIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .msg-anim{animation:msgIn .3s ease-out;}
        @keyframes gloveHit{0%{opacity:0;transform:scale(.4) rotate(-25deg);}30%{opacity:1;transform:scale(1.15) rotate(-5deg);}60%{opacity:1;transform:scale(1) rotate(0);}100%{opacity:0;transform:scale(.5) rotate(15deg);}}
        @keyframes impactBurst{0%{opacity:1;transform:scale(.2);}50%{opacity:1;transform:scale(1.3);}100%{opacity:0;transform:scale(1.8);}}
      `}</style>

      <main style={{ backgroundColor: "#1a2e4a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 52px", fontFamily: "'Sora', sans-serif" }}>
        <h1 style={{ color: "#f5a623", fontSize: "clamp(22px,5vw,32px)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>Hacıyatmaz</h1>
        <p style={{ color: "#e8f4fd", fontSize: 14, opacity: 0.75, marginBottom: 16, textAlign: "center", maxWidth: 340 }}>Bugün zor mu geçti? Buraya yaz, biraz boşal.</p>
        <p style={{ color: "#f5a623", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>{hits === 0 ? "Henüz vurmadın" : `${hits} kez vurdun`}</p>

        <div key={mesajKey} className="msg-anim" style={{ backgroundColor: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.32)", borderRadius: 12, padding: "10px 16px", maxWidth: 340, width: "100%", minHeight: 46, marginBottom: 16, color: "#f5a623", fontSize: 13, fontWeight: 600, textAlign: "center", lineHeight: 1.5 }}>
          {mesaj}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {SKINS.map((s, i) => (
            <button key={i} onClick={() => handleSkinChange(i)} title={s.label} style={{ width: 52, height: 52, borderRadius: 12, border: `2px solid ${skin === i ? "#f5a623" : "rgba(232,244,253,0.15)"}`, cursor: "pointer", background: skin === i ? "rgba(245,166,35,0.15)" : "rgba(232,244,253,0.06)", color: "white", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, transform: skin === i ? "scale(1.1)" : "scale(1)", transition: "all .2s" }}>
              <span style={{ fontSize: 22 }}>{s.emoji}</span>
              <span style={{ fontSize: 9, opacity: 0.7 }}>{s.label}</span>
            </button>
          ))}
        </div>

        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", cursor: "pointer", WebkitTapHighlightColor: "transparent" }} onClick={handleHit} />
          <div ref={gloveLayerRef} style={{ position: "absolute", top: 0, left: 0, width: W, height: H, pointerEvents: "none", overflow: "visible" }} />
        </div>

        <div style={{ display: "flex", gap: 8, maxWidth: 320, width: "100%", marginBottom: 10 }}>
          <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && handleYapistir()} maxLength={20} placeholder="Ne yazayım? (örn: Matematik sınavı)" style={{ flex: 1, padding: "10px 13px", borderRadius: 10, border: "1.5px solid rgba(232,244,253,0.22)", backgroundColor: "rgba(232,244,253,0.07)", color: "white", fontSize: 13, fontFamily: "'Sora', sans-serif", outline: "none" }} />
          <button onClick={handleYapistir} style={{ padding: "10px 16px", backgroundColor: "#f5a623", color: "#1a2e4a", fontWeight: 700, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "'Sora', sans-serif" }}>Yapıştır</button>
        </div>

        <button onClick={handleTemizle} style={{ padding: "7px 16px", backgroundColor: "transparent", color: "rgba(232,244,253,0.38)", border: "1px solid rgba(232,244,253,0.15)", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'Sora', sans-serif", marginBottom: 40 }}>Temizle ve sıfırla</button>
        <p style={{ color: "rgba(232,244,253,0.28)", fontSize: 11, textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>Bu sayfa seni dinliyor. Duygularını burada bırakabilirsin.</p>
      </main>
    </>
  );
}