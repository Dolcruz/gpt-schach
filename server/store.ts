// Einfacher JSON-Speicher für Partien, Puzzle-Versuche und Lernfortschritt (data/store.json).
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve(import.meta.dirname, '..', 'data', 'store.json');
export const COLLECTIONS = ['games', 'puzzles', 'lessons', 'openings', 'rush'] as const;
export type Collection = (typeof COLLECTIONS)[number];

type Item = { id: string; [k: string]: unknown };
type Store = Record<Collection, Item[]>;

function empty(): Store {
  return { games: [], puzzles: [], lessons: [], openings: [], rush: [] };
}

let store: Store = load();

function load(): Store {
  try {
    return { ...empty(), ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
  } catch {
    return empty();
  }
}

let saveTimer: NodeJS.Timeout | null = null;
function persist() {
  // Schreibvorgänge bündeln und atomar ersetzen, damit die Datei nie halb geschrieben ist
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(store));
    fs.renameSync(tmp, FILE);
  }, 200);
}

export function isCollection(c: string): c is Collection {
  return (COLLECTIONS as readonly string[]).includes(c);
}

export function list(c: Collection) {
  return store[c];
}

/** Legt an oder ersetzt (per id) – Felder werden zusammengeführt */
export function upsert(c: Collection, item: Item) {
  const arr = store[c];
  const i = arr.findIndex((x) => x.id === item.id);
  if (i >= 0) arr[i] = { ...arr[i], ...item };
  else arr.push(item);
  persist();
  return i >= 0 ? arr[i] : item;
}

export function remove(c: Collection, id: string) {
  store[c] = store[c].filter((x) => x.id !== id);
  persist();
}
