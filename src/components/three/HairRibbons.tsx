import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as THREE from "three";

const TAU = Math.PI * 2;

// deterministic pseudo-random so the sculpture is stable across renders
const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Build a swept tube with a VARIABLE radius so each strand tapers to fine tips
 * like real hair (constant-radius TubeGeometry can't taper). Frenet-framed,
 * indexed, with a per-fibre random baked in for varied sway.
 */
function taperedStrand(
  curve: THREE.CatmullRomCurve3,
  tubular: number,
  radial: number,
  radiusAt: (t: number) => number,
  randVal: number
) {
  const frames = curve.computeFrenetFrames(tubular, false);
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const rnd: number[] = [];
  const P = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, P);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radiusAt(t);
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * TAU;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);
      nrm.set(cos * N.x + sin * B.x, cos * N.y + sin * B.y, cos * N.z + sin * B.z).normalize();
      pos.push(P.x + r * nrm.x, P.y + r * nrm.y, P.z + r * nrm.z);
      nor.push(nrm.x, nrm.y, nrm.z);
      uv.push(t, j / radial);
      rnd.push(randVal);
    }
  }
  const idx: number[] = [];
  for (let i = 1; i <= tubular; i++) {
    for (let j = 1; j <= radial; j++) {
      const a = (radial + 1) * (i - 1) + (j - 1);
      const b = (radial + 1) * i + (j - 1);
      const c = (radial + 1) * i + j;
      const d = (radial + 1) * (i - 1) + j;
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setIndex(idx);
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aRand", new THREE.Float32BufferAttribute(rnd, 1));
  return g;
}

/**
 * The hero centerpiece — a soft, luminous fall of many fine hair strands.
 * Each strand is a fine, tapered fibre swept along a gently falling curve
 * (not a tight helix), all merged into one geometry. The material is a
 * matte-to-satin, anisotropic hair look — high roughness, no clearcoat, a soft
 * sheen and an along-the-strand anisotropic highlight — so a single strand
 * reads as lit hair, never a glossy round pipe.
 *
 * Motion (all GPU vertex-shader): an ambient per-fibre sway, a damped lean
 * toward the cursor + a soft whip on fast scroll, an intro reveal and a soft
 * parallax drift as the ritual scrolls (it lifts and fades rather than zooming).
 */
export default function HairRibbons({
  progressRef,
  velocityRef,
  reducedMotion = false,
}: {
  progressRef: React.MutableRefObject<number>;
  velocityRef?: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const reveal = useRef(reducedMotion ? 1 : 0);
  const uniforms = useRef({
    uTime: { value: 0 },
    uSway: { value: reducedMotion ? 0.4 : 1 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uWhip: { value: 0 },
  });

  const geometry = useMemo(() => {
    const K = 58;
    const geos: THREE.BufferGeometry[] = [];
    for (let k = 0; k < K; k++) {
      const a = rand(k + 1);
      const b = rand(k + 101);
      const c = rand(k + 211);
      const d = rand(k + 331);
      const baseAngle = a * TAU;
      const turns = 0.8 + b * 1.0; // gentle fall, not a tight twist
      const bundle = 0.24 + c * 0.66; // this strand's distance from the core
      const sway = 0.22 + c * 0.4;
      const yTop = 2.9 - a * 0.5;
      const yBot = -2.7 - b * 0.6;
      const SEG = 64;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= SEG; i++) {
        const t = i / SEG;
        const y = yTop + (yBot - yTop) * t;
        const ang = baseAngle + t * turns * Math.PI + 0.5 * Math.sin(t * 3.0 + k);
        const radial = bundle * (0.35 + 0.9 * Math.sin(t * Math.PI));
        const x = Math.cos(ang) * radial + sway * Math.sin(t * 2.2 + k * 1.3);
        const z = Math.sin(ang) * radial * 0.7 + sway * 0.6 * Math.cos(t * 1.8 + k);
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
      const baseR = 0.009 + d * 0.012; // fine strand
      const radiusAt = (t: number) => {
        const tip = Math.pow(1 - t, 0.85); // thick near root, thin at the tip
        const round = Math.min(1, t / 0.04); // round off the very top
        return baseR * Math.max(0.05, tip * round);
      };
      geos.push(taperedStrand(curve, SEG, 5, radiusAt, a * 0.5 + c * 0.5));
    }
    const merged = mergeGeometries(geos, false)!;
    geos.forEach((g) => g.dispose());
    return merged;
  }, []);

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#5a3540"),
      metalness: 0.0,
      roughness: 0.72,
      clearcoat: 0,
      anisotropy: 1,
      anisotropyRotation: 0, // stretch the highlight ALONG the strand (UV.u)
      sheen: 1,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color("#e8c3b2"),
      iridescence: 0.12,
      iridescenceIOR: 1.2,
      emissive: new THREE.Color("#b98a78"),
      emissiveIntensity: 0.14,
      envMapIntensity: 0.7,
      transparent: true,
      opacity: 1,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.current.uTime;
      shader.uniforms.uSway = uniforms.current.uSway;
      shader.uniforms.uPointer = uniforms.current.uPointer;
      shader.uniforms.uWhip = uniforms.current.uWhip;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uTime;
           uniform float uSway;
           uniform vec2  uPointer;
           uniform float uWhip;
           attribute float aRand;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           float ny = clamp((position.y + 2.9) / 5.8, 0.0, 1.0); // 0 tips, 1 crown
           float tips = 1.0 - ny;
           float ph = aRand * 6.2831;
           float amp = uSway * mix(0.03, 0.20, tips) * (0.6 + aRand * 0.9);
           transformed.x += sin(position.y * 1.1 + uTime * 0.8 + ph) * amp;
           transformed.z += cos(position.y * 0.9 + uTime * 0.6 + ph * 1.3) * amp * 0.8;
           transformed.x += uPointer.x * mix(0.03, 0.26, tips);
           transformed.z += uPointer.y * mix(0.02, 0.16, tips);
           transformed.x += uWhip * mix(0.04, 0.42, tips);`
        );
    };
    return m;
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progressRef.current;
    const u = uniforms.current;

    reveal.current = THREE.MathUtils.lerp(reveal.current, 1, reducedMotion ? 1 : 0.05);
    const r = reveal.current;

    if (!reducedMotion) {
      u.uTime.value += delta;
      u.uPointer.value.x = THREE.MathUtils.lerp(u.uPointer.value.x, state.pointer.x, 0.06);
      u.uPointer.value.y = THREE.MathUtils.lerp(u.uPointer.value.y, state.pointer.y, 0.06);
      const vel = velocityRef ? THREE.MathUtils.clamp(velocityRef.current, -1, 1) : 0;
      u.uWhip.value = THREE.MathUtils.lerp(u.uWhip.value, vel, 0.08);
    }

    const idle = reducedMotion ? 0 : state.clock.elapsedTime * 0.05;
    g.rotation.y = idle + (1 - r) * -0.7 + u.uPointer.value.x * 0.18;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.05 - u.uPointer.value.y * 0.08 + p * 0.1, 0.05);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0.035 * Math.sin(state.clock.elapsedTime * 0.3), 0.05);

    const targetY = -0.1 + (1 - r) * -0.5 + p * 1.15;
    const targetZ = (1 - r) * -1.4 - p * 1.2;
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 0.06);
    g.position.z = THREE.MathUtils.lerp(g.position.z, targetZ, 0.06);

    const s = 0.9 + r * 0.1;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, 0.06));

    material.opacity = r * (1 - THREE.MathUtils.smoothstep(p, 0.72, 1));
    material.emissiveIntensity = 0.14 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
  });

  return (
    <group ref={group} position={[0, -0.1, 0]}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
}
