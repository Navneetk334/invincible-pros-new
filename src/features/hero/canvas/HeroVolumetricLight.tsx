"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface VolumetricLightProps {
  opacity?: number;
}

// Global uniforms for volumetric light beam to satisfy compiler rules
const LIGHT_UNIFORMS = {
  uColor: { value: new THREE.Color("#e8e8e8") },
  uOpacity: { value: 1.0 },
};

export default function HeroVolumetricLight({ opacity = 1 }: VolumetricLightProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
      // Lerp active transition opacity in uniforms
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value,
        opacity,
        0.05
      );
    }
  });

  return (
    <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0]} name="hero-volumetric-beam">
      {/* Tall cylinder representing light shaft */}
      <cylinderGeometry args={[0.8, 1.6, 5.0, 32, 1, true]} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={LIGHT_UNIFORMS}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;

          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          uniform vec3 uColor;
          uniform float uOpacity;

          void main() {
            // Smooth vertical fade to 0 at the cylinder top and bottom caps
            float verticalFade = sin(vUv.y * 3.1415926);
            
            // Rim light falloff based on normals to fade out column sides
            float rimFade = 1.0 - abs(vNormal.z);
            
            float alpha = verticalFade * rimFade * 0.15 * uOpacity;
            
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
export { HeroVolumetricLight };
