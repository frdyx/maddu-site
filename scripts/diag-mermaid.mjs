// diag-mermaid.mjs — capture mermaid errors from /governance.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';
import { WebSocket } from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9342;
const PROFILE = 'C:\\Users\\FRDY\\AppData\\Local\\maddu-snap-profile';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--window-size=1400,2000',
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
const messages = [];
sock.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.id && pend.has(m.id)) { const { res } = pend.get(m.id); pend.delete(m.id); res(m.result); }
  if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Log.entryAdded' || m.method === 'Runtime.exceptionThrown') {
    messages.push(m);
  }
});
const call = (method, params = {}) =>
  new Promise((res) => { const n = ++id; pend.set(n, { res }); sock.send(JSON.stringify({ id: n, method, params })); });

await call('Page.enable');
await call('Runtime.enable');
await call('Log.enable');

// Test the PRODUCTION preview, not the dev server.
for (const p of [4173, 4174]) {
  const r = await call('Page.navigate', { url: `http://localhost:${p}/governance` });
  await sleep(800);
  const t = await call('Runtime.evaluate', { expression: '!!document.querySelector(".site-nav")', returnByValue: true });
  if (t.result.value) { console.log('Using preview port', p); break; }
}
await sleep(2500);

// Force render of both diagrams by scrolling to each.
await call('Runtime.evaluate', {
  expression: `document.querySelectorAll('[data-mermaid-host]').forEach(h => h.scrollIntoView({ block: 'center', behavior: 'instant' }))`,
});
await sleep(4000);

console.log('--- console messages (' + messages.length + ') ---');
for (const m of messages) {
  if (m.params?.args) {
    const txts = m.params.args.map((a) => a.value || a.description || '').join(' ');
    console.log(`[${m.params.type || 'log'}] ${txts.slice(0, 400)}`);
  } else if (m.params?.exceptionDetails) {
    const ex = m.params.exceptionDetails;
    console.log(`[exception] ${ex.text} :: ${ex.exception?.description?.slice(0, 400)}`);
  } else if (m.params?.entry) {
    console.log(`[${m.params.entry.level}] ${m.params.entry.text}`);
  }
}

// Dump the second host's source for inspection.
const src = await call('Runtime.evaluate', {
  expression: `Array.from(document.querySelectorAll('[data-mermaid-host]')).map(h => ({ revealed: h.querySelector('.mermaid-source')?.classList.contains('is-revealed'), code: h.querySelector('[data-mermaid-source]')?.textContent.slice(0, 800) }))`,
  returnByValue: true,
});
console.log('--- host sources ---');
console.log(JSON.stringify(src.result.value, null, 2));

sock.close();
chrome.kill();
