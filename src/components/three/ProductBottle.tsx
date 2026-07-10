import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * The signature object — a real-time refractive glass serum bottle, built
 * procedurally from a lathe profile (no external asset). A rose-gold metal
 * cap and collar, a tinted liquid line, and a proper transmission material
 * (refraction, chromatic aberration, roughness, IOR).
 *
 * Motion: a constant slow auto-rotate, accelerated by scroll through the
 * ritual, plus a gentle pointer-driven tilt/parallax and a floating bob.
 */
export default function ProductBottle({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);

  const bodyPoints = useMemo(() => {
    const p: THREE.Vector2[] = [];
    const add = (x: number, y: number) => p.push(new THREE.Vector2(x, y));
    add(0.0, -1.5);
    add(0.6, -1.5);
    add(0.76, -1.4);
    add(0.82, -1.18);
    add(0.83, 0.5);
    add(0.8, 0.82);
    add(0.62, 1.02);
    add(0.36, 1.16);
    add(0.32, 1.34);
    add(0.32, 1.5);
    return p;
  }, []);

  const liquidPoints = useMemo(() => {
    const p: THREE.Vector2[] = [];
    p.push(new THREE.Vector2(0.0, -1.44));
    p.push(new THREE.Vector2(0.76, -1.36));
    p.push(new THREE.Vector2(0.78, -1.1));
    p.push(new THREE.Vector2(0.78, 0.05));
    p.push(new THREE.Vector2(0.0, 0.05));
    return p;
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progressRef.current;
    spin.current += delta * (0.16 + p * 0.4);
    // auto-rotate + scroll rotation + pointer parallax
    g.rotation.y = spin.current + p * Math.PI + state.pointer.x * 0.4;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.22, 0.06);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -0.05 + p * 0.08, 0.05);
    g.position.y = -0.12 + Math.sin(state.clock.elapsedTime * 0.85) * 0.06;
    const s = 1 + p * 0.12;
    g.scale.setScalar(s);
  });

  return (
    <group ref={group} position={[0, -0.12, 0]}>
      {/* Refractive glass body */}
      <mesh castShadow>
        <latheGeometry args={[bodyPoints, 128]} />
        <MeshTransmissionMaterial
          samples={5}
          resolution={256}
          transmission={1}
          roughness={0.28}
          thickness={0.9}
          ior={1.44}
          chromaticAberration={0.035}
          anisotropy={0.25}
          distortion={0.12}
          distortionScale={0.2}
          temporalDistortion={0.06}
          clearcoat={1}
          clearcoatRoughness={0.28}
          attenuationDistance={2.6}
          attenuationColor={"#f0d4c4"}
          color={"#f8f0ea"}
          background={new THREE.Color("#c7a48f")}
        />
      </mesh>

      {/* Tinted liquid */}
      <mesh>
        <latheGeometry args={[liquidPoints, 96]} />
        <meshPhysicalMaterial
          transmission={0.6}
          thickness={2}
          roughness={0.2}
          ior={1.34}
          color={"#c99a8a"}
          attenuationColor={"#b7897a"}
          attenuationDistance={0.9}
          envMapIntensity={1}
        />
      </mesh>

      {/* Collar */}
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.35, 0.33, 0.18, 72]} />
        <meshStandardMaterial color={"#c99a8a"} metalness={1} roughness={0.2} envMapIntensity={1.5} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 1.74, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.46, 72]} />
        <meshStandardMaterial color={"#c1907f"} metalness={0.96} roughness={0.26} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0, 1.98, 0]}>
        <cylinderGeometry args={[0.365, 0.36, 0.05, 72]} />
        <meshStandardMaterial color={"#e8c3b2"} metalness={1} roughness={0.14} />
      </mesh>
    </group>
  );
}
