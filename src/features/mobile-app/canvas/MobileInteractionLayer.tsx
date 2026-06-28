"use client";

/**
 * MobileInteractionLayer.tsx
 *
 * Augments the Mobile Applications World with six new interaction modes:
 *   1. Rotatable Devices   — pointer drag rotates any device group
 *   2. Expandable UI Panel — click opens a floating glass interface panel
 *   3. Notification Touch  — click live notifications; dismissal spawns a sync packet
 *   4. Prototype Launcher  — activates a floating modal with animated content blocks
 *   5. Live Sync Observer  — visual ring around Cloud node brightens on packet arrival
 *   6. Inspector Overlay   — hover reveals metadata lines (tech stack, layer count, status)
 *
 * All interactions go through the existing Interaction Engine (useInteractiveObject).
 * Camera focus is handled entirely by useCameraStore.triggerFocus inside the hook.
 * No logic is duplicated from DeviceSyncEngine, LiveAppPreview, or DeviceAssembly.
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import { useInteractiveObject } from "@core/interaction/use-interaction";
import { useAssemblyRegister } from "@core/assembly/use-assembly";
import { useSyncStore } from "@core/sync/use-sync-store";

// ─── Shared Materials Helper ───────────────────────────────────────────────────

function useGlassMaterials(opacity: number) {
  return useMemo(() => ({
    panel: new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.04,
      transparent: true,
      opacity: 0.08 * opacity,
    }),
    panelEdge: new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.02,
      transparent: true,
      opacity: 0.14 * opacity,
    }),
    line: new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.18 * opacity,
    }),
    dot: new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.55 * opacity,
    }),
    activeLine: new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.35 * opacity,
    }),
  }), [opacity]);
}

// ─── 1. useRotatableDevice ─────────────────────────────────────────────────────
// Hook — attach to any Group ref to enable pointer-drag rotation.
// Returns pointer event handlers to spread onto the target group.

export function useRotatableDevice(groupRef: React.RefObject<THREE.Group | null>) {
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0);
  const { gl } = useThree();

  // Inertia decay each frame
  useFrame(() => {
    if (!groupRef.current) return;
    if (!dragging.current) {
      velX.current *= 0.92;
      velY.current *= 0.92;
      groupRef.current.rotation.y += velX.current;
      groupRef.current.rotation.x += velY.current;
      // Soft-clamp X rotation so device doesn't flip
      groupRef.current.rotation.x = THREE.MathUtils.clamp(
        groupRef.current.rotation.x, -0.6, 0.6
      );
    }
  });

  // Global pointer-up to end drag even if pointer leaves mesh
  useEffect(() => {
    const onUp = () => { dragging.current = false; };
    gl.domElement.addEventListener("pointerup", onUp);
    return () => gl.domElement.removeEventListener("pointerup", onUp);
  }, [gl]);

  const handlers = useMemo(() => ({
    onPointerDown: (e: { stopPropagation: () => void; nativeEvent: PointerEvent }) => {
      e.stopPropagation();
      dragging.current = true;
      lastX.current = e.nativeEvent.clientX;
      lastY.current = e.nativeEvent.clientY;
    },
    onPointerMove: (e: { stopPropagation: () => void; nativeEvent: PointerEvent }) => {
      if (!dragging.current || !groupRef.current) return;
      e.stopPropagation();
      const dx = (e.nativeEvent.clientX - lastX.current) * 0.008;
      const dy = (e.nativeEvent.clientY - lastY.current) * 0.005;
      velX.current = dx;
      velY.current = dy;
      groupRef.current.rotation.y += dx;
      groupRef.current.rotation.x += dy;
      groupRef.current.rotation.x = THREE.MathUtils.clamp(
        groupRef.current.rotation.x, -0.6, 0.6
      );
      lastX.current = e.nativeEvent.clientX;
      lastY.current = e.nativeEvent.clientY;
    },
    onPointerUp: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      dragging.current = false;
    },
  }), [groupRef]);

  return handlers;
}

// ─── 2. RotatableDeviceShell ────────────────────────────────────────────────────
// A standalone rotatable device slab with integrated camera focus, inspector overlay,
// and expandable UI panel. Placed as a hero device in the interaction zone.

export function RotatableDeviceShell({
  id,
  position,
  opacity = 1.0,
  label = "DEVICE.HERO",
}: {
  id: string;
  position: [number, number, number];
  opacity?: number;
  label?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const panelRef = useRef<THREE.Group>(null);
  const overlayRef = useRef<THREE.Group>(null);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const mats = useGlassMaterials(opacity);
  const rotHandlers = useRotatableDevice(groupRef);

  // Assembly registration
  useAssemblyRegister({
    id: `rotatable-${id}`,
    ref: groupRef,
    stage: "glass",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1.4, ease: "back.out(1.15)" });
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" });
      return tl;
    },
  });

  // Interaction: hover → inspector overlay; click → expand panel + focus camera
  const { handlers: interactHandlers } = useInteractiveObject({
    id: `rotatable-${id}`,
    tooltip: `Inspect ${label} — drag to rotate`,
    cameraPosition: [position[0], position[1] + 0.4, position[2] + 1.8],
    cameraTarget: position,
    cameraFov: 36,
    onHoverStart: () => setHovered(true),
    onHoverEnd: () => setHovered(false),
    onActivate: () => {
      const nextExpanded = !expanded;
      setExpanded(nextExpanded);
      if (panelRef.current) {
        if (nextExpanded) {
          gsap.fromTo(panelRef.current.scale,
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 1, z: 1, duration: 0.55, ease: "back.out(1.3)" }
          );
        } else {
          gsap.to(panelRef.current.scale,
            { x: 0, y: 0, z: 0, duration: 0.35, ease: "power2.in" }
          );
        }
      }
    },
  }, groupRef);

  // Inspector overlay fade
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (overlayRef.current) {
      const target = hovered ? 1 : 0;
      overlayRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          if (mat.opacity !== undefined) {
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, target * 0.22 * opacity, 0.1);
          }
        }
      });
    }
    // Gentle breathe float
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.65) * 0.05;
    }
  });

  // Merge pointer handlers — rotHandlers and interactHandlers don't overlap
  const merged = useMemo(() => ({
    ...interactHandlers,
    onPointerDown: rotHandlers.onPointerDown,
    onPointerMove: rotHandlers.onPointerMove,
    onPointerUp: rotHandlers.onPointerUp,
  }), [interactHandlers, rotHandlers]);

  return (
    <group ref={groupRef} position={position} name={`rotatable-device-${id}`} {...merged}>
      {/* Device body */}
      <mesh>
        <boxGeometry args={[0.95, 1.72, 0.044]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.2} metalness={0.88} transparent opacity={opacity} />
      </mesh>

      {/* Screen glass */}
      <mesh position={[0, 0, 0.023]}>
        <boxGeometry args={[0.87, 1.62, 0.003]} />
        <primitive object={mats.panel} attach="material" />
      </mesh>

      {/* Inspector metadata overlay — appears on hover */}
      <group ref={overlayRef} position={[0, 0, 0.025]}>
        {[0.4, 0.25, 0.1, -0.05, -0.2].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[0.55 - i * 0.04, 0.01, 0.001]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} />
          </mesh>
        ))}
      </group>

      {/* Edge trim */}
      <mesh position={[0, 0, -0.023]}>
        <boxGeometry args={[0.97, 1.74, 0.002]} />
        <primitive object={mats.panelEdge} attach="material" />
      </mesh>

      {/* Home indicator */}
      <mesh position={[0, -0.79, 0.025]}>
        <boxGeometry args={[0.2, 0.01, 0.001]} />
        <primitive object={mats.dot} attach="material" />
      </mesh>

      {/* Expandable UI Panel — appears to the right on click */}
      <group ref={panelRef} position={[1.4, 0.0, 0]} scale={[0, 0, 0]}>
        <ExpandedUIPanel opacity={opacity} />
      </group>

      {/* Label */}
      <Text position={[0, -1.0, 0]} fontSize={0.042} color="#66666c" font="/fonts/Inter-Bold.ttf">
        {label}
      </Text>
      <Text position={[0, -1.07, 0]} fontSize={0.03} color="#44444c" font="/fonts/Inter-Bold.ttf">
        DRAG TO ROTATE · CLICK TO EXPAND
      </Text>
    </group>
  );
}

