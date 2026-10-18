// Sprache für Server-Meldungen. Die App setzt ein Cookie „lang“; der Server ist lokal und
// bedient nur einen Nutzer, daher reicht die Sprache der jeweils letzten Anfrage.
import type { NextFunction, Request, Response } from 'express';

let current: 'de' | 'en' = 'en';

export const T = (de: string, en: string) => (current === 'en' ? en : de);

export function langMiddleware(req: Request, _res: Response, next: NextFunction) {
  const m = /(?:^|;\s*)lang=(de|en)\b/.exec(req.headers.cookie ?? '');
  current = m ? (m[1] as 'de' | 'en') : String(req.headers['accept-language'] ?? '').toLowerCase().startsWith('de') ? 'de' : 'en';
  next();
}
