import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import ProductBottle from "./ProductBottle";
import Particles from "./Particles";

/**
 * Camera drifts slowly closer as the ritual progresses, and the key rim-light
 * warms from cool shadow toward blush glow — the dark-to-radiant arc.
 */
function Rig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const rim = useRef<THREE.SpotLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const p = progressRef.current;
    // Drift from 8.1 → 5.6 on z, easing the object nearer.
    const targetZ = 8.1 - p * 2.5;
    const targetY = 0.2 - p * 0.15;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.lookAt(0, 0, 0);

    if (rim.current) rim.current.intensity = THREE.MathUtils.lerp(rim.current.intensity, 24 + p * 40, 0.05);
    if (key.current) key.current.intensity = THREE.MathUtils.lerp(key.current.intensity, 0.6 + p * 1.6, 0.05);
  });

  return (
    <>
      {/* soft ambient fill */}
      <ambientLight intensity={0.25} color={"#e9dcd3"} />
      {/* key light */}
      <directionalLight ref={key} position={[3, 4, 5]} intensity={0.6} color={"#fff2e9"} />
      {/* rose-gold rim from behind the object */}
      <spotLight
        ref={rim}
        position={[-4, 2, -4]}
        angle={0.7}
        penumbra={1}
        intensity={24}
        distance={18}
        color={"#c99a8a"}
      />
      {/* cool underlight to sculpt the glass */}
      <pointLight position={[2, -3, 2]} intensity={6} color={"#6c7f8a"} distance={12} />
    </>
  );
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
        <ProductBottle progressRef={progressRef} />
        <Particles count={particleCount} />

        {/* In-scene environment — custom light shapes for reflections, no
            network fetch. Gives the glass something warm to catch. */}
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.2} color="#fff0e6" position={[0, 3, 2]} scale={[6, 3, 1]} />
          <Lightformer intensity={1.4} color="#c99a8a" position={[-4, 0, -3]} scale={[3, 6, 1]} />
          <Lightformer intensity={1} color="#4a6b5c" position={[4, -1, -2]} scale={[3, 4, 1]} />
          <Lightformer intensity={1.6} color="#efe6df" position={[0, -3, 3]} scale={[6, 2, 1]} />
        </Environment>

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.62}
            luminanceSmoothing={0.4}
            mipmapBlur
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.72} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
