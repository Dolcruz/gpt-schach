import { Chess, type Move } from 'chess.js';
import type { Engine } from './engine';
import { L } from './i18n';

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
    id: 'kiki', category: 'Anfänger', name: 'Kiki', rating: 400, color: '#f6c344', style: 'chaotic', styleLabel: L('Chaotisch', 'Chaotic'),
    bio: L('Hat gestern gelernt, wie das Pferd hüpft. Glaube ich.', 'Learned how the knight jumps yesterday. I think.'),
    depth: 4, temp: 260, blunder: 0.25, random: 0.35,
    lines: {
      greet: [L('Hiii! Welche Farbe ist nochmal zuerst dran?', 'Hiii! Which color goes first again?'), L('Ich hab das Pferdchen am liebsten!', 'The horsey is my favorite!')],
      capture: [L('Ups, hab ich den genommen?', 'Oops, did I take that?'), L('Mjam!', 'Yum!')],
      check: [L('Schach! …oder? Ist das Schach?', 'Check! …or? Is that check?')],
      playerBlunder: [L('Oh, darf ich den einfach nehmen?', 'Oh, can I just take that?')],
      botWin: [L('WAS?! Ich hab gewonnen?!', 'WHAT?! I won?!')],
      botLose: [L('Gut gespielt! Nochmal?', 'Well played! Again?')],
    },
  },
  {
    id: 'heinz', category: 'Anfänger', name: L('Opa Heinz', 'Grandpa Heinz'), rating: 700, color: '#8d7b68', style: 'defensive', styleLabel: L('Vorsichtig', 'Cautious'),
    bio: L('Spielt seit 1962 im Park. Tauscht ungern, verteidigt gern.', 'Has played in the park since 1962. Hates trading, loves defending.'),
    depth: 5, temp: 170, blunder: 0.16, random: 0.12,
    lines: {
      greet: [L('Na, junger Mensch. Immer schön die Figuren decken!', 'Well, youngster. Always protect your pieces!'), L('Früher haben wir ohne Uhr gespielt.', 'Back in my day we played without a clock.')],
      capture: [L('Den nehm ich mal mit, nicht böse sein.', "I'll take that one, no hard feelings.")],
      check: [L('Schach! Pass auf deinen König auf.', 'Check! Watch your king.')],
      playerBlunder: [L('Hm, war das Absicht?', 'Hm, was that on purpose?')],
      botWin: [L('Erfahrung schlägt Jugend. Diesmal.', 'Experience beats youth. This time.')],
      botLose: [L('Respekt. Das hätte ich 1962 auch nicht besser gekonnt.', "Respect. I couldn't have done better back in 1962.")],
    },
  },
  {
    id: 'lena', category: 'Fortgeschritten', name: 'Lena', rating: 1000, color: '#6aa1d8', style: 'balanced', styleLabel: L('Ausgewogen', 'Balanced'),
    bio: L('Spielt im Schulverein und lernt gerade Eröffnungen.', 'Plays in her school club and is learning openings.'),
    depth: 6, temp: 110, blunder: 0.1, random: 0.04,
    lines: {
      greet: [L('Hi! Ich übe gerade meine Eröffnungen, sei nett', "Hi! I'm practicing my openings, be nice")],
      capture: [L('Danke für die Figur!', 'Thanks for the piece!')],
      check: [L('Schach!', 'Check!')],
      playerBlunder: [L('Oh, das war glaube ich ein Fehler…', 'Oh, I think that was a mistake…')],
      botWin: [L('Juhu! Gutes Spiel!', 'Yay! Good game!')],
      botLose: [L('Okay, du warst besser. Revanche?', 'Okay, you were better. Rematch?')],
    },
  },
  {
    id: 'bruno', category: 'Fortgeschritten', name: 'Bruno', rating: 1300, color: '#c0504d', style: 'aggressive', styleLabel: L('Angriffslustig', 'Aggressive'),
    bio: L('Bruno der Bulldozer. Greift an. Immer. Egal was.', 'Bruno the Bulldozer. Attacks. Always. No matter what.'),
    depth: 7, temp: 75, blunder: 0.07, random: 0.01,
    lines: {
      greet: [L('ICH. WILL. DEINEN. KÖNIG.', 'I. WANT. YOUR. KING.'), L('Verteidigung ist was für Feiglinge!', 'Defense is for cowards!')],
      capture: [L('ZERMALMT!', 'CRUSHED!'), L('Weg damit!', 'Gone!')],
      check: [L('SCHACH! Lauf, kleiner König!', 'CHECK! Run, little king!')],
      playerBlunder: [L('HAHA! Danke!', 'HAHA! Thanks!')],
      botWin: [L('BULLDOZER GEWINNT!', 'BULLDOZER WINS!')],
      botLose: [L('Grrr… Nächstes Mal greif ich noch härter an.', "Grrr… Next time I'll attack even harder.")],
    },
  },
  {
    id: 'gustav', category: 'Fortgeschritten', name: L('Gierhals Gustav', 'Greedy Gustav'), rating: 1500, color: '#5b9e5b', style: 'materialist', styleLabel: L('Materialist', 'Materialist'),
    bio: L('Nimmt alles, was nicht festgeschraubt ist. Bauern zählen doppelt.', "Grabs everything that isn't nailed down. Pawns count double."),
    depth: 8, temp: 55, blunder: 0.05, random: 0,
    lines: {
      greet: [L('Jeder Bauer ist ein kleiner Schatz.', 'Every pawn is a little treasure.')],
      capture: [L('Meins!', 'Mine!'), L('Ab in die Sammlung.', 'Into the collection.'), L('Material ist Material.', 'Material is material.')],
      check: [L('Schach. Und gleich hol ich mir noch was.', "Check. And I'll grab something else soon.")],
      playerBlunder: [L('Ein Geschenk? Für mich?', 'A gift? For me?')],
      botWin: [L('Mehr Material gewinnt eben.', 'More material simply wins.')],
      botLose: [L('Aber… ich hatte doch mehr Bauern!', 'But… I had more pawns!')],
    },
  },
  {
    id: 'weiss', category: 'Erfahren', name: L('Professor Weiß', 'Professor Weiss'), rating: 1700, color: '#9b8ec4', style: 'positional', styleLabel: L('Positionell', 'Positional'),
    bio: L('Schwache Felder, gute Läufer, offene Linien. Er hält Vorlesungen beim Spielen.', 'Weak squares, good bishops, open files. He lectures while playing.'),
    depth: 10, temp: 35, blunder: 0.03, random: 0,
    lines: {
      greet: [L('Willkommen zur heutigen Vorlesung: das Zentrum.', "Welcome to today's lecture: the center."), L('Ein guter Plan ist besser als kein Plan.', 'A good plan beats no plan.')],
      capture: [L('Ein logischer Abtausch.', 'A logical exchange.')],
      check: [L('Schach – aus strukturellen Gründen.', 'Check – for structural reasons.')],
      playerBlunder: [L('Das schwächt Ihre Struktur erheblich.', 'That weakens your structure considerably.')],
      botWin: [L('Q.e.d.', 'Q.E.D.')],
      botLose: [L('Bemerkenswert. Sie haben die Vorlesung bestanden.', 'Remarkable. You passed the lecture.')],
    },
  },
  {
    id: 'zoe', category: 'Erfahren', name: L('Zocker-Zoe', 'Gambler Zoe'), rating: 1850, color: '#e07bb5', style: 'tricky', styleLabel: L('Trickreich', 'Tricky'),
    bio: L('Gambits, Fallen, Opfer. Lieber spektakulär verlieren als langweilig remis.', 'Gambits, traps, sacrifices. Rather lose spectacularly than draw boringly.'),
    depth: 10, temp: 45, blunder: 0.03, random: 0,
    lines: {
      greet: [L('Lust auf ein bisschen Chaos?', 'Up for a little chaos?'), L('Ich hab da eine Falle für dich vorbereitet…', "I've prepared a trap for you…")],
      capture: [L('Hehe.', 'Hehe.')],
      check: [L('Schach! Spürst du den Druck?', 'Check! Feel the pressure?')],
      playerBlunder: [L('Reingetappt!', 'Walked right into it!')],
      botWin: [L('Alles Teil des Plans.', 'All part of the plan.')],
      botLose: [L('Okay okay, du hast meine Tricks durchschaut.', 'Okay okay, you saw through my tricks.')],
    },
  },
  {
    id: 'natascha', category: 'Erfahren', name: 'Natascha', rating: 2050, color: '#e8743b', style: 'aggressive', styleLabel: L('Angriffslustig', 'Aggressive'),
    bio: L('Vereinsmeisterin. Opfert gern Figuren für einen Königsangriff.', 'Club champion. Loves sacrificing pieces for a king attack.'),
    depth: 12, temp: 25, blunder: 0.015, random: 0,
    lines: {
      greet: [L('Ich hoffe, dein König hat sich warm angezogen.', 'I hope your king dressed warmly.')],
      capture: [L('Danke.', 'Thanks.')],
      check: [L('Schach.', 'Check.')],
      playerBlunder: [L('Das wird teuer.', "That's going to cost you.")],
      botWin: [L('Gutes Spiel.', 'Good game.')],
      botLose: [L('Stark gespielt. Ehrlich.', 'Strong play. Honestly.')],
    },
  },
  {
    id: 'bunker', category: 'Meister', name: L('Der Bunker', 'The Bunker'), rating: 2250, color: '#6b7b8c', style: 'defensive', styleLabel: L('Felsenfest', 'Rock solid'),
    bio: L('Steht wie eine Mauer. Wartet geduldig, bis du übertreibst.', 'Stands like a wall. Waits patiently until you overpush.'),
    depth: 13, temp: 18, blunder: 0.01, random: 0,
    lines: {
      greet: ['…', L('Komm nur.', 'Come on.')],
      capture: ['…'],
      check: [L('Schach.', 'Check.')],
      playerBlunder: [L('Geduld zahlt sich aus.', 'Patience pays off.')],
      botWin: [L('Die Mauer steht.', 'The wall stands.')],
      botLose: [L('Die Mauer ist gefallen.', 'The wall has fallen.')],
    },
  },
  {
    id: 'titan', category: 'Meister', name: 'Titan', rating: 2500, color: '#3d3d3d', style: 'balanced', styleLabel: L('Großmeister', 'Grandmaster'),
    bio: L('Großmeister-Niveau. Macht kaum Fehler.', 'Grandmaster level. Hardly makes mistakes.'),
    depth: 15, temp: 8, blunder: 0, random: 0,
    lines: {
      greet: [L('Viel Erfolg.', 'Good luck.')],
      check: [L('Schach.', 'Check.')],
      botWin: [L('Gut gekämpft.', 'Well fought.')],
      botLose: [L('Beeindruckend.', 'Impressive.')],
    },
  },
  {
    id: 'max', category: 'Engine', name: 'Stockfish Max', rating: 3200, color: '#2b6cb0', style: 'machine', styleLabel: L('Maschine', 'Machine'),
    bio: L('Volle Engine-Stärke. Viel Glück.', 'Full engine strength. Good luck.'),
    depth: 20, temp: 0, blunder: 0, random: 0,
    lines: {
      greet: [L('INITIALISIERE… GEGNER ERKANNT.', 'INITIALIZING… OPPONENT DETECTED.')],
      botWin: [L('ERGEBNIS: 1 PARTIE GEWONNEN.', 'RESULT: 1 GAME WON.')],
      botLose: [L('FEHLER 404: NIEDERLAGE NICHT ERWARTET.', 'ERROR 404: DEFEAT NOT EXPECTED.')],
    },
  },
];

