import { useEffect, useRef, useState } from "react";
import "./SoundToggle.css";

/**
 * Optional soft ambient-sound toggle. Rather than ship an audio file, we
 * synthesise a calm, breathing pad with the Web Audio API — two detuned
 * sine drones plus gently filtered noise, faded in/out. Off by default;
 * only ever plays on an explicit user gesture.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const build = () => {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Two detuned drones, a soft fifth apart, slowly beating.
    const voices = [110, 110.4, 164.8].map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.05 : 0.09;
      // slow tremolo
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(g).connect(master);
      osc.start();
      lfo.start();
      return [osc, lfo] as AudioNode[];
    });

    // Airy filtered noise — the "room".
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 600;
    bp.Q.value = 0.7;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.015;
    noise.connect(bp).connect(noiseGain).connect(master);
    noise.start();

    ctxRef.current = ctx;
    masterRef.current = master;
    nodesRef.current = [...voices.flat(), noise];
  };

  const toggle = () => {
    if (!ctxRef.current) build();
    const ctx = ctxRef.current!;
    const master = masterRef.current!;
    if (ctx.state === "suspended") ctx.resume();

    const next = !on;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(next ? 0.5 : 0, now + (next ? 1.6 : 0.9));
    setOn(next);
  };

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return (
    <button
      type="button"
      className={`sound-toggle ${on ? "is-on" : ""}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      title={on ? "Mute ambient sound" : "Play ambient sound"}
    >
      <span className="sound-toggle__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}
