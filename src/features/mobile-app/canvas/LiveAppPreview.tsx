"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import { useAssemblyRegister } from "@core/assembly/use-assembly";
import { useInteractiveObject } from "@core/interaction/use-interaction";
import appData from "../data/app-previews.json";

// ─── Types ─────────────────────────────────────────────────────────

interface AppConfig {
  id: string;
  name: string;
  category: string;
  layout: string;
  statusBar: string;
  position: [number, number, number];
}

interface LiveAppPreviewProps {
  opacity?: number;
}

// ─── Abstract Layout Renderers ─────────────────────────────────────
// Each function returns JSX blocks representing a unique app structure
// inside a normalized -0.4..0.4 x, -0.7..0.7 y coordinate space

function MapsLayout({ opacity, pulse }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Map grid tiles */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.04 * opacity} wireframe />
      </mesh>
      {/* Location pin */}
      <mesh position={[0.1, 0.2, 0.002]}>
        <sphereGeometry args={[0.03 * (1 + pulse * 0.2), 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5 * opacity} />
      </mesh>
      {/* Route line */}
      <mesh position={[-0.1, 0, 0.002]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.005, 0.5, 0.001]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2 * opacity} />
      </mesh>
      {/* Search bar */}
      <mesh position={[0, 0.55, 0.002]}>
        <boxGeometry args={[0.6, 0.06, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.06 * opacity} />
      </mesh>
    </group>
  );
}

function BookingLayout({ opacity, pulse }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Calendar grid */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-0.2 + (i % 4) * 0.14, 0.35 - Math.floor(i / 4) * 0.14, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.001]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={(i === 5 ? 0.15 + pulse * 0.05 : 0.04) * opacity}
          />
        </mesh>
      ))}
      {/* Time slots */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.06 * opacity} />
      </mesh>
      <mesh position={[0, -0.38, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.04 * opacity} />
      </mesh>
    </group>
  );
}

function HealthLayout({ opacity, pulse }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Heart rate line (simplified sine wave using segments) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.28 + i * 0.08, 0.3 + Math.sin(i * 1.2 + pulse * 3) * 0.06, 0]}>
          <boxGeometry args={[0.06, 0.008, 0.001]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4 * opacity} />
        </mesh>
      ))}
      {/* BPM readout */}
      <Text position={[0, 0.1, 0.002]} fontSize={0.08} color="#ffffff" font="/fonts/Inter-Bold.ttf">
        {`${72 + Math.floor(pulse * 4)}`}
      </Text>
      <Text position={[0, 0.02, 0.002]} fontSize={0.03} color="#88888c" font="/fonts/Inter-Bold.ttf">
        BPM
      </Text>
      {/* Metric bars */}
      <mesh position={[-0.15, -0.25, 0]}>
        <boxGeometry args={[0.18, 0.35 * (0.6 + pulse * 0.1), 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.06 * opacity} />
      </mesh>
      <mesh position={[0.15, -0.25, 0]}>
        <boxGeometry args={[0.18, 0.35 * (0.8 - pulse * 0.05), 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.05 * opacity} />
      </mesh>
    </group>
  );
}

function EducationLayout({ opacity }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Course cards */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.65, 0.2, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.06 * opacity} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.65, 0.2, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.05 * opacity} />
      </mesh>
      {/* Progress bar */}
      <mesh position={[-0.08, -0.15, 0]}>
        <boxGeometry args={[0.45, 0.025, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.03 * opacity} />
      </mesh>
      <mesh position={[-0.2, -0.15, 0.001]}>
        <boxGeometry args={[0.2, 0.025, 0.001]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 * opacity} />
      </mesh>
      {/* Text lines */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[0.55, 0.012, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.04 * opacity} />
      </mesh>
      <mesh position={[-0.06, -0.4, 0]}>
        <boxGeometry args={[0.42, 0.012, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.03 * opacity} />
      </mesh>
    </group>
  );
}

function CommerceLayout({ opacity }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Product grid */}
      {[[-0.18, 0.3], [0.18, 0.3], [-0.18, 0.0], [0.18, 0.0]].map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          <mesh>
            <boxGeometry args={[0.28, 0.22, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.05 * opacity} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <boxGeometry args={[0.2, 0.012, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.04 * opacity} />
          </mesh>
        </group>
      ))}
      {/* Cart indicator */}
      <mesh position={[0.28, 0.55, 0.002]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3 * opacity} />
      </mesh>
    </group>
  );
}