// ─── 3. ExpandedUIPanel ─────────────────────────────────────────────────────────
// A floating glass interface panel that slides out from a device on click.

function ExpandedUIPanel({ opacity }: { opacity: number }) {
  const mats = useGlassMaterials(opacity);

  return (
    <group name="expanded-ui-panel">
      {/* Panel body */}
      <mesh>
        <boxGeometry args={[1.1, 1.6, 0.018]} />
        <primitive object={mats.panel} attach="material" />
      </mesh>
      {/* Edge border */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[1.12, 1.62, 0.003]} />
        <primitive object={mats.panelEdge} attach="material" />
      </mesh>

      {/* Title bar */}
      <mesh position={[0, 0.72, 0.012]}>
        <boxGeometry args={[0.9, 0.04, 0.001]} />
        <primitive object={mats.line} attach="material" />
      </mesh>

      {/* Content blocks */}
      {[0.52, 0.34, 0.16, -0.02, -0.2, -0.38, -0.56].map((y, i) => (
        <mesh key={i} position={[0, y, 0.012]}>
          <boxGeometry args={[0.88 - (i % 3) * 0.08, i % 2 === 0 ? 0.1 : 0.055, 0.001]} />
          <primitive object={i === 0 ? mats.activeLine : mats.line} attach="material" />
        </mesh>
      ))}

      {/* Action buttons row */}
      {[-0.22, 0, 0.22].map((x, i) => (
        <mesh key={i} position={[x, -0.69, 0.012]}>
          <boxGeometry args={[0.18, 0.06, 0.001]} />
          <primitive object={i === 1 ? mats.activeLine : mats.panelEdge} attach="material" />
        </mesh>
      ))}

      <Text position={[0, 0.82, 0.014]} fontSize={0.038} color="#88888c" font="/fonts/Inter-Bold.ttf">
        INTERFACE.EXPANDED
      </Text>
    </group>
  );
}

