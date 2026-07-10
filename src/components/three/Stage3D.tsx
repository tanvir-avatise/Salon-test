import { Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Particles from "./Particles";

/**
 * Ambient particle field behind the real bottle. The camera drifts slowly
 * closer as the ritual progresses so the dust parallaxes past — the
 * "camera-drift" beat, now backing the composited photo bottle.
 */
function Rig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame(() => {
    const p = progressRef.current;
    const targetZ = 8.1 - p * 2.5;
    const targetY = 0.2 - p * 0.15;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Stage3D({
  progressRef,
  dpr = [1, 1.75],
  particleCount = 520,
}: {
  progressRef: React.MutableRefObject<number>;
  dpr?: [number, number];
  particleCount?: number;
}) {
  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.2, 8.1], fov: 34 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Rig progressRef={progressRef} />
        <Particles count={particleCount} />

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.85}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.4}
            mipmapBlur
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
