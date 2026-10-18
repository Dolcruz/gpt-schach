export interface AuthInfo {
  loggedIn: boolean;
  email?: string;
  plan?: string;
  source?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  efforts: string[];
  defaultEffort: string;
}

async function json<T>(r: Response): Promise<T> {
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error ?? `Fehler ${r.status}`);
  return j as T;
}

export const api = {
  status: () => fetch('/api/auth/status').then((r) => json<AuthInfo>(r)),
  login: () => fetch('/api/auth/login', { method: 'POST' }).then((r) => json<{ url: string }>(r)),
  importCodex: () => fetch('/api/auth/import-codex', { method: 'POST' }).then((r) => json<AuthInfo>(r)),
  logout: () => fetch('/api/auth/logout', { method: 'POST' }).then((r) => json<AuthInfo>(r)),
  models: () => fetch('/api/models').then((r) => json<{ models: ModelInfo[] }>(r)),
};

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

/** Streamt die Coach-Antwort; onDelta bekommt den bisher zusammengesetzten Text. */
export async function streamCoach(
  body: { model: string; effort?: string; instructions: string; messages: ChatMsg[] },
  onDelta: (full: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const r = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
  if (!r.ok || !r.body) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error ?? `Fehler ${r.status}`);
  }
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let full = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      if (!chunk.startsWith('data:')) continue;
      const ev = JSON.parse(chunk.slice(5));
      if (ev.t === 'delta') {
        full += ev.d;
        onDelta(full);
      } else if (ev.t === 'error') throw new Error(ev.d);
    }
  }
  return full;
}
