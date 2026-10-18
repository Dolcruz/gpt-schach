import { Chess, type Move } from 'chess.js';
import type { Engine } from './engine';

export type Category = 'Anfänger' | 'Fortgeschritten' | 'Erfahren' | 'Meister' | 'Engine';

export type Style =
  | 'chaotic' | 'defensive' | 'balanced' | 'aggressive' | 'materialist' | 'positional' | 'tricky' | 'machine'
  | 'copycat' | 'trader' | 'queenie' | 'pawnStorm' | 'knights' | 'gambit' | 'counter';

export interface Bot {
  id: string;
  name: string;
  rating: number;
  color: string;
  category: Category;
  style: Style;
  styleLabel: string;
  bio: string;
  /** Suchtiefe */
  depth: number;
  /** Softmax-Temperatur in Centipawns – höher = mehr Ungenauigkeiten */
  temp: number;
  /** Wahrscheinlichkeit für einen echten Patzer (schlechtester Kandidat) */
  blunder: number;
  /** Wahrscheinlichkeit für einen komplett zufälligen Zug */
  random: number;
  lines: Partial<Record<'greet' | 'capture' | 'check' | 'playerBlunder' | 'botWin' | 'botLose' | 'draw' | 'think', string[]>>;
}

const BASE_BOTS: Bot[] = [
  {
    id: 'kiki', category: 'Anfänger', name: 'Kiki', rating: 400, color: '#f6c344', style: 'chaotic', styleLabel: 'Chaotisch',
    bio: 'Hat gestern gelernt, wie das Pferd hüpft. Glaube ich.',
    depth: 4, temp: 260, blunder: 0.25, random: 0.35,
    lines: {
      greet: ['Hiii! Welche Farbe ist nochmal zuerst dran?', 'Ich hab das Pferdchen am liebsten!'],
      capture: ['Ups, hab ich den genommen?', 'Mjam!'],
      check: ['Schach! …oder? Ist das Schach?'],
      playerBlunder: ['Oh, darf ich den einfach nehmen?'],
      botWin: ['WAS?! Ich hab gewonnen?!'],
      botLose: ['Gut gespielt! Nochmal?'],
    },
  },
  {
    id: 'heinz', category: 'Anfänger', name: 'Opa Heinz', rating: 700, color: '#8d7b68', style: 'defensive', styleLabel: 'Vorsichtig',
    bio: 'Spielt seit 1962 im Park. Tauscht ungern, verteidigt gern.',
    depth: 5, temp: 170, blunder: 0.16, random: 0.12,
    lines: {
      greet: ['Na, junger Mensch. Immer schön die Figuren decken!', 'Früher haben wir ohne Uhr gespielt.'],
      capture: ['Den nehm ich mal mit, nicht böse sein.'],
      check: ['Schach! Pass auf deinen König auf.'],
      playerBlunder: ['Hm, war das Absicht?'],
      botWin: ['Erfahrung schlägt Jugend. Diesmal.'],
      botLose: ['Respekt. Das hätte ich 1962 auch nicht besser gekonnt.'],
    },
  },
  {
    id: 'lena', category: 'Fortgeschritten', name: 'Lena', rating: 1000, color: '#6aa1d8', style: 'balanced', styleLabel: 'Ausgewogen',
    bio: 'Spielt im Schulverein und lernt gerade Eröffnungen.',
    depth: 6, temp: 110, blunder: 0.1, random: 0.04,
    lines: {
      greet: ['Hi! Ich übe gerade meine Eröffnungen, sei nett'],
      capture: ['Danke für die Figur!'],
      check: ['Schach!'],
      playerBlunder: ['Oh, das war glaube ich ein Fehler…'],
      botWin: ['Juhu! Gutes Spiel!'],
      botLose: ['Okay, du warst besser. Revanche?'],
    },
  },
  {
    id: 'bruno', category: 'Fortgeschritten', name: 'Bruno', rating: 1300, color: '#c0504d', style: 'aggressive', styleLabel: 'Angriffslustig',
    bio: 'Bruno der Bulldozer. Greift an. Immer. Egal was.',
    depth: 7, temp: 75, blunder: 0.07, random: 0.01,
    lines: {
      greet: ['ICH. WILL. DEINEN. KÖNIG.', 'Verteidigung ist was für Feiglinge!'],
      capture: ['ZERMALMT!', 'Weg damit!'],
      check: ['SCHACH! Lauf, kleiner König!'],
      playerBlunder: ['HAHA! Danke!'],
      botWin: ['BULLDOZER GEWINNT!'],
      botLose: ['Grrr… Nächstes Mal greif ich noch härter an.'],
    },
  },
  {
    id: 'gustav', category: 'Fortgeschritten', name: 'Gierhals Gustav', rating: 1500, color: '#5b9e5b', style: 'materialist', styleLabel: 'Materialist',
    bio: 'Nimmt alles, was nicht festgeschraubt ist. Bauern zählen doppelt.',
    depth: 8, temp: 55, blunder: 0.05, random: 0,
    lines: {
      greet: ['Jeder Bauer ist ein kleiner Schatz.'],
      capture: ['Meins!', 'Ab in die Sammlung.', 'Material ist Material.'],
      check: ['Schach. Und gleich hol ich mir noch was.'],
      playerBlunder: ['Ein Geschenk? Für mich?'],
      botWin: ['Mehr Material gewinnt eben.'],
      botLose: ['Aber… ich hatte doch mehr Bauern!'],
    },
  },
  {
    id: 'weiss', category: 'Erfahren', name: 'Professor Weiß', rating: 1700, color: '#9b8ec4', style: 'positional', styleLabel: 'Positionell',
    bio: 'Schwache Felder, gute Läufer, offene Linien. Er hält Vorlesungen beim Spielen.',
    depth: 10, temp: 35, blunder: 0.03, random: 0,
    lines: {
      greet: ['Willkommen zur heutigen Vorlesung: das Zentrum.', 'Ein guter Plan ist besser als kein Plan.'],
      capture: ['Ein logischer Abtausch.'],
      check: ['Schach – aus strukturellen Gründen.'],
      playerBlunder: ['Das schwächt Ihre Struktur erheblich.'],
      botWin: ['Q.e.d.'],
      botLose: ['Bemerkenswert. Sie haben die Vorlesung bestanden.'],
    },
  },
  {
    id: 'zoe', category: 'Erfahren', name: 'Zocker-Zoe', rating: 1850, color: '#e07bb5', style: 'tricky', styleLabel: 'Trickreich',
    bio: 'Gambits, Fallen, Opfer. Lieber spektakulär verlieren als langweilig remis.',
    depth: 10, temp: 45, blunder: 0.03, random: 0,
    lines: {
      greet: ['Lust auf ein bisschen Chaos?', 'Ich hab da eine Falle für dich vorbereitet…'],
      capture: ['Hehe.'],
      check: ['Schach! Spürst du den Druck?'],
      playerBlunder: ['Reingetappt!'],
      botWin: ['Alles Teil des Plans.'],
      botLose: ['Okay okay, du hast meine Tricks durchschaut.'],
    },
  },
  {
    id: 'natascha', category: 'Erfahren', name: 'Natascha', rating: 2050, color: '#e8743b', style: 'aggressive', styleLabel: 'Angriffslustig',
    bio: 'Vereinsmeisterin. Opfert gern Figuren für einen Königsangriff.',
    depth: 12, temp: 25, blunder: 0.015, random: 0,
    lines: {
      greet: ['Ich hoffe, dein König hat sich warm angezogen.'],
      capture: ['Danke.'],
      check: ['Schach.'],
      playerBlunder: ['Das wird teuer.'],
      botWin: ['Gutes Spiel.'],
      botLose: ['Stark gespielt. Ehrlich.'],
    },
  },
  {
    id: 'bunker', category: 'Meister', name: 'Der Bunker', rating: 2250, color: '#6b7b8c', style: 'defensive', styleLabel: 'Felsenfest',
    bio: 'Steht wie eine Mauer. Wartet geduldig, bis du übertreibst.',
    depth: 13, temp: 18, blunder: 0.01, random: 0,
    lines: {
      greet: ['…', 'Komm nur.'],
      capture: ['…'],
      check: ['Schach.'],
      playerBlunder: ['Geduld zahlt sich aus.'],
      botWin: ['Die Mauer steht.'],
      botLose: ['Die Mauer ist gefallen.'],
    },
  },
  {
    id: 'titan', category: 'Meister', name: 'Titan', rating: 2500, color: '#3d3d3d', style: 'balanced', styleLabel: 'Großmeister',
    bio: 'Großmeister-Niveau. Macht kaum Fehler.',
    depth: 15, temp: 8, blunder: 0, random: 0,
    lines: {
      greet: ['Viel Erfolg.'],
      check: ['Schach.'],
      botWin: ['Gut gekämpft.'],
      botLose: ['Beeindruckend.'],
    },
  },
  {
    id: 'max', category: 'Engine', name: 'Stockfish Max', rating: 3200, color: '#2b6cb0', style: 'machine', styleLabel: 'Maschine',
    bio: 'Volle Engine-Stärke. Viel Glück.',
    depth: 20, temp: 0, blunder: 0, random: 0,
    lines: {
      greet: ['INITIALISIERE… GEGNER ERKANNT.'],
      botWin: ['ERGEBNIS: 1 PARTIE GEWONNEN.'],
      botLose: ['FEHLER 404: NIEDERLAGE NICHT ERWARTET.'],
    },
  },
];

