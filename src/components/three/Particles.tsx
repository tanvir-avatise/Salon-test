import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Ambient dust — a slow drifting cloud of soft, additively-blended points
 * catching the light. Purely decorative; count scales down on lighter setups.
 */
export default function Particles({ count = 520 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      speeds[i] = 0.05 + Math.random() * 0.12;
    }
    return { positions, speeds };
  }, [count]);

  const sprite = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,244,236,1)");
    g.addColorStop(0.3, "rgba(201,154,138,0.5)");
    g.addColorStop(1, "rgba(201,154,138,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 0.6;
      if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -5;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        map={sprite}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}
