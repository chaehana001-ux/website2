import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const config = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
assert.equal(config.outputDirectory, 'dist');
assert.equal(config.framework, null);
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(output, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(output + '/')) throw new Error('Invalid path');
    await stat(file);
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end('Not found');
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'karst-chrome-'));
const chrome = spawn(process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
try {
  const endpoint = await new Promise((done, reject) => {
    let logs = '';
    const timeout = setTimeout(() => reject(new Error('Chrome did not start')), 15000);
    chrome.on('error', reject);
    chrome.stderr.on('data', (chunk) => {
      logs += chunk;
      const match = logs.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timeout); done(match[1]); }
    });
  });
  const debugOrigin = 'http://' + new URL(endpoint).host;
  const target = await (await fetch(debugOrigin + '/json/new', { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, reject) => { socket.onopen = done; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  const missing = [];
  socket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    if (event.id) {
      const item = pending.get(event.id);
      if (!item) return;
      pending.delete(event.id);
      clearTimeout(item.timeout);
      if (event.error) item.reject(new Error(JSON.stringify(event.error)));
      else item.done(event.result);
    }
    if (event.method === 'Runtime.exceptionThrown') errors.push(event.params.exceptionDetails);
    if (event.method === 'Network.responseReceived') {
      const response = event.params.response;
      if (response.url.startsWith(origin) && response.status >= 400) missing.push(response.url);
    }
  };
  const call = (method, params = {}) => new Promise((done, reject) => {
    const requestId = ++id;
    const timeout = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 20000);
    pending.set(requestId, { done, reject, timeout });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => {
    const value = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert.ok(!value.exceptionDetails, JSON.stringify(value.exceptionDetails));
    return value.result.value;
  };
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Network.enable');
  // Keep the audit independent of external font availability.
  await call('Network.setBlockedURLs', { urls: ['https://fonts.googleapis.com/*', 'https://fonts.gstatic.com/*'] });
  const wait = () => evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  const reports = [];
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: width >= 1024 ? 1080 : 844, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: origin });
    for (let n = 0; n < 100; n++) {
      if (await evaluate('document.readyState === "complete" && !!document.querySelector(".material-banner-stage")')) break;
      await new Promise((done) => setTimeout(done, 50));
    }
    await evaluate(`Promise.all([...document.images].map(async img => { img.loading = 'eager'; await img.decode(); }))`);
    await wait();
    const report = await evaluate(`(() => {
      const cards = [...document.querySelectorAll('[data-benefit]')].map(el => el.getBoundingClientRect());
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        heights: cards.map(r => r.height), gaps: cards.slice(1).map((r,i) => r.top - cards[i].bottom),
        h1: document.querySelectorAll('h1').length,
        badAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash),
        subtitleRatio: parseFloat(getComputedStyle(document.querySelector('.home-fit-title-ko')).fontSize) / parseFloat(getComputedStyle(document.querySelector('.home-fit-copy h2')).fontSize),
        footerLast: document.querySelector('footer').lastElementChild.className };
    })()`);
    assert.ok(report.scrollWidth <= width + 1, `Horizontal overflow: ${JSON.stringify(report)}`);
    assert.ok(Math.max(...report.heights) - Math.min(...report.heights) < 1, `Unequal cards at ${width}`);
    assert.ok(report.gaps.every((gap) => Math.abs(gap - 24) < 1), `Unequal gaps at ${width}`);
    assert.equal(report.h1, 1);
    assert.deepEqual(report.badAnchors, []);
    assert.ok(Math.abs(report.subtitleRatio - .3) < .001);
    assert.equal(report.footerLast, 'footer-top');
    assert.equal(await evaluate(`(() => { const product=document.querySelector('.header-products').getBoundingClientRect(), logo=document.querySelector('.topbar .logo').getBoundingClientRect(); return product.left >= logo.right && product.right <= innerWidth; })()`), true, `Header actions overlap the logo at ${width}`);
    // Menu must be usable with keyboard, trap focus and restore it on Escape.
    await evaluate(`document.querySelector('.menu-toggle').focus(); document.querySelector('.menu-toggle').click()`);
    await wait();
    const menuState = await evaluate(`({ inert: document.querySelector('#menu').inert, mainInert: document.querySelector('main').inert, active: document.activeElement.outerHTML, focused: !!document.activeElement.closest('#menu'), visibility: getComputedStyle(document.querySelector('#menu')).visibility, className: document.querySelector('#menu').className })`);
    assert.ok(!menuState.inert && menuState.mainInert && menuState.focused, JSON.stringify({width, menuState}));
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.equal(await evaluate(`!!document.activeElement.closest('#menu')`), true);
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    assert.equal(await evaluate(`document.querySelector('#menu').inert && !document.querySelector('main').inert && document.activeElement === document.querySelector('.menu-toggle')`), true);
    // Product selection and the wrap from the last product back to the first.
    await evaluate(`document.querySelector('[data-series-index="3"]').click(); document.querySelector('[data-series-next]').click()`);
    assert.equal(await evaluate(`document.querySelector('[data-series-current]').textContent`), '01');
    const story = await evaluate(`(() => { const b=document.querySelector('.material-banner'); return {top:b.offsetTop, height:b.offsetHeight}; })()`);
    for (const progress of [0, .25, .5, .75, 1]) {
      await evaluate(`window.scrollTo({top:${story.top} + (${story.height} - innerHeight) * ${progress},behavior:'instant'})`);
      await wait();
    }
    assert.equal(await evaluate(`Number(getComputedStyle(document.querySelector('.material-banner-word:last-child')).opacity) > .99`), true);
    if ([390, 1440].includes(width)) {
      await evaluate(`document.querySelector('#guide').scrollIntoView({behavior:'instant'})`);
      await wait();
      const screenshot = await call('Page.captureScreenshot', { format: 'png' });
      const folder = join(root, '.content-backup', 'deployment-audit');
      await mkdir(folder, { recursive: true });
      await writeFile(join(folder, `collection-${width}.png`), Buffer.from(screenshot.data, 'base64'));
    }
    reports.push({ width, height: report.heights[0], gap: report.gaps[0], overflow: report.scrollWidth - width });
  }
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }, { name: 'pointer', value: 'coarse' }, { name: 'hover', value: 'none' }] });
  await wait();
  assert.equal(await evaluate(`document.querySelector('.material-banner').classList.contains('is-reduced-motion') && !document.querySelector('.material-banner').classList.contains('is-scroll-story') && document.querySelector('.hero-video').paused`), true);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.material-banner-word')).opacity`), '1');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.topbar')).pointerEvents`), 'auto');
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await call('Page.navigate', { url: origin });
  for (let n = 0; n < 100; n++) {
    if (await evaluate(`document.readyState === 'complete' && !!document.querySelector('.is-reduced-motion')`)) break;
    await new Promise((done) => setTimeout(done, 50));
  }
  assert.equal(await evaluate(`document.querySelector('.hero-video').paused && !document.querySelector('.material-banner').classList.contains('is-scroll-story') && document.documentElement.scrollWidth <= innerWidth`), true, 'Reduced-motion mobile load');
  assert.equal((await fetch(origin + '/missing-file.png')).status, 404);
  assert.deepEqual(errors, [], 'JavaScript runtime errors');
  assert.deepEqual(missing, [], 'Missing page assets');
  console.log(JSON.stringify({ viewports: reports, runtimeErrors: errors.length, missingAssets: missing.length,
    checks: ['image decoding', 'anchors', 'card sizing', 'subtitle ratio', 'footer order', 'menu keyboard and focus', 'product switching', 'scroll story', 'reduced motion', 'touch navigation', '404 response'] }, null, 2));
} finally {
  socket?.close();
  chrome.kill();
  server.close();
  // Chrome can briefly keep profile files open after exiting.
  await new Promise((done) => chrome.exitCode !== null ? done() : chrome.once('exit', done));
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
