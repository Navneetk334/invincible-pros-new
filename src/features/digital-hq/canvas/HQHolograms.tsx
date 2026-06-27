"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface HQHologramsProps {
  opacity?: number;
}

interface TelemetryPanel {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
}

const PANELS: TelemetryPanel[] = [
  { position: [-2.5, 2.3, -2.4], rotation: [0, Math.PI / 4, 0], size: [1.0, 0.6] },
  { position: [2.5, 2.2, -0.9], rotation: [0, -Math.PI / 6, 0], size: [0.8, 0.5] },
  { position: [-1.0, 2.1, 2.1], rotation: [0, Math.PI / 2, 0], size: [0.7, 0.4] },
];

export default function HQHolograms({ opacity = 1.0 }: HQHologramsProps) {
  const hologramsRef = useRef<THREE.Group>(null);

  // Pre-generate plane geometries for edge helper outlines
  const panelGeometries = useMemo(() => {
    return PANELS.map((p) => new THREE.PlaneGeometry(p.size[0], p.size[1]));
  }, []);

  useFrame((state) => {
    if (hologramsRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Floating wave rotation on panel interfaces
      hologramsRef.current.position.y = Math.sin(time * 1.2) * 0.04;
      
      // Auto-align (billboard) panels to face the camera directly
      hologramsRef.current.children.forEach((child) => {
        if (child instanceof THREE.Group && child.name !== "ground-grids") {
          child.quaternion.copy(state.camera.quaternion);
        }
      });

      // Subtle pulse opacity loop on lines
      hologramsRef.current.traverse((child) => {
        if (child instanceof THREE.LineSegments) {
          const mat = child.material as THREE.LineBasicMaterial;
          mat.opacity = (0.2 + Math.sin(time * 3.0 + child.position.x) * 0.05) * opacity;
        }
      });
    }
  });

  return (
    <group ref={hologramsRef} name="hq-holograms">
      {PANELS.map((panel, i) => {
        const geom = panelGeometries[i];
        
        return (
          <group key={`panel-${i}`} position={panel.position} rotation={panel.rotation}>
            {/* 1. Transparent Panel Fill */}
            <mesh>
              <planeGeometry args={panel.size} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.03 * opacity}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* 2. Sharp HUD Wireframe Grid */}
            <mesh position={[0, 0, 0.001]}>
              <planeGeometry args={panel.size} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.05 * opacity}
                wireframe
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* 3. Telemetry Edges */}
            <lineSegments position={[0, 0, 0.002]}>
              <edgesGeometry args={[geom]} />
              <lineBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.2 * opacity}
                side={THREE.DoubleSide}
              />
            </lineSegments>
          </group>
        );
      })}

      {/* Ground flat target rings */}
      <group name="ground-grids">
        <mesh position={[0, -2.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 2.82, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08 * opacity} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -2.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.2, 4.22, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.04 * opacity} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
export { HQHolograms };
