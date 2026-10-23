// Eröffnungstrainer: Hauptvarianten zum Nachspielen
import { lang } from '../i18n';

export interface Opening {
  id: string;
  name: string;
  eco: string;
  /** Seite, die du übst */
  side: 'w' | 'b';
  family: 'Offene Spiele (1.e4 e5)' | 'Halboffene Spiele (1.e4 andere)' | 'Geschlossene Spiele (1.d4)' | 'Flankeneröffnungen';
  level: 'Einsteiger' | 'Fortgeschritten' | 'Erfahren';
  moves: string[];
  idea: string;
}

export const OPENINGS: Opening[] = [
  {
    id: 'italian', name: 'Italienische Partie', eco: 'C50', side: 'w', family: 'Offene Spiele (1.e4 e5)', level: 'Einsteiger',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'O-O', 'Re1', 'a6', 'Bb3', 'Ba7'],
    idea: 'Schnelle Entwicklung, Läufer zielt auf f7. Mit c3 und d3 baut Weiß ein solides Zentrum auf und bereitet später d4 vor.',
  },
  {
    id: 'ruy', name: 'Spanische Partie', eco: 'C84', side: 'w', family: 'Offene Spiele (1.e4 e5)', level: 'Fortgeschritten',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3'],
    idea: 'Der Läufer übt Druck auf den Springer c6 aus, der e5 deckt. Weiß spielt langfristig auf das Zentrum mit c3 und d4.',
  },
  {
    id: 'scotch', name: 'Schottische Partie', eco: 'C45', side: 'w', family: 'Offene Spiele (1.e4 e5)', level: 'Einsteiger',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Be3', 'Qf6', 'c3', 'Nge7', 'Bc4'],
    idea: 'Weiß öffnet sofort mit d4 das Zentrum und bekommt freies Figurenspiel.',
  },
  {
    id: 'twoknights', name: 'Zweispringerspiel im Nachzuge', eco: 'C59', side: 'b', family: 'Offene Spiele (1.e4 e5)', level: 'Fortgeschritten',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Na5', 'Bb5+', 'c6', 'dxc6', 'bxc6', 'Be2', 'h6', 'Nf3', 'e4', 'Ne5'],
    idea: 'Schwarz verteidigt sich gegen den Angriff auf f7 aktiv: Für den Bauern bekommt Schwarz schnelle Entwicklung und Initiative.',
  },
  {
    id: 'najdorf', name: 'Sizilianisch – Najdorf', eco: 'B92', side: 'b', family: 'Halboffene Spiele (1.e4 andere)', level: 'Erfahren',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be2', 'e5', 'Nb3', 'Be7', 'O-O', 'O-O'],
    idea: 'Schwarz kämpft asymmetrisch um das Zentrum. ...a6 verhindert Nb5/Bb5 und bereitet ...e5 oder ...b5 vor.',
  },
  {
    id: 'french', name: 'Französisch – Vorstoßvariante', eco: 'C02', side: 'b', family: 'Halboffene Spiele (1.e4 andere)', level: 'Fortgeschritten',
    moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6', 'a3', 'c4', 'Nbd2', 'Na5'],
    idea: 'Schwarz greift die weiße Bauernkette an ihrer Basis (d4) an. Die Dame auf b6 und der Springer auf c6 erhöhen den Druck.',
  },
  {
    id: 'caro', name: 'Caro-Kann – Klassisch', eco: 'B18', side: 'b', family: 'Halboffene Spiele (1.e4 andere)', level: 'Einsteiger',
    moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7', 'h5', 'Bh7', 'Bd3', 'Bxd3', 'Qxd3'],
    idea: 'Solide Struktur: Schwarz entwickelt den Damenläufer vor die Bauernkette und steht sehr stabil.',
  },
  {
    id: 'scandi', name: 'Skandinavisch', eco: 'B01', side: 'b', family: 'Halboffene Spiele (1.e4 andere)', level: 'Einsteiger',
    moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3', 'c6', 'Bc4', 'Bf5', 'Bd2', 'e6'],
    idea: 'Schwarz stellt sofort die Zentrumsfrage. Die Dame steht auf a5 sicher, Schwarz baut mit c6, Bf5 und e6 eine solide Stellung auf.',
  },
  {
    id: 'london', name: 'Londoner System', eco: 'D02', side: 'w', family: 'Geschlossene Spiele (1.d4)', level: 'Einsteiger',
    moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'c5', 'c3', 'Nc6', 'Nbd2', 'Bd6', 'Bg3', 'O-O', 'Bd3'],
    idea: 'Ein leicht zu lernendes System: Läufer nach f4, Bauern auf c3–d4–e3, dann Bd3, Nbd2, O-O. Funktioniert gegen fast alles.',
  },
  {
    id: 'qgd', name: 'Abgelehntes Damengambit', eco: 'D37', side: 'b', family: 'Geschlossene Spiele (1.d4)', level: 'Fortgeschritten',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Be7', 'Bg5', 'O-O', 'e3', 'h6', 'Bh4', 'b6'],
    idea: 'Schwarz hält mit e6 den Stützpunkt d5. Klassisch, solide, mit späterem Befreiungszug ...c5.',
  },
  {
    id: 'qga', name: 'Angenommenes Damengambit', eco: 'D27', side: 'w', family: 'Geschlossene Spiele (1.d4)', level: 'Einsteiger',
    moves: ['d4', 'd5', 'c4', 'dxc4', 'Nf3', 'Nf6', 'e3', 'e6', 'Bxc4', 'c5', 'O-O', 'a6'],
    idea: 'Weiß gewinnt den Bauern mit Bxc4 zurück und hat ein starkes Zentrum mit schneller Entwicklung.',
  },
  {
    id: 'slav', name: 'Slawische Verteidigung', eco: 'D17', side: 'b', family: 'Geschlossene Spiele (1.d4)', level: 'Fortgeschritten',
    moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5', 'e3', 'e6', 'Bxc4', 'Bb4'],
    idea: 'Wie das Damengambit, aber der Damenläufer kommt vor der Bauernkette ins Spiel (Bf5).',
  },
  {
    id: 'kid', name: 'Königsindisch', eco: 'E97', side: 'b', family: 'Geschlossene Spiele (1.d4)', level: 'Erfahren',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7'],
    idea: 'Schwarz überlässt Weiß zunächst das Zentrum und greift es dann mit ...e5 und später ...f5 am Königsflügel an.',
  },
  {
    id: 'nimzo', name: 'Nimzo-Indisch', eco: 'E32', side: 'b', family: 'Geschlossene Spiele (1.d4)', level: 'Erfahren',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O', 'a3', 'Bxc3+', 'Qxc3', 'b6', 'Bg5', 'Bb7'],
    idea: 'Schwarz fesselt den Springer c3 und kämpft so um e4. Oft gibt Schwarz das Läuferpaar für eine gesunde Struktur.',
  },
  {
    id: 'english', name: 'Englische Eröffnung', eco: 'A29', side: 'w', family: 'Flankeneröffnungen', level: 'Fortgeschritten',
    moves: ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'd5', 'cxd5', 'Nxd5', 'Bg2', 'Nb6', 'Nf3', 'Nc6', 'O-O', 'Be7'],
    idea: 'Ein umgekehrter Sizilianer: Weiß kontrolliert das Zentrum von der Flanke, der Läufer auf g2 wirkt auf der langen Diagonale.',
  },
  {
    id: 'vienna', name: 'Wiener Partie', eco: 'C25', side: 'w', family: 'Offene Spiele (1.e4 e5)', level: 'Einsteiger',
    moves: ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Nc6', 'd3', 'Bc5', 'f4', 'd6', 'Nf3', 'O-O'],
    idea: 'Weiß bereitet mit Nc3 den Vorstoß f4 vor und bekommt einen gefährlichen Königsangriff.',
  },
  {
    id: 'fourknights', name: 'Schottisches Vierspringerspiel', eco: 'C47', side: 'w', family: 'Offene Spiele (1.e4 e5)', level: 'Einsteiger',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'd4', 'exd4', 'Nxd4', 'Bb4', 'Nxc6', 'bxc6', 'Bd3', 'd5', 'exd5', 'cxd5', 'O-O', 'O-O', 'Bg5', 'c6'],
    idea: 'Alle vier Springer kommen schnell heraus, dann öffnet Weiß mit d4 das Zentrum. Nach dem Tausch auf c6 deckt Bd3 den e-Bauern, Weiß rochiert und fesselt mit Bg5.',
  },
  {
    id: 'kingsgambit', name: 'Königsgambit', eco: 'C39', side: 'w', family: 'Offene Spiele (1.e4 e5)', level: 'Fortgeschritten',
    moves: ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5', 'h4', 'g4', 'Ne5', 'Nf6', 'd4', 'd6', 'Nd3', 'Nxe4'],
    idea: 'Weiß opfert den f-Bauern, um die f-Linie zu öffnen und schnell anzugreifen. Ein scharfes, romantisches Gambit.',
  },
  {
    id: 'evans', name: 'Evans-Gambit', eco: 'C52', side: 'w', family: 'Offene Spiele (1.e4 e5)', level: 'Fortgeschritten',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O', 'Nge7'],
    idea: 'Ein Italienisch mit Bauernopfer: Mit b4 und c3 gewinnt Weiß Tempo für d4 und bekommt ein starkes Zentrum mit Angriff.',
  },
  {
    id: 'petroff', name: 'Russische Verteidigung (Petroff)', eco: 'C42', side: 'b', family: 'Offene Spiele (1.e4 e5)', level: 'Fortgeschritten',
    moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'd6', 'Nf3', 'Nxe4', 'd4', 'd5', 'Bd3', 'Nc6', 'O-O', 'Be7'],
    idea: 'Schwarz greift sofort zurück an statt e5 zu decken. Sehr solide – aber Vorsicht: erst d6, dann den e-Bauern nehmen.',
  },
  {
    id: 'dragon', name: 'Sizilianisch – Drachen', eco: 'B76', side: 'b', family: 'Halboffene Spiele (1.e4 andere)', level: 'Erfahren',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'Bc4', 'Bd7'],
    idea: 'Der Läufer auf g7 („Drache“) zielt auf die lange Diagonale. Oft rochieren beide Seiten entgegengesetzt und greifen sich gegenseitig an.',
  },
  {
    id: 'alapin', name: 'Sizilianisch – Alapin (2.c3)', eco: 'B22', side: 'w', family: 'Halboffene Spiele (1.e4 andere)', level: 'Einsteiger',
    moves: ['e4', 'c5', 'c3', 'Nf6', 'e5', 'Nd5', 'd4', 'cxd4', 'Nf3', 'Nc6', 'cxd4', 'd6', 'Bc4', 'Nb6', 'Bb5'],
    idea: 'Ein ruhiger Weg gegen Sizilianisch: Mit c3 bereitet Weiß d4 vor und bekommt ein klassisches Bauernzentrum, ohne viel Theorie lernen zu müssen.',
  },
  {
    id: 'pirc', name: 'Pirc-Verteidigung', eco: 'B08', side: 'b', family: 'Halboffene Spiele (1.e4 andere)', level: 'Fortgeschritten',
    moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Nf3', 'Bg7', 'Be2', 'O-O', 'O-O', 'c6'],
    idea: 'Schwarz lässt Weiß das Zentrum, entwickelt den Läufer nach g7 und greift das Zentrum später mit …e5 oder …c5 an.',
  },
  {
    id: 'grunfeld', name: 'Grünfeld-Indisch', eco: 'D85', side: 'b', family: 'Geschlossene Spiele (1.d4)', level: 'Erfahren',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7', 'Nf3', 'c5', 'Be3', 'Qa5'],
    idea: 'Schwarz lässt Weiß ein großes Bauernzentrum bauen und greift es dann mit dem Läufer g7 und …c5 an.',
  },
  {
    id: 'catalan', name: 'Katalanisch', eco: 'E05', side: 'w', family: 'Geschlossene Spiele (1.d4)', level: 'Erfahren',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'dxc4', 'Qc2', 'a6', 'Qxc4', 'b5', 'Qc2', 'Bb7'],
    idea: 'Der Läufer auf g2 drückt auf die lange Diagonale. Weiß opfert oft vorübergehend den c-Bauern und gewinnt ihn mit Qc2 zurück.',
  },
  {
    id: 'dutch', name: 'Holländisch – Leningrader System', eco: 'A87', side: 'b', family: 'Geschlossene Spiele (1.d4)', level: 'Fortgeschritten',
    moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'g6', 'Nf3', 'Bg7', 'O-O', 'O-O', 'c4', 'd6', 'Nc3', 'Qe8'],
    idea: 'Mit …f5 kontrolliert Schwarz e4 und plant einen Königsangriff, oft mit …Qe8–h5 und …e5.',
  },
];

