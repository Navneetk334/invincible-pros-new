"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState, Suspense } from "react";
import * as THREE from "three";
import { Detailed } from "@react-three/drei";
import { useWorldStore } from "../use-world-store";

interface GLTFResult {
  scene: THREE.Group;
}

interface GLTFLoaderInstance {
  load: (
    url: string,
    onLoad: (gltf: GLTFResult) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) => void;
}

interface WindowWithTHREE {
  THREE: {
    GLTFLoader: new () => GLTFLoaderInstance;
  };
}

// Custom R3F GLB Loader fallback model component
function GLTMascotModel({ url, state }: { url: string; state: string }) {
  // If public assets GLB files are added later, this is prepared to load them natively
  const [model, setModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const win = window as unknown as WindowWithTHREE;
    if (!win.THREE || !win.THREE.GLTFLoader) return;

    const loader = new win.THREE.GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        setModel(gltf.scene);
      },
      undefined,
      () => {
        // Fallback silently if public model fetch fails
        setModel(null);
      }
    );
  }, [url]);

  if (!model) return null;

  return <primitive object={model} name={`glb-mascot-${state}`} />;
}

// Procedural robot droid sub-components with different details for LOD
function ProceduralHighDetail({
  color,
  opacity,
  headRef,
  rightArmRef,
  leftArmRef,
  leftEyeRef,
  rightEyeRef,
}: {
  color: string;
  opacity: number;
  headRef: React.RefObject<THREE.Group | null>;
  rightArmRef: React.RefObject<THREE.Mesh | null>;
  leftArmRef: React.RefObject<THREE.Mesh | null>;
  leftEyeRef: React.RefObject<THREE.Mesh | null>;
  rightEyeRef: React.RefObject<THREE.Mesh | null>;
}) {
  const materials = useMemo(() => {
    return {
      metal: new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.15,
        metalness: 0.85,
        transparent: true,
        opacity,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.15 * opacity,
        roughness: 0.05,
        metalness: 0.2,
      }),
      glow: new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity,
      }),
    };
  }, [color, opacity]);

  return (
    <group name="procedural-high-detail">
      {/* 1. Торсо (torso capsule) */}
      <mesh name="torso">
        <cylinderGeometry args={[0.15, 0.12, 0.45, 32]} />
        <primitive object={materials.metal} attach="material" />
      </mesh>

      {/* Decorative center ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.02, 16, 32]} />
        <primitive object={materials.glow} attach="material" />
      </mesh>

      {/* 2. Floating Head Node */}
      <group ref={headRef} position={[0, 0.36, 0]} name="head-node">
        {/* Main head sphere */}
        <mesh>
          <sphereGeometry args={[0.13, 32, 32]} />
          <primitive object={materials.metal} attach="material" />
        </mesh>
        {/* Outer glass visor helmet */}
        <mesh>
          <sphereGeometry args={[0.15, 32, 32]} />
          <primitive object={materials.glass} attach="material" />
        </mesh>

        {/* Floating Left Eye */}
        <mesh ref={leftEyeRef} position={[-0.05, 0.02, 0.1]} name="left-eye">
          <sphereGeometry args={[0.02, 16, 16]} />
          <primitive object={materials.glow} attach="material" />
        </mesh>

        {/* Floating Right Eye */}
        <mesh ref={rightEyeRef} position={[0.05, 0.02, 0.1]} name="right-eye">
          <sphereGeometry args={[0.02, 16, 16]} />
          <primitive object={materials.glow} attach="material" />
        </mesh>
      </group>

      {/* 3. Floating Left Arm */}
      <mesh ref={leftArmRef} position={[-0.22, 0.05, 0]} name="left-arm">
        <cylinderGeometry args={[0.025, 0.02, 0.28, 16]} />
        <primitive object={materials.metal} attach="material" />
      </mesh>

      {/* 4. Floating Right Arm (Waving/Pointing arm) */}
      <mesh ref={rightArmRef} position={[0.22, 0.05, 0]} name="right-arm">
        <cylinderGeometry args={[0.025, 0.02, 0.28, 16]} />
        <primitive object={materials.metal} attach="material" />
      </mesh>
    </group>
  );
}

