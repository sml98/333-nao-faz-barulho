import { newPackage } from './packages';
export type Phase = 'MENU' | 'PLAYING' | 'PAUSED' | 'WON' | 'LOST';
export class GameState {
  phase: Phase = 'MENU';
  delivered = 0;
  held = false;
  hidden: string | null = null;
  box = newPackage();
  total = 1;
  time = 0;
  reset(total = 1) {
    this.phase = 'PLAYING';
    this.delivered = 0;
    this.held = false;
    this.hidden = null;
    this.box = newPackage();
    this.total = total;
    this.time = 0;
  }
  pickup() {
    if (this.phase !== 'PLAYING' || this.held || this.delivered >= this.total) return false;
    this.held = true;
    this.box = newPackage(this.delivered);
    return true;
  }
  deliver(id: string) {
    if (this.phase !== 'PLAYING' || !this.held || id !== String(301 + this.delivered)) return false;
    this.delivered++;
    this.held = false;
    return true;
  }
  finish() {
    if (this.phase === 'PLAYING' && this.delivered === this.total && !this.held) {
      this.phase = 'WON';
      return true;
    }
    return false;
  }
}
