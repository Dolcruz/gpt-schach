import { Chess } from 'chess.js';
import { L } from '../i18n';
import { OPENINGS } from './openings';

/** Eröffnungslinie, der der Bot folgt (SAN ab Grundstellung, beide Seiten) */
export interface BookLine {
  name: string;
  sans: string[];
}

export function openingLine(id: string): BookLine | null {
  const o = OPENINGS.find((x) => x.id === id);
  return o ? { name: o.name, sans: o.moves } : null;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/**
 * Liest eine Coach-Angabe: Eröffnungs-ID ("scandi"), "Name | e4 d5 exd5" oder nur Züge.
 * Züge werden gegen die Grundstellung geprüft und beim ersten illegalen Zug abgeschnitten.
 */
export function parseBookLine(spec: string): BookLine | null {
  const raw = spec.trim();
  if (!raw) return null;
  const [head, tail] = raw.includes('|') ? raw.split('|', 2).map((s) => s.trim()) : ['', raw];
  const byId = OPENINGS.find((o) => o.id === norm(tail) || norm(o.name) === norm(tail));
  if (byId) return { name: byId.name, sans: byId.moves };
  const tokens = tail
    .replace(/\d+\.(\.\.)?/g, ' ')
    .split(/[\s,]+/)
    .map((t) => t.replace(/[!?*]+$/g, '').trim())
    .filter((t) => t && t !== '...' && t !== '…');
  const c = new Chess();
  const sans: string[] = [];
  for (const t of tokens) {
    try {
      sans.push(c.move(t).san);
    } catch {
      break;
    }
  }
  if (sans.length < 2) return null;
  // Namen von der bekannten Eröffnung mit dem längsten gemeinsamen Anfang übernehmen
  const lcp = (m: string[]) => {
    let i = 0;
    while (i < m.length && i < sans.length && m[i] === sans[i]) i++;
    return i;
  };
  const known = [...OPENINGS].sort((a, b) => lcp(b.moves) - lcp(a.moves))[0];
  const knownName = known && lcp(known.moves) >= Math.min(6, sans.length) ? known.name : '';
  return { name: head || knownName || sans.slice(0, 4).join(' '), sans };
}

/** Passt die bisherige Partie (noch) zur Linie? */
export const fitsLine = (line: BookLine, history: string[]) => history.every((s, i) => line.sans[i] === s);

/** Nächster Buchzug, falls die Partie noch der Linie folgt */
export function bookMove(line: BookLine | null, history: string[]): string | null {
  if (!line || history.length >= line.sans.length || !fitsLine(line, history)) return null;
  return line.sans[history.length];
}

export type BookState = { kind: 'following'; next: string } | { kind: 'done' } | { kind: 'left'; ply: number };

export function bookState(line: BookLine, history: string[]): BookState {
  const dev = history.findIndex((s, i) => i >= line.sans.length || line.sans[i] !== s);
  if (dev === -1) return history.length < line.sans.length ? { kind: 'following', next: line.sans[history.length] } : { kind: 'done' };
  return dev >= line.sans.length ? { kind: 'done' } : { kind: 'left', ply: dev };
}

/** Zeile für den Coach-Kontext */
export function bookNote(line: BookLine, history: string[]) {
  const st = bookState(line, history);
  const status =
    st.kind === 'following'
      ? L(`Partie folgt noch der Theorie, nächster Theoriezug: ${st.next}`, `Game still follows the theory, next theory move: ${st.next}`)
      : st.kind === 'done'
        ? L('Theorie-Linie ist zu Ende, der Bot spielt jetzt frei', 'The theory line is finished, the bot now plays freely')
        : L(`Theorie verlassen beim ${st.ply + 1}. Halbzug (${history[st.ply]} statt ${line.sans[st.ply]})`, `Theory left at half-move ${st.ply + 1} (${history[st.ply]} instead of ${line.sans[st.ply]})`);
  return L(
    `Gewählte Eröffnung: ${line.name} (${line.sans.join(' ')}). Der Bot spielt seine Züge aus dieser Linie, solange die Partie ihr folgt. ${status}.`,
    `Chosen opening: ${line.name} (${line.sans.join(' ')}). The bot plays its moves from this line as long as the game follows it. ${status}.`,
  );
}

/** Eröffnungsliste für die Coach-Anweisungen */
export const openingCatalog = () => OPENINGS.map((o) => `${o.id} = ${o.name}`).join(', ');
