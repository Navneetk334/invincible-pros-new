"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useWorldStore } from "../use-world-store";
import { WorldId } from "../world-registry";
import { useAssemblyRegister } from "../../assembly/use-assembly";
import { useAudioStore, synth } from "../../audio/use-audio-store";
import { useInteractiveObject } from "../../interaction/use-interaction";

const VERTEX_COUNT = 1020;

// Deterministic random generator for pure state allocations
function createRandom(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

// 11 Shape coordinate buffer generators
const SHAPE_GENERATORS: Record<WorldId, (count: number) => Float32Array> = {
  loading: (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(1111);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx] = (rand() - 0.5) * 0.05;
      arr[idx + 1] = (rand() - 0.5) * 0.05;
      arr[idx + 2] = (rand() - 0.5) * 0.05;
    }
    return arr;
  },
  hero: (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(2222);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 0.8;
      arr[idx] = r * Math.sin(phi) * Math.cos(theta);
      arr[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[idx + 2] = r * Math.cos(phi);
    }
    return arr;
  },
  "digital-hq": (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(3333);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Cube outlines
      const edge = rand() > 0.5 ? 0.75 : -0.75;
      arr[idx] = rand() > 0.5 ? edge : (rand() - 0.5) * 1.5;
      arr[idx + 1] = rand() > 0.5 ? (rand() - 0.5) * 1.5 : edge;
      arr[idx + 2] = rand() > 0.5 ? edge : (rand() - 0.5) * 1.5;
    }
    return arr;
  },
  "web-dev": (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(4444);
    const lines = 10;
    const pointsPerLine = count / lines;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const lineIdx = Math.floor(i / pointsPerLine);
      const ptIdx = i % pointsPerLine;
      
      arr[idx] = (ptIdx / pointsPerLine - 0.5) * 2.0 + (rand() - 0.5) * 0.05;
      arr[idx + 1] = (lineIdx / lines - 0.5) * 1.5 + (rand() - 0.5) * 0.02;
      arr[idx + 2] = (rand() - 0.5) * 0.1;
    }
    return arr;
  },
  "mobile-app": (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(5555);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const theta = rand() * Math.PI * 2;
      const h = (rand() - 0.5) * 1.6;
      const r = 0.6;
      arr[idx] = r * Math.cos(theta);
      arr[idx + 1] = h;
      arr[idx + 2] = r * Math.sin(theta);
    }
    return arr;
  },
  ai: (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(6666);
    const nodes = [
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(-0.8, 0, 0),
      new THREE.Vector3(0.8, 0, 0),
      new THREE.Vector3(-0.4, -0.8, -0.4),
      new THREE.Vector3(0.4, -0.8, 0.4),
    ];
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const startNode = nodes[Math.floor(rand() * nodes.length)];
      const endNode = nodes[Math.floor(rand() * nodes.length)];
      const t = rand();
      const pos = new THREE.Vector3().lerpVectors(startNode, endNode, t);
      arr[idx] = pos.x + (rand() - 0.5) * 0.08;
      arr[idx + 1] = pos.y + (rand() - 0.5) * 0.08;
      arr[idx + 2] = pos.z + (rand() - 0.5) * 0.08;
    }
    return arr;
  },
  "cloud-infra": (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(7777);
    const centers = [
      new THREE.Vector3(0.7, 0.4, 0),
      new THREE.Vector3(-0.7, -0.4, 0.5),
      new THREE.Vector3(0, 0.6, -0.7),
    ];
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const center = centers[i % centers.length];
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 0.25;
      arr[idx] = center.x + r * Math.sin(phi) * Math.cos(theta);
      arr[idx + 1] = center.y + r * Math.sin(phi) * Math.sin(theta);
      arr[idx + 2] = center.z + r * Math.cos(phi);
    }
    return arr;
  },
  crm: (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(8888);
    const rings = 3;
    const pointsPerRing = count / rings;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const ringIdx = Math.floor(i / pointsPerRing);
      const radius = 0.4 * (ringIdx + 1);
      const theta = rand() * Math.PI * 2;
      arr[idx] = radius * Math.cos(theta);
      arr[idx + 1] = (rand() - 0.5) * 0.05;
      arr[idx + 2] = radius * Math.sin(theta);
    }
    return arr;
  },
  "cyber-sec": (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(9999);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const theta = rand() * Math.PI * 2;
      const phi = rand() * (Math.PI / 2); // Hemisphere dome
      const r = 1.3;
      arr[idx] = r * Math.sin(phi) * Math.cos(theta);
      arr[idx + 1] = r * Math.cos(phi);
      arr[idx + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  },
  "it-infra": (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(1212);
    const backbones = 3;
    const pointsPerBackbone = count / backbones;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const lineIdx = Math.floor(i / pointsPerBackbone);
      const px = (lineIdx - 1) * 0.6;
      arr[idx] = px + (rand() - 0.5) * 0.05;
      arr[idx + 1] = (rand() - 0.5) * 1.8;
      arr[idx + 2] = (rand() - 0.5) * 0.1;
    }
    return arr;
  },
  contact: (count) => {
    const arr = new Float32Array(count * 3);
    const rand = createRandom(3434);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Torus knot path
      const t = (i / count) * Math.PI * 2 * 3;
      const r = 0.8 + 0.25 * Math.cos(3 * t);
      arr[idx] = r * Math.cos(2 * t);
      arr[idx + 1] = r * Math.sin(2 * t);
      arr[idx + 2] = 0.25 * Math.sin(3 * t) + (rand() - 0.5) * 0.05;
    }
    return arr;
  },
};

