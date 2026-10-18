// Zweisprachigkeit (Deutsch / Englisch).
// Texte stehen direkt im Code als L('Deutsch', 'English') – so bleibt alles lesbar und nah beieinander.
// Die Sprache wird beim Start festgelegt; ein Wechsel lädt die Seite neu.

export type Lang = 'de' | 'en';

function detect(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'de' || saved === 'en') return saved;
  } catch {}
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en';
}

export const lang: Lang = typeof window !== 'undefined' ? detect() : 'de';

if (typeof document !== 'undefined') {
  document.documentElement.lang = lang;
  // Damit auch Server-Meldungen in der gewählten Sprache kommen
  document.cookie = `lang=${lang}; path=/; max-age=31536000; samesite=lax`;
}

/** Text in der aktuellen Sprache */
export const L = (de: string, en: string) => (lang === 'en' ? en : de);

/** Locale für Datum/Zahlen */
export const locale = lang === 'en' ? 'en-US' : 'de-DE';

export function setLang(l: Lang) {
  try {
    localStorage.setItem('lang', l);
  } catch {}
  location.reload();
}