const NEW_BOTS: Bot[] = [
  {
    id: 'mia', category: 'Anfänger', name: 'Mia', rating: 250, color: '#f3a6c8', style: 'knights', styleLabel: L('Springer-Fan', 'Knight fan'),
    bio: L('Findet Pferdchen am schönsten. Alle anderen Figuren sind eher Deko.', 'Thinks horsies are the prettiest. All other pieces are just decoration.'),
    depth: 3, temp: 320, blunder: 0.3, random: 0.45,
    lines: {
      greet: [L('Hallo! Darf ich die Pferdchen zuerst ziehen?', 'Hello! Can I move the horsies first?')],
      capture: [L('Hüpf!', 'Hop!'), L('Mein Pferdchen hat gewonnen!', 'My horsey won!')],
      check: [L('Schach! Ist das gut?', 'Check! Is that good?')],
      botWin: [L('Die Pferdchen haben gewonnen!', 'The horsies won!')],
      botLose: [L('Du bist echt gut. Nochmal?', "You're really good. Again?")],
    },
  },
  {
    id: 'tim', category: 'Anfänger', name: 'Tim', rating: 550, color: '#9ad0f5', style: 'copycat', styleLabel: L('Nachmacher', 'Copycat'),
    bio: L('Macht einfach deine Züge nach – gespiegelt. Klappt erstaunlich lange.', 'Simply copies your moves – mirrored. Works surprisingly long.'),
    depth: 4, temp: 200, blunder: 0.2, random: 0.15,
    lines: {
      greet: [L('Was du kannst, kann ich auch!', 'Anything you can do, I can do too!'), L('Ich mach dir alles nach.', "I'll copy everything you do.")],
      capture: [L('Hab ich mir abgeschaut.', 'Learned that from you.')],
      check: [L('Schach! Wie du!', 'Check! Just like you!')],
      playerBlunder: [L('Den Zug mach ich lieber nicht nach …', "I'd rather not copy that move …")],
      botWin: [L('Ha! Nachmachen funktioniert!', 'Ha! Copying works!')],
      botLose: [L('Okay, das konnte ich nicht nachmachen.', "Okay, I couldn't copy that.")],
    },
  },
  {
    id: 'gerda', category: 'Fortgeschritten', name: L('Oma Gerda', 'Granny Gerda'), rating: 850, color: '#c9a7d8', style: 'trader', styleLabel: L('Tauscherin', 'Trader'),
    bio: L('Tauscht alles, was sich tauschen lässt. „Weniger Figuren, weniger Ärger.“', 'Trades everything that can be traded. "Fewer pieces, fewer worries."'),
    depth: 5, temp: 150, blunder: 0.14, random: 0.08,
    lines: {
      greet: [L('Na Kindchen, wollen wir ein bisschen tauschen?', 'Well dear, shall we trade a little?')],
      capture: [L('Eins gegen eins, das ist fair.', "One for one, that's fair."), L('Tausch ist Tausch.', 'A trade is a trade.')],
      check: [L('Schach, mein Lieber.', 'Check, my dear.')],
      botWin: [L('Siehst du, mit wenig Figuren ist alles übersichtlicher.', 'See, with fewer pieces everything is clearer.')],
      botLose: [L('Du bist ja ein ganz Schlauer!', "Aren't you a clever one!")],
    },
  },
  {
    id: 'kalle', category: 'Fortgeschritten', name: 'Kalle', rating: 1100, color: '#f4b860', style: 'queenie', styleLabel: L('Damen-Ausflügler', 'Early queen'),
    bio: L('Holt die Dame im zweiten Zug raus. Jedes Mal. Manchmal klappt es.', 'Brings the queen out on move two. Every time. Sometimes it works.'),
    depth: 6, temp: 100, blunder: 0.1, random: 0.03,
    lines: {
      greet: [L('Meine Dame und ich sind ein Team.', 'My queen and I are a team.'), L('Schäfermatt? Vielleicht …', "Scholar's mate? Maybe …")],
      capture: [L('Die Dame räumt auf!', 'The queen cleans up!')],
      check: [L('Schach von der Königin!', 'Check from Her Majesty!')],
      playerBlunder: [L('Meine Dame sieht alles.', 'My queen sees everything.')],
      botWin: [L('Die Dame regiert!', 'The queen rules!')],
      botLose: [L('Meine arme Dame …', 'My poor queen …')],
    },
  },
  {
    id: 'sven', category: 'Fortgeschritten', name: 'Sven', rating: 1250, color: '#8fc17a', style: 'pawnStorm', styleLabel: L('Bauernsturm', 'Pawn storm'),
    bio: L('Schiebt Bauern nach vorne, bis der Gegner keine Luft mehr bekommt.', "Pushes pawns forward until the opponent can't breathe."),
    depth: 7, temp: 80, blunder: 0.08, random: 0.01,
    lines: {
      greet: [L('Meine Bauern marschieren!', 'My pawns are marching!')],
      capture: [L('Der Bauer frisst sich durch.', 'The pawn chews its way through.')],
      check: [L('Schach! Und die Bauern kommen nach.', 'Check! And the pawns follow.')],
      botWin: [L('Kein Platz mehr für dich.', 'No room left for you.')],
      botLose: [L('Zu weit vorgerückt …', 'Pushed too far …')],
    },
  },
  {
    id: 'paula', category: 'Fortgeschritten', name: L('Pferde-Paula', 'Pony Paula'), rating: 1400, color: '#d7a46b', style: 'knights', styleLabel: L('Springer-Spezialistin', 'Knight specialist'),
    bio: L('Springergabeln sind ihre Leidenschaft. Achte auf jedes Feld, das ein Springer erreichen kann.', 'Knight forks are her passion. Watch every square a knight can reach.'),
    depth: 8, temp: 60, blunder: 0.05, random: 0,
    lines: {
      greet: [L('Pass auf deine Felder auf – meine Springer sehen alles.', 'Watch your squares – my knights see everything.')],
      capture: [L('Gabel!', 'Fork!'), L('Huf drauf.', 'Hoof down.')],
      check: [L('Springerschach!', 'Knight check!')],
      playerBlunder: [L('Das riecht nach einer Gabel …', 'Smells like a fork …')],
      botWin: [L('Die Springer haben es entschieden.', 'The knights decided it.')],
      botLose: [L('Du hast meine Springer gut im Griff gehabt.', 'You handled my knights well.')],
    },
  },
  {
    id: 'gregor', category: 'Erfahren', name: L('Gambit-Gregor', 'Gambit Gregor'), rating: 1600, color: '#e58f6a', style: 'gambit', styleLabel: L('Gambitspieler', 'Gambiteer'),
    bio: L('Opfert früh Bauern für Entwicklung und Angriff. Nimm die Bauern – wenn du dich traust.', 'Sacrifices pawns early for development and attack. Take them – if you dare.'),
    depth: 9, temp: 50, blunder: 0.04, random: 0,
    lines: {
      greet: [L('Ein Bauer gefällig? Nimm ruhig.', 'Fancy a pawn? Go ahead, take it.'), L('Wer nicht wagt, der nicht gewinnt.', 'Fortune favors the bold.')],
      capture: [L('Jetzt hole ich mir alles zurück.', "Now I'm taking it all back.")],
      check: [L('Schach! Siehst du die Initiative?', 'Check! See the initiative?')],
      playerBlunder: [L('Das Gambit zahlt sich aus.', 'The gambit pays off.')],
      botWin: [L('Initiative schlägt Material.', 'Initiative beats material.')],
      botLose: [L('Du hast das Gambit gut abgewehrt.', 'You defended the gambit well.')],
    },
  },
  {
    id: 'ingrid', category: 'Erfahren', name: 'Ingrid', rating: 1900, color: '#7fa7c9', style: 'trader', styleLabel: L('Endspiel-Expertin', 'Endgame expert'),
    bio: L('Tauscht schnell in ein Endspiel ab – und dort macht sie keine Fehler.', "Trades down into an endgame quickly – and there she doesn't make mistakes."),
    depth: 12, temp: 22, blunder: 0.015, random: 0,
    lines: {
      greet: [L('Wir sehen uns im Endspiel.', 'See you in the endgame.')],
      capture: [L('Ein Tausch weniger bis zum Endspiel.', 'One trade closer to the endgame.')],
      check: [L('Schach.', 'Check.')],
      botWin: [L('Endspiele gewinnt man nicht durch Glück.', "You don't win endgames by luck.")],
      botLose: [L('Starke Technik. Respekt.', 'Strong technique. Respect.')],
    },
  },
  {
    id: 'kobra', category: 'Meister', name: L('Kobra', 'Cobra'), rating: 2100, color: '#5f8a5a', style: 'counter', styleLabel: L('Konterspieler', 'Counterpuncher'),
    bio: L('Wartet geduldig ab und schlägt zu, sobald du eine Lücke lässt.', 'Waits patiently and strikes the moment you leave a gap.'),
    depth: 13, temp: 18, blunder: 0.01, random: 0,
    lines: {
      greet: [L('Ssssso. Zeig mir, was du hast.', "Ssssso. Show me what you've got.")],
      capture: [L('Zugeschnappt.', 'Snap.')],
      check: [L('Schach. Ssss.', 'Check. Ssss.')],
      playerBlunder: [L('Da ist die Lücke.', "There's the gap.")],
      botWin: [L('Geduld ist Gift.', 'Patience is poison.')],
      botLose: [L('Du hast mir keine Lücke gelassen.', "You didn't leave me a gap.")],
    },
  },
];

