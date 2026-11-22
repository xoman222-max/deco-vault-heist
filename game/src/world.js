// World geometry: the vault hall, its cover, and the line-of-sight rules.
// Vision and movement are both blocked by pillars, display cases, tables and palms.

import { FIELD, COVER_RECTS, COVER_CIRCLES, VAULT, DOOR, VENT } from './config.js';

// Clamp a point into the walkable field (inside the walls).
export function clampToField(x, y, r) {
  return {
    x: Math.max(FIELD.x + r, Math.min(FIELD.x + FIELD.w - r, x)),
    y: Math.max(FIELD.y + r, Math.min(FIELD.y + FIELD.h - r, y)),
  };
}

// Does a circle (x, y, r) overlap a rectangle?
function circleHitsRect(x, y, r, rect) {
  const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy < r * r;
}

// Does a circle overlap a cover circle?
function circleHitsCircle(x, y, r, c) {
  const dx = x - c.x;
  const dy = y - c.y;
  const rr = r + c.r;
  return dx * dx + dy * dy < rr * rr;
}

// Is this spot blocked for a body of radius r?
export function isBlocked(x, y, r) {
  for (const rect of COVER_RECTS) {
    if (circleHitsRect(x, y, r, rect)) return true;
  }
  for (const c of COVER_CIRCLES) {
    if (circleHitsCircle(x, y, r, c)) return true;
  }
  return false;
}

// Move a circle, sliding along cover: try full step, then x-only, then y-only.
export function moveCircle(x, y, r, dx, dy) {
  if (!isBlocked(x + dx, y + dy, r)) return { x: x + dx, y: y + dy };
  if (!isBlocked(x + dx, y, r)) return { x: x + dx, y };
  if (!isBlocked(x, y + dy, r)) return { x, y: y + dy };
  return { x, y };
}

// --- line of sight -----------------------------------------------------------

// Does segment (x1,y1)-(x2,y2) cross a rectangle? (Slab test.)
function segmentHitsRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < rect.x || x1 > rect.x + rect.w) return false;
  } else {
    let a = (rect.x - x1) / dx;
    let b = (rect.x + rect.w - x1) / dx;
    if (a > b) { const t = a; a = b; b = t; }
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
    if (t0 > t1) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < rect.y || y1 > rect.y + rect.h) return false;
  } else {
    let a = (rect.y - y1) / dy;
    let b = (rect.y + rect.h - y1) / dy;
    if (a > b) { const t = a; a = b; b = t; }
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
    if (t0 > t1) return false;
  }
  return true;
}

// Does segment (x1,y1)-(x2,y2) cross a circle?
function segmentHitsCircle(x1, y1, x2, y2, c) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-9) return false;
  let t = ((c.x - x1) * dx + (c.y - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * dx - c.x;
  const py = y1 + t * dy - c.y;
  return px * px + py * py < c.r * c.r;
}

// True when nothing solid stands between the two points.
export function hasLineOfSight(x1, y1, x2, y2) {
  for (const rect of COVER_RECTS) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) return false;
  }
  for (const c of COVER_CIRCLES) {
    if (segmentHitsCircle(x1, y1, x2, y2, c)) return false;
  }
  return true;
}

// --- named places ------------------------------------------------------------

export function nearVault(x, y) {
  const cx = VAULT.x + VAULT.w / 2;
  const cy = VAULT.y + VAULT.h;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy < 70 * 70;
}

export function atExit(x, y) {
  return x > DOOR.x && x < DOOR.x + DOOR.w && y > DOOR.y - 6;
}

export function nearVent(x, y, which) {
  const v = VENT[which];
  const dx = x - v.x;
  const dy = y - v.y;
  return dx * dx + dy * dy < (VENT.r + 26) * (VENT.r + 26);
}

// Distance helper.
export function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}
