import { L } from '../i18n';
// Kronen: Fortschritt beim „Durchspielen“ der Bots
import { BOTS, type Bot } from '../bots';
import type { GameRecord } from './data';

export type CrownId = 'win' | 'both' | 'clean';

export const CROWNS: { id: CrownId; label: string; desc: string }[] = [
  { id: 'win', label: L('Besiegt', 'Defeated'), desc: L('Gewinne eine Partie', 'Win a game') },
  { id: 'both', label: L('Beide Farben', 'Both colors'), desc: L('Gewinne mit Weiß und mit Schwarz', 'Win with White and with Black') },
  { id: 'clean', label: L('Ohne Hilfe', 'No help'), desc: L('Gewinne ohne Zurücknehmen und ohne Hinweise', 'Win without takebacks and without hints') },
];

/** Gewertete Siege gegen einen Bot (Übungsstellungen zählen nicht) */
const winsVs = (botId: string, games: GameRecord[]) => games.filter((g) => g.botId === botId && g.result === 'win' && g.mode !== 'practice' && !g.startFen);

export function crownsFor(botId: string, games: GameRecord[]): Set<CrownId> {
  const wins = winsVs(botId, games);
  const out = new Set<CrownId>();
  if (wins.length) out.add('win');
  if (wins.some((g) => g.color === 'w') && wins.some((g) => g.color === 'b')) out.add('both');
  if (wins.some((g) => !g.takebacks && !g.hints)) out.add('clean');
  return out;
}

export function crownSummary(games: GameRecord[]) {
  const per = new Map(BOTS.map((b) => [b.id, crownsFor(b.id, games)]));
  const total = BOTS.length * CROWNS.length;
  const earned = [...per.values()].reduce((a, s) => a + s.size, 0);
  const beaten = BOTS.filter((b) => per.get(b.id)!.has('win')).length;
  /** Der schwächste Bot, den du noch nicht besiegt hast – dein nächstes Ziel */
  const next: Bot | undefined = BOTS.find((b) => !per.get(b.id)!.has('win'));
  return { per, total, earned, beaten, next };
}

/** Kronen, die durch eine neue Partie dazugekommen sind */
export function newCrowns(game: GameRecord, before: GameRecord[]): CrownId[] {
  const had = crownsFor(game.botId, before.filter((g) => g.id !== game.id));
  const now = crownsFor(game.botId, [...before.filter((g) => g.id !== game.id), game]);
  return CROWNS.map((c) => c.id).filter((id) => now.has(id) && !had.has(id));
}
