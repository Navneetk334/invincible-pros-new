"use client";

import { create } from "zustand";

// ─── Types ──────────────────────────────────────────────────────────

export type DeviceNodeId = "phone" | "tablet" | "desktop" | "watch" | "cloud";

export type SyncPayload = {
  /** Unique message ID */
  id: string;
  /** Source device sending the data */
  from: DeviceNodeId;
  /** Destination device receiving the data */
  to: DeviceNodeId;
  /** Data label shown on stream */
  label: string;
  /** Normalized travel progress 0.0 → 1.0 */
  progress: number;
  /** Whether this packet is currently alive */
  alive: boolean;
};

export type DeviceState = {
  id: DeviceNodeId;
  label: string;
  /** Current sync activity level 0.0 – 1.0 */
  activity: number;
  /** Whether the device currently holds "focus" from a drag */
  dragging: boolean;
  /** Whether the device is currently receiving a packet */
  receiving: boolean;
};

// ─── Connection Map ──────────────────────────────────────────────────
// Defines which device pairs are connected by streams

export type Connection = { from: DeviceNodeId; to: DeviceNodeId };

export const SYNC_CONNECTIONS: Connection[] = [
  { from: "phone",   to: "cloud"   },
  { from: "tablet",  to: "cloud"   },
  { from: "desktop", to: "cloud"   },
  { from: "watch",   to: "phone"   },
  { from: "cloud",   to: "desktop" },
  { from: "phone",   to: "tablet"  },
];

// ─── Zustand Store ───────────────────────────────────────────────────

interface SyncStore {
  devices: Record<DeviceNodeId, DeviceState>;
  packets: SyncPayload[];
  dragSource: DeviceNodeId | null;

  // Actions
  setActivity: (id: DeviceNodeId, level: number) => void;
  setDragging: (id: DeviceNodeId, value: boolean) => void;
  setReceiving: (id: DeviceNodeId, value: boolean) => void;
  spawnPacket: (from: DeviceNodeId, to: DeviceNodeId, label: string) => void;
  tickPackets: (delta: number) => void;
  startDrag: (id: DeviceNodeId) => void;
  endDrag: (target: DeviceNodeId | null) => void;
}

let packetCounter = 0;

const INITIAL_DEVICES: Record<DeviceNodeId, DeviceState> = {
  phone:   { id: "phone",   label: "HANDSET",  activity: 0, dragging: false, receiving: false },
  tablet:  { id: "tablet",  label: "TABLET",   activity: 0, dragging: false, receiving: false },
  desktop: { id: "desktop", label: "WORKSTATION", activity: 0, dragging: false, receiving: false },
  watch:   { id: "watch",   label: "WEARABLE", activity: 0, dragging: false, receiving: false },
  cloud:   { id: "cloud",   label: "CLOUD.CORE", activity: 0, dragging: false, receiving: false },
};

export const useSyncStore = create<SyncStore>((set, get) => ({
  devices: INITIAL_DEVICES,
  packets: [],
  dragSource: null,

  setActivity: (id, level) =>
    set((state) => ({
      devices: {
        ...state.devices,
        [id]: { ...state.devices[id], activity: level },
      },
    })),

  setDragging: (id, value) =>
    set((state) => ({
      devices: {
        ...state.devices,
        [id]: { ...state.devices[id], dragging: value },
      },
    })),

  setReceiving: (id, value) =>
    set((state) => ({
      devices: {
        ...state.devices,
        [id]: { ...state.devices[id], receiving: value },
      },
    })),

  spawnPacket: (from, to, label) => {
    const newPacket: SyncPayload = {
      id: `pkt-${++packetCounter}`,
      from,
      to,
      label,
      progress: 0,
      alive: true,
    };
    set((state) => ({ packets: [...state.packets, newPacket] }));

    // Mark source as active
    get().setActivity(from, 1.0);
    get().setReceiving(to, true);

    // Clear receiving flag on arrival after ~2s
    setTimeout(() => {
      get().setReceiving(to, false);
      get().setActivity(from, 0.2);
    }, 2000);
  },

  tickPackets: (delta) => {
    const speed = 0.35; // normalized units per second
    set((state) => ({
      packets: state.packets
        .map((p) => ({ ...p, progress: p.progress + delta * speed }))
        .filter((p) => p.progress < 1.05), // remove completed packets
    }));
  },

  startDrag: (id) => {
    set({ dragSource: id });
    get().setDragging(id, true);
  },

  endDrag: (target) => {
    const source = get().dragSource;
    if (source && target && source !== target) {
      get().spawnPacket(source, target, "STATE.PUSH");
    }
    if (source) get().setDragging(source, false);
    set({ dragSource: null });
  },
}));
