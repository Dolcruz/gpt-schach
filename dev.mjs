// Startet Server + Vite zusammen (unabhängig vom aktuellen Verzeichnis)
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = import.meta.dirname;
// stdin offen halten: Vite beendet sich sonst, wenn stdin endet
const run = (args) => spawn(process.execPath, args, { cwd: root, stdio: ['pipe', 'inherit', 'inherit'] });
const procs = [
  run([path.join(root, 'node_modules/tsx/dist/cli.mjs'), 'watch', 'server/index.ts']),
  run([path.join(root, 'node_modules/vite/bin/vite.js')]),
];
const stop = () => procs.forEach((p) => p.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
procs.forEach((p) => p.on('exit', stop));
