import { Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import ProductBottle from "./ProductBottle";
import Particles from "./Particles";

/**
 * Camera drifts slowly closer as the ritual progresses and parallaxes gently
 * with the pointer — depth that reacts, the dark-to-radiant arc.
 */
function Rig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame((state) => {
    const p = progressRef.current;
    const targetZ = 8.2 - p * 2.4;
    const targetY = 0.2 - p * 0.15 + state.pointer.y * 0.25;
    const targetX = state.pointer.x * 0.45;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Stage3D({
  progressRef,
  dpr = [1, 1.75],
  particleCount = 480,
}: {
  progressRef: React.MutableRefObject<number>;
  dpr?: [number, number];
  particleCount?: number;
}) {
  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.2, 8.2], fov: 34 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Rig progressRef={progressRef} />

        {/* soft lights to catch the metal cap + sculpt the glass */}
        <ambientLight intensity={0.55} color={"#f0e4da"} />
        <directionalLight position={[3, 4, 5]} intensity={1.5} color={"#fff4ec"} />
        <spotLight position={[-4, 2, -4]} angle={0.7} penumbra={1} intensity={55} distance={20} color={"#e0b39f"} />
        <pointLight position={[2, -3, 2]} intensity={8} color={"#6c7f8a"} distance={12} />

        <Float speed={1} rotationIntensity={0.12} floatIntensity={0.35} floatingRange={[-0.05, 0.08]}>
          <ProductBottle progressRef={progressRef} />
        </Float>

        <Particles count={particleCount} />

        {/* In-scene studio environment — light shapes for real reflections,
            baked once, no network HDRI fetch. */}
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.4} color="#fff0e6" position={[0, 3, 2]} scale={[7, 3, 1]} />
          <Lightformer intensity={1.5} color="#c99a8a" position={[-4, 0, -3]} scale={[3, 7, 1]} />
          <Lightformer intensity={1.1} color="#4a6b5c" position={[4, -1, -2]} scale={[3, 4, 1]} />
          <Lightformer intensity={1.7} color="#efe6df" position={[0, -3, 3]} scale={[7, 2, 1]} />
        </Environment>

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.95}
            luminanceThreshold={0.58}
            luminanceSmoothing={0.4}
            mipmapBlur
            radius={0.75}
          />
          <ChromaticAberration
            offset={new THREE.Vector2(0.0005, 0.0006)}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette eskil={false} offset={0.22} darkness={0.74} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
