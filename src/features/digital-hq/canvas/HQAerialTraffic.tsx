"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { PositionalSynthNode } from "../../../core/audio/EnvironmentalAudio";

interface HQAerialTrafficProps {
  opacity?: number;
}

// 3 Predefined closed spline paths for AI drones outside of component scope
const DRONE_PATHS = [
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, 1.8, -1.8),
    new THREE.Vector3(0.0, 2.2, -2.4),
    new THREE.Vector3(3.2, 1.8, -1.8),
    new THREE.Vector3(0.0, 1.4, -1.2),
  ], true, "centripetal"),
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.5, 1.6, 0.5),
    new THREE.Vector3(0.8, 1.9, 1.5),
    new THREE.Vector3(-1.0, 1.4, 0.0),
    new THREE.Vector3(0.8, 1.7, -1.5),
  ], true, "centripetal"),
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.2, 0.8, 1.8),
    new THREE.Vector3(0.0, 1.3, 0.0),
    new THREE.Vector3(2.2, 1.8, -1.8),
    new THREE.Vector3(0.0, 1.2, 1.0),
  ], true, "centripetal"),
];

export default function HQAerialTraffic({ opacity = 1.0 }: HQAerialTrafficProps) {
  const drone1Ref = useRef<THREE.Group>(null);
  const drone2Ref = useRef<THREE.Group>(null);
  const drone3Ref = useRef<THREE.Group>(null);

  // Array of refs to make index loops simple and type-safe
  const droneRefs = useMemo(() => [drone1Ref, drone2Ref, drone3Ref], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Evaluate base position and orientation along closed spline tracks
    const speeds = [0.035, 0.05, 0.028];
    const offsets = [0.0, 0.35, 0.7]; // Start progress offsets

    const basePositions = droneRefs.map((ref, i) => {
      const progress = (time * speeds[i] + offsets[i]) % 1.0;
      const basePos = DRONE_PATHS[i].getPointAt(progress);
      
      // Face direction of travel by looking at a coordinate slightly ahead on spline
      const lookProgress = (progress + 0.004) % 1.0;
      const lookTarget = DRONE_PATHS[i].getPointAt(lookProgress);
      
      if (ref.current) {
        ref.current.lookAt(lookTarget);
      }
      
      return basePos;
    });

    // 2. Perform pairwise collision avoidance (Boids-style lateral swerving)
    for (let i = 0; i < basePositions.length; i++) {
      for (let j = i + 1; j < basePositions.length; j++) {
        const posA = basePositions[i];
        const posB = basePositions[j];
        const dist = posA.distanceTo(posB);
        const safetyRadius = 0.8;

        if (dist < safetyRadius) {
          // Calculate push force direction
          const pushForce = (safetyRadius - dist) * 0.4;
          const pushVector = new THREE.Vector3().subVectors(posA, posB).normalize();
          
          // Displace base positions outward
          posA.addScaledVector(pushVector, pushForce);
          posB.addScaledVector(pushVector, -pushForce);
        }
      }
    }

    // 3. Write final positions to meshes and overlay organic high-frequency hover wiggles
    droneRefs.forEach((ref, i) => {
      if (ref.current) {
        const finalPos = basePositions[i];
        
        // Sinusoidal wiggles relative to local space
        const hoverX = Math.sin(time * 2.5 + i) * 0.03;
        const hoverY = Math.cos(time * 2.0 + i) * 0.04;
        const hoverZ = Math.sin(time * 1.8 + i) * 0.03;
        
        ref.current.position.set(
          finalPos.x + hoverX,
          finalPos.y + hoverY,
          finalPos.z + hoverZ
        );
      }
    });
  });

  return (
    <group name="hq-aerial-drones">
      {/* Drone 1: Scanning Sweeper */}
      <group ref={drone1Ref}>
        <mesh>
          <coneGeometry args={[0.08, 0.2, 4]} />
          <meshStandardMaterial color="#0b0b0d" roughness={0.1} metalness={0.9} transparent opacity={opacity} />
        </mesh>
        {/* Glow status LED */}
        <mesh position={[0, -0.06, 0.08]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8 * opacity} />
        </mesh>
        <PositionalSynthNode frequency={196.0} type="triangle" gain={0.012} />
      </group>

      {/* Drone 2: Orbital Sentinel */}
      <group ref={drone2Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 6]} />
          <meshStandardMaterial color="#0b0b0d" roughness={0.1} metalness={0.9} transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9 * opacity} />
        </mesh>
        <PositionalSynthNode frequency={220.0} type="triangle" gain={0.01} />
      </group>

      {/* Drone 3: Diagonal Courier */}
      <group ref={drone3Ref}>
        <mesh>
          <boxGeometry args={[0.12, 0.04, 0.12]} />
          <meshStandardMaterial color="#0b0b0d" roughness={0.1} metalness={0.9} transparent opacity={opacity} />
        </mesh>
        {/* Wing status indicators */}
        <mesh position={[-0.06, 0, 0]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7 * opacity} />
        </mesh>
        <mesh position={[0.06, 0, 0]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7 * opacity} />
        </mesh>
        <PositionalSynthNode frequency={164.81} type="triangle" gain={0.015} />
      </group>
    </group>
  );
}
export { HQAerialTraffic };
