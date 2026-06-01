// Inspect what classes the rendered palette rows actually carry, and what
// computed CSS they get. That tells us whether the styles are scoped away.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';
import { WebSocket } from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9334;
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
await sleep(500);

const r = await call('Runtime.evaluate', {
  expression: `(() => {
    const row = document.querySelector('.palette-row');
    if (!row) return { row: null };
    const cs = getComputedStyle(row);
    const styleTags = Array.from(document.querySelectorAll('style')).map(s => s.textContent.length);
    return {
      rowOuter: row.outerHTML.slice(0, 400),
      classes: row.className,
      display: cs.display,
      gridCols: cs.gridTemplateColumns,
      padding: cs.padding,
      classOnText: row.querySelector('.palette-row-text')?.className,
      classOnTitle: row.querySelector('.palette-row-title')?.className,
      paletteClasses: document.querySelector('.palette').className,
      styleLengths: styleTags,
    };
  })()`,
  returnByValue: true,
});

console.log(JSON.stringify(r.result.value, null, 2));
sock.close();
chrome.kill();
