import { Chess } from 'chess.js';
import { formatScore, winPercent, type EngineLine } from './engine';

export type Classification = 'book' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'great';

export const CLASS_INFO: Record<Classification, { label: string; icon: string; color: string }> = {
  great: { label: 'Großartiger Zug', icon: '!', color: '#749bbf' },
  best: { label: 'Bester Zug', icon: '', color: '#81b64c' },
  excellent: { label: 'Exzellent', icon: '', color: '#96bc4b' },
  good: { label: 'Gut', icon: '', color: '#95af8a' },
  book: { label: 'Theoriezug', icon: '', color: '#a88865' },
  inaccuracy: { label: 'Ungenauigkeit', icon: '?!', color: '#f7c045' },
  mistake: { label: 'Fehler', icon: '?', color: '#ffa459' },
  blunder: { label: 'Patzer', icon: '??', color: '#fa412d' },
};

export interface MoveReview {
  san: string;
  uci: string;
  classification: Classification;
  /** Verlust an Gewinnwahrscheinlichkeit in Prozentpunkten */
  winLoss: number;
  evalBefore: string;
  evalAfter: string;
  bestUci: string;
  bestSan: string;
  bestPvSan: string[];
  /** Beste Antwort des Gegners nach dem gespielten Zug */
  replyPvSan: string[];
  alternatives: { san: string; eval: string }[];
  fenBefore: string;
  fenAfter: string;
}

/** UCI-Variante in SAN umwandeln */
export function pvToSan(fen: string, pv: string[], max = 6): string[] {
  const c = new Chess(fen);
  const out: string[] = [];
  for (const u of pv.slice(0, max)) {
    try {
      out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
    } catch {
      break;
    }
  }
  return out;
}

/**
 * Bewertet den Zug des Spielers.
 * before: Analyse vor dem Zug (Sicht Spieler), after: Analyse danach (Sicht Gegner).
 */
export function reviewMove(fenBefore: string, uci: string, san: string, before: EngineLine[], after: EngineLine[], ply: number): MoveReview {
  const best = before[0];
  // Nach dem Zug ist der Gegner am Zug -> Vorzeichen drehen
  const afterScore = after.length ? -after[0].score : best.score;
  const afterMate = after.length && after[0].mate !== null ? -after[0].mate : null;
  const winLoss = Math.max(0, winPercent(best.score) - winPercent(afterScore));
  const isBest = best.pv[0] === uci;
  const secondGap = before[1] ? winPercent(best.score) - winPercent(before[1].score) : 0;

  let classification: Classification;
  if (isBest && secondGap > 15 && winPercent(afterScore) > 30) classification = 'great';
  else if (isBest) classification = ply < 10 && Math.abs(best.score) < 60 ? 'book' : 'best';
  else if (winLoss < 2) classification = 'excellent';
  else if (winLoss < 5) classification = 'good';
  else if (winLoss < 10) classification = 'inaccuracy';
  else if (winLoss < 20) classification = 'mistake';
  else classification = 'blunder';

  const fenAfter = (() => {
    const c = new Chess(fenBefore);
    c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    return c.fen();
  })();

  return {
    san,
    uci,
    classification,
    winLoss,
    evalBefore: formatScore(best.score, best.mate),
    evalAfter: formatScore(afterScore, afterMate),
    bestUci: best.pv[0],
    bestSan: pvToSan(fenBefore, best.pv, 1)[0] ?? '',
    bestPvSan: pvToSan(fenBefore, best.pv),
    replyPvSan: after.length ? pvToSan(fenAfter, after[0].pv, 5) : [],
    alternatives: before.slice(0, 3).map((l) => ({ san: pvToSan(fenBefore, l.pv, 1)[0] ?? '?', eval: formatScore(l.score, l.mate) })),
    fenBefore,
    fenAfter,
  };
}

// ---------- Prompting ----------

