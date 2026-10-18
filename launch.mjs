// GPT-Schach starten: baut die App bei Bedarf, startet den lokalen Server und öffnet den Browser.
// Aufruf: npm start   (Port per PORT=… änderbar)
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = import.meta.dirname;
const PORT = process.env.PORT ?? '8080';
const HOST = process.env.APP_HOST ?? 'gpt-schach.localhost';
const APP_URL = `http://${HOST}${PORT === '80' ? '' : `:${PORT}`}`;

function newestMtime(dir) {
  let t = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    t = Math.max(t, e.isDirectory() ? newestMtime(p) : fs.statSync(p).mtimeMs);
  }
  return t;
}

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(cmd[0], cmd[1], { stdio: 'ignore', detached: true }).unref();
}

async function isUp() {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/api/auth/status`, { signal: AbortSignal.timeout(1000) });
    return r.ok;
  } catch {
    return false;
  }
}

if (await isUp()) {
  console.log(`GPT-Schach läuft bereits: ${APP_URL}`);
  openBrowser(APP_URL);
  process.exit(0);
}

// Bauen, wenn noch kein Build existiert oder der Code neuer ist
const index = path.join(root, 'dist', 'index.html');
const needsBuild = !fs.existsSync(index) || newestMtime(path.join(root, 'src')) > fs.statSync(index).mtimeMs;
if (needsBuild) {
  console.log('Baue die App (einmalig, dauert ein paar Sekunden) …');
  const r = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const server = spawn(process.execPath, [path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'), path.join(root, 'server', 'index.ts')], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, SERVER_PORT: PORT, APP_URL },
});
server.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => server.kill());
process.on('SIGTERM', () => server.kill());

for (let i = 0; i < 60 && !(await isUp()); i++) await new Promise((r) => setTimeout(r, 250));
console.log(`\n  ♞ GPT-Schach läuft: ${APP_URL}\n  Beenden mit Strg+C\n`);
openBrowser(APP_URL);
