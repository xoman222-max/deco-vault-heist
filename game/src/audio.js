// Sound: tiny WebAudio synth effects, no audio files, nothing over the network.
// M toggles mute. Every effect is a short oscillator/noise burst.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  blip(freq, seconds, type, gain) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + seconds);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + seconds + 0.02);
  }

  noise(seconds, gain) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain || 0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + seconds);
    src.connect(g);
    g.connect(ctx.destination);
    src.start(t);
  }

  step() { this.noise(0.05, 0.03); }
  coin() { this.blip(1320, 0.12, 'triangle', 0.1); }
  pickup() { this.blip(880, 0.1, 'sine', 0.12); this.blip(1318, 0.16, 'sine', 0.1); }
  diamond() { this.blip(1046, 0.14, 'sine', 0.12); this.blip(1318, 0.14, 'sine', 0.12); this.blip(1568, 0.22, 'sine', 0.1); }
  smoke() { this.noise(0.35, 0.08); }
  emp() { this.blip(220, 0.3, 'sawtooth', 0.08); }
  vault() { this.blip(196, 0.2, 'square', 0.08); this.blip(147, 0.3, 'square', 0.08); }
  spotted() { this.blip(660, 0.12, 'square', 0.1); this.blip(880, 0.12, 'square', 0.1); }
  alarm() { this.blip(440, 0.25, 'sawtooth', 0.1); this.blip(330, 0.35, 'sawtooth', 0.1); }
  win() { this.blip(523, 0.15, 'sine', 0.12); this.blip(659, 0.15, 'sine', 0.12); this.blip(784, 0.3, 'sine', 0.12); }
  caught() { this.blip(392, 0.2, 'sawtooth', 0.1); this.blip(311, 0.25, 'sawtooth', 0.1); this.blip(233, 0.4, 'sawtooth', 0.1); }
}
