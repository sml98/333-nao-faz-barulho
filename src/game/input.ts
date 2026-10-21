export class Input {
  keys = new Set<string>();
  stick = { x: 0, y: 0 };
  yaw = 0;
  pitch = 0.17;
  shush = false;
  run = false;
  interact = false;
  pause = false;
  stickId: number | null = null;
  cameraId: number | null = null;
  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Escape'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'KeyE') this.interact = true;
      if (e.code === 'Escape') this.pause = true;
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.clear();
      this.pause = true;
    });
    canvas.addEventListener('pointerdown', (e) => {
      this.cameraId = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (this.cameraId === e.pointerId || document.pointerLockElement === canvas) {
        this.yaw -= e.movementX * 0.005;
        this.pitch = Math.max(-0.05, Math.min(0.65, this.pitch + e.movementY * 0.003));
      }
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId === this.cameraId) this.cameraId = null;
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    const joystick = document.querySelector<HTMLElement>('#joystick')!,
      knob = document.querySelector<HTMLElement>('#knob')!;
    const update = (e: PointerEvent) => {
      const b = joystick.getBoundingClientRect(),
        dx = (e.clientX - b.x - b.width / 2) / 45,
        dy = (e.clientY - b.y - b.height / 2) / 45,
        l = Math.max(1, Math.hypot(dx, dy));
      this.stick = { x: dx / l, y: dy / l };
      knob.style.transform = `translate(${this.stick.x * 38}px,${this.stick.y * 38}px)`;
    };
    joystick.addEventListener('pointerdown', (e) => {
      if (this.stickId !== null) return;
      this.stickId = e.pointerId;
      joystick.setPointerCapture(e.pointerId);
      update(e);
    });
    joystick.addEventListener('pointermove', (e) => {
      if (this.stickId === e.pointerId) update(e);
    });
    const stop = (e: PointerEvent) => {
      if (this.stickId === e.pointerId) {
        this.stickId = null;
        this.stick = { x: 0, y: 0 };
        knob.style.transform = '';
      }
    };
    joystick.addEventListener('pointerup', stop);
    joystick.addEventListener('pointercancel', stop);
    joystick.addEventListener('lostpointercapture', stop);
    for (const [id, prop] of [
      ['shush', 'shush'],
      ['run', 'run'],
    ] as const) {
      const b = document.querySelector<HTMLElement>('#' + id)!;
      b.addEventListener('pointerdown', (e) => {
        b.setPointerCapture(e.pointerId);
        this[prop] = true;
        b.classList.add('pressed');
      });
      for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture'])
        b.addEventListener(ev, () => {
          this[prop] = false;
          b.classList.remove('pressed');
        });
    }
    document.querySelector('#interact')!.addEventListener('click', () => (this.interact = true));
    document.querySelector('#pause')!.addEventListener('click', () => (this.pause = true));
  }
  get quiet() {
    return this.shush || this.keys.has('Space');
  }
  get running() {
    return this.run || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }
  movement() {
    let x = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0) + this.stick.x;
    let y = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0) - this.stick.y;
    const n = Math.max(1, Math.hypot(x, y));
    x /= n;
    y /= n;
    return {
      x: x * Math.cos(this.yaw) + y * Math.sin(this.yaw),
      z: -x * Math.sin(this.yaw) + y * Math.cos(this.yaw),
      moving: Math.hypot(x, y) > 0.1,
    };
  }
  clear() {
    this.keys.clear();
    this.stick = { x: 0, y: 0 };
    this.shush = false;
    this.run = false;
    this.interact = false;
    this.pause = false;
    this.stickId = null;
    this.cameraId = null;
    document.querySelector<HTMLElement>('#knob')!.style.transform = '';
  }
}