function ProceduralMediumDetail({ color, opacity }: { color: string; opacity: number }) {
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity,
      wireframe: true,
    });
  }, [color, opacity]);

  return (
    <group name="procedural-medium-detail">
      {/* Torso */}
      <mesh>
        <cylinderGeometry args={[0.14, 0.11, 0.42, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Limbs */}
      <mesh position={[-0.22, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.26, 0.04]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0.22, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.26, 0.04]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

function ProceduralLowDetail({ color, opacity }: { color: string; opacity: number }) {
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.6 * opacity,
      wireframe: true,
    });
  }, [color, opacity]);

  return (
    <group name="procedural-low-detail">
      {/* Torso */}
      <mesh>
        <boxGeometry args={[0.24, 0.4, 0.24]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

export default function SharedMascot() {
  const rootRef = useRef<THREE.Group>(null);
  
  // Ref hooks for procedural node tracking
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  const lookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const mascotConfig = useWorldStore((state) => state.mascotConfig);
  const { camera } = useThree();

  // Animation active state state machine (falls back to idle if undefined)
  const animState = mascotConfig.animationState || "idle";

  useFrame((state) => {
    if (!rootRef.current) return;

    // Handle visibility state
    if (!mascotConfig.visible) {
      rootRef.current.visible = false;
      return;
    }
    rootRef.current.visible = true;

    const time = state.clock.getElapsedTime();

    // 1. Slow floating wiggles Y (breathing loop)
    const floatOffset = Math.sin(time * 1.6) * 0.05;

    // Smooth position lerp
    const [px, py, pz] = mascotConfig.position;
    const targetPos = new THREE.Vector3(px, py + floatOffset, pz);
    rootRef.current.position.lerp(targetPos, 0.05);

    // Smooth scale lerp
    const scaleVal = mascotConfig.scale ?? 1.0;
    const targetScale = new THREE.Vector3(scaleVal, scaleVal, scaleVal);
    rootRef.current.scale.lerp(targetScale, 0.05);

    // 2. Head look-at cursor/camera tracking
    const lookTargetOption = mascotConfig.lookTarget || "cursor";
    const targetCoord = new THREE.Vector3(0, 0, 0);

    if (lookTargetOption === "camera") {
      targetCoord.copy(camera.position);
    } else if (lookTargetOption === "cursor") {
      // Project mouse coordinates in front of camera
      targetCoord.set(
        state.pointer.x * 2.5,
        state.pointer.y * 2.0,
        camera.position.z - 4.5
      );
    } else if (Array.isArray(lookTargetOption)) {
      targetCoord.set(
        lookTargetOption[0],
        lookTargetOption[1],
        lookTargetOption[2]
      );
    }

    lookAtRef.current.lerp(targetCoord, 0.08);

    if (headRef.current) {
      headRef.current.lookAt(lookAtRef.current);
    }
    if (leftEyeRef.current) {
      leftEyeRef.current.lookAt(lookAtRef.current);
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.lookAt(lookAtRef.current);
    }

    // 3. Arm Animation State Machine
    if (leftArmRef.current && rightArmRef.current) {
      const leftArm = leftArmRef.current;
      const rightArm = rightArmRef.current;

      if (animState === "idle") {
        // Slow float wiggles on both limbs
        leftArm.rotation.z = -Math.sin(time * 1.3) * 0.06;
        leftArm.rotation.x = Math.cos(time * 1.0) * 0.04;
        
        rightArm.rotation.z = Math.sin(time * 1.3) * 0.06;
        rightArm.rotation.x = Math.cos(time * 1.0) * 0.04;
        rightArm.quaternion.identity(); // Clear pointing
      } else if (animState === "wave") {
        // Left arm floats idle
        leftArm.rotation.z = -Math.sin(time * 1.3) * 0.06;
        
        // Right arm waves at 5.5Hz
        rightArm.rotation.x = 0;
        rightArm.rotation.z = 2.1 + Math.sin(time * 5.5) * 0.35;
        rightArm.quaternion.identity(); // Clear pointing
      } else if (animState === "point") {
        // Left arm floats idle
        leftArm.rotation.z = -Math.sin(time * 1.3) * 0.06;

        // Right shoulder base coordinate in world space
        const rightShoulder = new THREE.Vector3(0.22, 0.05, 0).applyMatrix4(
          rootRef.current.matrixWorld
        );
        const dir = new THREE.Vector3()
          .subVectors(lookAtRef.current, rightShoulder)
          .normalize();

        // Convert world dir vector to local orientation quaternion on right arm
        const parentQuatInv = new THREE.Quaternion()
          .copy(rootRef.current.quaternion)
          .invert();
        const localDir = dir.clone().applyQuaternion(parentQuatInv);
        
        const armQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, -1, 0), // Base cylinder cylinder faces down
          localDir
        );

        rightArm.quaternion.slerp(armQuat, 0.1);
      }
    }
  });

  const meshColor = mascotConfig.color || "#ffffff";
  const meshOpacity = mascotConfig.opacity ?? 1.0;

  return (
    <group ref={rootRef} name="shared-mascot-wrapper">
      {/* Attempt to load public GLB model if path is set in store configs */}
      {mascotConfig.modelPath ? (
        <Suspense fallback={null}>
          <GLTMascotModel url={mascotConfig.modelPath} state={animState} />
        </Suspense>
      ) : (
        /* Reusable LOD detailed grids */
        <Detailed distances={[0, 5, 11]}>
          <ProceduralHighDetail
            color={meshColor}
            opacity={meshOpacity}
            headRef={headRef}
            leftArmRef={leftArmRef}
            rightArmRef={rightArmRef}
            leftEyeRef={leftEyeRef}
            rightEyeRef={rightEyeRef}
          />
          <ProceduralMediumDetail color={meshColor} opacity={meshOpacity} />
          <ProceduralLowDetail color={meshColor} opacity={meshOpacity} />
        </Detailed>
      )}
    </group>
  );
}
export { SharedMascot };
