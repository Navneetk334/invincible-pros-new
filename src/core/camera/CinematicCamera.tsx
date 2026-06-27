"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useCameraStore } from "./use-camera-store";
import { CAMERA_WAYPOINTS } from "./camera-paths-config";

// Interpolate properties linearly between waypoint nodes along segment paths
function interpolateWaypointParams(progress: number) {
  const numWaypoints = CAMERA_WAYPOINTS.length;
  const rawProgress = progress * (numWaypoints - 1);
  const index = Math.min(Math.floor(rawProgress), numWaypoints - 2);
  const segmentProgress = rawProgress - index;

  const wpStart = CAMERA_WAYPOINTS[index];
  const wpEnd = CAMERA_WAYPOINTS[index + 1];

  const target = [
    THREE.MathUtils.lerp(wpStart.target[0], wpEnd.target[0], segmentProgress),
    THREE.MathUtils.lerp(wpStart.target[1], wpEnd.target[1], segmentProgress),
    THREE.MathUtils.lerp(wpStart.target[2], wpEnd.target[2], segmentProgress),
  ] as [number, number, number];

  const fov = THREE.MathUtils.lerp(wpStart.fov, wpEnd.fov, segmentProgress);
  const shakeIntensity = THREE.MathUtils.lerp(wpStart.shakeIntensity, wpEnd.shakeIntensity, segmentProgress);
  const focusDistance = THREE.MathUtils.lerp(wpStart.focusDistance, wpEnd.focusDistance, segmentProgress);
  const aperture = THREE.MathUtils.lerp(wpStart.aperture, wpEnd.aperture, segmentProgress);

  return { target, fov, shakeIntensity, focusDistance, aperture };
}

export default function CinematicCamera() {
  const scrollProgress = useCameraStore((state) => state.scrollProgress);
  const shakeEnabled = useCameraStore((state) => state.shakeEnabled);
  const shakeIntensityMultiplier = useCameraStore((state) => state.shakeIntensityMultiplier);
  const isScrolling = useCameraStore((state) => state.isScrolling);

  const lookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Construct Catmull-Rom spline curve from waypoint coordinates
  const splineCurve = useMemo(() => {
    const points = CAMERA_WAYPOINTS.map(
      (wp) => new THREE.Vector3(wp.position[0], wp.position[1], wp.position[2])
    );
    return new THREE.CatmullRomCurve3(points, false, "centripetal");
  }, []);

  useFrame((state) => {
    const cam = state.camera;
    const time = state.clock.getElapsedTime();
    
    // 1. Evaluate base position along spline
    const basePos = splineCurve.getPointAt(scrollProgress);
    cam.position.copy(basePos);

    // 2. Resolve interpolated parameter nodes
    const { target, fov, shakeIntensity } = interpolateWaypointParams(scrollProgress);

    // 3. Apply low-frequency mouse movement parallax offset (orbit/pan)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    cam.position.addScaledVector(right, state.pointer.x * 0.3);
    cam.position.addScaledVector(up, state.pointer.y * 0.3);

    // 4. Apply high-frequency pseudo-random camera shake (sinusoidal combinations)
    const activeShake = shakeIntensity * shakeIntensityMultiplier * (isScrolling ? 1.3 : 1.0);
    if (shakeEnabled && activeShake > 0) {
      const jitterX = (Math.sin(time * 16) * 0.012 + Math.cos(time * 26) * 0.006) * activeShake;
      const jitterY = (Math.cos(time * 14) * 0.012 + Math.sin(time * 22) * 0.006) * activeShake;
      cam.position.addScaledVector(right, jitterX);
      cam.position.addScaledVector(up, jitterY);
    }

    // 5. Update lookAt targets smoothly
    const targetVector = new THREE.Vector3(...target);
    lookAtRef.current.lerp(targetVector, 0.08);
    cam.lookAt(lookAtRef.current);

    // 6. Handle Field-of-View transitions safely
    if ("fov" in cam) {
      const perspectiveCamera = cam as THREE.PerspectiveCamera;
      if (Math.abs(perspectiveCamera.fov - fov) > 0.01) {
        perspectiveCamera.fov = fov;
        perspectiveCamera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
export { CinematicCamera };