function CRMLayout({ opacity, pulse }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Pipeline columns */}
      {[-0.25, 0, 0.25].map((x, i) => (
        <group key={i} position={[x, 0.15, 0]}>
          <mesh>
            <boxGeometry args={[0.2, 0.8, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.03 * opacity} />
          </mesh>
          {/* Contact cards in column */}
          {[0.25, 0.05, -0.15].map((cy, j) => (
            <mesh key={j} position={[0, cy, 0.001]}>
              <boxGeometry args={[0.16, 0.12, 0.001]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={(i === 1 && j === 0 ? 0.1 + pulse * 0.03 : 0.05) * opacity}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function DashboardLayout({ opacity, pulse }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Chart bars */}
      {Array.from({ length: 6 }).map((_, i) => {
        const h = 0.12 + Math.sin(i * 1.5 + pulse * 2) * 0.06;
        return (
          <mesh key={i} position={[-0.22 + i * 0.09, -0.1 + h / 2, 0]}>
            <boxGeometry args={[0.06, h, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.08 * opacity} />
          </mesh>
        );
      })}
      {/* KPI cards row */}
      {[-0.2, 0.05, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.2, 0.12, 0.001]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.05 * opacity} />
        </mesh>
      ))}
      {/* Line chart */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.65, 0.005, 0.001]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12 * opacity} />
      </mesh>
    </group>
  );
}

function FinanceLayout({ opacity, pulse }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Balance display */}
      <Text position={[0, 0.42, 0.002]} fontSize={0.065} color="#ffffff" font="/fonts/Inter-Bold.ttf">
        {`${(24850 + Math.floor(pulse * 120)).toLocaleString()}`}
      </Text>
      <Text position={[0, 0.35, 0.002]} fontSize={0.028} color="#88888c" font="/fonts/Inter-Bold.ttf">
        BALANCE.USD
      </Text>
      {/* Transaction rows */}
      {[0.15, 0.02, -0.11, -0.24].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.6, 0.08, 0.001]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={(0.04 + (i === 0 ? pulse * 0.02 : 0)) * opacity} />
        </mesh>
      ))}
    </group>
  );
}

function TravelLayout({ opacity }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Destination card */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.65, 0.35, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.05 * opacity} />
      </mesh>
      {/* Itinerary steps */}
      {[0.0, -0.15, -0.3].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh position={[-0.25, 0, 0]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.25 * opacity} />
          </mesh>
          <mesh position={[0.05, 0, 0]}>
            <boxGeometry args={[0.4, 0.012, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.04 * opacity} />
          </mesh>
        </group>
      ))}
      {/* Connecting line */}
      <mesh position={[-0.25, -0.15, 0]}>
        <boxGeometry args={[0.003, 0.3, 0.001]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1 * opacity} />
      </mesh>
    </group>
  );
}

function LogisticsLayout({ opacity, pulse }: { opacity: number; pulse: number }) {
  return (
    <group>
      {/* Map grid base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.7, 0.55, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.03 * opacity} wireframe />
      </mesh>
      {/* Vehicle dots */}
      {[[-0.15, 0.2], [0.1, 0.05], [0.2, 0.25], [-0.05, -0.05]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.002]}>
          <sphereGeometry args={[0.018 * (1 + (i === 0 ? pulse * 0.3 : 0)), 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4 * opacity} />
        </mesh>
      ))}
      {/* Status strip */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.001]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.05 * opacity} />
      </mesh>
    </group>
  );
}

// ─── Layout Selector ───────────────────────────────────────────────

const LAYOUT_MAP: Record<string, React.FC<{ opacity: number; pulse: number }>> = {
  maps: MapsLayout,
  booking: BookingLayout,
  health: HealthLayout,
  education: EducationLayout,
  commerce: CommerceLayout,
  crm: CRMLayout,
  dashboard: DashboardLayout,
  finance: FinanceLayout,
  travel: TravelLayout,
  logistics: LogisticsLayout,
};

// ─── Single App Device Frame ───────────────────────────────────────

