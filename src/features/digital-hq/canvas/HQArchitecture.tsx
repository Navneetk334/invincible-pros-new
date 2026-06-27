"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useAssemblyRegister } from "@core/assembly/use-assembly";

interface HQArchitectureProps {
  opacity?: number;
  transitionProgress?: number;
}

interface GlassTower {
  position: [number, number, number];
  args: [number, number, number];
  coreArgs: [number, number, number];
  isCylinder?: boolean;
}

interface BridgeBeam {
  position: [number, number, number];
  args: [number, number, number];
}

// Glass architectural towers and structural bridges config outside of render loop
const GLASS_TOWERS: GlassTower[] = [
  { position: [-2.5, 0.4, -2.5], args: [1.4, 3.6, 1.4], coreArgs: [0.35, 0.35, 3.4], isCylinder: true },
  { position: [2.5, 0.6, -1.0], args: [1.6, 3.0, 1.6], coreArgs: [0.5, 2.8, 0.5] },
  { position: [-1.0, 0.8, 2.0], args: [1.2, 2.4, 1.2], coreArgs: [0.25, 0.25, 2.2], isCylinder: true },
];

const BRIDGE_BEAMS: BridgeBeam[] = [
  { position: [0.0, 1.0, -2.5], args: [3.6, 0.05, 0.3] }, // Connecting Tower 1 horizontally
  { position: [0.75, 1.4, -1.0], args: [1.9, 0.05, 0.3] }, // Connecting Tower 2 horizontally
  { position: [-1.0, 0.5, -0.25], args: [0.3, 0.05, 3.1] }, // Connecting Tower 3 vertically
];

export default function HQArchitecture({
  opacity = 1.0,
}: HQArchitectureProps) {
  const architectureRef = useRef<THREE.Group>(null);

  // Memoize materials to prevent redundant recreation
  const { glassMaterial, graphiteMaterial } = useMemo(() => {
    return {
      glassMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.14 * opacity,
        roughness: 0.05,
        metalness: 0.1,
      }),
      graphiteMaterial: new THREE.MeshStandardMaterial({
        color: "#0a0a0c",
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: opacity,
      }),
    };
  }, [opacity]);

  // Register with Procedural Assembly System
  useAssemblyRegister({
    id: "hq-architecture-stage",
    ref: architectureRef,
    stage: "frame",
    animateIn: () => {
      const tl = gsap.timeline();
      if (!architectureRef.current) return tl;

      // Precision mechanical reveal
      architectureRef.current.children.forEach((child) => {
        if (child.name.startsWith("glass-tower-")) {
          const index = parseInt(child.name.split("-")[2]);
          const targetY = GLASS_TOWERS[index].position[1];
          
          tl.fromTo(
            child.position,
            { y: targetY - 3.5 },
            { y: targetY, duration: 1.4, ease: "power3.out" },
            0.0
          );
          
          // Animate scale profile
          tl.fromTo(
            child.scale,
            { x: 0.2, z: 0.2 },
            { x: 1.0, z: 1.0, duration: 1.2, ease: "power2.out" },
            0.1
          );
        }

        if (child.name.startsWith("bridge-beam-")) {
          tl.fromTo(
            child.scale,
            { x: 0, z: 0 },
            { x: 1, z: 1, duration: 0.8, ease: "power2.out" },
            0.4
          );
        }
      });
      return tl;
    },
    animateOut: () => {
      const tl = gsap.timeline();
      if (!architectureRef.current) return tl;

      architectureRef.current.children.forEach((child) => {
        if (child.name.startsWith("glass-tower-")) {
          const index = parseInt(child.name.split("-")[2]);
          const startY = GLASS_TOWERS[index].position[1] - 3.5;
          
          tl.to(
            child.position,
            { y: startY, duration: 1.0, ease: "power2.in" },
            0.2
          );
        }

        if (child.name.startsWith("bridge-beam-")) {
          tl.to(
            child.scale,
            { x: 0, z: 0, duration: 0.6, ease: "power2.in" },
            0.0
          );
        }
      });
      return tl;
    },
  });

  useFrame((state) => {
    if (architectureRef.current) {
      const time = state.clock.getElapsedTime();
      
      architectureRef.current.children.forEach((child) => {
        // 1. Apply vertical scale breathing to glass towers
        if (child.name.startsWith("glass-tower-")) {
          const index = parseInt(child.name.split("-")[2]);
          const scaleY = 1.0 + Math.sin(time * 0.4 + index) * 0.012;
          child.scale.y = scaleY;
        }
        
        // 2. Apply horizontal scale expansion to horizontal/vertical bridges (while keeping assembly transitions)
        if (child.name.startsWith("bridge-beam-") && child.scale.x > 0.01) {
          const scaleMultiplier = 1.0 + Math.sin(time * 0.5) * 0.015;
          const box = child as THREE.Mesh;
          const geom = box.geometry as THREE.BoxGeometry;
          if (geom.parameters.width > geom.parameters.depth) {
            child.scale.x = scaleMultiplier;
          } else {
            child.scale.z = scaleMultiplier;
          }
        }

        // 3. Pulse synchronize locking indicators at 4Hz
        if (child.name.startsWith("lock-light-")) {
          const index = parseInt(child.name.split("-")[2]);
          const lightMesh = child as THREE.Mesh;
          const mat = lightMesh.material as THREE.MeshBasicMaterial;
          mat.opacity = (0.2 + Math.sin(time * 6.0 + index) * 0.6) * opacity;
        }
      });
    }
  });

  return (
    <group ref={architectureRef} name="hq-architecture">
      {/* 1. Glass Towers & Metallic Cores */}
      {GLASS_TOWERS.map((tower, i) => {
        return (
          <group 
            key={`tower-${i}`} 
            position={[tower.position[0], tower.position[1], tower.position[2]]}
            name={`glass-tower-${i}`}
          >
            {/* Outer Glass Shell */}
            <mesh>
              {tower.isCylinder ? (
                <cylinderGeometry args={[tower.args[0] / 2, tower.args[0] / 2, tower.args[1], 32]} />
              ) : (
                <boxGeometry args={tower.args} />
              )}
              <primitive object={glassMaterial} attach="material" />
            </mesh>

            {/* Inner Structural Backbone */}
            <mesh position={[0, 0.05, 0]}>
              {tower.isCylinder ? (
                <cylinderGeometry args={[tower.coreArgs[0], tower.coreArgs[1], tower.coreArgs[2], 16]} />
              ) : (
                <boxGeometry args={tower.coreArgs} />
              )}
              <primitive object={graphiteMaterial} attach="material" />
            </mesh>
          </group>
        );
      })}

      {/* 2. Connecting Beams/Bridges */}
      {BRIDGE_BEAMS.map((beam, i) => {
        return (
          <mesh 
            key={`beam-${i}`} 
            position={[beam.position[0], beam.position[1], beam.position[2]]}
            name={`bridge-beam-${i}`}
          >
            <boxGeometry args={beam.args} />
            <primitive object={graphiteMaterial} attach="material" />
          </mesh>
        );
      })}

      {/* 3. Locking Indicators */}
      {BRIDGE_BEAMS.map((beam, i) => {
        return (
          <mesh 
            key={`light-${i}`} 
            position={[beam.position[0], beam.position[1] + 0.04, beam.position[2]]}
            name={`lock-light-${i}`}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
          </mesh>
        );
      })}
    </group>
  );
}
export { HQArchitecture };
