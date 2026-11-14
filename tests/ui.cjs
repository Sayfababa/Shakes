// UI-Test im echten Browser (Playwright): spielt die wichtigsten Wege auf iPhone SE und iPhone 13 durch
// und prüft: keine JS-Fehler, nichts ragt aus dem Bildschirm (kein Scrollen). Screenshots nach tests/out/.
// Aufruf: node tests/ui.cjs   (startet selbst einen Server auf Port 8765)
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', '8765'], { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
let failures = 0;
(async () => {
  await new Promise(r => setTimeout(r, 800));
  const b = await chromium.launch();
  for (const dev of ['iPhone SE', 'iPhone 13']) {
    const c = await b.newContext({ ...devices[dev] }); const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    const tag = dev.replace(' ', '');
    const chk = async n => {
      await p.waitForTimeout(120);
      const over = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect();
        return [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect();
          return (r.bottom > m.bottom + 1 || r.right > m.right + 1) && !e.closest('.log, .journal, .note p'); }).length; });
      if (over) { failures++; console.log(`FEHLER ${tag} ${n}: ${over} Elemente ragen heraus`); }
      await p.screenshot({ path: `${OUT}/${tag}-${n}.png` });
    };
    const tap = async s => { const el = await p.$(s); if (el) await el.tap(); return !!el; };
    await p.goto('http://localhost:8765/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
    await tap('[data-c="witch"]'); await chk('create'); await p.fill('#nm', 'Test'); await tap('[data-action=create]'); await chk('tut1');
    await tap('[data-t=kaspar]'); await chk('kaspar');
    for (let i = 0; i < 8; i++) { await tap('[data-v=trips]'); await tap('.trip[data-action=trip]'); if (!i) await chk('wait');
      await tap('[data-action=rush]'); await tap('[data-action=resolve]'); if (!i) await chk('fight'); await tap('[data-action=skip]'); if (!i) await chk('result'); }
    for (const v of ['trips', 'hero', 'stats', 'talents', 'crypt', 'arena']) { await tap('[data-v=hero]'); await tap(`[data-v=${v}]`); await chk(v); }
    await tap('[data-v=traders]'); for (const t of ['halvar', 'ysolde', 'kaspar']) { await tap(`[data-t=${t}]`); await chk(t); }
    if (await tap('[data-action=turnin]')) await chk('turnin');
    for (const [tab, n] of [['crypt', 'ilse'], ['arena', 'vargo'], ['trips', 'prophet']]) { await tap(`[data-v=${tab}]`); await tap('.speaker'); await chk(n); }
    await tap('[data-v=hero]'); if (await tap('.cellitem')) await chk('itemtip');
    if (errs.length) { failures++; console.log(`FEHLER ${tag} JS:`, errs); }
    await c.close();
  }
  await b.close(); srv.kill();
  console.log(failures ? `${failures} Probleme` : 'UI ok – Screenshots in tests/out/');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); srv.kill(); process.exit(1); });
