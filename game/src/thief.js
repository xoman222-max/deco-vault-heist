// The thief: movement, sneaking, tools that cost something, and the loot run.
// Tools: smoke (blocks vision), coin (lures a guard), EMP (kills the cameras),
// and the service vent (a hidden crawl from one grate to the other).

import { THIEF, TOOLS, VENT, DIAMOND } from './config.js';
import { clampToField, moveCircle, nearVault, atExit, nearVent, dist } from './world.js';

export class Thief {
  constructor() {
    this.x = THIEF.x;
    this.y = THIEF.y;
    this.r = THIEF.r;
    this.angle = -Math.PI / 2;
    this.sneaking = false;
    this.inSmoke = false;
    this.smokeLeft = TOOLS.smoke.start;
    this.coinsLeft = TOOLS.coin.start;
    this.empLeft = TOOLS.emp.start;
    this.smokes = []; // {x, y, left}
    this.coinToss = null; // {x, y, left}
    this.vaultSeconds = 0; // lockpick channel progress (0..3)
    this.vaultOpen = false;
    this.hasDiamond = false;
    this.loot = 0;
    this.lootTaken = new Set();
    this.ventLeft = 0; // seconds left crawling the vent
    this.ventFrom = null;
    this.ventTo = null;
    this.moving = false;
  }

  place(x, y, loot, vaultOpen, hasDiamond) {
    this.x = x;
    this.y = y;
    this.loot = loot || 0;
    this.vaultOpen = !!vaultOpen;
    this.hasDiamond = !!hasDiamond;
  }

  // Step the thief from keyboard input. Returns events for sound + HUD.
  update(dt, keys, mouse) {
    const events = [];
    if (this.ventLeft > 0) {
      this.ventLeft -= dt;
      if (this.ventLeft <= 0 && this.ventTo) {
        this.x = this.ventTo.x;
        this.y = this.ventTo.y;
        this.ventTo = null;
        events.push('vent-out');
      }
      return events;
    }

    let mx = 0;
    let my = 0;
    if (keys['arrowleft'] || keys['a']) mx -= 1;
    if (keys['arrowright'] || keys['d']) mx += 1;
    if (keys['arrowup'] || keys['w']) my -= 1;
    if (keys['arrowdown'] || keys['s']) my += 1;
    this.sneaking = !!keys['shift'];
    this.moving = mx !== 0 || my !== 0;
    if (this.moving) {
      const len = Math.hypot(mx, my);
      const speed = this.sneaking ? THIEF.sneakSpeed : THIEF.speed;
      const pos = moveCircle(this.x, this.y, this.r, (mx / len) * speed * dt, (my / len) * speed * dt);
      const clamped = clampToField(pos.x, pos.y, this.r);
      this.x = clamped.x;
      this.y = clamped.y;
      this.angle = Math.atan2(my, mx);
    }

    // Smoke clouds fade; the thief is hidden while standing in one.
    this.inSmoke = false;
    for (const s of this.smokes) {
      s.left -= dt;
      if (dist(this.x, this.y, s.x, s.y) < TOOLS.smoke.radius) this.inSmoke = true;
    }
    this.smokes = this.smokes.filter((s) => s.left > 0);
    if (this.coinToss) {
      this.coinToss.left -= dt;
      if (this.coinToss.left <= 0) this.coinToss = null;
    }
    return events;
  }

  useSmoke() {
    if (this.smokeLeft <= 0) return false;
    this.smokeLeft -= 1;
    this.smokes.push({ x: this.x, y: this.y, left: TOOLS.smoke.seconds });
    this.inSmoke = true;
    return true;
  }

  tossCoin(x, y) {
    if (this.coinsLeft <= 0) return false;
    this.coinsLeft -= 1;
    this.coinToss = { x, y, left: 3 };
    return true;
  }

  useEmp(cameras) {
    if (this.empLeft <= 0) return false;
    this.empLeft -= 1;
    for (const c of cameras) c.disable(TOOLS.emp.seconds);
    return true;
  }

  // Start a vent crawl when standing by a grate. Returns true when started.
  tryVent() {
    if (this.ventLeft > 0) return false;
    if (nearVent(this.x, this.y, 'a')) {
      this.ventFrom = VENT.a;
      this.ventTo = VENT.b;
      this.ventLeft = VENT.crawlSeconds;
      return true;
    }
    if (nearVent(this.x, this.y, 'b')) {
      this.ventFrom = VENT.b;
      this.ventTo = VENT.a;
      this.ventLeft = VENT.crawlSeconds;
      return true;
    }
    return false;
  }

  // Hold E at the vault to pick the lock. Returns 'open' the moment it opens.
  channelVault(dt, holding) {
    if (this.vaultOpen) return null;
    if (holding && nearVault(this.x, this.y)) {
      this.vaultSeconds += dt;
      if (this.vaultSeconds >= 3) {
        this.vaultOpen = true;
        return 'open';
      }
      return 'picking';
    }
    this.vaultSeconds = Math.max(0, this.vaultSeconds - dt * 2);
    return null;
  }

  // Walk over loot to take it. Returns the loot item taken, or null.
  collectLoot(items) {
    for (const item of items) {
      if (this.lootTaken.has(item.id)) continue;
      if (dist(this.x, this.y, item.x, item.y) < 34) {
        this.lootTaken.add(item.id);
        this.loot += item.value;
        return item;
      }
    }
    if (!this.hasDiamond && this.vaultOpen && dist(this.x, this.y, DIAMOND.x, DIAMOND.y) < 34) {
      this.hasDiamond = true;
      this.loot += DIAMOND.value;
      return { id: 'diamond', x: DIAMOND.x, y: DIAMOND.y, value: DIAMOND.value, label: 'The Diamond' };
    }
    return null;
  }

  get escaped() {
    return this.hasDiamond && atExit(this.x, this.y);
  }
}
