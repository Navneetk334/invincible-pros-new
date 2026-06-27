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
    const { target, fov, shakeIntensity } = interpolateWaypointParams(scrollProgress);

    // Retrieve active focus variables from state store
    const focusTarget = useCameraStore.getState().focusTarget;
    const focusPosition = useCameraStore.getState().focusPosition;
    const focusFov = useCameraStore.getState().focusFov;
    const focusProgress = useCameraStore.getState().focusProgress;

    // 2. Interpolate base position (either spline path or focused interpolate)
    if (focusProgress > 0 && focusPosition && focusTarget) {
      const targetPos = new THREE.Vector3(...focusPosition);
      cam.position.copy(basePos).lerp(targetPos, focusProgress);
    } else {
      cam.position.copy(basePos);
    }

    // 3. Resolve lookAt interpolation smoothly
    const targetVector = new THREE.Vector3(...target);
    if (focusProgress > 0 && focusTarget) {
      const targetLookAt = new THREE.Vector3(...focusTarget);
      lookAtRef.current.copy(targetVector).lerp(targetLookAt, focusProgress);
      cam.lookAt(lookAtRef.current);
    } else {
      lookAtRef.current.lerp(targetVector, 0.08);
      cam.lookAt(lookAtRef.current);
    }

    // 4. Apply low-frequency mouse movement parallax offset (orbit/pan)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    cam.position.addScaledVector(right, state.pointer.x * 0.3);
    cam.position.addScaledVector(up, state.pointer.y * 0.3);

    // 5. Apply high-frequency pseudo-random camera shake (sinusoidal combinations)
    const activeShake = shakeIntensity * shakeIntensityMultiplier * (isScrolling ? 1.3 : 1.0);
    if (shakeEnabled && activeShake > 0) {
      const jitterX = (Math.sin(time * 16) * 0.012 + Math.cos(time * 26) * 0.006) * activeShake;
      const jitterY = (Math.cos(time * 14) * 0.012 + Math.sin(time * 22) * 0.006) * activeShake;
      cam.position.addScaledVector(right, jitterX);
      cam.position.addScaledVector(up, jitterY);
    }

    // 6. Handle Field-of-View transitions safely
    if ("fov" in cam) {
      const perspectiveCamera = cam as THREE.PerspectiveCamera;
      const targetFov = (focusProgress > 0 && focusFov) ? focusFov : fov;
      if (Math.abs(perspectiveCamera.fov - targetFov) > 0.01) {
        perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, targetFov, 0.08);
        perspectiveCamera.updateProjectionMatrix();
      }
    }

    // 7. Direct DOM telemetry updates for high performance 60 FPS feedback
    if (typeof window !== "undefined") {
      const el = document.getElementById("hud-cam-coords");
      if (el) {
        el.textContent = `${cam.position.x.toFixed(2)}, ${cam.position.y.toFixed(2)}, ${cam.position.z.toFixed(2)}`;
      }
    }
  });

  return null;
}
export { CinematicCamera };
