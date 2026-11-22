// Guards: patrol waypoints, sweep their vision cones, and react to what they see.
// States: patrol -> suspicious (a glimpse) -> chase (a clear sighting) -> patrol.

import { hasLineOfSight, dist } from './world.js';

export const GUARD_STATE = { PATROL: 'patrol', SUSPICIOUS: 'suspicious', CHASE: 'chase', INVESTIGATE: 'investigate' };

export class Guard {
  constructor(def) {
    this.name = def.name;
    this.waypoints = def.waypoints;
    this.speed = def.speed;
    this.range = def.range;
    this.halfAngle = def.halfAngle;
    this.pauseSeconds = def.pauseSeconds;
    this.x = def.waypoints[0][0];
    this.y = def.waypoints[0][1];
    this.targetIndex = 1;
    this.angle = Math.PI / 2; // facing down the room
    this.state = GUARD_STATE.PATROL;
    this.pauseLeft = 0;
    this.suspicion = 0; // 0..1, builds while the thief is glimpsed
    this.loseSightLeft = 0;
    this.investigateX = 0;
    this.investigateY = 0;
    this.investigateLeft = 0;
    this.lookAngle = this.angle;
    this.lookTimer = 0;
  }

  // Place the guard exactly (used by deterministic screenshot setups).
  place(x, y, angle, state) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    if (state) this.state = state;
  }

  // Can this guard see the point (tx, ty)? Range, cone and line of sight.
  canSee(tx, ty, inSmoke) {
    if (inSmoke) return false;
    const d = dist(this.x, this.y, tx, ty);
    if (d > this.range) return false;
    let a = Math.atan2(ty - this.y, tx - this.x) - this.angle;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    if (Math.abs(a) > this.halfAngle) return false;
    return hasLineOfSight(this.x, this.y, tx, ty);
  }

  // How strongly the guard sees the thief right now: 0 (blind) to 1 (point blank).
  seeStrength(tx, ty, inSmoke, sneaking) {
    if (!this.canSee(tx, ty, inSmoke)) return 0;
    const d = dist(this.x, this.y, tx, ty);
    let s = 1 - d / this.range;
    if (sneaking) s *= 0.5;
    return Math.max(0, Math.min(1, s));
  }

  // Send the guard to look at a thrown coin.
  investigate(x, y) {
    if (this.state === GUARD_STATE.CHASE) return;
    this.state = GUARD_STATE.INVESTIGATE;
    this.investigateX = x;
    this.investigateY = y;
    this.investigateLeft = 2.5;
  }

  update(dt, thief) {
    const seen = this.seeStrength(thief.x, thief.y, thief.inSmoke, thief.sneaking);
    if (seen > 0) {
      this.suspicion = Math.min(1, this.suspicion + seen * dt * 1.6);
      this.loseSightLeft = 2;
      if (this.suspicion > 0.55) this.state = GUARD_STATE.CHASE;
      else if (this.state === GUARD_STATE.PATROL) this.state = GUARD_STATE.SUSPICIOUS;
    } else {
      this.suspicion = Math.max(0, this.suspicion - dt * 0.4);
      this.loseSightLeft -= dt;
      if (this.state === GUARD_STATE.CHASE && this.loseSightLeft <= 0) {
        this.state = GUARD_STATE.PATROL;
        this.suspicion = 0;
      } else if (this.state === GUARD_STATE.SUSPICIOUS && this.suspicion <= 0) {
        this.state = GUARD_STATE.PATROL;
      }
    }

    if (this.state === GUARD_STATE.CHASE) {
      this.chase(dt, thief);
    } else if (this.state === GUARD_STATE.INVESTIGATE) {
      this.walkTo(dt, this.investigateX, this.investigateY, this.speed * 0.9);
      this.investigateLeft -= dt;
      if (this.investigateLeft <= 0 || dist(this.x, this.y, this.investigateX, this.investigateY) < 12) {
        this.state = GUARD_STATE.PATROL;
      }
    } else {
      this.patrol(dt);
    }
  }

  chase(dt, thief) {
    this.walkTo(dt, thief.x, thief.y, this.speed * 1.35);
  }

  patrol(dt) {
    if (this.pauseLeft > 0) {
      this.pauseLeft -= dt;
      // Look around while pausing at a waypoint.
      this.lookTimer -= dt;
      if (this.lookTimer <= 0) {
        this.lookTimer = 0.9;
        this.lookAngle = this.angle + (Math.random() - 0.5) * 1.6;
      }
      this.angle = this.lookAngle;
      return;
    }
    const wp = this.waypoints[this.targetIndex];
    const arrived = this.walkTo(dt, wp[0], wp[1], this.speed);
    if (arrived) {
      this.targetIndex = (this.targetIndex + 1) % this.waypoints.length;
      this.pauseLeft = this.pauseSeconds;
      this.lookTimer = 0;
    }
  }

  // Walk toward (tx, ty) at speed; returns true when arrived.
  walkTo(dt, tx, ty, speed) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) return true;
    const step = Math.min(d, speed * dt);
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
    this.angle = Math.atan2(dy, dx);
    return d - step < 4;
  }
}
