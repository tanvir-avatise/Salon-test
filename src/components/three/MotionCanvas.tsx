import { Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { asset } from "../../lib/asset";

/**
 * The "In motion" moment as a genuinely moving image: a full-bleed shader that
 * takes our hair still and brings it to life — a slow cinematic push-in driven
 * by scroll, a flowing shimmer, and two bands of light that travel down the
 * strands. No video file ships; it's a single fullscreen fragment pass, so it
 * stays cheap while reading as living footage rather than a placeholder still.
 */
// ScreenQuad's fullscreen-triangle geometry has no uv attribute, so derive the
// screen uv straight from the clip-space position.
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uRes;
  uniform vec2 uImg;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    float ra = uRes.x / uRes.y;
    float ia = uImg.x / uImg.y;
    vec2 s = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    // slow cinematic push-in as the section scrubs + a gentle continuous pan
    float zoom = 1.16 - uScroll * 0.16;
    uv = (uv - 0.5) * zoom + 0.5;
    uv.y += (uScroll - 0.5) * 0.05 - uTime * 0.004;

    vec2 c = coverUv(uv);
    // flowing shimmer — the strands breathe and drift
    float flow = sin(c.y * 16.0 + uTime * 0.7) * 0.0022
               + sin(c.y * 6.0 - uTime * 0.45) * 0.0030;
    c.x += flow;

    vec3 col = texture2D(uTex, clamp(c, 0.001, 0.999)).rgb;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));

    // two bands of light travelling down the hair
    float s1 = smoothstep(0.10, 0.0, abs(fract(c.y * 1.2 - uTime * 0.10) - 0.5));
    float s2 = smoothstep(0.06, 0.0, abs(fract(c.y * 2.3 - uTime * 0.16 + 0.3) - 0.5));
    float streak = (s1 * 0.7 + s2 * 0.5) * smoothstep(0.25, 0.78, lum);
    col += streak * vec3(0.55, 0.36, 0.26);

    // soft breathing + warm grade + vignette
    col *= 0.9 + 0.1 * sin(uTime * 0.5);
    col = mix(col, col * vec3(1.06, 0.96, 0.94), 0.6);
    float d = distance(vUv, vec2(0.5));
    col *= smoothstep(1.05, 0.35, d);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Quad({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const tex = useTexture(asset("images/hero-hair.jpg"));
  const { size } = useThree();
  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return {
      uTex: { value: tex },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: {
        value: new THREE.Vector2(tex.image?.width || 1103, tex.image?.height || 1380),
      },
    };
  }, [tex]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uScroll.value = THREE.MathUtils.lerp(
      uniforms.uScroll.value,
      progressRef.current,
      0.1
    );
    uniforms.uRes.value.set(size.width, size.height);
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  );
}

export default function MotionCanvas({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Quad progressRef={progressRef} />
      </Suspense>
    </Canvas>
  );
}
