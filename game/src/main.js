// Deco Vault Heist — game loop, input, and the state machine.
// Screens: title -> play -> win / caught. ?shot=cover|tools|vault|win sets up a
// deterministic scene and freezes it, so screenshots are real renders of real states.

import { CANVAS_W, CANVAS_H, GUARDS, CAMERAS, LOOT, ALARM, THIEF } from './config.js';
import { Guard, GUARD_STATE } from './guards.js';
import { Camera } from './cameras.js';
import { Thief } from './thief.js';
import { SoundBank } from './audio.js';
import { render } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  screen: 'title',
  time: 0,
  alarm: 0,
  beingSeen: false,
  thief: new Thief(),
  guards: GUARDS.map((g) => new Guard(g)),
  cameras: CAMERAS.map((c) => new Camera(c)),
  loot: LOOT.map((l) => ({ ...l })),
  sounds: new SoundBank(),
  frozen: false,
  stepSoundLeft: 0,
};

const keys = {};
let mouse = { x: 0, y: 0 };

function reset() {
  game.screen = 'play';
  game.time = 0;
  game.alarm = 0;
  game.beingSeen = false;
  game.thief = new Thief();
  game.guards = GUARDS.map((g) => new Guard(g));
  game.cameras = CAMERAS.map((c) => new Camera(c));
  game.loot = LOOT.map((l) => ({ ...l }));
  game.frozen = false;
}

function fmtTime(t) {
  return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
}

// --- deterministic screenshot scenes -----------------------------------------

function applyShot(shot) {
  reset();
  game.frozen = true;
  if (shot === 'cover') {
    // Mid-heist: thief behind a pillar, a smoke cloud up, alarm at 35, gold taken.
    game.thief.place(430, 480, 100, false, false);
    game.thief.lootTaken.add('gold1');
    game.thief.smokes.push({ x: 560, y: 400, left: 3 });
    game.thief.inSmoke = false;
    game.alarm = 35;
    game.time = 72;
    game.guards[0].place(300, 330, 0.4, GUARD_STATE.PATROL);
    game.guards[1].place(640, 300, Math.PI / 2, GUARD_STATE.SUSPICIOUS);
    game.guards[2].place(980, 340, Math.PI * 0.85, GUARD_STATE.PATROL);
    game.cameras[0].place(0.9, 0);
    game.cameras[1].place(2.0, 0);
    game.beingSeen = true;
  } else if (shot === 'tools') {
    // Coin tossed, a guard turning to it, cameras jammed, smoke up.
    game.thief.place(700, 400, 150, false, false);
    game.thief.lootTaken.add('gold1');
    game.thief.lootTaken.add('cash1');
    game.thief.coinsLeft = 4;
    game.thief.smokeLeft = 1;
    game.thief.smokes.push({ x: 580, y: 500, left: 2.5 });
    game.thief.coinToss = { x: 820, y: 350, left: 2 };
    game.alarm = 20;
    game.time = 96;
    game.guards[0].place(300, 380, 0.3, GUARD_STATE.PATROL);
    game.guards[1].place(700, 300, 0.6, GUARD_STATE.INVESTIGATE);
    game.guards[1].investigateX = 820;
    game.guards[1].investigateY = 350;
    game.guards[2].place(980, 420, Math.PI * 0.8, GUARD_STATE.PATROL);
    game.cameras[0].place(1.1, 4);
    game.cameras[1].place(1.8, 4);
  } else if (shot === 'vault') {
    // At the vault, lockpick half done, a guard closing in, alarm 55.
    game.thief.place(640, 200, 250, false, false);
    game.thief.lootTaken.add('gold1');
    game.thief.lootTaken.add('gold2');
    game.thief.lootTaken.add('cash1');
    game.thief.vaultSeconds = 1.8;
    game.alarm = 55;
    game.time = 125;
    game.guards[0].place(300, 300, 0.5, GUARD_STATE.PATROL);
    game.guards[1].place(640, 330, Math.PI / 2, GUARD_STATE.CHASE);
    game.guards[2].place(980, 300, Math.PI * 0.7, GUARD_STATE.SUSPICIOUS);
    game.cameras[0].place(1.0, 0);
    game.cameras[1].place(1.9, 0);
    game.beingSeen = true;
  } else if (shot === 'win') {
    // Clean getaway: diamond taken, score breakdown on screen.
    game.thief.place(640, 655, 800, true, true);
    for (const item of LOOT) game.thief.lootTaken.add(item.id);
    game.alarm = 22;
    game.time = 120;
    game.screen = 'win';
    game.guards[0].place(300, 250, 0.4, GUARD_STATE.PATROL);
    game.guards[1].place(640, 300, Math.PI / 2, GUARD_STATE.PATROL);
    game.guards[2].place(980, 250, Math.PI * 0.8, GUARD_STATE.PATROL);
    game.cameras[0].place(0.9, 0);
    game.cameras[1].place(2.0, 0);
  }
  render(ctx, game);
}

