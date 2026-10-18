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
