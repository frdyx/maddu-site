// snap-nav.mjs — screenshot the nav across viewport widths to debug wrapping.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { WebSocket } from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9338;
const PROFILE = 'C:\\Users\\FRDY\\AppData\\Local\\maddu-snap-profile';
mkdirSync(resolve('public/snaps'), { recursive: true });

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu',
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
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 100, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://localhost:4321/' });
await sleep(2400);
await call('Runtime.evaluate', { expression: `localStorage.setItem('maddu-site-theme','dark')` });

const widths = [1920, 1440, 1200, 1000, 850, 720, 600, 420];
for (const w of widths) {
  await call('Emulation.setDeviceMetricsOverride', { width: w, height: 200, deviceScaleFactor: 1, mobile: w < 720 });
  await sleep(500);
  // Inspect nav state for each width.
  const info = await call('Runtime.evaluate', {
    expression: `(() => {
      const nav = document.querySelector('.site-nav-inner');
      const r = nav.getBoundingClientRect();
      const links = Array.from(document.querySelectorAll('.site-nav-link'));
      const linkInfo = links.map(a => {
        const cr = a.getBoundingClientRect();
        const lbl = a.querySelector('span:not(.site-nav-glyph)');
        const lr = lbl ? lbl.getBoundingClientRect() : null;
        return {
          text: a.textContent.trim(),
          w: Math.round(cr.width),
          h: Math.round(cr.height),
          lh: lr ? Math.round(lr.height) : null,
          ws: lbl ? getComputedStyle(lbl).whiteSpace : null,
        };
      });
      return { navW: Math.round(r.width), navH: Math.round(r.height), linkInfo };
    })()`,
    returnByValue: true,
  });
  console.log(`— ${w}px —`);
  console.log(JSON.stringify(info.result.value, null, 2));
  const { data } = await call('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: 90, scale: 1 } });
  writeFileSync(resolve('public/snaps/nav-' + w + '.png'), Buffer.from(data, 'base64'));
  console.log('  ✓ saved nav-' + w + '.png');
}

sock.close();
chrome.kill();
