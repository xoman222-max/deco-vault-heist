// Deco Vault Heist — the entrypoint make.fun runs (Node 22, standard library only).
// It stages a clean copy of the game and its screenshots into the output directory,
// then writes the dossier the judge reads, using the kit's own library. Running it
// twice over the same repository writes the same bytes both times.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.)

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps the scorer grades against (this competition's gate): only
// text_max_bytes shapes the dossier bytes; the rest refuse an over-large entry.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function stageDirectory(name) {
  const from = join(repoRoot, name);
  const to = join(outDir, name);
  if (!existsSync(from)) return;
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
stageDirectory('game');
stageDirectory('screenshots');

const dossier = buildDossier(outDir, DOSSIER_CAPS);
writeFileSync(join(outDir, 'dossier.json'), dossier);
