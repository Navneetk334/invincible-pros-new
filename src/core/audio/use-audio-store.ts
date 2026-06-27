import { create } from "zustand";

class ProceduralSynth {
  ctx: AudioContext | null = null;
  humGain: GainNode | null = null;
  windGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Start ambient loops
    this.startHum();
    this.startWind();
  }

  startHum() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 55.0; // 55Hz Hum (A1)
    
    filter.type = "lowpass";
    filter.frequency.value = 110.0;

    gain.gain.value = 0.05; // very subtle
    this.humGain = gain;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
  }

  startWind() {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Procedural White Noise Buffer
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 350;
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.025; // ambient wind layer
    this.windGain = gain;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();

    // Modulate filter frequency slowly to simulate wind gusts
    const modulate = () => {
      if (!this.ctx) return;
      const targetFreq = 180 + Math.random() * 350;
      filter.frequency.exponentialRampToValueAtTime(
        targetFreq,
        this.ctx.currentTime + 4.0 + Math.random() * 2.0
      );
      // Continuous procedural sweep loops
      setTimeout(modulate, 6000);
    };
    modulate();
  }

  playClick() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playLock() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(75, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playPulse() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.75);
  }
}

export const synth = typeof window !== "undefined" ? new ProceduralSynth() : null;

interface AudioState {
  unlocked: boolean;
  unlock: () => void;
  playClick: () => void;
  playLock: () => void;
  playPulse: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  unlocked: false,
  
  unlock: () => {
    if (get().unlocked) return;
    if (synth) {
      synth.init();
      // Resume context if suspended by browser
      if (synth.ctx && synth.ctx.state === "suspended") {
        synth.ctx.resume();
      }
    }
    set({ unlocked: true });
  },

  playClick: () => {
    if (synth) {
      synth.playClick();
    }
  },

  playLock: () => {
    if (synth) {
      synth.playLock();
    }
  },

  playPulse: () => {
    if (synth) {
      synth.playPulse();
    }
  },
}));
export default useAudioStore;
