import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TAU = Math.PI * 2;

/**
 * The hero centerpiece — a sculptural knot of long, glossy strands that flow
 * and curl through space like a lock of hair caught in light, or ribbons of
 * liquid silk. Built procedurally from swept tubes along swirling curves; no
 * external mesh. A single iridescent MeshPhysicalMaterial (clearcoat + sheen +
 * thin-film iridescence, warm plum → rose-gold → champagne) gives it a
 * luminous, alive-but-abstract quality — evocative of hair and transformation,
 * never a recognisable product.
 *
 * Motion: a slow idle turn + a GPU vertex-shader sway (so the strands undulate
 * without any per-frame geometry rebuild), a gentle pointer parallax, an
 * intro "form / sweep into view" reveal, and a soft parallax drift on scroll —
 * it recedes and settles rather than zooming to fill.
 */
export default function HairRibbons({
  progressRef,
  reducedMotion = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const reveal = useRef(reducedMotion ? 1 : 0);
  const uniforms = useRef({ uTime: { value: 0 }, uSway: { value: reducedMotion ? 0.35 : 1 } });

  // A handful of swirling strands cascading through the frame.
  const strands = useMemo(() => {
    const K = 7;
    const radii = [0.05, 0.082, 0.058, 0.095, 0.052, 0.075, 0.064];
    const out: { geo: THREE.TubeGeometry }[] = [];
    for (let k = 0; k < K; k++) {
      const baseAngle = (k / K) * TAU;
      const pts: THREE.Vector3[] = [];
      const SEG = 90;
      for (let i = 0; i <= SEG; i++) {
        const t = i / SEG;
        const y = 2.7 - t * 5.5;
        // curls tighter as it descends; radius swells through the middle
        const a = baseAngle + t * (2.3 + 0.7 * Math.sin(k * 1.7)) * Math.PI;
        const rad = 0.42 + 1.05 * Math.sin(t * Math.PI) + 0.14 * (k / K);
        const x = Math.cos(a) * rad + 0.22 * Math.sin(t * 3.1 + k);
        const z = Math.sin(a) * rad * 0.72 - 0.15 * k * 0.02;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
      const geo = new THREE.TubeGeometry(curve, 150, radii[k], 12, false);
      out.push({ geo });
    }
    return out;
  }, []);

  // One shared iridescent silk material for every strand.
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#432634"),
      metalness: 0.38,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.14,
      iridescence: 1,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [120, 520],
      sheen: 1,
      sheenRoughness: 0.32,
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
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uTime;
           uniform float uSway;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           float ny = (position.y + 2.8) / 5.5;        // 0 at the tips, ~1 at the crown
           float ampl = uSway * mix(0.20, 0.02, ny);    // strands swing most at the ends
           transformed.x += sin(position.y * 1.15 + uTime * 0.85) * ampl;
           transformed.z += cos(position.y * 0.95 + uTime * 0.62) * ampl * 0.8;`
        );
    };
    return m;
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progressRef.current;

    // intro: form / sweep into view
    reveal.current = THREE.MathUtils.lerp(reveal.current, 1, reducedMotion ? 1 : 0.03);
    const r = reveal.current;

    if (!reducedMotion) uniforms.current.uTime.value += delta;

    // slow idle turn + reveal spin-in + pointer parallax; recede softly on scroll
    const idle = reducedMotion ? 0 : state.clock.elapsedTime * 0.055;
    g.rotation.y = idle + (1 - r) * -0.7 + state.pointer.x * 0.25;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.06 + -state.pointer.y * 0.12 + p * 0.12, 0.05);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0.04 * Math.sin(state.clock.elapsedTime * 0.3), 0.05);

    // parallax drift — up and back as the ritual scrolls, NOT a zoom-in
    const targetY = -0.1 + (1 - r) * -0.5 + p * 0.85;
    const targetZ = (1 - r) * -1.4 - p * 1.1;
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 0.06);
    g.position.z = THREE.MathUtils.lerp(g.position.z, targetZ, 0.06);

    const s = 0.9 + r * 0.1; // settles to full size (never overshoots to fill)
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, 0.06));

    material.opacity = r;
    material.emissiveIntensity = 0.22 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <group ref={group} position={[0, -0.1, 0]}>
      {strands.map((s, i) => (
        <mesh key={i} geometry={s.geo} material={material} />
      ))}
    </group>
  );
}
