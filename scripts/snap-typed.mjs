// Snap with a query typed — confirms match-suffix + sub kind render.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';
import { writeFileSync } from 'node:fs';
import { WebSocket } from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9335;
const PROFILE = 'C:\\Users\\FRDY\\AppData\\Local\\maddu-snap-profile';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--window-size=1400,900',
  '--remote-debugging-port=' + DEBUG_PORT,
  '--user-data-dir=' + PROFILE,
  'about:blank',
], { stdio: 'ignore' });
await sleep(1200);

const tabs = await new Promise((res, rej) => {
  http.get('http://127.0.0.1:' + DEBUG_PORT + '/json', (r) => {
    let buf = ''; r.on('data', (d) => buf += d); r.on('end', () => res(JSON.parse(buf)));
  }).on('error', rej);
});
const t = tabs.find((x) => x.type === 'page');
const sock = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((res) => sock.on('open', res));
let id = 0;
const pending = new Map();
sock.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.id && pending.has(m.id)) { const { res } = pending.get(m.id); pending.delete(m.id); res(m.result); }
});
function call(method, params = {}) {
  return new Promise((res) => { const n = ++id; pending.set(n, { res }); sock.send(JSON.stringify({ id: n, method, params })); });
}

await call('Page.enable');
await call('Page.navigate', { url: 'http://localhost:4321/' });
await sleep(2200);
await call('Runtime.evaluate', { expression: 'window.__maddu_openSearch && window.__maddu_openSearch()' });
await sleep(400);
await call('Runtime.evaluate', {
  expression: `(() => {
    const inp = document.getElementById('palette-input');
    inp.value = 'spine';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`,
});
await sleep(400);
const { data } = await call('Page.captureScreenshot', { format: 'png' });
writeFileSync('public/snaps/mine-typed-spine.png', Buffer.from(data, 'base64'));
console.log('  ✓ public/snaps/mine-typed-spine.png');

sock.close();
chrome.kill();