// ---------- English ----------

const OPENINGS_EN: Record<string, { name: string; idea: string }> = {
  italian: { name: 'Italian Game', idea: 'Fast development with the bishop aiming at f7. With c3 and d3 White builds a solid center and prepares d4 later.' },
  ruy: { name: 'Ruy Lopez', idea: 'The bishop pressures the knight on c6, which defends e5. In the long run White plays for the center with c3 and d4.' },
  scotch: { name: 'Scotch Game', idea: 'White opens the center immediately with d4 and gets free piece play.' },
  twoknights: { name: 'Two Knights Defense', idea: 'Black defends actively against the attack on f7: in return for the pawn Black gets fast development and the initiative.' },
  najdorf: { name: 'Sicilian Najdorf', idea: 'Black fights for the center asymmetrically. …a6 prevents Nb5/Bb5 and prepares …e5 or …b5.' },
  french: { name: 'French Defense – Advance Variation', idea: "Black attacks White's pawn chain at its base (d4). The queen on b6 and the knight on c6 add pressure." },
  caro: { name: 'Caro-Kann – Classical', idea: 'A solid structure: Black develops the light-squared bishop outside the pawn chain and stands very stable.' },
  scandi: { name: 'Scandinavian Defense', idea: 'Black challenges the center right away. The queen is safe on a5, and Black builds a solid setup with c6, Bf5 and e6.' },
  london: { name: 'London System', idea: 'An easy-to-learn system: bishop to f4, pawns on c3–d4–e3, then Bd3, Nbd2, O-O. Works against almost anything.' },
  qgd: { name: "Queen's Gambit Declined", idea: 'Black holds the d5 strongpoint with e6. Classical and solid, with the freeing break …c5 later.' },
  qga: { name: "Queen's Gambit Accepted", idea: 'White wins the pawn back with Bxc4 and has a strong center with fast development.' },
  slav: { name: 'Slav Defense', idea: "Like the Queen's Gambit, but the light-squared bishop gets out before the pawn chain (Bf5)." },
  kid: { name: "King's Indian Defense", idea: 'Black first lets White have the center and then attacks it with …e5 and later …f5 on the kingside.' },
  nimzo: { name: 'Nimzo-Indian Defense', idea: 'Black pins the knight on c3 and fights for e4. Black often gives up the bishop pair for a healthy structure.' },
  english: { name: 'English Opening', idea: 'A reversed Sicilian: White controls the center from the flank, the bishop on g2 works along the long diagonal.' },
  vienna: { name: 'Vienna Game', idea: 'With Nc3 White prepares f4 and gets a dangerous kingside attack.' },
  fourknights: { name: 'Scotch Four Knights', idea: 'All four knights come out quickly, then White opens the center with d4. After the trade on c6, Bd3 protects the e-pawn, White castles and pins with Bg5.' },
  kingsgambit: { name: "King's Gambit", idea: 'White sacrifices the f-pawn to open the f-file and attack fast. A sharp, romantic gambit.' },
  evans: { name: 'Evans Gambit', idea: 'An Italian with a pawn sacrifice: with b4 and c3 White gains time for d4 and gets a strong center with an attack.' },
  petroff: { name: 'Petroff Defense', idea: 'Black counter-attacks immediately instead of defending e5. Very solid – but careful: play d6 first, then take the e-pawn.' },
  dragon: { name: 'Sicilian Dragon', idea: 'The bishop on g7 (the "dragon") aims down the long diagonal. Often both sides castle on opposite wings and attack each other.' },
  alapin: { name: 'Sicilian Alapin (2.c3)', idea: 'A quiet way against the Sicilian: with c3 White prepares d4 and gets a classical pawn center without much theory.' },
  pirc: { name: 'Pirc Defense', idea: 'Black lets White have the center, develops the bishop to g7 and attacks the center later with …e5 or …c5.' },
  grunfeld: { name: 'Grünfeld Defense', idea: 'Black lets White build a big pawn center and then attacks it with the g7 bishop and …c5.' },
  catalan: { name: 'Catalan Opening', idea: 'The bishop on g2 presses on the long diagonal. White often gives up the c-pawn temporarily and wins it back with Qc2.' },
  dutch: { name: 'Dutch Defense – Leningrad', idea: 'With …f5 Black controls e4 and plans a kingside attack, often with …Qe8–h5 and …e5.' },
};

if (lang === 'en') for (const o of OPENINGS) Object.assign(o, OPENINGS_EN[o.id] ?? {});

/** Angezeigter Name einer Eröffnungsfamilie */
export function familyLabel(f: Opening['family']) {
  if (lang !== 'en') return f;
  return {
    'Offene Spiele (1.e4 e5)': 'Open Games (1.e4 e5)',
    'Halboffene Spiele (1.e4 andere)': 'Semi-Open Games (1.e4 other)',
    'Geschlossene Spiele (1.d4)': 'Closed Games (1.d4)',
    Flankeneröffnungen: 'Flank Openings',
  }[f];
}