const NEW_BOTS: Bot[] = [
  {
    id: 'mia', category: 'Anfänger', name: 'Mia', rating: 250, color: '#f3a6c8', style: 'knights', styleLabel: 'Springer-Fan',
    bio: 'Findet Pferdchen am schönsten. Alle anderen Figuren sind eher Deko.',
    depth: 3, temp: 320, blunder: 0.3, random: 0.45,
    lines: {
      greet: ['Hallo! Darf ich die Pferdchen zuerst ziehen?'],
      capture: ['Hüpf!', 'Mein Pferdchen hat gewonnen!'],
      check: ['Schach! Ist das gut?'],
      botWin: ['Die Pferdchen haben gewonnen!'],
      botLose: ['Du bist echt gut. Nochmal?'],
    },
  },
  {
    id: 'tim', category: 'Anfänger', name: 'Tim', rating: 550, color: '#9ad0f5', style: 'copycat', styleLabel: 'Nachmacher',
    bio: 'Macht einfach deine Züge nach – gespiegelt. Klappt erstaunlich lange.',
    depth: 4, temp: 200, blunder: 0.2, random: 0.15,
    lines: {
      greet: ['Was du kannst, kann ich auch!', 'Ich mach dir alles nach.'],
      capture: ['Hab ich mir abgeschaut.'],
      check: ['Schach! Wie du!'],
      playerBlunder: ['Den Zug mach ich lieber nicht nach …'],
      botWin: ['Ha! Nachmachen funktioniert!'],
      botLose: ['Okay, das konnte ich nicht nachmachen.'],
    },
  },
  {
    id: 'gerda', category: 'Fortgeschritten', name: 'Oma Gerda', rating: 850, color: '#c9a7d8', style: 'trader', styleLabel: 'Tauscherin',
    bio: 'Tauscht alles, was sich tauschen lässt. „Weniger Figuren, weniger Ärger.“',
    depth: 5, temp: 150, blunder: 0.14, random: 0.08,
    lines: {
      greet: ['Na Kindchen, wollen wir ein bisschen tauschen?'],
      capture: ['Eins gegen eins, das ist fair.', 'Tausch ist Tausch.'],
      check: ['Schach, mein Lieber.'],
      botWin: ['Siehst du, mit wenig Figuren ist alles übersichtlicher.'],
      botLose: ['Du bist ja ein ganz Schlauer!'],
    },
  },
  {
    id: 'kalle', category: 'Fortgeschritten', name: 'Kalle', rating: 1100, color: '#f4b860', style: 'queenie', styleLabel: 'Damen-Ausflügler',
    bio: 'Holt die Dame im zweiten Zug raus. Jedes Mal. Manchmal klappt es.',
    depth: 6, temp: 100, blunder: 0.1, random: 0.03,
    lines: {
      greet: ['Meine Dame und ich sind ein Team.', 'Schäfermatt? Vielleicht …'],
      capture: ['Die Dame räumt auf!'],
      check: ['Schach von der Königin!'],
      playerBlunder: ['Meine Dame sieht alles.'],
      botWin: ['Die Dame regiert!'],
      botLose: ['Meine arme Dame …'],
    },
  },
  {
    id: 'sven', category: 'Fortgeschritten', name: 'Sven', rating: 1250, color: '#8fc17a', style: 'pawnStorm', styleLabel: 'Bauernsturm',
    bio: 'Schiebt Bauern nach vorne, bis der Gegner keine Luft mehr bekommt.',
    depth: 7, temp: 80, blunder: 0.08, random: 0.01,
    lines: {
      greet: ['Meine Bauern marschieren!'],
      capture: ['Der Bauer frisst sich durch.'],
      check: ['Schach! Und die Bauern kommen nach.'],
      botWin: ['Kein Platz mehr für dich.'],
      botLose: ['Zu weit vorgerückt …'],
    },
  },
  {
    id: 'paula', category: 'Fortgeschritten', name: 'Pferde-Paula', rating: 1400, color: '#d7a46b', style: 'knights', styleLabel: 'Springer-Spezialistin',
    bio: 'Springergabeln sind ihre Leidenschaft. Achte auf jedes Feld, das ein Springer erreichen kann.',
    depth: 8, temp: 60, blunder: 0.05, random: 0,
    lines: {
      greet: ['Pass auf deine Felder auf – meine Springer sehen alles.'],
      capture: ['Gabel!', 'Huf drauf.'],
      check: ['Springerschach!'],
      playerBlunder: ['Das riecht nach einer Gabel …'],
      botWin: ['Die Springer haben es entschieden.'],
      botLose: ['Du hast meine Springer gut im Griff gehabt.'],
    },
  },
  {
    id: 'gregor', category: 'Erfahren', name: 'Gambit-Gregor', rating: 1600, color: '#e58f6a', style: 'gambit', styleLabel: 'Gambitspieler',
    bio: 'Opfert früh Bauern für Entwicklung und Angriff. Nimm die Bauern – wenn du dich traust.',
    depth: 9, temp: 50, blunder: 0.04, random: 0,
    lines: {
      greet: ['Ein Bauer gefällig? Nimm ruhig.', 'Wer nicht wagt, der nicht gewinnt.'],
      capture: ['Jetzt hole ich mir alles zurück.'],
      check: ['Schach! Siehst du die Initiative?'],
      playerBlunder: ['Das Gambit zahlt sich aus.'],
      botWin: ['Initiative schlägt Material.'],
      botLose: ['Du hast das Gambit gut abgewehrt.'],
    },
  },
  {
    id: 'ingrid', category: 'Erfahren', name: 'Ingrid', rating: 1900, color: '#7fa7c9', style: 'trader', styleLabel: 'Endspiel-Expertin',
    bio: 'Tauscht schnell in ein Endspiel ab – und dort macht sie keine Fehler.',
    depth: 12, temp: 22, blunder: 0.015, random: 0,
    lines: {
      greet: ['Wir sehen uns im Endspiel.'],
      capture: ['Ein Tausch weniger bis zum Endspiel.'],
      check: ['Schach.'],
      botWin: ['Endspiele gewinnt man nicht durch Glück.'],
      botLose: ['Starke Technik. Respekt.'],
    },
  },
  {
    id: 'kobra', category: 'Meister', name: 'Kobra', rating: 2100, color: '#5f8a5a', style: 'counter', styleLabel: 'Konterspieler',
    bio: 'Wartet geduldig ab und schlägt zu, sobald du eine Lücke lässt.',
    depth: 13, temp: 18, blunder: 0.01, random: 0,
    lines: {
      greet: ['Ssssso. Zeig mir, was du hast.'],
      capture: ['Zugeschnappt.'],
      check: ['Schach. Ssss.'],
      playerBlunder: ['Da ist die Lücke.'],
      botWin: ['Geduld ist Gift.'],
      botLose: ['Du hast mir keine Lücke gelassen.'],
    },
  },
];