// ─── 4. NotificationInteractor ──────────────────────────────────────────────────
// A tappable notification banner. Clicking dismisses it and fires a sync packet.
// Automatically re-appears after an interval.

export function NotificationInteractor({
  position,
  sourceDevice = "phone",
  opacity = 1.0,
}: {
  position: [number, number, number];
  sourceDevice?: "phone" | "tablet" | "desktop" | "watch" | "cloud";
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const timerRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const spawnPacket = useSyncStore((s) => s.spawnPacket);
  const mats = useGlassMaterials(opacity);

  // Show/hide cycle
  const show = useCallback(() => {
    setVisible(true);
    if (groupRef.current) {
      gsap.fromTo(groupRef.current.position,
        { y: position[1] + 0.25 },
        { y: position[1], duration: 0.45, ease: "back.out(1.5)" }
      );
      gsap.fromTo(groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [position]);

  const dismiss = useCallback((fromInteraction = false) => {
    if (!groupRef.current) return;
    gsap.to(groupRef.current.scale,
      { x: 0, y: 0, z: 0, duration: 0.3, ease: "power2.in",
        onComplete: () => setVisible(false),
      }
    );
    // Dismissal by user triggers a sync event
    if (fromInteraction) {
      spawnPacket(sourceDevice, "cloud", "NOTIF.ACK");
    }
  }, [spawnPacket, sourceDevice]);

  // Auto-cycle timer
  useFrame((_, delta) => {
    timerRef.current += delta;
    const interval = 7.5 + (position[0] * 1.2);
    if (!visible && timerRef.current > interval) {
      timerRef.current = 0;
      show();
    }
    if (visible && timerRef.current > 5.0) {
      timerRef.current = 0;
      dismiss(false);
    }
  });

  const { handlers } = useInteractiveObject({
    id: `notif-${position.join("-")}`,
    tooltip: "Tap to acknowledge notification",
    cameraPosition: [position[0], position[1] + 0.1, position[2] + 1.0],
    cameraTarget: position,
    cameraFov: 42,
    onActivate: () => dismiss(true),
  }, groupRef);

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position} scale={[0, 0, 0]} {...handlers}>
      {/* Banner background */}
      <mesh>
        <boxGeometry args={[0.85, 0.12, 0.01]} />
        <primitive object={mats.panel} attach="material" />
      </mesh>
      {/* Banner border */}
      <mesh position={[0, 0, 0.006]}>
        <boxGeometry args={[0.87, 0.14, 0.002]} />
        <primitive object={mats.panelEdge} attach="material" />
      </mesh>
      {/* Dot indicator */}
      <mesh position={[-0.36, 0, 0.007]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <primitive object={mats.dot} attach="material" />
      </mesh>
      {/* Text lines */}
      <mesh position={[0.04, 0.025, 0.007]}>
        <boxGeometry args={[0.38, 0.012, 0.001]} />
        <primitive object={mats.activeLine} attach="material" />
      </mesh>
      <mesh position={[-0.02, -0.015, 0.007]}>
        <boxGeometry args={[0.28, 0.009, 0.001]} />
        <primitive object={mats.line} attach="material" />
      </mesh>
      <Text position={[0, -0.1, 0.007]} fontSize={0.028} color="#55555c" font="/fonts/Inter-Bold.ttf">
        TAP TO ACK
      </Text>
    </group>
  );
}

// ─── 5. PrototypeLauncher ───────────────────────────────────────────────────────
// A pressable button mesh that opens a floating prototype modal.

export function PrototypeLauncher({
  position,
  opacity = 1.0,
}: {
  position: [number, number, number];
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const modalRef = useRef<THREE.Group>(null);
  const btnRef = useRef<THREE.Mesh>(null);
  const [open, setOpen] = useState(false);
  const mats = useGlassMaterials(opacity);

  useAssemblyRegister({
    id: `proto-launcher-${position.join("-")}`,
    ref: groupRef,
    stage: "hologram",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1.2, ease: "back.out(1.2)" });
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: `proto-launcher-${position.join("-")}`,
    tooltip: open ? "Close prototype preview" : "Launch prototype preview",
    cameraPosition: [position[0], position[1] + 0.5, position[2] + 1.6],
    cameraTarget: position,
    cameraFov: 38,
    onActivate: () => {
      const next = !open;
      setOpen(next);
      if (modalRef.current) {
        if (next) {
          gsap.fromTo(modalRef.current.scale,
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 1, z: 1, duration: 0.6, ease: "back.out(1.3)" }
          );
          gsap.fromTo(modalRef.current.position,
            { y: position[1] - 0.3 },
            { y: position[1] + 1.0, duration: 0.55, ease: "power3.out" }
          );
        } else {
          gsap.to(modalRef.current.scale,
            { x: 0, y: 0, z: 0, duration: 0.35, ease: "power2.in" }
          );
        }
      }
      if (btnRef.current) {
        gsap.to(btnRef.current.scale,
          { x: 0.92, y: 0.92, z: 0.92, duration: 0.08, ease: "power2.in",
            yoyo: true, repeat: 1 }
        );
      }
    },
  }, groupRef);

  // Button breath
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (btnRef.current && !open) {
      const s = 1 + Math.sin(t * 1.8) * 0.02;
      btnRef.current.scale.set(s, s, s);
    }
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.7 + position[2]) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position} {...handlers}>
      {/* Launch button */}
      <mesh ref={btnRef}>
        <boxGeometry args={[0.5, 0.14, 0.025]} />
        <primitive object={mats.panelEdge} attach="material" />
      </mesh>
      <Text position={[0, 0, 0.015]} fontSize={0.038} color="#888890" font="/fonts/Inter-Bold.ttf">
        LAUNCH PROTOTYPE
      </Text>

      {/* Prototype modal */}
      <group ref={modalRef} position={[0, 1.0, 0]} scale={[0, 0, 0]}>
        <PrototypeModal opacity={opacity} />
      </group>
    </group>
  );
}

