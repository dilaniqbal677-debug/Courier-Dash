/**
 * Procedural Spatial Audio Manager for City Ambience
 * 100% procedural Web Audio API synthesis - Zero external files (0 404s guaranteed)
 */

import * as THREE from 'three';

export class AudioManager {
  private listener: THREE.AudioListener;
  private ambientSound: THREE.Audio | null = null;
  private isStarted: boolean = false;

  constructor(camera: THREE.Camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.initProceduralAmbientSound();
  }

  private initProceduralAmbientSound() {
    try {
      const ctx = this.listener.context;
      if (!ctx) return;

      this.ambientSound = new THREE.Audio(this.listener);

      // Synthesize 6-second seamless looping stereo city ambient buffer
      const duration = 6.0;
      const sampleRate = ctx.sampleRate || 44100;
      const bufferSize = Math.floor(sampleRate * duration);
      const audioBuffer = ctx.createBuffer(2, bufferSize, sampleRate);

      const leftChannel = audioBuffer.getChannelData(0);
      const rightChannel = audioBuffer.getChannelData(1);

      // Pink noise / brownian noise generator for distant city traffic rush
      let b0L = 0, b1L = 0, b2L = 0;
      let b0R = 0, b1R = 0, b2R = 0;

      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;

        // 3-pole pinking filter
        b0L = 0.99765 * b0L + whiteL * 0.0555179;
        b1L = 0.96300 * b1L + whiteL * 0.0750759;
        b2L = 0.57000 * b2L + whiteL * 0.1538520;
        const pinkL = (b0L + b1L + b2L) * 0.18;

        b0R = 0.99765 * b0R + whiteR * 0.0555179;
        b1R = 0.96300 * b1R + whiteR * 0.0750759;
        b2R = 0.57000 * b2R + whiteR * 0.1538520;
        const pinkR = (b0R + b1R + b2R) * 0.18;

        // Subtle low frequency wave simulating passing distant traffic rush & wind breeze
        const t = i / sampleRate;
        const wave = Math.sin(t * Math.PI * 2 * (1 / duration)) * 0.08 +
                     Math.sin(t * Math.PI * 4 * (1 / duration)) * 0.04;

        // Crossfade edges for click-free seamless looping
        const fadeLen = Math.floor(sampleRate * 0.2);
        let env = 1.0;
        if (i < fadeLen) env = i / fadeLen;
        else if (i > bufferSize - fadeLen) env = (bufferSize - i) / fadeLen;

        leftChannel[i] = (pinkL + wave) * 0.12 * env;
        rightChannel[i] = (pinkR + wave) * 0.12 * env;
      }

      this.ambientSound.setBuffer(audioBuffer);
      this.ambientSound.setLoop(true);
      this.ambientSound.setVolume(0.22);
    } catch {
      // AudioContext policy fallback
    }
  }

  public start() {
    if (this.isStarted || !this.ambientSound) return;
    try {
      const ctx = this.listener.context;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      this.ambientSound.play();
      this.isStarted = true;
    } catch {
      // Handled
    }
  }

  public updateVolume(courierZ: number) {
    if (!this.ambientSound) return;
    if (!this.isStarted) {
      this.start();
    }
    // Subtle volume modulation as runner sprints down the city
    const speedVariation = 0.22 + Math.min(0.12, Math.abs(courierZ) * 0.00008);
    this.ambientSound.setVolume(speedVariation);
  }

  public dispose() {
    if (this.ambientSound) {
      try {
        this.ambientSound.stop();
        this.ambientSound.disconnect();
      } catch {}
      this.ambientSound = null;
    }
  }
}