function AppDeviceFrame({
  app,
  opacity = 1.0,
}: {
  app: AppConfig;
  opacity?: number;
}) {
  const deviceRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Group>(null);
  const notifRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const notifTimerRef = useRef<number>(0);

  const { bezelMaterial, glassMaterial } = useMemo(() => ({
    bezelMaterial: new THREE.MeshStandardMaterial({
      color: "#0a0a0d",
      roughness: 0.2,
      metalness: 0.88,
      transparent: true,
      opacity,
    }),
    glassMaterial: new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.02,
      transparent: true,
      opacity: 0.12 * opacity,
    }),
  }), [opacity]);

  // Assembly registration
  useAssemblyRegister({
    id: app.id,
    ref: deviceRef,
    stage: "hologram",
    animateIn: () => {
      if (!deviceRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(deviceRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1.3, ease: "back.out(1.2)" }, 0);
      tl.fromTo(deviceRef.current.position, { y: app.position[1] - 1.5 },
        { y: app.position[1], duration: 1.0, ease: "power3.out" }, 0.1);
      return tl;
    },
    animateOut: () => {
      if (!deviceRef.current) return;
      const tl = gsap.timeline();
      tl.to(deviceRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: app.id,
    tooltip: `Inspect ${app.name} [${app.category}]`,
    cameraPosition: [app.position[0], app.position[1] + 0.3, app.position[2] + 1.4],
    cameraTarget: app.position,
    cameraFov: 36,
    onHoverStart: () => setHovered(true),
    onHoverEnd: () => setHovered(false),
  }, deviceRef);

  // Animations: float, cursor reactivity, and notification pulse
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (deviceRef.current) {
      // Gentle float
      deviceRef.current.position.y = app.position[1] + Math.sin(t * 0.6 + app.position[0] * 0.5) * 0.04;
      // Cursor tilt reactivity when hovered
      if (hovered) {
        deviceRef.current.rotation.y = Math.sin(t * 1.5) * 0.06;
        deviceRef.current.rotation.x = Math.cos(t * 1.2) * 0.03;
      } else {
        deviceRef.current.rotation.y *= 0.95;
        deviceRef.current.rotation.x *= 0.95;
      }
    }

    // Screen content breathing
    if (screenRef.current) {
      const breathe = 0.97 + Math.sin(t * 1.5 + app.position[0]) * 0.03;
      screenRef.current.scale.set(breathe, breathe, 1);
    }

    // Natural notification timing
    notifTimerRef.current += 1;
    if (notifTimerRef.current > 420 + Math.floor(app.position[0] * 60)) {
      notifTimerRef.current = 0;
      setNotifVisible(true);
      if (notifRef.current) {
        gsap.fromTo(notifRef.current.position, { y: 0.85 }, { y: 0.72, duration: 0.4, ease: "back.out(1.4)" });
        gsap.fromTo(notifRef.current.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" });
        gsap.to(notifRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.3, ease: "power2.in", delay: 2.5,
          onComplete: () => setNotifVisible(false),
        });
      }
    }
  });



  return (
    <group ref={deviceRef} position={app.position} {...handlers}>
      {/* Device bezel */}
      <mesh>
        <boxGeometry args={[0.95, 1.7, 0.04]} />
        <primitive object={bezelMaterial} attach="material" />
      </mesh>

      {/* Screen glass */}
      <mesh position={[0, 0, 0.021]}>
        <boxGeometry args={[0.87, 1.62, 0.003]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Live app content */}
      <group ref={screenRef} position={[0, 0, 0.024]}>
        <LivePulseWrapper opacity={opacity} app={app} />
      </group>

      {/* Status bar */}
      <Text position={[0, 0.78, 0.025]} fontSize={0.028} color="#66666c" font="/fonts/Inter-Bold.ttf">
        {app.statusBar}
      </Text>

      {/* Home indicator */}
      <mesh position={[0, -0.76, 0.025]}>
        <boxGeometry args={[0.2, 0.01, 0.001]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2 * opacity} />
      </mesh>

      {/* Notification banner (slides in naturally) */}
      {notifVisible && (
        <mesh ref={notifRef} position={[0, 0.85, 0.03]} scale={[0, 0, 0]}>
          <boxGeometry args={[0.7, 0.08, 0.002]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.1 * opacity} />
        </mesh>
      )}

      {/* Category label */}
      <Text position={[0, -0.95, 0]} fontSize={0.04} color="#88888c" font="/fonts/Inter-Bold.ttf">
        {app.name.toUpperCase()}
      </Text>
      <Text position={[0, -1.03, 0]} fontSize={0.03} color="#55555c" font="/fonts/Inter-Bold.ttf">
        {app.category.toUpperCase()}
      </Text>
    </group>
  );
}

// ─── Pulse Wrapper ─────────────────────────────────────────────────
// Provides a time-driven pulse value to layout children

function LivePulseWrapper({
  opacity,
  app,
}: {
  opacity: number;
  app: AppConfig;
  children?: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [pulse, setPulse] = useState(0);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = Math.sin(t * 1.2 + app.position[0]) * 0.5 + 0.5;
    setPulse(p);
  });

  // Resolve the layout component and clone with pulse
  const LayoutComponent = LAYOUT_MAP[app.layout] ?? MapsLayout;

  return (
    <group ref={groupRef}>
      <LayoutComponent opacity={opacity} pulse={pulse} />
    </group>
  );
}

// ─── Main LiveAppPreview Engine ────────────────────────────────────

export default function LiveAppPreview({ opacity = 1.0 }: LiveAppPreviewProps) {
  const apps = useMemo(() => appData as AppConfig[], []);

  return (
    <group name="live-app-preview-engine">
      {apps.map((app) => (
        <AppDeviceFrame key={app.id} app={app} opacity={opacity} />
      ))}
    </group>
  );
}
export { LiveAppPreview };