function PrototypeModal({ opacity }: { opacity: number }) {
  const mats = useGlassMaterials(opacity);
  const contentRef = useRef<THREE.Group>(null);

  // Animate content blocks sequentially once
  useEffect(() => {
    if (!contentRef.current) return;
    const children = contentRef.current.children;
    const tl = gsap.timeline({ delay: 0.1 });
    children.forEach((child, i) => {
      tl.fromTo(child.scale, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1, duration: 0.25, ease: "power2.out" }, i * 0.07);
    });
    return () => { tl.kill(); };
  }, []);

  return (
    <group name="prototype-modal">
      {/* Modal background */}
      <mesh>
        <boxGeometry args={[1.3, 1.8, 0.022]} />
        <primitive object={mats.panel} attach="material" />
      </mesh>
      {/* Edge */}
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[1.32, 1.82, 0.003]} />
        <primitive object={mats.panelEdge} attach="material" />
      </mesh>

      {/* Content rows */}
      <group ref={contentRef} position={[0, 0, 0.014]}>
        {[0.72, 0.55, 0.38, 0.21, 0.04, -0.13, -0.3, -0.47].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} scale={[0, 1, 1]}>
            <boxGeometry args={[1.0 - (i % 3) * 0.1, i === 0 ? 0.055 : 0.04, 0.001]} />
            <primitive object={i < 2 ? mats.activeLine : mats.line} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Close affordance */}
      <mesh position={[0.56, 0.85, 0.014]}>
        <boxGeometry args={[0.05, 0.05, 0.001]} />
        <primitive object={mats.panelEdge} attach="material" />
      </mesh>

      <Text position={[0, -0.98, 0.014]} fontSize={0.038} color="#55555c" font="/fonts/Inter-Bold.ttf">
        PROTOTYPE.PREVIEW_V1
      </Text>
    </group>
  );
}

