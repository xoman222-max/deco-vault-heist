// Security cameras: wall-mounted, sweeping their red cones across the room.
// An EMP jammer freezes them dark for a few seconds.

import { hasLineOfSight, dist } from './world.js';

export class Camera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.from = def.from;
    this.to = def.to;
    this.period = def.period;
    this.range = def.range;
    this.halfAngle = def.halfAngle;
    this.phase = Math.random() * Math.PI * 2;
    this.angle = (def.from + def.to) / 2;
    this.disabledLeft = 0;
  }

  place(angle, disabledLeft) {
    this.angle = angle;
    this.disabledLeft = disabledLeft || 0;
  }

  disable(seconds) {
    this.disabledLeft = Math.max(this.disabledLeft, seconds);
  }

  get disabled() {
    return this.disabledLeft > 0;
  }

  update(dt, time) {
    if (this.disabledLeft > 0) {
      this.disabledLeft -= dt;
      return;
    }
    // Smooth ping-pong sweep between the arc ends.
    const t = (time / this.period + this.phase / (Math.PI * 2)) % 2;
    const k = t < 1 ? t : 2 - t;
    const eased = k * k * (3 - 2 * k);
    this.angle = this.from + (this.to - this.from) * eased;
  }

  canSee(tx, ty, inSmoke) {
    if (this.disabled || inSmoke) return false;
    const d = dist(this.x, this.y, tx, ty);
    if (d > this.range) return false;
    let a = Math.atan2(ty - this.y, tx - this.x) - this.angle;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    if (Math.abs(a) > this.halfAngle) return false;
    return hasLineOfSight(this.x, this.y, tx, ty);
  }

  seeStrength(tx, ty, inSmoke, sneaking) {
    if (!this.canSee(tx, ty, inSmoke)) return 0;
    const d = dist(this.x, this.y, tx, ty);
    let s = 1 - d / this.range;
    if (sneaking) s *= 0.5;
    return Math.max(0, Math.min(1, s));
  }
}
