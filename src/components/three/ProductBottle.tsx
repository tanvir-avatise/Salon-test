import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * The signature object — a frosted-glass serum bottle, built procedurally
 * from a lathe profile so no model asset is needed. A rose-gold collar and
 * cap, a translucent liquid line inside, and a soft warm tint. Rotation and
 * subtle scale are driven by scroll progress (0 → 1) passed from the stage.
 */
export default function ProductBottle({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);

  // Glass body profile (radius, height) — rounded shoulder, tapered neck.
  const bodyPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const add = (x: number, y: number) => pts.push(new THREE.Vector2(x, y));
    add(0.0, -1.55);
    add(0.62, -1.55);
    add(0.78, -1.42);
    add(0.82, -1.1);
    add(0.82, 0.55);
    add(0.8, 0.86);
    add(0.6, 1.12);
    add(0.34, 1.24);
    add(0.3, 1.42);
    add(0.3, 1.6);
    return pts;
  }, []);

  // Liquid — a slightly inset lathe filling the lower ~60%.
  const liquidPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.0, -1.48));
    pts.push(new THREE.Vector2(0.74, -1.42));
    pts.push(new THREE.Vector2(0.77, -1.1));
    pts.push(new THREE.Vector2(0.77, 0.15));
    pts.push(new THREE.Vector2(0.0, 0.15));
    return pts;
  }, []);

  const spin = useRef(0);
  useFrame((_, delta) => {
    if (!group.current) return;
    const p = progressRef.current;
    // A constant slow turn, accelerated by scroll as the ritual unfolds.
    spin.current += delta * (0.12 + p * 0.5);
    group.current.rotation.y = spin.current + p * Math.PI * 1.2;
    // Gentle tilt that eases upright as the camera drifts closer.
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      -0.12 + p * 0.12,
      0.05
    );
  });

  return (
    <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.5} floatingRange={[-0.08, 0.12]}>
      <group ref={group} position={[0, -0.2, 0]}>
        {/* Frosted glass body */}
        <mesh castShadow>
          <latheGeometry args={[bodyPoints, 96]} />
          <meshPhysicalMaterial
            transmission={0.92}
            thickness={1.4}
            roughness={0.32}
            ior={1.36}
            clearcoat={1}
            clearcoatRoughness={0.28}
            color={"#f4e9e2"}
            attenuationColor={"#e9c6b6"}
            attenuationDistance={2.4}
            envMapIntensity={1.1}
          />
        </mesh>

        {/* Liquid */}
        <mesh>
          <latheGeometry args={[liquidPoints, 80]} />
          <meshPhysicalMaterial
            transmission={0.6}
            thickness={2}
            roughness={0.18}
            ior={1.34}
            color={"#c99a8a"}
            attenuationColor={"#b7897a"}
            attenuationDistance={1.1}
            envMapIntensity={1}
          />
        </mesh>

        {/* Collar */}
        <mesh position={[0, 1.34, 0]}>
          <cylinderGeometry args={[0.33, 0.31, 0.16, 64]} />
          <meshStandardMaterial
            color={"#c99a8a"}
            metalness={1}
            roughness={0.22}
            envMapIntensity={1.4}
          />
        </mesh>

        {/* Cap */}
        <mesh position={[0, 1.66, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.42, 64]} />
          <meshStandardMaterial
            color={"#c1907f"}
            metalness={0.95}
            roughness={0.28}
            envMapIntensity={1.3}
          />
        </mesh>
        <mesh position={[0, 1.88, 0]}>
          <cylinderGeometry args={[0.345, 0.34, 0.04, 64]} />
          <meshStandardMaterial color={"#e8c3b2"} metalness={1} roughness={0.15} />
        </mesh>
      </group>
    </Float>
  );
}
