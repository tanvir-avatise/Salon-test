import { Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import HairRibbons from "./HairRibbons";
import Particles from "./Particles";

/**
 * Camera holds steady and parallaxes gently with the pointer — the strands do
 * the moving. No dolly-to-fill; the hero should feel like light breathing, not
 * a product turntable.
 */
function Rig() {
  const { camera } = useThree();
  useFrame((state) => {
    const tx = state.pointer.x * 0.35;
    const ty = 0.15 + state.pointer.y * 0.22;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.045);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.05);
    camera.lookAt(0, -0.1, 0);
  });
  return null;
}

export default function HairStage({
  progressRef,
  dpr = [1, 1.75],
  particleCount = 420,
  reducedMotion = false,
}: {
  progressRef: React.MutableRefObject<number>;
  dpr?: [number, number];
  particleCount?: number;
  reducedMotion?: boolean;
}) {
  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.15, 7.4], fov: 36 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Rig />

        {/* warm key + rose rim to sculpt the strands */}
        <ambientLight intensity={0.5} color="#f0e4da" />
        <directionalLight position={[3, 4, 5]} intensity={1.3} color="#fff4ec" />
        <spotLight position={[-4, 2, 2]} angle={0.7} penumbra={1} intensity={45} distance={22} color="#e0b39f" />
        <pointLight position={[2.5, -2, 3]} intensity={10} color="#c99a8a" distance={14} />

        <Float speed={reducedMotion ? 0 : 0.8} rotationIntensity={0} floatIntensity={reducedMotion ? 0 : 0.3} floatingRange={[-0.06, 0.08]}>
          <HairRibbons progressRef={progressRef} reducedMotion={reducedMotion} />
        </Float>

        <Particles count={particleCount} />

        {/* in-scene studio light shapes for real rose-gold reflections */}
        <Environment resolution={512} frames={1}>
          <Lightformer intensity={2.6} color="#fff0e6" position={[0, 3, 2]} scale={[9, 3, 1]} />
          <Lightformer intensity={1.7} color="#c99a8a" position={[-4, 0.5, -3]} scale={[3, 9, 1]} />
          <Lightformer intensity={1.4} color="#efc9b4" position={[4, 1, 2]} scale={[3, 6, 1]} />
          <Lightformer intensity={1.1} color="#4a6b5c" position={[0, -3.5, 2]} scale={[8, 2, 1]} />
          <Lightformer form="ring" intensity={2} color="#ffe9d8" position={[2.4, 2, 3]} scale={[2, 2, 1]} />
          <Lightformer intensity={1.8} color="#ffffff" position={[-2, 3, 2]} rotation={[0, 0, 0.6]} scale={[0.4, 6, 1]} />
        </Environment>

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.4} mipmapBlur radius={0.78} />
          <Vignette eskil={false} offset={0.22} darkness={0.72} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
