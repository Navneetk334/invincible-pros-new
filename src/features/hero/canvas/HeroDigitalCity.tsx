"use client";

import { useMemo } from "react";

interface HeroDigitalCityProps {
  gridSize?: number;
  spacing?: number;
  maxHeight?: number;
  opacity?: number;
}

interface Block {
  position: [number, number, number];
  args: [number, number, number];
}

// Generate static city blocks outside of the render function to preserve purity
function generateCityBlocks(gridSize: number, spacing: number, maxHeight: number): Block[] {
  const arr: Block[] = [];
  const offset = ((gridSize - 1) * spacing) / 2;

  // Deterministic seed generator for purity checks
  let seed = 12345;
  const pseudoRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const posX = x * spacing - offset;
      const posZ = z * spacing - offset;
      
      // Skip core origin to let AI Core stand out in focus
      if (Math.abs(posX) < 1.2 && Math.abs(posZ) < 1.2) continue;

      const h = 0.4 + pseudoRandom() * maxHeight;
      arr.push({
        position: [posX, h / 2 - 2, posZ],
        args: [0.7, h, 0.7],
      });
    }
  }
  return arr;
}

export default function HeroDigitalCity({
  gridSize = 5,
  spacing = 2.5,
  maxHeight = 2.5,
  opacity = 1,
}: HeroDigitalCityProps) {
  const blocks = useMemo(() => {
    return generateCityBlocks(gridSize, spacing, maxHeight);
  }, [gridSize, spacing, maxHeight]);

  return (
    <group name="hero-digital-city">
      {blocks.map((block, i) => (
        <mesh key={i} position={block.position}>
          <boxGeometry args={block.args} />
          <meshStandardMaterial
            color="#18181b"
            wireframe
            roughness={0.9}
            metalness={0.1}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
      <gridHelper args={[20, 20, "#161616", "#111111"]} position={[0, -2, 0]} />
    </group>
  );
}
