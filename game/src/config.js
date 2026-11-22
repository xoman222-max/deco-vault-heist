// Deco Vault Heist — configuration: room layout, patrols, loot, tools, palette.
// Art direction: 1920s Art Deco bank vault — black lacquer, gold leaf, teal marble.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// HUD bar (top) and hint bar (bottom) — the play field sits between them.
export const HUD_H = 64;
export const HINT_H = 20;
export const FIELD = { x: 40, y: 80, w: 1200, h: 600 };

// Entry / exit door (bottom centre) and the vault (top centre).
export const DOOR = { x: 600, y: 668, w: 80, h: 32 };
export const VAULT = { x: 560, y: 92, w: 160, h: 58 };
export const DIAMOND = { x: 640, y: 122, value: 500 };

// Cover that blocks both movement and vision (pillars + display cases).
export const COVER_RECTS = [
  { x: 200, y: 240, w: 46, h: 46, kind: 'pillar' },
  { x: 200, y: 420, w: 46, h: 46, kind: 'pillar' },
  { x: 1034, y: 240, w: 46, h: 46, kind: 'pillar' },
  { x: 1034, y: 420, w: 46, h: 46, kind: 'pillar' },
  { x: 300, y: 300, w: 120, h: 50, kind: 'case' },
  { x: 860, y: 300, w: 120, h: 50, kind: 'case' },
  { x: 320, y: 520, w: 90, h: 40, kind: 'table' },
  { x: 870, y: 520, w: 90, h: 40, kind: 'table' },
];

// Round cover (palms) — block movement and vision too.
export const COVER_CIRCLES = [
  { x: 120, y: 640, r: 28, kind: 'palm' },
  { x: 1160, y: 640, r: 28, kind: 'palm' },
];

// The service vent: crawl from the lower grate to the upper grate, hidden while inside.
export const VENT = {
  a: { x: 1215, y: 600 },
  b: { x: 1215, y: 200 },
  r: 22,
  crawlSeconds: 2,
};

// Guards: name, patrol waypoints, speed, vision range / half-angle.
export const GUARDS = [
  {
    name: 'Marco',
    waypoints: [[300, 200], [300, 500]],
    speed: 55, range: 175, halfAngle: 0.56, pauseSeconds: 1.2,
  },
  {
    name: 'Vera',
    waypoints: [[640, 250], [640, 520]],
    speed: 60, range: 180, halfAngle: 0.56, pauseSeconds: 1.2,
  },
  {
    name: 'Otto',
    waypoints: [[980, 200], [980, 500]],
    speed: 55, range: 175, halfAngle: 0.56, pauseSeconds: 1.2,
  },
];

// Wall cameras: mount point, sweep arc (radians), period, vision range / half-angle.
export const CAMERAS = [
  { x: 140, y: 100, from: 0.35, to: 1.92, period: 5.0, range: 230, halfAngle: 0.42 },
  { x: 1140, y: 100, from: 1.22, to: 2.79, period: 5.0, range: 230, halfAngle: 0.42 },
];

// Side loot (walk over to collect).
export const LOOT = [
  { id: 'gold1', x: 360, y: 325, value: 100, label: 'Gold bar' },
  { id: 'gold2', x: 920, y: 325, value: 100, label: 'Gold bar' },
  { id: 'cash1', x: 365, y: 540, value: 50, label: 'Cash' },
  { id: 'cash2', x: 915, y: 540, value: 50, label: 'Cash' },
];

// Tools: what the thief carries, and what each one costs.
export const TOOLS = {
  smoke: { start: 2, radius: 95, seconds: 4 },
  coin: { start: 5 },
  emp: { start: 1, seconds: 6 },
};

// Thief movement.
export const THIEF = {
  x: 640, y: 640, r: 13,
  speed: 175, sneakSpeed: 95,
};

// Alarm: rises while seen, decays while hidden; 100 means caught.
export const ALARM = {
  max: 100,
  risePerSecond: 30,
  decayPerSecond: 8,
  chaseAbove: 70,
};

// Art Deco palette.
export const PALETTE = {
  floorA: '#0e2a2b',
  floorB: '#123536',
  floorLine: '#1d4a4b',
  gold: '#d4a437',
  goldBright: '#f2c94c',
  goldDim: '#8a6d2b',
  teal: '#1f6f6b',
  tealDark: '#143f3d',
  lacquer: '#0a0f0f',
  wall: '#1a2e2e',
  wallTrim: '#d4a437',
  cream: '#f5e9c8',
  ink: '#101414',
  danger: '#e5484d',
  dangerDim: '#7a2a2d',
  coneGuard: 'rgba(242, 201, 76, 0.20)',
  coneGuardEdge: 'rgba(242, 201, 76, 0.55)',
  coneCamera: 'rgba(229, 72, 77, 0.20)',
  coneCameraEdge: 'rgba(229, 72, 77, 0.55)',
  smoke: 'rgba(200, 200, 200, 0.55)',
  hudBg: '#0a0f0f',
  hudLine: '#d4a437',
};