const BEGINNER_RULES = `- Der Schüler ist noch Anfänger und liest Notation schwer: Nenne bei jedem Zug die Figur in Worten, z. B. „Springer nach f3 (Nf3)“ oder „Läufer schlägt auf f7 mit Schach (Bxf7+)“.
- Wenn du eine Fortsetzung, Alternative oder Drohung beschreibst, gib sie ZUSÄTZLICH in einer eigenen Zeile maschinenlesbar aus: "VARIANTE: Nf3 Nc6 d4" (SAN ohne Zugnummern, max. 8 Halbzüge, nur Züge aus den mitgelieferten Daten). Höchstens 2 solche Zeilen. Der Schüler kann sie auf dem Brett Zug für Zug durchklicken.`;

export const COACH_INSTRUCTIONS = `Du bist "Coach", ein freundlicher, motivierender Schachtrainer – so wie der Coach-Modus auf chess.com.
Du begleitest den Schüler während einer Partie gegen einen Bot und sprichst ihn mit "du" an.

Regeln:
- Bewertungen und Varianten kommen AUSSCHLIESSLICH aus den mitgelieferten Stockfish-Daten. Erfinde keine Züge, prüfe Behauptungen gegen die Brettstellung (FEN/Diagramm).
- Erkläre die IDEE hinter Zügen: Drohungen, hängende Figuren, Taktiken (Gabel, Fesselung, Spieß, Abzug), Königssicherheit, Entwicklung, Zentrum, Bauernstruktur, Pläne.
- Passe die Sprache an das Niveau des Schülers an (ca. {LEVEL} Elo). Keine Engine-Zahlen auswerfen, außer sie helfen ("du stehst klar besser").
- Notation: deutsche Sprache, aber Züge in SAN mit englischen Figurenbuchstaben (z. B. Nf3, Bxe5, O-O).
- Halte dich kurz: Zugkommentare 1–3 Sätze. Bei Fragen im Chat darfst du ausführlicher sein (max. ~120 Wörter).
- Bei Hinweisen den Zug NICHT verraten, nur die Idee/den Bereich andeuten.
${BEGINNER_RULES}
- Optional darfst du ganz am Ende EINE Zeile "PFEILE: e2e4 g1f3" ausgeben (max. 3, UCI-Format), um Pfeile aufs Brett zu zeichnen. Grün = gut. Nur Felder/Züge, die in der Stellung Sinn ergeben.`;

export interface GameContext {
  fen: string;
  ascii: string;
  history: string[];
  playerColor: 'w' | 'b';
  opponent: string;
  level: number;
  evalText?: string;
  topLines?: string[];
  /** Zusatzhinweis, z. B. dass gerade hypothetische Züge erkundet werden */
  note?: string;
}

