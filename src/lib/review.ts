import { Chess } from 'chess.js';
import type { Engine, EngineLine } from '../engine';
import { reviewMove, type Classification } from '../coach';
import { accuracyFromLoss, type GameAnalysis, type PlyAnalysis } from './data';

const MATE_CP = 10000;

/** Bewertung der Stellung aus Sicht Weiß in Centipawns (Matt ≈ ±10000) */
export function whiteCp(fen: string, lines: EngineLine[], fallbackGameOver?: Chess): { cp: number; mate: number | null } {
  const sign = fen.split(' ')[1] === 'w' ? 1 : -1;
  if (!lines.length) {
    // keine Züge mehr: Matt oder Patt
    if (fallbackGameOver?.isCheckmate()) return { cp: -sign * MATE_CP, mate: 0 };
    return { cp: 0, mate: null };
  }
  const l = lines[0];
  if (l.mate !== null) return { cp: sign * Math.sign(l.mate || -1) * MATE_CP, mate: sign * l.mate };
  return { cp: sign * l.score, mate: null };
}

/**
 * Analysiert eine komplette Partie. Für jede Stellung wird einmal gerechnet,
 * die Einstufung eines Zuges vergleicht die Stellung davor und danach.
 */
export async function analyzeGame(
  engine: Engine,
  startFen: string | undefined,
  sans: string[],
  depth: number,
  onProgress: (done: number, total: number) => void,
  isCancelled: () => boolean,
): Promise<GameAnalysis | null> {
  const c = new Chess(startFen);
  const fens = [c.fen()];
  const ucis: string[] = [];
  for (const san of sans) {
    const m = c.move(san);
    ucis.push(m.from + m.to + (m.promotion ?? ''));
    fens.push(c.fen());
  }
  const results: EngineLine[][] = [];
  for (let i = 0; i < fens.length; i++) {
    if (isCancelled()) return null;
    results.push(await engine.analyze(fens[i], { depth, movetime: 2000, multipv: 2 }));
    onProgress(i + 1, fens.length);
  }

  propagateAlongGame(results, ucis);

  const plies: PlyAnalysis[] = [];
  const losses: Record<'w' | 'b', number[]> = { w: [], b: [] };
  for (let i = 0; i < sans.length; i++) {
    const fenBefore = fens[i];
    const mover = fenBefore.split(' ')[1] as 'w' | 'b';
    const after = new Chess(fens[i + 1]);
    const w = whiteCp(fens[i + 1], results[i + 1], after);
    let c: Classification = 'best';
    let winLoss = 0;
    let best = '';
    let bestSan = '';
    if (results[i].length) {
      const r = reviewMove(fenBefore, ucis[i], sans[i], results[i], results[i + 1], i);
      c = after.isCheckmate() ? 'best' : r.classification;
      winLoss = after.isCheckmate() ? 0 : r.winLoss;
      best = r.bestUci;
      bestSan = r.bestSan;
    }
    losses[mover].push(winLoss);
    plies.push({ cp: w.cp, mate: w.mate, best, bestSan, c, winLoss });
  }
  const acc = (arr: number[]) => (arr.length ? Math.round(accuracyFromLoss(arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0);
  const start = whiteCp(fens[0], results[0]);
  return { depth, startCp: start.cp, plies, accuracy: { w: acc(losses.w), b: acc(losses.b) } };
}

/**
 * Rückwärts-Abgleich entlang der Partie: Bei geringer Tiefe übersieht die Engine manchmal
 * Kombinationen, die sie einen Halbzug später sofort sieht (z. B. ein Damenopfer mit Matt).
 * Der Wert einer Stellung ist mindestens so gut wie der des gespielten Zugs – und genau so gut,
 * wenn der gespielte Zug der Engine-Zug war. Das korrigiert solche Horizont-Fehler.
 */
function propagateAlongGame(results: EngineLine[][], ucis: string[]) {
  for (let i = ucis.length - 1; i >= 0; i--) {
    const here = results[i][0];
    const next = results[i + 1]?.[0];
    if (!here || !next) continue;
    const viaMove = -next.score;
    const score = here.pv[0] === ucis[i] ? viaMove : Math.max(here.score, viaMove);
    if (score === here.score) continue;
    const mate = Math.abs(score) > 90000 ? Math.sign(score) * Math.max(1, 100000 - Math.abs(score)) : null;
    results[i] = [{ ...here, score, mate }, ...results[i].slice(1)];
  }
}

export const CLASS_ORDER: Classification[] = ['great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'blunder'];
