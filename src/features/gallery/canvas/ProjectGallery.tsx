"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import { useAssemblyRegister } from "@core/assembly/use-assembly";
import { useInteractiveObject } from "@core/interaction/use-interaction";
import projectsData from "../projects-data.json";

interface GalleryProps {
  opacity?: number;
}

interface ProjectConfig {
  id: string;
  title: string;
  subtitle: string;
  tech: string[];
  timeline: string;
  shape: string;
  position: [number, number, number];
}

// Seeded deterministic random coordinate generator for purity compliance
function createRandom(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

export function ProjectNode({
  project,
  scale = 1.0,
  opacity = 1.0,
}: {
  project: ProjectConfig;
  scale?: number;
  opacity?: number;
}) {
  const nodeRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);

  const { borderMaterial, glassMaterial, gridMaterial } = useMemo(() => {
    return {
      borderMaterial: new THREE.MeshStandardMaterial({
        color: "#16161a",
        roughness: 0.2,
        metalness: 0.9,
        transparent: true,
        opacity: 0.6 * opacity,
      }),
      glassMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.05,
        transparent: true,
        opacity: 0.15 * opacity,
      }),
      gridMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.08 * opacity,
        wireframe: true,
      }),
    };
  }, [opacity]);

  // Assembly Register
  useAssemblyRegister({
    id: project.id,
    ref: nodeRef,
    stage: "glass",
    animateIn: () => {
      if (!nodeRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        nodeRef.current.position,
        { y: project.position[1] - 3 },
        { y: project.position[1], duration: 1.5, ease: "power3.out" },
        0
      );
      tl.fromTo(
        nodeRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.1, ease: "back.out(1.1)" },
        0.1
      );
      return tl;
    },
    animateOut: () => {
      if (!nodeRef.current) return;
      const tl = gsap.timeline();
      tl.to(nodeRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: project.id,
    tooltip: `Inspect: ${project.title}`,
    cameraPosition: [project.position[0], project.position[1] + 0.3, project.position[2] + 1.5],
    cameraTarget: [project.position[0], project.position[1], project.position[2]],
    cameraFov: 38,
    onHoverStart: () => setHovered(true),
    onHoverEnd: () => setHovered(false),
  }, nodeRef);

  // Slow floating motion and particle rotation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (screenRef.current) {
      screenRef.current.position.y = 0.6 + Math.sin(time * 1.2) * 0.04;
      screenRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * (hovered ? 0.8 : 0.3);
      pointsRef.current.rotation.x = time * 0.1;
    }
  });

  // Calculate coordinates based on shape selection
  const count = 80;
  const pointsGeometry = useMemo(() => {
    const rand = createRandom(5050);
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      if (project.shape === "sphere") {
        // Spherical distribution
        const u = rand();
        const v = rand();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 0.35;
        positions[idx] = r * Math.sin(phi) * Math.cos(theta);
        positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[idx + 2] = r * Math.cos(phi);
      } else if (project.shape === "cube") {
        // Cubic shell distribution
        positions[idx] = (rand() - 0.5) * 0.6;
        positions[idx + 1] = (rand() - 0.5) * 0.6;
        positions[idx + 2] = (rand() - 0.5) * 0.6;
      } else {
        // Torus distribution
        const theta = rand() * Math.PI * 2;
        const phi = rand() * Math.PI * 2;
        const R = 0.3;
        const r = 0.1;
        positions[idx] = (R + r * Math.cos(phi)) * Math.cos(theta);
        positions[idx + 1] = (R + r * Math.cos(phi)) * Math.sin(theta);
        positions[idx + 2] = r * Math.sin(phi);
      }
    }

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [project.shape]);

  return (
    <group ref={nodeRef} position={project.position} scale={[scale, scale, scale]} name="project-node" {...handlers}>
      {/* Floating glass preview screen (renders abstract layout architecture) */}
      <mesh ref={screenRef} position={[0, 0.6, 0]}>
        <boxGeometry args={[1.1, 0.65, 0.02]} />
        <primitive object={borderMaterial} attach="material" />
      </mesh>

      {/* Screen visor glass */}
      <mesh position={[0, 0.6, 0.012]}>
        <boxGeometry args={[1.04, 0.59, 0.004]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Stack schema grid mapping */}
      <mesh position={[0, 0.6, 0.015]}>
        <boxGeometry args={[0.9, 0.45, 0.002]} />
        <primitive object={gridMaterial} attach="material" />
      </mesh>

      {/* Dynamic assembling particle core */}
      <points ref={pointsRef} geometry={pointsGeometry} position={[0, 0, 0]}>
        <pointsMaterial color="#ffffff" size={0.02} transparent opacity={0.65 * opacity} />
      </points>

      {/* Holographic Text Metadata details */}
      <Text position={[0, 1.15, 0]} fontSize={0.075} color="#ffffff" font="/fonts/Inter-Bold.ttf">
        {project.title.toUpperCase()}
      </Text>
      <Text position={[0, 1.02, 0]} fontSize={0.045} color="#88888c" font="/fonts/Inter-Bold.ttf">
        {project.subtitle.toUpperCase()}
      </Text>
      <Text position={[0, 0.18, 0.02]} fontSize={0.035} color="#cccccc" font="/fonts/Inter-Bold.ttf">
        {project.tech.join(" // ")}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.04} color="#55555c" font="/fonts/Inter-Bold.ttf">
        {project.timeline}
      </Text>
    </group>
  );
}

export default function ProjectGallery({ opacity = 1.0 }: GalleryProps) {
  // Parse project registry list cleanly from database
  const projects = useMemo(() => {
    return projectsData as ProjectConfig[];
  }, []);

  return (
    <group name="project-gallery">
      {/* Base grid layout */}
      <gridHelper args={[18, 18, "#0f0f11", "#08080a"]} position={[0, -1.0, 0]} />

      {/* Map project node systems */}
      {projects.map((project) => (
        <ProjectNode key={project.id} project={project} opacity={opacity} />
      ))}
    </group>
  );
}
export { ProjectGallery };
