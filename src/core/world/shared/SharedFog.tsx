"use client";

import { useWorldStore } from "../use-world-store";

export default function SharedFog() {
  const fogConfig = useWorldStore((state) => state.fogConfig);

  return <fogExp2 attach="fog" args={[fogConfig.color, fogConfig.density]} />;
}
export { SharedFog };