/** Alle Bots, aufsteigend nach Spielstärke */
export const BOTS: Bot[] = [...BASE_BOTS, ...NEW_BOTS].sort((a, b) => a.rating - b.rating);

export const COACH_BOT: Bot = {
  id: 'coach', category: 'Fortgeschritten', name: 'Coach', rating: 1200, color: '#81b64c', style: 'balanced', styleLabel: 'Coach',
  bio: 'Spielt mit dir auf Augenhöhe und erklärt jeden Zug. (Stärke einstellbar)',
  depth: 7, temp: 90, blunder: 0.06, random: 0.02,
  lines: { greet: ['Lass uns eine lehrreiche Partie spielen! Ich erkläre dir unterwegs, was passiert.'] },
};

/** Coach-Gegner mit wählbarer Stärke */
export function coachOpponent(rating: number): Bot {
  const closest = [...BOTS].filter((b) => b.style !== 'machine').sort((a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating))[0];
  return { ...COACH_BOT, rating, depth: closest.depth, temp: closest.temp, blunder: closest.blunder, random: closest.random };
}

const VALUE: Record<string, number> = { p: 100, n: 300, b: 320, r: 500, q: 900, k: 0 };

function sqDist(a: string, b: string) {
  return Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)), Math.abs(Number(a[1]) - Number(b[1])));
}

