// verify-themes.mjs — CDP screenshots of /architecture in both themes
// after mermaid renders, to confirm theme-aware re-render actually flips
// the diagram palettes (not just the surrounding chrome).
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { WebSocket } from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9336;
const PROFILE = 'C:\\Users\\FRDY\\AppData\\Local\\maddu-snap-profile';
mkdirSync(resolve('public/snaps'), { recursive: true });

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
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
sock.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.id && pend.has(m.id)) { const { res } = pend.get(m.id); pend.delete(m.id); res(m.result); }
});
const call = (method, params = {}) =>
  new Promise((res) => { const n = ++id; pend.set(n, { res }); sock.send(JSON.stringify({ id: n, method, params })); });

await call('Page.enable');
// Pin localStorage to 'dark' before any page loads — that way the
// pre-paint script picks dark deterministically.
await call('Page.navigate', { url: 'http://localhost:4321/' });
await sleep(400);
await call('Runtime.evaluate', { expression: `localStorage.setItem('maddu-site-theme', 'dark')` });
await call('Page.navigate', { url: 'http://localhost:4321/architecture' });
await sleep(3500);

async function snap(name) {
  const { data } = await call('Page.captureScreenshot', { format: 'png' });
  const p = resolve('public/snaps/' + name + '.png');
  writeFileSync(p, Buffer.from(data, 'base64'));
  console.log('  ✓ ' + p);
}

async function diagState() {
  const r = await call('Runtime.evaluate', {
    expression: `(() => {
      const host = document.querySelector('[data-mermaid-host].is-rendered');
      if (!host) return { rendered: false };
      const svg = host.querySelector('svg');
      // Sample background of the diagram and the first node fill.
      const bg = svg && svg.getAttribute('style') || '';
      const firstNode = host.querySelector('svg .node rect, svg rect.basic');
      const nodeFill = firstNode ? getComputedStyle(firstNode).fill : null;
      const labelEl = host.querySelector('svg .nodeLabel, svg foreignObject, svg text');
      const labelColor = labelEl ? getComputedStyle(labelEl).color : null;
      return { rendered: true, nodeFill, labelColor, theme: document.documentElement.dataset.theme };
    })()`,
    returnByValue: true,
  });
  return r.result.value;
}

console.log('— dark theme —');
console.log(JSON.stringify(await diagState()));
await snap('arch-dark');

// Flip to light, then wait long enough for the mermaid MutationObserver
// to re-init + re-render every host.
await call('Runtime.evaluate', {
  expression: `(() => {
    localStorage.setItem('maddu-site-theme', 'light');
    document.documentElement.dataset.theme = 'light';
  })()`,
});
await sleep(2800);
console.log('— light theme —');
console.log(JSON.stringify(await diagState()));
await snap('arch-light');

sock.close();
chrome.kill();
console.log('Done.');
