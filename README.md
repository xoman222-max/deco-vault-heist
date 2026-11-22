# deco-vault-heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/xoman222-max/deco-vault-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/xoman222-max/deco-vault-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**DECO VAULT** — a 1920s Art Deco heist game: 3 patrolling guards, 2 sweeping
cameras, 4 routes, 6 tools. Cross the vault hall, read the vision cones before
you move, pick the vault lock, steal the Diamond, and reach the EXIT before the
alarm hits 100.

## How to play

Open `game/index.html` in desktop Chrome (or serve `game/` with any static
server). No network, no build step, no install.

- **Move:** WASD / arrow keys. **Sneak:** hold Shift (slower, harder to spot).
- **Tools (they cost something):** `1` smoke bomb — a cloud that blocks all
  vision for 4s (2 carried). `2` or right-click — toss a coin; the nearest
  guard walks over to look (5 coins). `3` EMP — jams both cameras for 6s
  (1 carried). `E` — hold at the vault to pick the lock (3s), or press near a
  vent grate to crawl through it, hidden.
- **Win:** take the Diamond from the open vault, then reach the EXIT door.
  **Lose:** the alarm meter hits 100 and the guards close in.
- **Score:** loot value + time bonus + alarm bonus. Side loot: 2 gold bars
  ($100 each) and 2 cash stacks ($50 each); the Diamond is $500.

## The room

One frame, one hall: marble pillars and display cases block sight lines, a
velvet-rope floor, potted palms, a sunburst medallion, and a wall of gold
trim. Three routes run up the hall — left behind the pillars, centre across
the open floor, right past the cases — plus the service vent along the right
wall. Guards patrol and chase when they get a clear look; cameras sweep the
floor in red cones until an EMP kills them.

## Run it

```sh
# play it
python3 -m http.server --directory game 8000
# then open http://localhost:8000/

# hand it in (the entrypoint; writes out/ + dossier.json)
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `game/index.html` + `game/src/` — the game (Canvas 2D, ES modules, no
  libraries): `config.js` (layout, patrols, loot, palette), `world.js`
  (geometry + line of sight), `guards.js` (patrol / suspicion / chase),
  `cameras.js` (sweep + EMP), `thief.js` (movement + tools + the loot run),
  `audio.js` (WebAudio synth effects), `render.js` (all drawing + HUD),
  `main.js` (loop, input, state machine, screenshot scenes).
- `main.ts` — Node 22 entrypoint: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` with the kit's `vendor/makefun-game.ts`.
- `screenshots/` — 4 real renders of the game in a browser (cover first).
- `shots.json` — the `?shot=` scene each screenshot was taken from.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ag1zr0tn&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