function kingSquare(chess: Chess, color: 'w' | 'b') {
  for (const row of chess.board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square;
  return 'e1';
}

/** Persönlichkeits-Bonus in Centipawns für einen Kandidatenzug */
function styleBonus(style: Style, move: Move, chess: Chess, ply: number): number {
  const enemyKing = kingSquare(chess, move.color === 'w' ? 'b' : 'w');
  const ownKing = kingSquare(chess, move.color);
  const isCheck = move.san.includes('+') || move.san.includes('#');
  const captured = move.captured ? VALUE[move.captured] : 0;
  const forward = move.color === 'w' ? Number(move.to[1]) - Number(move.from[1]) : Number(move.from[1]) - Number(move.to[1]);
  const center = ['d4', 'e4', 'd5', 'e5', 'c4', 'c5', 'f4', 'f5'].includes(move.to) ? 1 : 0;
  switch (style) {
    case 'aggressive':
      return (isCheck ? 45 : 0) + (captured ? 15 : 0) + (sqDist(move.to, enemyKing) <= 2 ? 25 : 0) + Math.max(0, forward) * 6;
    case 'defensive':
      return (sqDist(move.to, ownKing) <= 2 ? 20 : 0) - (isCheck ? 10 : 0) - Math.max(0, forward) * 5 + (move.san === 'O-O' || move.san === 'O-O-O' ? 30 : 0);
    case 'materialist':
      return captured * 0.35 + (move.piece === 'p' && move.captured ? 20 : 0);
    case 'positional':
      return center * 15 + (move.san.startsWith('O-O') ? 25 : 0) + (['n', 'b'].includes(move.piece) && ['1', '8'].includes(move.from[1]) ? 15 : 0);
    case 'tricky':
      return (isCheck ? 30 : 0) + (move.piece !== 'p' && !move.captured && sqDist(move.to, enemyKing) <= 3 ? 20 : 0) + Math.random() * 40;
    case 'chaotic':
      return Math.random() * 120;
    case 'trader': {
      // Gleichwertige Tausche bevorzugen (Figur schlägt Figur gleichen Werts)
      const moverValue = VALUE[move.piece] ?? 0;
      return captured ? 25 + (Math.abs(captured - moverValue) <= 30 ? 45 : 0) : 0;
    }
    case 'queenie':
      return move.piece === 'q' ? (ply < 20 ? 80 : 35) : 0;
    case 'pawnStorm':
      return move.piece === 'p' ? 30 + Math.max(0, forward) * 12 + ('abgh'.includes(move.to[0]) ? 15 : 0) : 0;
    case 'knights':
      return move.piece === 'n' ? 55 : move.piece === 'b' ? -10 : 0;
    case 'gambit':
      // In der Eröffnung lieber vorwärts und mit Tempo, Material ist zweitrangig
      return ply < 24 ? (move.piece === 'p' ? 35 : 0) + (isCheck ? 35 : 0) + (['n', 'b'].includes(move.piece) && ['1', '8'].includes(move.from[1]) ? 25 : 0) : isCheck ? 20 : 0;
    case 'counter':
      return (sqDist(move.to, ownKing) <= 2 ? 15 : 0) + (isCheck ? 30 : 0) + (captured ? 15 : 0) - Math.max(0, forward) * 3;
    default:
      return 0;
  }
}

function pick<T>(arr: T[] | undefined): T | undefined {
  return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

export function botLine(bot: Bot, key: keyof Bot['lines']) {
  return pick(bot.lines[key]);
}

/** Wählt einen Zug (UCI) für den Bot */
export async function chooseBotMove(
  engine: Engine,
  fen: string,
  bot: Bot,
  limits?: { movetime?: number; lastMove?: { from: string; to: string } },
): Promise<string | null> {
  const chess = new Chess(fen);
  const legal = chess.moves({ verbose: true });
  if (!legal.length) return null;
  const uci = (m: Move) => m.from + m.to + (m.promotion ?? '');

  if (Math.random() < bot.random) return uci(pick(legal)!);

  // Nachmacher: spiegelt den letzten Zug des Gegners, wenn das legal ist
  if (bot.style === 'copycat' && limits?.lastMove && Math.random() < 0.85) {
    const mirror = (sq: string) => sq[0] + (9 - Number(sq[1]));
    const want = mirror(limits.lastMove.from) + mirror(limits.lastMove.to);
    const m = legal.find((x) => x.from + x.to === want);
    if (m) return uci(m);
  }
  const ply = (chess.moveNumber() - 1) * 2 + (chess.turn() === 'b' ? 1 : 0);

  const multipv = bot.style === 'machine' ? 1 : Math.min(legal.length, 8);
  const lines = await engine.analyze(fen, { depth: bot.depth, multipv, movetime: limits?.movetime });
  if (!lines.length) return uci(pick(legal)!);
  if (bot.style === 'machine' || lines.length === 1) return lines[0].pv[0];

  const cands = lines
    .map((l) => {
      const mv = legal.find((m) => uci(m) === l.pv[0]);
      return mv ? { uci: l.pv[0], score: l.score + styleBonus(bot.style, mv, chess, ply) } : null;
    })
    .filter((c): c is { uci: string; score: number } => !!c);
  if (!cands.length) return lines[0].pv[0];

  // Matt in Reichweite: starke Bots verpassen das nicht
  if (lines[0].mate !== null && lines[0].mate > 0 && bot.rating >= 1500) return lines[0].pv[0];

  if (Math.random() < bot.blunder && cands.length > 2) {
    const worst = cands.slice(-Math.ceil(cands.length / 2));
    return pick(worst)!.uci;
  }

  const best = Math.max(...cands.map((c) => c.score));
  const temp = Math.max(bot.temp, 1);
  const weights = cands.map((c) => Math.exp(Math.max(-30, (c.score - best) / temp)));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < cands.length; i++) {
    r -= weights[i];
    if (r <= 0) return cands[i].uci;
  }
  return cands[0].uci;
}
