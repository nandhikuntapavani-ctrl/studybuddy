/**
 * Web Audio API Sound Generator
 * Generates notification chimes and focus ambient sounds procedurally.
 * No external mp3/wav files required — runs 100% offline and reliably!
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.currentAmbientType = null;
    this.isMuted = false;
    this.masterVolume = 0.7;
    this.ambientVolume = 0.5;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Chimes & Notifications ---
  playNotification(type = 'tibetan') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      switch (type) {
        case 'tibetan':
          this.playTibetanBowl(now);
          break;
        case 'crystal':
          this.playCrystalChime(now);
          break;
        case 'digital':
          this.playDigitalBeep(now);
          break;
        case 'marimba':
          this.playMarimba(now);
          break;
        default:
          this.playTibetanBowl(now);
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playTibetanBowl(now) {
    const freqs = [293.66, 587.33, 880.0, 1174.66]; // D4 and harmonics
    const gains = [0.4, 0.25, 0.15, 0.08];

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gains[i] * this.masterVolume, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  playCrystalChime(now) {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const startTime = now + index * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.9);
    });
  }

  playDigitalBeep(now) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1760, now + 0.12);

    gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
    gain.gain.setValueAtTime(0.25 * this.masterVolume, now + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  playMarimba(now) {
    const freqs = [440, 554.37, 659.25];
    freqs.forEach((freq, idx) => {
      const start = now + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.35 * this.masterVolume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.46);
    });
  }

  // --- UI Click / Flip / Success Sounds ---
  playCardFlip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

      gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  playSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2 * this.masterVolume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.32);
      });
    } catch (e) {}
  }

  playError() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.2);

      gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  // --- Ambient Background Generator ---
  startAmbient(type) {
    this.initContext();
    if (!this.ctx) return;

    this.stopAmbient();
    this.currentAmbientType = type;

    try {
      if (type === 'rain') {
        this.startRainAmbient();
      } else if (type === 'whitenoise') {
        this.startWhiteNoiseAmbient();
      } else if (type === 'focus40hz') {
        this.startBinauralFocus();
      } else if (type === 'campfire') {
        this.startCampfireAmbient();
      }
    } catch (e) {
      console.warn('Ambient error:', e);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        if (Array.isArray(this.ambientSource)) {
          this.ambientSource.forEach(s => {
            if (s.stop) s.stop();
            if (s.disconnect) s.disconnect();
          });
        } else {
          if (this.ambientSource.stop) this.ambientSource.stop();
          if (this.ambientSource.disconnect) this.ambientSource.disconnect();
        }
      } catch (e) {}
      this.ambientSource = null;
    }
    this.currentAmbientType = null;
  }

  startWhiteNoiseAmbient() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Gentle low-pass filter to make it pleasant (pink noise character)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * this.ambientVolume, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    this.ambientSource = [whiteNoise, filter, gain];
    this.ambientGain = gain;
  }

  startRainAmbient() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter1.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18 * this.ambientVolume, this.ctx.currentTime);

    rainSource.connect(filter1);
    filter1.connect(gain);
    gain.connect(this.ctx.destination);

    rainSource.start();
    this.ambientSource = [rainSource, filter1, gain];
    this.ambientGain = gain;
  }

  startCampfireAmbient() {
    // Warm low rumble + random crackle
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Crackle bursts
      const r = Math.random();
      output[i] = (r > 0.985 ? (Math.random() * 2 - 1) * 3 : 0) + (Math.random() * 0.15 - 0.075);
    }

    const crackle = this.ctx.createBufferSource();
    crackle.buffer = noiseBuffer;
    crackle.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2 * this.ambientVolume, this.ctx.currentTime);

    crackle.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    crackle.start();
    this.ambientSource = [crackle, filter, gain];
    this.ambientGain = gain;
  }

  startBinauralFocus() {
    // 40Hz Gamma frequency beat (200Hz Left, 240Hz Right) for deep focus
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const merger = this.ctx.createChannelMerger(2);
    const gain = this.ctx.createGain();

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(200, this.ctx.currentTime);

    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(240, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08 * this.ambientVolume, this.ctx.currentTime);

    oscL.connect(merger, 0, 0); // left ear
    oscR.connect(merger, 0, 1); // right ear

    merger.connect(gain);
    gain.connect(this.ctx.destination);

    oscL.start();
    oscR.start();

    this.ambientSource = [oscL, oscR, merger, gain];
    this.ambientGain = gain;
  }

  setAmbientVolume(val) {
    this.ambientVolume = Math.max(0, Math.min(1, val));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(0.18 * this.ambientVolume, this.ctx.currentTime);
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
  }
}

// Global Sound Instance
window.soundEngine = new SoundEngine();
