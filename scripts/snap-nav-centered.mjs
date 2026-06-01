// snap-nav-centered.mjs — verify the centered nav across viewport widths.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { WebSocket } from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9339;
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
await call('Emulation.setDeviceMetricsOverride', { width: 1920, height: 100, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://localhost:4321/' });
await sleep(2000);
await call('Runtime.evaluate', { expression: `localStorage.setItem('maddu-site-theme','dark')` });

for (const w of [1920, 1440, 1200, 1080, 1000]) {
  await call('Emulation.setDeviceMetricsOverride', { width: w, height: 200, deviceScaleFactor: 1, mobile: false });
  await sleep(450);
  const info = await call('Runtime.evaluate', {
    expression: `(() => {
      const brand = document.querySelector('.site-brand').getBoundingClientRect();
      const links = document.querySelector('.site-nav-links').getBoundingClientRect();
      const actions = document.querySelector('.site-nav-actions').getBoundingClientRect();
      return {
        viewportW: window.innerWidth,
        brandRight:   Math.round(brand.right),
        linksLeft:    Math.round(links.left),
        linksRight:   Math.round(links.right),
        linksCenter:  Math.round((links.left + links.right) / 2),
        viewportCtr:  Math.round(window.innerWidth / 2),
        actionsLeft:  Math.round(actions.left),
        actionsRight: Math.round(actions.right),
      };
    })()`,
    returnByValue: true,
  });
  console.log(`— ${w}px —  ` + JSON.stringify(info.result.value));
  const { data } = await call('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: 80, scale: 1 } });
  writeFileSync(resolve('public/snaps/cnav-' + w + '.png'), Buffer.from(data, 'base64'));
}

sock.close();
chrome.kill();
