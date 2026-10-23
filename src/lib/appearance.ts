import { L } from '../i18n';

export const PIECE_SETS = [
  { id: 'cburnett', name: 'Klassisch' },
  { id: 'staunty', name: 'Staunty' },
  { id: 'maestro', name: 'Maestro' },
  { id: 'california', name: 'California' },
  { id: 'cardinal', name: 'Cardinal' },
  { id: 'fresca', name: 'Fresca' },
  { id: 'merida', name: 'Merida' },
  { id: 'chessnut', name: 'Chessnut' },
].map((s) => (s.id === 'cburnett' ? { ...s, name: L('Klassisch', 'Classic') } : s));

export const BOARDS = [
  { id: 'green', name: L('Grün', 'Green'), light: '#ebecd0', dark: '#739552' },
  { id: 'brown', name: L('Holz', 'Wood'), light: '#f0d9b5', dark: '#b58863' },
  { id: 'blue', name: L('Blau', 'Blue'), light: '#dee3e6', dark: '#8ca2ad' },
  { id: 'ice', name: L('Eis', 'Ice'), light: '#e8edf9', dark: '#7a93c4' },
  { id: 'gray', name: L('Grau', 'Gray'), light: '#e0e0e0', dark: '#9a9a9a' },
  { id: 'purple', name: L('Lila', 'Purple'), light: '#efefef', dark: '#8877b7' },
];

const read = (k: string, d: string) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};

export const getPieceSet = () => read('pieceSet', 'cburnett');
export const getBoard = () => read('boardTheme', 'green');

/** Figurensatz und Brettfarben auf die ganze Seite anwenden */
export function applyAppearance(pieceSet = getPieceSet(), board = getBoard()) {
  const root = document.documentElement;
  root.className = root.className.replace(/\bpieces-\S+/g, '').trim();
  if (pieceSet !== 'cburnett') {
    // Bilder vorladen, damit das Brett beim Umschalten nicht kurz leer ist
    for (const c of 'wb') for (const p of 'KQRBNP') new Image().src = `/pieces/${pieceSet}/${c}${p}.svg`;
    root.classList.add(`pieces-${pieceSet}`);
  }
  const b = BOARDS.find((x) => x.id === board) ?? BOARDS[0];
  root.style.setProperty('--light-sq', b.light);
  root.style.setProperty('--dark-sq', b.dark);
  try {
    localStorage.setItem('pieceSet', pieceSet);
    localStorage.setItem('boardTheme', b.id);
  } catch {
    /* ignorieren */
  }
}
