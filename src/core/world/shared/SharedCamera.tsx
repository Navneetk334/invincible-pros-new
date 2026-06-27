"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useWorldStore } from "../use-world-store";

export default function SharedCamera() {
  const { camera } = useThree();
  const cameraConfig = useWorldStore((state) => state.cameraConfig);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (cameraConfig.fov && "fov" in camera) {
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      // eslint-disable-next-line react-hooks/immutability
      perspectiveCamera.fov = cameraConfig.fov;
      perspectiveCamera.updateProjectionMatrix();
    }
  }, [camera, cameraConfig.fov]);

  useFrame(() => {
    // Target position vector from configuration
    const [px, py, pz] = cameraConfig.position;
    const targetPos = new THREE.Vector3(px, py, pz);
    
    // Smooth linear interpolation (lerp)
    camera.position.lerp(targetPos, 0.05);

    // Target look-at vectors
    const [tx, ty, tz] = cameraConfig.target;
    const targetLookAt = new THREE.Vector3(tx, ty, tz);
    targetRef.current.lerp(targetLookAt, 0.05);
    
    camera.lookAt(targetRef.current);
  });

  return null;
}
export { SharedCamera };