// ─── 6. SyncObserverRing ────────────────────────────────────────────────────────
// A pulsing torus ring around the Cloud node that visually reacts
// to packet arrivals tracked in useSyncStore.

export function SyncObserverRing({
  position,
  opacity = 1.0,
}: {
  position: [number, number, number];
  opacity?: number;
}) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  const { handlers } = useInteractiveObject({
    id: "sync-observer-cloud-ring",
    tooltip: "Observe live synchronization — Cloud Core",
    cameraPosition: [position[0], position[1] + 0.8, position[2] + 1.8],
    cameraTarget: position,
    cameraFov: 32,
  }, ring1Ref as React.RefObject<THREE.Object3D | null>);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Check if any packet is currently in flight targeting cloud
    const packets = useSyncStore.getState().packets;
    const cloudActive = packets.some((p) => p.to === "cloud" || p.from === "cloud");
    const baseOpacity = cloudActive ? 0.35 : 0.08;
    const freq = cloudActive ? 4.5 : 1.4;

    if (ring1Ref.current) {
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial;
      const pulse = baseOpacity + Math.sin(t * freq) * 0.06;
      mat.opacity = pulse * opacity;
      const s = 1.0 + Math.sin(t * freq) * 0.04;
      ring1Ref.current.scale.set(s, 1, s);
    }
    if (ring2Ref.current) {
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial;
      const pulse = (baseOpacity * 0.6) + Math.cos(t * freq * 0.8) * 0.04;
      mat.opacity = pulse * opacity;
      const s = 1.0 + Math.cos(t * freq * 0.8) * 0.03;
      ring2Ref.current.scale.set(s, 1, s);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group position={position} name="sync-observer-ring" {...handlers}>
      {/* Inner ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.008, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08 * opacity} />
      </mesh>
      {/* Mid ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.005, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05 * opacity} />
      </mesh>
      {/* Outer rotating orbit lines */}
      <group ref={ring3Ref}>
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.95, 0, Math.sin(angle) * 0.95]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3 * opacity} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── Main Interaction Layer Aggregator ─────────────────────────────────────────

interface InteractionLayerProps {
  opacity?: number;
}

export default function MobileInteractionLayer({ opacity = 1.0 }: InteractionLayerProps) {
  return (
    <group name="mobile-interaction-layer">
      {/* Hero rotatable device — phone form factor, center stage */}
      <RotatableDeviceShell
        id="hero-phone"
        position={[0, 0.6, 3.8]}
        opacity={opacity}
        label="HERO.DEVICE_01"
      />

      {/* Second rotatable device — tablet, offset left */}
      <RotatableDeviceShell
        id="hero-tablet"
        position={[-2.6, 0.5, 3.2]}
        opacity={opacity}
        label="HERO.DEVICE_02"
      />

      {/* Notification interactors — staggered positions above devices */}
      <NotificationInteractor
        position={[0, 1.8, 3.8]}
        sourceDevice="phone"
        opacity={opacity}
      />
      <NotificationInteractor
        position={[-2.6, 1.75, 3.2]}
        sourceDevice="tablet"
        opacity={opacity}
      />
      <NotificationInteractor
        position={[2.8, 1.6, 3.0]}
        sourceDevice="desktop"
        opacity={opacity}
      />

      {/* Prototype launcher */}
      <PrototypeLauncher
        position={[2.8, 0.1, 3.0]}
        opacity={opacity}
      />

      {/* Sync observer ring — wraps the cloud node at [0, 1.6, 0] + local offset [0, 0.2, 12.5] */}
      <SyncObserverRing
        position={[0, 2.1, 12.5]}
        opacity={opacity}
      />
    </group>
  );
}
export { MobileInteractionLayer };
