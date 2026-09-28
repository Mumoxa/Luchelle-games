/* Tiny WebAudio synth — all sounds generated, no assets needed. */
class Sfx {
  private ctx: AudioContext | null = null;
  muted = false;

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  private tone(f0: number, f1: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
    if (!this.ctx || this.muted) return;
    try {
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(Math.max(1, f0), t);
      o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.03);
    } catch {
      /* ignore audio errors */
    }
  }

  click() { this.tone(620, 520, 0.07, "triangle", 0.14); }
  pop(i = 0) { const v = (i % 5) * 35; this.tone(320 + v, 660 + v, 0.12, "triangle", 0.26); }
  move() { this.tone(430, 490, 0.05, "square", 0.07); }
  bump() { this.tone(170, 90, 0.13, "square", 0.16); }
  place() { this.tone(520, 690, 0.09, "triangle", 0.2); }
  erase() { this.tone(320, 210, 0.08, "triangle", 0.14); }
  correct() { [523, 659, 784].forEach((f, i) => this.tone(f, f, 0.13, "triangle", 0.22, i * 0.07)); }
  bigCorrect() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.16, "triangle", 0.24, i * 0.08));
    this.tone(2093, 2093, 0.22, "sine", 0.09, 0.34);
  }
  wrong() { this.tone(220, 105, 0.3, "sawtooth", 0.16); this.tone(185, 92, 0.3, "square", 0.09, 0.02); }
  levelup() { [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.15, "triangle", 0.23, i * 0.09)); }
  gameover() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, f * 0.98, 0.24, "triangle", 0.2, i * 0.17)); }
  win() { [523, 659, 784, 659, 1047, 1319].forEach((f, i) => this.tone(f, f, 0.14, "triangle", 0.22, i * 0.09)); }
}

export const sfx = new Sfx();
