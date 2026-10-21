import { distance, type Point } from './config';
export interface NoiseEvent {
  position: Point & { y: number };
  loudness: number;
  radius: number;
  sourceId: string;
  timestamp: number;
  ttl: number;
  id: number;
}
export function chooseNoise(events: NoiseEvent[], listener: Point, now: number) {
  return events
    .filter((e) => now - e.timestamp <= e.ttl && distance(e.position, listener) <= e.radius)
    .sort(
      (a, b) =>
        b.loudness / (1 + distance(b.position, listener)) -
        a.loudness / (1 + distance(a.position, listener)),
    )[0];
}
export class AudioBus {
  context: AudioContext | null = null;
  enabled = true;
  unlock() {
    try {
      this.context ??= new AudioContext();
      void this.context.resume();
    } catch {
      /* Visual signals stay available. */
    }
  }
  tone(frequency: number, duration = 0.15, volume = 0.04) {
    if (!this.context || !this.enabled) return;
    const c = this.context,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(frequency, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(frequency * 0.6, c.currentTime + duration);
    g.gain.setValueAtTime(volume, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + duration);
  }
}
