// Varianten: Zugfolgen, die man auf dem Brett durchklicken kann
import { useCallback, useMemo, useState } from 'react';
import { Chess, type Move } from 'chess.js';
import type { Key } from 'chessground/types';

export interface Variation {
  startFen: string;
  sans: string[];
  title?: string;
}

const PIECE: Record<string, string> = { K: 'König', Q: 'Dame', R: 'Turm', B: 'Läufer', N: 'Springer' };
const PROMO: Record<string, string> = { Q: 'Dame', R: 'Turm', B: 'Läufer', N: 'Springer' };

/** SAN in verständliche Worte, z. B. "Nxd4+" → "Springer schlägt auf d4, Schach" */
export function sanToWords(san: string): string {
  if (san.startsWith('O-O-O')) return 'Lange Rochade' + (san.endsWith('#') ? ', Matt' : san.endsWith('+') ? ', Schach' : '');
  if (san.startsWith('O-O')) return 'Kurze Rochade' + (san.endsWith('#') ? ', Matt' : san.endsWith('+') ? ', Schach' : '');
  const m = san.match(/^([KQRBN])?([a-h]?[1-8]?)(x)?([a-h][1-8])(=([QRBN]))?([+#])?/);
  if (!m) return san;
  const piece = m[1] ? PIECE[m[1]] : 'Bauer';
  let s = `${piece} ${m[3] ? 'schlägt auf' : 'nach'} ${m[4]}`;
  if (m[6]) s += `, wird zur ${PROMO[m[6]]}`;
  if (m[7] === '#') s += ' – Matt!';
  else if (m[7] === '+') s += ', Schach';
  return s;
}

/** Holt VARIANTE:/PFEILE:-Zeilen aus einer Coach-Antwort */
export function extractMarkers(text: string): { text: string; lines: string[][]; arrows: string[] } {
  const lines: string[][] = [];
  let arrows: string[] = [];
  const kept: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const v = raw.match(/^\s*\**VARIANTE\**\s*:\s*(.+)$/i);
    const a = raw.match(/^\s*\**PFEILE\**\s*:\s*(.+)$/i);
    if (v) {
      const sans = v[1]
        .replace(/\d+\.(\.\.)?/g, ' ')
        .split(/[\s,]+/)
        .map((t) => t.replace(/[!?*]+$/g, '').trim())
        .filter((t) => t && t !== '...' && t !== '…');
      if (sans.length) lines.push(sans);
    } else if (a) {
      arrows = a[1].split(/[\s,]+/).filter((s) => /^[a-h][1-8][a-h][1-8]/.test(s)).slice(0, 3);
    } else kept.push(raw);
  }
  return { text: kept.join('\n').trim(), lines, arrows };
}

/** Während des Streamens die Marker-Zeilen ausblenden */
export const hideMarkers = (t: string) => t.replace(/\n?[^\n]*\b(VARIANTE|PFEILE)\b\s*:[^\n]*/gi, '').replace(/\n\s*\**(VARIANT|VARIAN|VARIA|VARI|PFEIL|PFEI)\w*$/i, '');

/** Prüft eine Zugfolge gegen mögliche Startstellungen; nimmt die, in der am meisten legal ist */
export function resolveVariation(sans: string[], fens: string[], title?: string): Variation | null {
  let best: Variation | null = null;
  for (const fen of fens) {
    if (!fen) continue;
    const c = new Chess(fen);
    const ok: string[] = [];
    for (const san of sans) {
      try {
        ok.push(c.move(san).san);
      } catch {
        break;
      }
    }
    if (ok.length && (!best || ok.length > best.sans.length)) best = { startFen: fen, sans: ok, title };
  }
  return best;
}

/** Zugnummern-Präfix für einen Halbzug in einer Variante */
export function moveLabel(startFen: string, index: number, always = false) {
  const parts = startFen.split(' ');
  const blackStarts = parts[1] === 'b';
  const startNo = Number(parts[5] ?? 1);
  const ply = index + (blackStarts ? 1 : 0);
  const no = startNo + Math.floor(ply / 2);
  return ply % 2 === 0 ? `${no}.` : index === 0 || always ? `${no}...` : '';
}

/** Zustand für das Durchklicken einer Variante auf einem Brett */
export function useVariationView() {
  const [state, setState] = useState<{ v: Variation; idx: number } | null>(null);
  const moves = useMemo<Move[]>(() => {
    if (!state) return [];
    const c = new Chess(state.v.startFen);
    return state.v.sans.map((s) => c.move(s));
  }, [state?.v]);

  const open = useCallback((v: Variation, idx = 0) => setState({ v, idx: Math.max(0, Math.min(idx, v.sans.length)) }), []);
  const close = useCallback(() => setState(null), []);
  const go = useCallback((idx: number) => setState((s) => (s ? { ...s, idx: Math.max(0, Math.min(idx, s.v.sans.length)) } : s)), []);

  const idx = state?.idx ?? 0;
  const current = idx > 0 ? moves[idx - 1] : undefined;
  const next = state && idx < moves.length ? moves[idx] : undefined;
  return {
    active: !!state,
    variation: state?.v ?? null,
    idx,
    moves,
    fen: state ? (current ? current.after : state.v.startFen) : null,
    lastMove: current ? ([current.from, current.to] as [string, string]) : undefined,
    current,
    /** Der kommende Zug als Pfeil-Vorschau */
    nextArrow: next ? ([next.from, next.to] as [string, string]) : null,
    open,
    close,
    go,
  };
}

export type VariationView = ReturnType<typeof useVariationView>;

/** Pfeil für den nächsten Zug der angezeigten Variante */
export function variationShapes(vv: VariationView) {
  return vv.nextArrow ? [{ orig: vv.nextArrow[0] as Key, dest: vv.nextArrow[1] as Key, brush: 'paleBlue' }] : [];
}

/** Scrollt nur den Nachrichten-Container ans Ende – nie die ganze Seite (wichtig bei schmalem Fenster) */
export function scrollFeedToEnd(endMarker: HTMLElement | null) {
  const feed = endMarker?.parentElement;
  if (feed) feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
}
