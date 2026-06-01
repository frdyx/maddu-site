// snap-palette.mjs — drive headless Chrome via CDP to take screenshots
// of both palettes, then dump them as files for visual comparison.
//
// Why: the user wants me to actually see what's rendered, not just trust
// the CSS rules. CDP is a thin layer over Chrome's DevTools Protocol and
// needs nothing beyond Node + Chrome installed.

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9333;
const PROFILE = 'C:\\Users\\FRDY\\AppData\\Local\\maddu-snap-profile';

mkdirSync(resolve('public/snaps'), { recursive: true });
mkdirSync(PROFILE, { recursive: true });

// ── Launch Chrome ───────────────────────────────────────────────────
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1400,900',
  '--remote-debugging-port=' + DEBUG_PORT,
  '--user-data-dir=' + PROFILE,
  'about:blank',
], { detached: false, stdio: 'ignore' });

// Give Chrome a moment to come up + open the debug port.
await sleep(1200);

// Locate the first available tab via the HTTP devtools endpoint.
async function getTabUrl() {
  const body = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:' + DEBUG_PORT + '/json', (r) => {
      let buf = ''; r.on('data', (d) => buf += d); r.on('end', () => res(buf));
    }).on('error', rej);
  });
  const tabs = JSON.parse(body);
  const t = tabs.find((x) => x.type === 'page');
  if (!t) throw new Error('no page tab');
  return t.webSocketDebuggerUrl;
}

// Minimal CDP client over the discovered websocket.
async function cdp(ws) {
  const { WebSocket } = await import('ws').catch(() => ({}));
  if (!WebSocket) {
    throw new Error('ws module missing. Install with: npm install --save-dev ws');
  }
  const sock = new WebSocket(ws);
  await new Promise((res, rej) => { sock.on('open', res); sock.on('error', rej); });
  let id = 0;
  const pending = new Map();
  sock.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.id && pending.has(m.id)) {
      const { res } = pending.get(m.id);
      pending.delete(m.id);
      res(m.result);
    }
  });
  function call(method, params = {}) {
    return new Promise((res) => {
      const n = ++id;
      pending.set(n, { res });
      sock.send(JSON.stringify({ id: n, method, params }));
    });
  }
  return { call, close: () => sock.close() };
}

// ── Workflow ────────────────────────────────────────────────────────
const wsUrl = await getTabUrl();
const client = await cdp(wsUrl);

async function shoot(name, url, openCmd) {
  await client.call('Page.enable');
  await client.call('Page.navigate', { url });
  await sleep(2200);
  if (openCmd) {
    await client.call('Runtime.evaluate', { expression: openCmd, awaitPromise: true });
    await sleep(700);
  }
  const { data } = await client.call('Page.captureScreenshot', { format: 'png' });
  const path = resolve('public/snaps/' + name + '.png');
  writeFileSync(path, Buffer.from(data, 'base64'));
  console.log('  ✓ ' + path);
}

// 1. My site's palette (Cmd-K equivalent — call the global opener directly)
await shoot(
  'mine-palette',
  'http://localhost:4321/',
  `(window.__maddu_openSearch ? window.__maddu_openSearch() : null) || 'opened';`,
);

// 2. The cockpit's palette (uses keyboard shortcut on the cockpit JS side)
await shoot(
  'cockpit-palette',
  'http://127.0.0.1:4177/',
  // Cockpit listens for Ctrl/Cmd+K via document keydown. Dispatch a
  // synthetic event so we can trigger it without a real keyboard.
  `(() => {
     const ev = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, bubbles: true });
     document.dispatchEvent(ev);
     return 'dispatched';
   })();`,
);

// 3. Also grab the cockpit at /conductor so we see the in-context palette
await shoot(
  'cockpit-palette-conductor',
  'http://127.0.0.1:4177/#/conductor',
  `(() => {
     const ev = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, bubbles: true });
     document.dispatchEvent(ev);
     return 'dispatched';
   })();`,
);

client.close();
chrome.kill();
console.log('Done.');
