import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { JOURNEY } from "../../lib/content";
import { asset } from "../../lib/asset";

const N = JOURNEY.length;
const Y_GAP = 3.5; // vertical spacing between stations
const X_OFF = 1.4; // how far each panel sits off the spine
const TILT = 0.32; // radians each panel turns toward the camera

/** A gently cylinder-bent plane so each photo wraps the rail. */
function useBentGeometry(w: number, h: number, bend: number) {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 24, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setZ(i, -((x / (w / 2)) ** 2) * bend);
    }
    g.computeVertexNormals();
    return g;
  }, [w, h, bend]);
}

/** A border-only outline that follows the bent panel edge (no internal seams). */
function useBentFrame(w: number, h: number, bend: number) {
  return useMemo(() => {
    const zf = (x: number) => -((x / (w / 2)) ** 2) * bend + 0.004;
    const pts: THREE.Vector3[] = [];
    const seg = 20;
    // top edge, left → right (traces the curve)
    for (let i = 0; i <= seg; i++) {
      const x = -w / 2 + (w * i) / seg;
      pts.push(new THREE.Vector3(x, h / 2, zf(x)));
    }
    // bottom edge, right → left
    for (let i = 0; i <= seg; i++) {
      const x = w / 2 - (w * i) / seg;
      pts.push(new THREE.Vector3(x, -h / 2, zf(x)));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [w, h, bend]);
}

function Scene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera, size } = useThree();
  // Narrow / portrait screens: centre the panels and drop their captions
  // underneath so nothing runs off the edge; pull the camera back to frame it.
  const compact = size.width < 640;
  const xOff = compact ? 0 : X_OFF;
  const tilt = compact ? 0.12 : TILT;

  // Reframe the camera for the compact layout.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.z = compact ? 9.4 : 6.6;
    cam.fov = compact ? 46 : 36;
    cam.updateProjectionMatrix();
  }, [camera, compact]);

  const textures = useTexture(JOURNEY.map((j) => asset(`images/${j.img}`)));
  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [textures]);

  const geo = useBentGeometry(2.5, 3.12, 0.42);
  const frameGeo = useBentFrame(2.5, 3.12, 0.42);

  const spineRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const rigRef = useRef<THREE.Group>(null);
  const panelRefs = useRef<(THREE.Group | null)[]>([]);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Helical "luminous strand" for the spine.
  const spineGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const H = N * Y_GAP + 3;
    for (let t = 0; t <= 1; t += 1 / 160) {
      const a = t * Math.PI * 5;
      pts.push(new THREE.Vector3(Math.sin(a) * 0.16, H / 2 - t * H, Math.cos(a) * 0.16));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 240, 0.05, 16, false);
  }, []);

  const easeSmooth = (x: number) => x * x * (3 - 2 * x);

  useFrame((state, delta) => {
    const p = progressRef.current;
    const activeF = p * (N - 1);

    // rig travels vertically so each station reaches the focal centre
    if (rigRef.current) {
      const targetY = activeF * Y_GAP;
      rigRef.current.position.y = THREE.MathUtils.lerp(rigRef.current.position.y, targetY, 0.12);
    }
    // the strand slowly rotates as you scroll (and drifts a touch on its own)
    if (spineRef.current) {
      spineRef.current.rotation.y = p * Math.PI * 1.6 + state.clock.elapsedTime * 0.05;
    }
    // travelling glow bead rides the strand toward the active node
    if (orbRef.current) {
      const H = N * Y_GAP + 3;
      const a = p * Math.PI * 5;
      orbRef.current.position.set(Math.sin(a) * 0.16, H / 2 - p * H, Math.cos(a) * 0.16);
    }

    // per-panel focus: forward in Z + scale + opacity as it nears centre
    panelRefs.current.forEach((grp, i) => {
      const mesh = meshRefs.current[i];
      if (!grp || !mesh) return;
      const d = activeF - i;
      const f = easeSmooth(Math.max(0, 1 - Math.min(1, Math.abs(d))));
      grp.position.z = THREE.MathUtils.lerp(grp.position.z, -1.4 + f * 2.5, 0.15);
      const s = 0.82 + f * 0.26;
      grp.scale.setScalar(THREE.MathUtils.lerp(grp.scale.x, s, 0.15));
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.14 + f * 0.86;
      const cap = capRefs.current[i];
      if (cap) cap.style.opacity = String(Math.max(0, f * 1.15 - 0.15));
    });

    // subtle camera parallax
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.pointer.x * 0.4, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, state.pointer.y * 0.3, 0.05);
    camera.lookAt(0, 0, 0.4);
    void delta;
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#f0e4da" />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#fff2e9" />
      <spotLight position={[-4, 2, 3]} angle={0.7} penumbra={1} intensity={30} color="#e0b39f" distance={20} />

      {/* the luminous rose-gold strand — iridescent liquid glass */}
      <group ref={spineRef}>
        <mesh geometry={spineGeo}>
          <meshPhysicalMaterial
            color="#5a3b44"
            metalness={0.2}
            roughness={0.07}
            transmission={0.6}
            thickness={0.7}
            ior={1.46}
            attenuationColor={new THREE.Color("#c99a8a")}
            attenuationDistance={1.4}
            iridescence={1}
            iridescenceIOR={1.4}
            iridescenceThicknessRange={[200, 900]}
            clearcoat={1}
            clearcoatRoughness={0.06}
            specularIntensity={1}
            emissive={new THREE.Color("#c99a8a")}
            emissiveIntensity={0.32}
            envMapIntensity={1.9}
          />
        </mesh>
        <mesh ref={orbRef}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshBasicMaterial color="#fff2e9" toneMapped={false} />
        </mesh>
      </group>

      {/* threaded photo panels */}
      <group ref={rigRef}>
        {JOURNEY.map((j, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          // compact: caption tucked under a centred panel; wide: to the side
          const capPos: [number, number, number] = compact ? [0, -2.15, 0.3] : [-side * 2.35, 0, 0.3];
          const capClass = compact ? "rj3-cap rj3-cap--c" : `rj3-cap rj3-cap--${side < 0 ? "l" : "r"}`;
          return (
            <group
              key={j.index}
              ref={(el) => (panelRefs.current[i] = el)}
              position={[side * xOff, -i * Y_GAP, 0]}
              rotation={[0, -side * tilt, 0]}
            >
              <mesh ref={(el) => (meshRefs.current[i] = el)} geometry={geo}>
                <meshBasicMaterial map={textures[i]} transparent toneMapped={false} side={THREE.DoubleSide} />
              </mesh>
              {/* thin rose-gold border, tracing the curved edge only */}
              <lineLoop geometry={frameGeo}>
                <lineBasicMaterial color="#e8c3b2" transparent opacity={0.4} toneMapped={false} />
              </lineLoop>
              <Html
                position={capPos}
                center
                distanceFactor={7.5}
                zIndexRange={[20, 0]}
                pointerEvents="none"
                wrapperClass="rj3-html"
              >
                <div ref={(el) => (capRefs.current[i] = el)} className={capClass}>
                  <span className="rj3-cap-index">
                    {j.index} <em>/</em> {j.title}
                  </span>
                  <p className="rj3-cap-line">{j.line}</p>
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* in-scene environment for iridescence + reflections */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.4} color="#fff0e6" position={[0, 3, 3]} scale={[8, 3, 1]} />
        <Lightformer intensity={1.6} color="#c99a8a" position={[-4, 0, -2]} scale={[3, 8, 1]} />
        <Lightformer intensity={1.4} color="#e8c3b2" position={[4, 1, 2]} scale={[3, 5, 1]} />
        <Lightformer intensity={1} color="#4a6b5c" position={[0, -4, 2]} scale={[6, 2, 1]} />
      </Environment>

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.9} luminanceThreshold={0.5} luminanceSmoothing={0.4} mipmapBlur radius={0.72} />
        <Vignette eskil={false} offset={0.25} darkness={0.72} />
      </EffectComposer>
    </>
  );
}

export default function JourneySpine({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6.6], fov: 36 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene progressRef={progressRef} />
    </Canvas>
  );
}