export function contextBlock(ctx: GameContext) {
  const moves = ctx.history.map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${m}` : m)).join(' ');
  return [
    ctx.note ?? '',
    `Schüler spielt: ${ctx.playerColor === 'w' ? 'Weiß' : 'Schwarz'} gegen ${ctx.opponent}`,
    `Partie bisher: ${moves || '(noch keine Züge)'}`,
    `Aktuelle Stellung (FEN): ${ctx.fen}`,
    `Diagramm (Großbuchstaben = Weiß):\n${ctx.ascii}`,
    ctx.evalText ? `Stockfish-Bewertung (Sicht Weiß): ${ctx.evalText}` : '',
    ctx.topLines?.length ? `Stockfish beste Fortsetzungen:\n${ctx.topLines.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function movePrompt(ctx: GameContext, r: MoveReview) {
  const ci = CLASS_INFO[r.classification];
  return `${contextBlock(ctx)}

Der Schüler hat gerade ${r.san} gespielt (Stellung oben ist NACH dem Zug).
Engine-Einstufung: ${ci.label} (Verlust ≈ ${r.winLoss.toFixed(1)} Prozentpunkte Gewinnchance)
Bewertung vorher: ${r.evalBefore}, nachher: ${r.evalAfter} (jeweils Sicht des Schülers)
Bester Zug wäre gewesen: ${r.bestSan} – Variante: ${r.bestPvSan.join(' ')}
Top-Kandidaten vorher: ${r.alternatives.map((a) => `${a.san} (${a.eval})`).join(', ')}
Beste Antwort des Gegners jetzt: ${r.replyPvSan.join(' ') || '–'}

Kommentiere den Zug kurz wie ein Coach. ${
    ['inaccuracy', 'mistake', 'blunder'].includes(r.classification)
      ? `Erkläre konkret, WAS das Problem ist (z. B. was der Gegner jetzt mit ${r.replyPvSan[0] ?? 'seiner Antwort'} droht) und warum ${r.bestSan} besser war. Gib die bessere Fortsetzung als VARIANTE ab der Stellung VOR dem Zug des Schülers aus (beginnend mit ${r.bestSan}) und – falls hilfreich – die Antwort des Gegners auf den gespielten Zug als zweite VARIANTE ab der aktuellen Stellung.`
      : 'Lobe kurz und erkläre die Idee oder worauf der Schüler als Nächstes achten sollte.'
  }`;
}

export function hintPrompt(ctx: GameContext, level: 1 | 2) {
  return `${contextBlock(ctx)}

Der Schüler ist am Zug und bittet um einen ${level === 1 ? 'kleinen Hinweis. Verrate den Zug NICHT – nenne nur die Idee, das Motiv oder welche Figur/welcher Bereich interessant ist. Keine Pfeile.' : 'deutlicheren Hinweis: Nenne die Figur, die ziehen sollte, und die Idee, aber noch nicht das Zielfeld.'}`;
}

export function chatPrompt(ctx: GameContext, question: string) {
  return `${contextBlock(ctx)}

Frage des Schülers: ${question}`;
}

export function botMovePrompt(ctx: GameContext, botSan: string, threatPv: string[]) {
  return `${contextBlock(ctx)}

Der Gegner (${ctx.opponent}) hat gerade ${botSan} gespielt. Engine-Hauptvariante für den Schüler jetzt: ${threatPv.join(' ') || '–'}
Erkläre in 1–2 Sätzen, was der Gegner mit ${botSan} vorhat bzw. droht, damit der Schüler aufpasst. Verrate den besten Antwortzug nicht direkt.`;
}

export const TRAINER_INSTRUCTIONS = `Du bist "Coach", ein freundlicher, präziser Schachtrainer wie auf chess.com. Du hilfst dem Schüler beim Training: Taktikaufgaben, Lektionen, Eröffnungen und Partie-Analysen. Sprich ihn mit "du" an.

Regeln:
- Bewertungen und Varianten kommen AUSSCHLIESSLICH aus den mitgelieferten Daten (Stockfish, Lösungszüge, Theorie-Linien). Erfinde keine Züge und prüfe Aussagen gegen die Stellung (FEN/Diagramm).
- Erkläre die IDEE: Drohungen, Motive (Gabel, Fesselung, Spieß, Abzug, Ablenkung, Überlastung …), Pläne, typische Fehler.
- Niveau des Schülers: ca. {LEVEL} Elo. Klare, kurze Sätze. Deutsch, Züge in SAN mit englischen Figurenbuchstaben (Nf3, Bxe5, O-O).
- Halte dich kurz (meist 2–5 Sätze), außer der Schüler will ausdrücklich eine ausführliche Erklärung oder Lektion.
- Wenn nach einem Hinweis gefragt wird: den Zug nicht verraten, nur die Idee andeuten.
${BEGINNER_RULES}
- Optional darfst du ganz am Ende EINE Zeile "PFEILE: e2e4 g1f3" ausgeben (max. 3, UCI-Format), um Pfeile aufs Brett zu zeichnen.`;

/** Stellungsbeschreibung für den Coach */
export function positionBlock(fen: string, extra: string[] = []) {
  const c = new Chess(fen);
  const side = c.turn() === 'w' ? 'Weiß' : 'Schwarz';
  const state = c.isCheckmate() ? `Schachmatt – ${side} ist matt gesetzt.` : c.isStalemate() ? `Patt – ${side} hat keinen legalen Zug.` : `${side} ist am Zug${c.inCheck() ? ' und steht im Schach' : ''}.`;
  return [`Stellung (FEN): ${fen}`, state, `Diagramm (Großbuchstaben = Weiß):\n${c.ascii()}`, ...extra].filter(Boolean).join('\n');
}