// Global single-instance uniforms for AI Core morph shaders
const SHAPE_UNIFORMS = {
  uTime: { value: 0 },
  uTransition: { value: 0.0 },
  uColor: { value: new THREE.Color("#ffffff") },
  uPulseSpeed: { value: 1.0 },
};

export default function SharedAICore() {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const activeWorldId = useWorldStore((state) => state.activeWorldId);
  const aiCoreConfig = useWorldStore((state) => state.aiCoreConfig);
  const unlocked = useAudioStore((state) => state.unlocked);

  // Register AI Core with the Procedural Assembly System
  useAssemblyRegister({
    id: "shared-ai-core-assembly",
    ref: pointsRef,
    stage: "mechanical",
    animateIn: () => {
      if (!pointsRef.current) return;
      return gsap.fromTo(
        pointsRef.current.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: aiCoreConfig.scale,
          y: aiCoreConfig.scale,
          z: aiCoreConfig.scale,
          duration: 1.0,
          ease: "back.out(1.5)",
        }
      );
    },
    animateOut: () => {
      if (!pointsRef.current) return;
      return gsap.to(
        pointsRef.current.scale,
        { x: 0, y: 0, z: 0, duration: 0.6, ease: "power2.in" }
      );
    },
  });

  // Trigger procedural AI Core audio pulses periodically
  useEffect(() => {
    if (!unlocked || !synth) return;
    
    // Play immediately and then repeat at 3s intervals
    synth.playPulse();
    const interval = setInterval(() => {
      synth?.playPulse();
    }, 3000);

    return () => clearInterval(interval);
  }, [unlocked]);

  const { handlers } = useInteractiveObject({
    id: "shared-ai-core",
    tooltip: "Inspect cognitive neural core",
    cameraPosition: [0, 2.3, 1.2],
    cameraTarget: [0, 2.0, -1.0],
    cameraFov: 35,
  }, pointsRef);

  // Pre-calculate shape vertex buffers once
  const shapeBuffers = useMemo(() => {
    const map = {} as Record<WorldId, Float32Array>;
    const keys = Object.keys(SHAPE_GENERATORS) as WorldId[];
    keys.forEach((key) => {
      map[key] = SHAPE_GENERATORS[key](VERTEX_COUNT);
    });
    return map;
  }, []);

  const uniforms = SHAPE_UNIFORMS;

  // Setup initial geometries
  const { initialPosition, initialTarget } = useMemo(() => {
    const pos = shapeBuffers.loading.slice();
    const target = shapeBuffers.loading.slice();
    return { initialPosition: pos, initialTarget: target };
  }, [shapeBuffers]);

  useEffect(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    // Grab target layout from map
    const targetBuffer = shapeBuffers[activeWorldId];
    if (!targetBuffer) return;

    // Interrupt active transition cleanly by copying current lerped vertices to base
    const baseAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const targetAttr = geometry.getAttribute("aTargetPosition") as THREE.BufferAttribute;

    if (baseAttr && targetAttr) {
      const currentPos = new Float32Array(VERTEX_COUNT * 3);
      const baseArr = baseAttr.array as Float32Array;
      const targetArr = targetAttr.array as Float32Array;
      const t = uniforms.uTransition.value;

      // Extract current interpolated vertices
      for (let i = 0; i < VERTEX_COUNT * 3; i++) {
        currentPos[i] = baseArr[i] + (targetArr[i] - baseArr[i]) * t;
      }

      baseAttr.set(currentPos);
      baseAttr.needsUpdate = true;
    }

    // Set new morph target buffer
    const targetAttribute = new THREE.BufferAttribute(targetBuffer.slice(), 3);
    geometry.setAttribute("aTargetPosition", targetAttribute);

    // Reset uniform transition index and play GSAP morph tween
    uniforms.uTransition.value = 0.0;
    const anim = gsap.to(uniforms.uTransition, {
      value: 1.0,
      duration: 1.6,
      ease: "power3.inOut",
    });

    return () => {
      anim.kill();
    };
  }, [activeWorldId, shapeBuffers, uniforms]);

  // Update uniforms and positions in R3F render loop
  useFrame((state) => {
    if (!pointsRef.current || !materialRef.current) return;

    // Set visibility state
    pointsRef.current.visible = aiCoreConfig.visible;
    if (!aiCoreConfig.visible) return;

    const time = state.clock.getElapsedTime();
    
    // Lerp color dynamically
    const targetColor = new THREE.Color(aiCoreConfig.color);
    materialRef.current.uniforms.uColor.value.lerp(targetColor, 0.05);

    // Lerp position offsets
    const [px, py, pz] = aiCoreConfig.position;
    const targetPos = new THREE.Vector3(px, py, pz);
    pointsRef.current.position.lerp(targetPos, 0.06);

    // Lerp scale
    const targetScale = new THREE.Vector3(
      aiCoreConfig.scale,
      aiCoreConfig.scale,
      aiCoreConfig.scale
    );
    pointsRef.current.scale.lerp(targetScale, 0.06);

    // Update material time and pulse speed uniforms
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uPulseSpeed.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uPulseSpeed.value,
      aiCoreConfig.pulseSpeed,
      0.05
    );
  });

  return (
    <points ref={pointsRef} name="shared-ai-core" {...handlers}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPosition, 3]}
        />
        <bufferAttribute
          attach="attributes-aTargetPosition"
          args={[initialTarget, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uTransition;
          uniform float uPulseSpeed;
          
          attribute vec3 aTargetPosition;
          
          varying vec3 vPosition;

          void main() {
            // Smoothly morph vertex coordinates on GPU
            vec3 mixedPos = mix(position, aTargetPosition, uTransition);
            
            // Subtle noise wiggle wave
            float wiggle = sin(mixedPos.x * 5.0 + uTime * 2.2) * cos(mixedPos.y * 5.0 + uTime * 1.8) * 0.06 * uPulseSpeed;
            mixedPos += normalize(mixedPos + vec3(0.01)) * wiggle;
            
            vPosition = mixedPos;
            
            vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // High-precision particle point size setting
            gl_PointSize = 32.0 / -mvPosition.z;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying vec3 vPosition;

          void main() {
            // Soft glowing disc mask
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = smoothstep(0.5, 0.15, dist) * 0.95;
            
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
export { SharedAICore };
