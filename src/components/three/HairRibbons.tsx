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
 * The hero centerpiece — a soft, luminous column of many fine hair fibres.
 * Dozens of individual glossy strands, each swept as a thin tube along its own
 * swirling path, merged into a single geometry for performance. One iridescent
 * MeshPhysicalMaterial (clearcoat + sheen + thin-film, warm plum → rose-gold →
 * champagne) gives it the alive-but-abstract quality of real hair caught in
 * light — evocative of transformation, never a recognisable product.
 *
 * Motion (all GPU vertex-shader, no geometry rebuilds):
 *  - an ambient per-fibre sway, phase-varied so strands never move in unison;
 *  - a gentle lean toward the cursor + a soft whip on fast scroll (damped),
 *    fully disabled under reduced motion;
 *  - an intro "form / sweep into view" reveal and a soft parallax drift as the
 *    ritual scrolls — it lifts and recedes rather than zooming to fill.
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

  // Build ~56 fine fibres and merge them into one geometry.
  const geometry = useMemo(() => {
    const K = 56;
    const geos: THREE.BufferGeometry[] = [];
    for (let k = 0; k < K; k++) {
      const a = rand(k + 1);
      const b = rand(k + 101);
      const c = rand(k + 211);
      const d = rand(k + 331);
      const baseAngle = a * TAU;
      const turns = 2.0 + b * 1.9; // how many times it wraps the column
      const bundle = 0.26 + c * 0.62; // this fibre's distance from the core
      const yTop = 2.9 - a * 0.5;
      const yBot = -2.7 - b * 0.6;
      const SEG = 64;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= SEG; i++) {
        const t = i / SEG;
        const y = yTop + (yBot - yTop) * t;
        const ang = baseAngle + t * turns * Math.PI;
        // column swells through the middle; each fibre keeps its own radius
        const radial = bundle * (0.5 + 0.85 * Math.sin(t * Math.PI));
        const x = Math.cos(ang) * radial + 0.12 * Math.sin(t * 4.0 + k);
        const z = Math.sin(ang) * radial * 0.72 + 0.1 * Math.cos(t * 3.0 + k * 1.3);
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
      const r = 0.008 + d * 0.014; // fine strand, slight per-fibre variation
      const g = new THREE.TubeGeometry(curve, SEG, r, 6, false);
      // per-fibre random, baked as a vertex attribute for varied sway/lean
      const vcount = g.attributes.position.count;
      const arr = new Float32Array(vcount);
      arr.fill(a * 0.5 + c * 0.5);
      g.setAttribute("aRand", new THREE.BufferAttribute(arr, 1));
      geos.push(g);
    }
    const merged = mergeGeometries(geos, false)!;
    geos.forEach((g) => g.dispose());
    return merged;
  }, []);

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#4a2b39"),
      metalness: 0.34,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      iridescence: 1,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [130, 540],
      sheen: 1,
      sheenRoughness: 0.35,
      sheenColor: new THREE.Color("#e8c3b2"),
      emissive: new THREE.Color("#c99a8a"),
      emissiveIntensity: 0.22,
      envMapIntensity: 1.7,
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
           float tips = 1.0 - ny;                                 // strands move most at the ends
           float ph = aRand * 6.2831;
           float amp = uSway * mix(0.03, 0.20, tips) * (0.6 + aRand * 0.9);
           transformed.x += sin(position.y * 1.1 + uTime * 0.8 + ph) * amp;
           transformed.z += cos(position.y * 0.9 + uTime * 0.6 + ph * 1.3) * amp * 0.8;
           // gesture: lean toward the cursor + whip on fast scroll (tips lead)
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

    // intro: form / sweep into view
    reveal.current = THREE.MathUtils.lerp(reveal.current, 1, reducedMotion ? 1 : 0.05);
    const r = reveal.current;

    if (!reducedMotion) {
      u.uTime.value += delta;
      // damped cursor lean
      u.uPointer.value.x = THREE.MathUtils.lerp(u.uPointer.value.x, state.pointer.x, 0.06);
      u.uPointer.value.y = THREE.MathUtils.lerp(u.uPointer.value.y, state.pointer.y, 0.06);
      // damped scroll-velocity whip, easing back to rest
      const vel = velocityRef ? THREE.MathUtils.clamp(velocityRef.current, -1, 1) : 0;
      u.uWhip.value = THREE.MathUtils.lerp(u.uWhip.value, vel, 0.08);
    }

    // slow idle turn + reveal spin-in + a touch of pointer parallax
    const idle = reducedMotion ? 0 : state.clock.elapsedTime * 0.05;
    g.rotation.y = idle + (1 - r) * -0.7 + u.uPointer.value.x * 0.18;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.05 - u.uPointer.value.y * 0.08 + p * 0.1, 0.05);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0.035 * Math.sin(state.clock.elapsedTime * 0.3), 0.05);

    // parallax drift — lifts up and back as the ritual scrolls (never zoom-in)
    const targetY = -0.1 + (1 - r) * -0.5 + p * 1.15;
    const targetZ = (1 - r) * -1.4 - p * 1.2;
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 0.06);
    g.position.z = THREE.MathUtils.lerp(g.position.z, targetZ, 0.06);

    const s = 0.9 + r * 0.1;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, 0.06));

    // form in, then softly fade out as the hero hands off to the Journey
    material.opacity = r * (1 - THREE.MathUtils.smoothstep(p, 0.72, 1));
    material.emissiveIntensity = 0.22 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <group ref={group} position={[0, -0.1, 0]}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
}
