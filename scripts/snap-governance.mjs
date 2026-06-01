// snap-governance.mjs — check what the governance page is actually rendering.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { WebSocket } from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9341;
const PROFILE = 'C:\\Users\\FRDY\\AppData\\Local\\maddu-snap-profile';
mkdirSync(resolve('public/snaps'), { recursive: true });

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu',
  '--window-size=1400,900',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + PROFILE,
  'about:blank',
], { stdio: 'ignore' });
await sleep(1200);

const tabs = await new Promise((res, rej) => {
  http.get('http://127.0.0.1:' + PORT + '/json', (r) => {
    let buf = ''; r.on('data', (d) => buf += d); r.on('end', () => res(JSON.parse(buf)));
  }).on('error', rej);
});
const sock = new WebSocket(tabs.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((res) => sock.on('open', res));
let id = 0; const pend = new Map();
sock.on('message', (raw) => { const m = JSON.parse(raw.toString()); if (m.id && pend.has(m.id)) { const { res } = pend.get(m.id); pend.delete(m.id); res(m.result); } });
const call = (method, params = {}) =>
  new Promise((res) => { const n = ++id; pend.set(n, { res }); sock.send(JSON.stringify({ id: n, method, params })); });

await call('Page.enable');
await call('Console.enable');
await call('Runtime.enable');

// Try both dev ports.
const ports = [4322, 4321];
let working = null;
for (const p of ports) {
  await call('Page.navigate', { url: `http://localhost:${p}/governance` });
  await sleep(1200);
  const t = await call('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
  if (t.result.value && !t.result.value.includes('not found')) { working = p; break; }
}
console.log('Using port', working);
await call('Page.navigate', { url: `http://localhost:${working}/governance` });
await sleep(3500);

// Scroll to the first mermaid host to ensure it intersects.
await call('Runtime.evaluate', {
  expression: `(() => {
    const h = document.querySelector('[data-mermaid-host]');
    if (h) h.scrollIntoView({ block: 'center' });
  })()`,
});
await sleep(2500);

// Inspect each host's state.
const states = await call('Runtime.evaluate', {
  expression: `(() => {
    return Array.from(document.querySelectorAll('[data-mermaid-host]')).map((h, i) => {
      const r = h.getBoundingClientRect();
      const svg = h.querySelector('svg');
      const rendered = h.classList.contains('is-rendered');
      const sourceRevealed = h.querySelector('.mermaid-source')?.classList.contains('is-revealed');
      const sourcePreview = h.querySelector('.mermaid-source')?.textContent.slice(0, 80);
      return { i, rendered, sourceRevealed, hasSvg: !!svg, top: Math.round(r.top), height: Math.round(r.height), sourcePreview };
    });
  })()`,
  returnByValue: true,
});
console.log('Mermaid hosts:');
console.log(JSON.stringify(states.result.value, null, 2));

// Capture console output.
console.log('--- last 5 messages ---');
// console messages were collected via Console.messageAdded events; not stored here. Skipping.

// Full page screenshot.
const { data } = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
writeFileSync(resolve('public/snaps/governance-full.png'), Buffer.from(data, 'base64'));
console.log('  ✓ saved governance-full.png');

// Specifically screenshot the first diagram area.
const { data: dat2 } = await call('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 100, width: 1400, height: 800, scale: 1 } });
writeFileSync(resolve('public/snaps/governance-diagram.png'), Buffer.from(dat2, 'base64'));
console.log('  ✓ saved governance-diagram.png');

sock.close();
chrome.kill();
