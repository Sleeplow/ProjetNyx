/**
 * Smoke test du serveur : démarre le bundle, connecte un client (colyseus.js) et
 * vérifie le bout-en-bout — join, réception d'un snapshot, rejet d'une mauvaise
 * version (handshake), et sonde /health. Sort 0 si tout est bon.
 *
 * Lancé en CI (`npm run test:smoke`) APRÈS `npm run build:server`. Attrape une
 * casse de protocole/API serveur (comme un bump Colyseus incompatible) sans jouer.
 */
import { spawn } from 'child_process';
import http from 'http';
import { Client } from 'colyseus.js';

const PORT = 2599;
const HEALTH = 2568;
const URL = `ws://localhost:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let srv;
function fail(msg) {
  console.error('SMOKE FAIL:', msg);
  srv?.kill('SIGKILL');
  process.exit(1);
}

async function main() {
  srv = spawn('node', ['server/nyxt-server.cjs'], {
    env: { ...process.env, PORT: String(PORT), HEALTH_PORT: String(HEALTH), NYXT_ALLOW_NO_ORIGIN: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let ready = false;
  srv.stdout.on('data', (d) => {
    if (/en écoute/.test(String(d))) ready = true;
  });
  srv.stderr.on('data', (d) => process.stderr.write(d));
  for (let i = 0; i < 60 && !ready; i++) await sleep(100);
  if (!ready) fail('serveur non démarré');

  // 1) Join + réception d'un snapshot.
  const client = new Client(URL);
  let room;
  try {
    room = await client.joinOrCreate('nyxt', { name: 'Smoke', zarek: 'zephyr', mode: 'brawl-ball', v: 1 });
  } catch (e) {
    fail('join refusé : ' + (e?.message || e));
  }
  let snap = false;
  room.onMessage('snap', () => {
    snap = true;
  });
  await sleep(800);
  if (!snap) fail('aucun snapshot reçu');
  console.log('OK  join + snapshot');
  await room.leave(true);

  // 2) Handshake : une mauvaise version doit être rejetée (code 4001).
  try {
    await new Client(URL).joinOrCreate('nyxt', { name: 'Old', zarek: 'zephyr', mode: 'brawl-ball', v: 999 });
    fail('un client de mauvaise version a été accepté');
  } catch (e) {
    if (e?.code !== 4001) fail('code de rejet inattendu : ' + e?.code);
    console.log('OK  handshake rejette la mauvaise version (4001)');
  }

  // 3) Sonde /health.
  const health = await new Promise((resolve) => {
    http
      .get({ host: '127.0.0.1', port: HEALTH, path: '/health' }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      })
      .on('error', () => resolve(null));
  });
  if (!health || health.status !== 200 || !/"ok":true/.test(health.body)) fail('sonde /health KO : ' + JSON.stringify(health));
  console.log('OK  /health répond 200');

  console.log('=== SMOKE OK ===');
  srv.kill('SIGTERM');
  await sleep(300);
  process.exit(0);
}

main().catch((e) => fail('exception : ' + (e?.stack || e)));