/** Alle Bots, aufsteigend nach Spielstärke */
export const BOTS: Bot[] = [...BASE_BOTS, ...NEW_BOTS].sort((a, b) => a.rating - b.rating);

export const COACH_BOT: Bot = {
  id: 'coach', category: 'Fortgeschritten', name: 'Coach', rating: 1200, color: '#81b64c', style: 'balanced', styleLabel: 'Coach',
  bio: L('Spielt mit dir auf Augenhöhe und erklärt jeden Zug. (Stärke einstellbar)', 'Plays at your level and explains every move. (Adjustable strength)'),
  depth: 7, temp: 90, blunder: 0.06, random: 0.02,
  lines: { greet: [L('Lass uns eine lehrreiche Partie spielen! Ich erkläre dir unterwegs, was passiert.', "Let's play an instructive game! I'll explain what's happening along the way.")] },
};

/** Angezeigter Name einer Kategorie (intern bleiben die deutschen Kennungen) */
export function categoryLabel(c: Category) {
  return ({ Anfänger: L('Anfänger', 'Beginner'), Fortgeschritten: L('Fortgeschritten', 'Intermediate'), Erfahren: L('Erfahren', 'Advanced'), Meister: L('Meister', 'Master'), Engine: 'Engine' } as const)[c];
}

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
