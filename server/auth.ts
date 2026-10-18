// ChatGPT-Login (gleicher OAuth-Flow wie die Codex CLI: "Sign in with ChatGPT").
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { T } from './i18n.ts';

export const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
const ISSUER = 'https://auth.openai.com';
const CALLBACK_PORT = 1455; // bei OpenAI für diesen Client registrierte Redirect-URI
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/auth/callback`;

const DATA_DIR = path.resolve(import.meta.dirname, '..', 'data');
const STORE = path.join(DATA_DIR, 'auth.json');

export interface Tokens {
  id_token: string;
  access_token: string;
  refresh_token: string;
  account_id: string;
  source: 'oauth' | 'codex';
}

export interface AuthInfo {
  loggedIn: boolean;
  email?: string;
  plan?: string;
  source?: string;
  pending?: boolean;
}

function decodeJwt(token: string): any {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return {};
  }
}

function claims(t: Tokens) {
  const c = decodeJwt(t.id_token);
  const auth = c['https://api.openai.com/auth'] ?? {};
  return { email: c.email as string | undefined, plan: auth.chatgpt_plan_type as string | undefined, accountId: auth.chatgpt_account_id as string | undefined };
}

let tokens: Tokens | null = load();
let pendingLogin: { verifier: string; state: string } | null = null;
let callbackServer: http.Server | null = null;

function load(): Tokens | null {
  try {
    return JSON.parse(fs.readFileSync(STORE, 'utf8'));
  } catch {
    return null;
  }
}

function save(t: Tokens | null) {
  tokens = t;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (t) fs.writeFileSync(STORE, JSON.stringify(t, null, 2));
  else if (fs.existsSync(STORE)) fs.unlinkSync(STORE);
}

export function status(): AuthInfo {
  if (!tokens) return { loggedIn: false, pending: !!pendingLogin };
  const c = claims(tokens);
  return { loggedIn: true, email: c.email, plan: c.plan, source: tokens.source };
}

export function logout() {
  save(null);
}

/** Übernimmt einen bestehenden Login der Codex CLI / Codex App (~/.codex/auth.json). */
export function importCodex(): AuthInfo {
  const file = path.join(process.env.CODEX_HOME ?? path.join(os.homedir(), '.codex'), 'auth.json');
  if (!fs.existsSync(file)) throw new Error(T('Keine Codex-Anmeldung gefunden (~/.codex/auth.json fehlt).', 'No Codex login found (~/.codex/auth.json is missing).'));
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const t = raw.tokens;
  if (!t?.access_token || !t?.refresh_token) throw new Error(T('Codex ist nicht mit einem ChatGPT-Konto angemeldet.', 'Codex is not signed in with a ChatGPT account.'));
  const next: Tokens = { id_token: t.id_token, access_token: t.access_token, refresh_token: t.refresh_token, account_id: t.account_id, source: 'codex' };
  next.account_id ||= claims(next).accountId ?? '';
  save(next);
  return status();
}

/** Startet den Browser-Login und liefert die URL, die der Nutzer öffnen soll. */
export async function startLogin(appUrl: string): Promise<string> {
  const verifier = crypto.randomBytes(64).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const state = crypto.randomBytes(32).toString('base64url');
  pendingLogin = { verifier, state };
  await ensureCallbackServer(appUrl);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid profile email offline_access',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    id_token_add_organizations: 'true',
    codex_cli_simplified_flow: 'true',
    state,
    originator: 'codex_cli_rs',
  });
  return `${ISSUER}/oauth/authorize?${params}`;
}

function ensureCallbackServer(appUrl: string): Promise<void> {
  if (callbackServer) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const srv = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? '/', REDIRECT_URI);
      if (url.pathname !== '/auth/callback') {
        res.writeHead(404).end();
        return;
      }
      const page = (title: string, body: string) =>
        `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:system-ui;background:#262421;color:#eee;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><h2>${title}</h2><p>${body}</p></div></body>`;
      try {
        if (!pendingLogin || url.searchParams.get('state') !== pendingLogin.state) throw new Error(T('Ungültiger Login-Status – bitte erneut versuchen.', 'Invalid login state – please try again.'));
        const code = url.searchParams.get('code');
        if (!code) throw new Error(url.searchParams.get('error_description') ?? T('Kein Code erhalten.', 'No code received.'));
        const r = await fetch(`${ISSUER}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: CLIENT_ID, code_verifier: pendingLogin.verifier }),
        });
        if (!r.ok) throw new Error(`${T('Token-Austausch fehlgeschlagen', 'Token exchange failed')} (${r.status}): ${await r.text()}`);
        const j: any = await r.json();
        const next: Tokens = { id_token: j.id_token, access_token: j.access_token, refresh_token: j.refresh_token, account_id: '', source: 'oauth' };
        next.account_id = claims(next).accountId ?? '';
        save(next);
        pendingLogin = null;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(
          page(T('Angemeldet ✓', 'Signed in ✓'), `${T('Du kannst dieses Fenster schließen.', 'You can close this window.')} <script>setTimeout(()=>{location.href=${JSON.stringify(appUrl)}},1200)</script>`),
        );
        setTimeout(closeCallbackServer, 500);
      } catch (e: any) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' }).end(page(T('Login fehlgeschlagen', 'Login failed'), String(e.message ?? e)));
      }
    });
    srv.once('error', (e: any) =>
      reject(new Error(e.code === 'EADDRINUSE' ? T(`Port ${CALLBACK_PORT} ist belegt (läuft gerade ein Codex-Login?).`, `Port ${CALLBACK_PORT} is busy (is a Codex login running right now?).`) : e.message)),
    );
    srv.listen(CALLBACK_PORT, '127.0.0.1', () => {
      callbackServer = srv;
      resolve();
    });
  });
}

function closeCallbackServer() {
  callbackServer?.close();
  callbackServer = null;
}

function expiresSoon(t: Tokens) {
  const exp = decodeJwt(t.access_token).exp;
  return !exp || exp * 1000 - Date.now() < 5 * 60_000;
}

let refreshing: Promise<void> | null = null;

export async function refresh(): Promise<void> {
  if (!tokens) throw new Error(T('Nicht angemeldet', 'Not signed in'));
  refreshing ??= (async () => {
    const r = await fetch(`${ISSUER}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, grant_type: 'refresh_token', refresh_token: tokens!.refresh_token, scope: 'openid profile email' }),
    });
    if (!r.ok) {
      // Bei Codex-Import: vielleicht hat die CLI inzwischen selbst refresht.
      if (tokens!.source === 'codex') {
        importCodex();
        if (!expiresSoon(tokens!)) return;
      }
      throw new Error(T(`Token-Refresh fehlgeschlagen (${r.status}). Bitte neu anmelden.`, `Token refresh failed (${r.status}). Please sign in again.`));
    }
    const j: any = await r.json();
    save({ ...tokens!, access_token: j.access_token ?? tokens!.access_token, id_token: j.id_token ?? tokens!.id_token, refresh_token: j.refresh_token ?? tokens!.refresh_token });
  })().finally(() => (refreshing = null));
  return refreshing;
}

export async function authHeaders(): Promise<Record<string, string>> {
  if (!tokens) throw Object.assign(new Error(T('Nicht angemeldet', 'Not signed in')), { status: 401 });
  if (expiresSoon(tokens)) await refresh();
  return {
    Authorization: `Bearer ${tokens!.access_token}`,
    'chatgpt-account-id': tokens!.account_id,
    originator: 'codex_cli_rs',
    'OpenAI-Beta': 'responses=experimental',
  };
}
