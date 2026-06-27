"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useAudioStore, synth } from "./use-audio-store";

// Reusable spatial synth node mapping Web Audio oscillators into Three's positional nodes
export function PositionalSynthNode({
  frequency,
  type = "sine",
  gain = 0.05,
  refDistance = 1.0,
  maxDistance = 8.0,
}: {
  frequency: number;
  type?: "sine" | "triangle" | "sawtooth" | "square";
  gain?: number;
  refDistance?: number;
  maxDistance?: number;
}) {
  const pAudioRef = useRef<THREE.PositionalAudio>(null);
  const unlocked = useAudioStore((state) => state.unlocked);
  const oscRef = useRef<OscillatorNode | null>(null);
  const { camera } = useThree();

  // Find camera's single AudioListener
  const listener = useMemo(() => {
    return camera.children.find((c) => c instanceof THREE.AudioListener) as
      | THREE.AudioListener
      | undefined;
  }, [camera]);

  useEffect(() => {
    if (!unlocked || !pAudioRef.current || !listener || !synth || !synth.ctx) {
      return;
    }

    const ctx = synth.ctx;
    const pAudio = pAudioRef.current;

    // Connect to camera listener
    pAudio.setRefDistance(refDistance);
    pAudio.setMaxDistance(maxDistance);
    pAudio.setRolloffFactor(2.0);

    // Create local oscillator and gain nodes
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gainNode.gain.value = gain;

    // Connect: Osc -> Gain -> Three.js Positional Destination
    osc.connect(gainNode);
    gainNode.connect(pAudio.gain);

    osc.start();
    oscRef.current = osc;

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch {
          // Prevent double stop exceptions
        }
      }
    };
  }, [unlocked, listener, frequency, type, gain, refDistance, maxDistance]);

  return <positionalAudio ref={pAudioRef} args={[listener || new THREE.AudioListener()]} />;
}

export default function EnvironmentalAudio() {
  const { camera } = useThree();
  const unlocked = useAudioStore((state) => state.unlocked);

  // Instantiate and mount THREE.AudioListener to viewport camera
  const listener = useMemo(() => new THREE.AudioListener(), []);

  useEffect(() => {
    camera.add(listener);
    return () => {
      camera.remove(listener);
    };
  }, [camera, listener]);

  // Adjust master hum & wind volumes slowly based on camera distance (dampens when far)
  useFrame(() => {
    if (!unlocked || !synth || !synth.ctx) return;
    
    const dist = camera.position.length();
    const dampFactor = THREE.MathUtils.clamp(8.0 / dist, 0.25, 1.0);

    if (synth.humGain) {
      synth.humGain.gain.value = THREE.MathUtils.lerp(
        synth.humGain.gain.value,
        0.05 * dampFactor,
        0.05
      );
    }
    if (synth.windGain) {
      synth.windGain.gain.value = THREE.MathUtils.lerp(
        synth.windGain.gain.value,
        0.025 * dampFactor,
        0.05
      );
    }
  });

  return null;
}
export { EnvironmentalAudio };
