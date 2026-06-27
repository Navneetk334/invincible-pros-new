"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useWorldStore } from "../use-world-store";
import { useExperienceStore } from "@store/use-experience-store";

// Generate positions outside of render loop to preserve component purity
function generateParticlePositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  let seed = 98765;
  const pseudoRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    arr[idx] = (pseudoRandom() - 0.5) * 15;
    arr[idx + 1] = (pseudoRandom() - 0.5) * 15;
    arr[idx + 2] = (pseudoRandom() - 0.5) * 15;
  }
  return arr;
}

export default function SharedParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const particlesConfig = useWorldStore((state) => state.particlesConfig);
  const scrollProgress = useExperienceStore((state) => state.scrollProgress);

  const count = 300;
  const positions = useMemo(() => generateParticlePositions(count), [count]);

  useFrame((state) => {
    if (!pointsRef.current || !materialRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow ambient rotation offset
    pointsRef.current.rotation.y = time * 0.01 * particlesConfig.speed;
    
    // Parallax translation driven by scroll
    pointsRef.current.position.y = -scrollProgress * 2.5;

    // Apply continuous dynamic wind/airflow drift to individual coordinates
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    if (posAttr) {
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const py = arr[idx + 1];
        
        // Simulates aerodynamic drift (wind noise)
        const windX = Math.sin(time * 0.2 + py * 0.4) * 0.003 * particlesConfig.speed;
        const windZ = Math.cos(time * 0.15 + py * 0.3) * 0.002 * particlesConfig.speed;
        
        arr[idx] += windX;
        arr[idx + 2] += windZ;

        // Bound constraints wrapping to contain point cloud within -7.5 to 7.5 box
        if (Math.abs(arr[idx]) > 7.5) {
          arr[idx] = -Math.sign(arr[idx]) * 7.5;
        }
        if (Math.abs(arr[idx + 2]) > 7.5) {
          arr[idx + 2] = -Math.sign(arr[idx + 2]) * 7.5;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Smoothly interpolate configuration values
    const targetColor = new THREE.Color(particlesConfig.color);
    materialRef.current.color.lerp(targetColor, 0.05);

    const targetOpacity = particlesConfig.opacity ?? 0.3;
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      targetOpacity,
      0.05
    );
  });

  return (
    <points ref={pointsRef} name="shared-particles-cluster">
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color="#ffffff"
        size={0.045}
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </points>
  );
}
export { SharedParticles };
