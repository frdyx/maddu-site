// perf-check.mjs — drive headless Chrome through key pages and report
// transfer sizes / request counts. Cheap stand-in for a full Lighthouse
// run; catches regressions on the things that matter:
//   - did mermaid actually lazy-load (no JS until scroll)?
//   - are fonts only fetched from same-origin?
//   - any console errors / unexpected outbound requests?

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';
import { WebSocket } from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9337;
const PROFILE = 'C:\\Users\\FRDY\\AppData\\Local\\maddu-snap-profile';

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
let id = 0;
const pending = new Map();
const events = [];
sock.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.id && pending.has(m.id)) { const { res } = pending.get(m.id); pending.delete(m.id); res(m.result); }
  else if (m.method) events.push(m);
});
const call = (method, params = {}) =>
  new Promise((res) => { const n = ++id; pending.set(n, { res }); sock.send(JSON.stringify({ id: n, method, params })); });

await call('Network.enable');
await call('Page.enable');
await call('Console.enable');
await call('Runtime.enable');

const PAGES = [
  { path: '/', name: 'index' },
  { path: '/architecture', name: 'architecture' },
  { path: '/capabilities', name: 'capabilities' },
  { path: '/manifesto', name: 'manifesto' },
  { path: '/changelog', name: 'changelog' },
];

console.log('Path                 Reqs  Total      JS         Fonts    Mermaid?  Console errors');
console.log('-'.repeat(96));

for (const p of PAGES) {
  events.length = 0;
  await call('Network.clearBrowserCache');
  await call('Page.navigate', { url: 'http://localhost:4321' + p.path });
  await sleep(2200);

  const reqs = events.filter((e) => e.method === 'Network.responseReceived').map((e) => e.params);
  const errors = events.filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Console.messageAdded' && e.params.message.level === 'error'));
  const total = reqs.reduce((n, r) => n + (r.response.encodedDataLength || 0), 0);
  const js = reqs.filter((r) => (r.response.mimeType || '').includes('javascript')).reduce((n, r) => n + (r.response.encodedDataLength || 0), 0);
  const fonts = reqs.filter((r) => (r.type === 'Font') || r.response.url.includes('/fonts/')).reduce((n, r) => n + (r.response.encodedDataLength || 0), 0);
  const mermaid = reqs.find((r) => r.response.url.includes('mermaid')) ? 'YES (eager)' : 'NO (lazy)';
  const third = reqs.filter((r) => {
    const u = r.response.url;
    return u && !u.startsWith('http://localhost') && !u.startsWith('data:') && !u.startsWith('chrome://');
  });

  const kb = (n) => (n / 1024).toFixed(1) + 'KB';
  console.log(
    p.path.padEnd(20) +
    ' ' + String(reqs.length).padStart(4) +
    '  ' + kb(total).padStart(9) +
    '  ' + kb(js).padStart(9) +
    '  ' + kb(fonts).padStart(7) +
    '  ' + mermaid.padEnd(10) +
    ' ' + errors.length +
    (third.length ? '  3RD-PARTY: ' + third.length : '')
  );

  // Now scroll the page to trigger mermaid lazy load + measure deferred JS.
  if (p.name === 'architecture' || p.name === 'manifesto') {
    events.length = 0;
    await call('Runtime.evaluate', { expression: 'window.scrollTo({ top: 1200, behavior: "instant" })' });
    await sleep(3000);
    const lateReqs = events.filter((e) => e.method === 'Network.responseReceived').map((e) => e.params);
    const lateJs = lateReqs.filter((r) => (r.response.mimeType || '').includes('javascript')).reduce((n, r) => n + (r.response.encodedDataLength || 0), 0);
    const mermaidLate = lateReqs.find((r) => r.response.url.includes('mermaid'));
    if (mermaidLate || lateJs > 0) {
      console.log(
        '  after-scroll'.padEnd(20) +
        ' +' + String(lateReqs.length).padStart(3) +
        '            +' + kb(lateJs).padStart(8) +
        '           ' + (mermaidLate ? ' (mermaid loaded on scroll)' : '')
      );
    }
  }
}

sock.close();
chrome.kill();
console.log('Done.');