// --- input -------------------------------------------------------------------

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  keys[k] = true;
  if (k === 'enter' && game.screen === 'title') {
    reset();
  } else if (k === 'r' && (game.screen === 'win' || game.screen === 'caught')) {
    reset();
  } else if (k === 'm') {
    game.sounds.toggleMute();
  } else if (game.screen === 'play') {
    if (k === '1') {
      if (game.thief.useSmoke()) game.sounds.smoke();
    } else if (k === '2') {
      if (game.thief.tossCoin(mouse.x, mouse.y)) {
        game.sounds.coin();
        const g = nearestGuard(mouse.x, mouse.y);
        if (g) g.investigate(mouse.x, mouse.y);
      }
    } else if (k === '3') {
      if (game.thief.useEmp(game.cameras)) game.sounds.emp();
    } else if (k === 'e') {
      if (game.thief.tryVent()) game.sounds.smoke();
    }
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - r.left) / r.width) * CANVAS_W;
  mouse.y = ((e.clientY - r.top) / r.height) * CANVAS_H;
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
  if (game.screen !== 'play') return;
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * CANVAS_W;
  const y = ((e.clientY - r.top) / r.height) * CANVAS_H;
  if (e.button === 2) {
    if (game.thief.tossCoin(x, y)) {
      game.sounds.coin();
      const g = nearestGuard(x, y);
      if (g) g.investigate(x, y);
    }
  }
});

function nearestGuard(x, y) {
  let best = null;
  let bestD = Infinity;
  for (const g of game.guards) {
    const d = Math.hypot(g.x - x, g.y - y);
    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }
  return bestD < 320 ? best : null;
}

// --- the loop ----------------------------------------------------------------

let last = performance.now();
let wasSeen = false;

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.frozen && game.screen === 'play') {
    game.time += dt;
    const events = game.thief.update(dt, keys, mouse);
    for (const g of game.guards) g.update(dt, game.thief);
    for (const c of game.cameras) c.update(dt, game.time);

    // Footsteps.
    if (game.thief.moving) {
      game.stepSoundLeft -= dt;
      if (game.stepSoundLeft <= 0) {
        game.stepSoundLeft = game.thief.sneaking ? 0.55 : 0.34;
        game.sounds.step();
      }
    }

    // Vault lockpick.
    const vault = game.thief.channelVault(dt, !!keys['e']);
    if (vault === 'open') game.sounds.vault();

    // Loot.
    const taken = game.thief.collectLoot(game.loot);
    if (taken) {
      if (taken.id === 'diamond') game.sounds.diamond();
      else game.sounds.pickup();
    }

    // Detection: every observer that sees the thief pushes the alarm up.
    let worst = 0;
    for (const g of game.guards) worst = Math.max(worst, g.seeStrength(game.thief.x, game.thief.y, game.thief.inSmoke, game.thief.sneaking));
    for (const c of game.cameras) worst = Math.max(worst, c.seeStrength(game.thief.x, game.thief.y, game.thief.inSmoke, game.thief.sneaking));
    game.beingSeen = worst > 0;
    if (worst > 0) {
      game.alarm = Math.min(ALARM.max, game.alarm + ALARM.risePerSecond * (0.4 + worst) * dt);
      if (!wasSeen) game.sounds.spotted();
    } else {
      game.alarm = Math.max(0, game.alarm - ALARM.decayPerSecond * dt);
    }
    wasSeen = game.beingSeen;

    if (game.alarm >= ALARM.max) {
      game.screen = 'caught';
      game.sounds.caught();
    } else if (game.thief.escaped) {
      game.screen = 'win';
      game.sounds.win();
    }
  } else if (game.screen === 'title') {
    game.time += dt;
  }
  render(ctx, game);
  requestAnimationFrame(tick);
}

// Boot: a ?shot= scene renders once, frozen; otherwise the title screen runs.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(shot);
} else {
  render(ctx, game);
  requestAnimationFrame(tick);
}
