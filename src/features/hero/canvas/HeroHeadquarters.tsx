"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface HeroHeadquartersProps {
  transitionProgress?: number;
  opacity?: number;
}

interface HQBlock {
  position: [number, number, number];
  args: [number, number, number];
  isGlass?: boolean;
}

// Architectural blocks and plates configuration outside of render loop
const HQ_BLOCKS: HQBlock[] = [
  // Base columns (dark graphite)
  { position: [-2.5, -1.2, -2.0], args: [0.8, 2.5, 0.8] },
  { position: [2.5, -1.5, -2.5], args: [1.0, 2.0, 1.0] },
  { position: [-3.0, -1.8, 2.0], args: [0.7, 1.6, 0.7] },
  { position: [3.2, -2.0, 1.5], args: [0.6, 1.2, 0.6] },
  
  // Foundation grids
  { position: [0, -2.4, 0], args: [9.0, 0.15, 9.0] },

  // Floating platforms (glass)
  { position: [-2.5, 0.6, -2.0], args: [1.6, 0.08, 1.6], isGlass: true },
  { position: [2.5, 0.3, -2.5], args: [1.8, 0.08, 1.8], isGlass: true },
  
  // Holographic vertical panes (glass)
  { position: [-1.2, -0.1, -1.2], args: [0.03, 1.6, 1.4], isGlass: true },
  { position: [1.2, -0.3, 1.2], args: [1.4, 1.4, 0.03], isGlass: true },
  { position: [0, 1.6, -2.0], args: [2.8, 0.05, 1.6], isGlass: true },
];

export default function HeroHeadquarters({
  transitionProgress = 1.0,
  opacity = 1.0,
}: HeroHeadquartersProps) {
  const glassGroupRef = useRef<THREE.Group>(null);

  // Group blocks by type
  const { graphiteBlocks, glassBlocks } = useMemo(() => {
    const graphite = HQ_BLOCKS.filter((b) => !b.isGlass);
    const glass = HQ_BLOCKS.filter((b) => b.isGlass);
    return { graphiteBlocks: graphite, glassBlocks: glass };
  }, []);

  useFrame((state) => {
    if (glassGroupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Floating sinusoidal motion loop
      glassGroupRef.current.position.y = Math.sin(time * 0.8) * 0.06;
      glassGroupRef.current.rotation.y = Math.cos(time * 0.4) * 0.01;
    }
  });

  return (
    <group name="hero-headquarters-architecture">
      {/* 1. Assembling Dark Graphite Columns */}
      {graphiteBlocks.map((block, i) => {
        // Translate vertically from y-offset to final layout coordinate
        const startY = block.position[1] - 4.5;
        const currentY = THREE.MathUtils.lerp(startY, block.position[1], transitionProgress);

        return (
          <mesh key={`graphite-${i}`} position={[block.position[0], currentY, block.position[2]]}>
            <boxGeometry args={block.args} />
            <meshStandardMaterial
              color="#0c0c0e"
              roughness={0.15}
              metalness={0.85}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}

      {/* 2. Floating Translucent Glass/Holographic Systems */}
      <group ref={glassGroupRef}>
        {glassBlocks.map((block, i) => {
          // Adjust vertical position on mount
          const startY = block.position[1] - 2.5;
          const currentY = THREE.MathUtils.lerp(startY, block.position[1], transitionProgress);

          return (
            <mesh key={`glass-${i}`} position={[block.position[0], currentY, block.position[2]]}>
              <boxGeometry args={block.args} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.05}
                metalness={0.1}
                transparent
                opacity={0.15 * opacity}
              />
            </mesh>
          );
        })}
      </group>

      {/* Ground reference helper grid */}
      <gridHelper args={[24, 24, "#161618", "#0b0b0c"]} position={[0, -2.4, 0]} />
    </group>
  );
}
export { HeroHeadquarters };
