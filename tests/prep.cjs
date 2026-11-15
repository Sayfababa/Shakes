// Vorbereitung-Layout auf vielen Bildschirmen (auch iOS-App, wo unten ein Stück fehlt): Kämpfen-Knopf muss sichtbar sein
const { chromium, devices } = require('playwright'); const { spawn } = require('child_process');
const OUT = __dirname + '/out/prep'; require('fs').mkdirSync(OUT, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', '8782'], { cwd: '/home/user/Shakes', stdio: 'ignore' });
const SCR = [['ios932', 430, 932, 75], ['ios932b', 430, 932, 0], ['app', 430, 867, 0], ['real', 430, 800, 0], ['i13', 390, 664, 0], ['i13app', 390, 844, 60], ['se', 375, 667, 0], ['tiny', 320, 568, 0]];
// [Krypta-Index, Ebene, Stufe, Treue (3 Plätze), Tränke vorrätig]
const CASES = [[0, 0, 3, 0, 0], [1, 4, 7, 0, 0], [1, 4, 60, 1, 1], [3, 4, 30, 1, 1], [2, 2, 15, 0, 1]];
(async () => { await new Promise(r => setTimeout(r, 700)); const b = await chromium.launch(); let bad = 0, n = 0;
  await Promise.all(SCR.map(async ([nm, w, h, cut]) => {
    const c = await b.newContext({ ...devices['iPhone 15 Pro Max'], viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const p = await c.newPage();
    await p.goto('http://localhost:8782/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
    await p.tap('[data-c="witch"]'); await p.fill('#nm', 'Sayfa'); await p.tap('[data-action=create]'); await p.waitForTimeout(150);
    if (cut) await p.addStyleTag({ content: `#app { bottom: ${cut}px !important; }` });
    for (const [ci, fl, lvl, loy, potsOn] of CASES) {
      const id = await p.evaluate(async ([ci, fl, lvl, loy, potsOn]) => { const D = await import('./js/data.js'); const G = await import('./js/state.js'); const S = G.S;
        Object.assign(S, { lvl, tut: 99, gold: 3000 }); const cr = D.CRYPTS[ci]; S.crypt.cd = 0; S.crypt.prog[cr.id] = fl; S.shards = ['a', 'b', 'c', 'd'];
        S.traders.ysolde.rep = loy ? 99999 : 0; S.pots = potsOn ? { rotwurz: 3, steinhaut: 3, falkenauge: 1, gegengift: 3 } : {}; S.belt = [null, null, null]; S.view = 'hero'; return cr.id; }, [ci, fl, lvl, loy, potsOn]);
      await p.tap('[data-v=hero]'); await p.tap('[data-v=crypt]'); await p.waitForTimeout(60);
      if (!(await p.$(`[data-action=crypt][data-id=${id}]`))) { console.log(nm, 'Krypta nicht antippbar', id); continue; }
      await p.tap(`[data-action=crypt][data-id=${id}]`); await p.waitForTimeout(80);
      if (potsOn) { await p.tap('[data-action=bestBelt]').catch(() => {}); await p.waitForTimeout(80); }
      n++;
      const r = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect(), out = [];
        const go = document.querySelector('[data-action=cryptgo]'); if (!go) out.push('KEIN KÄMPFEN'); else if (go.getBoundingClientRect().bottom > m.bottom + 1) out.push('KÄMPFEN ABGESCHNITTEN');
        for (const e of document.querySelectorAll('main *')) { const q = e.getBoundingClientRect(); if (q.height && q.bottom > m.bottom + 1) { out.push('UNTER MAIN ' + (e.className || e.tagName)); break; } }
        for (const e of document.querySelectorAll('.etag')) { const q = e.getBoundingClientRect(); for (const k of e.children) if (k.getBoundingClientRect().bottom > q.bottom + 1) { out.push('HINWEIS ABGESCHNITTEN'); break; } }
        return out.join(' '); });
      if (r) { bad++; console.log(nm, id, 'Ebene', fl, 'Stufe', lvl, r); await p.screenshot({ path: `${OUT}/${nm}_${id}_${fl}.png` }); }
    }
    await c.close(); }));
  await b.close(); srv.kill(); console.log(bad ? `${bad} Probleme (Screenshots in tests/out/prep)` : `Vorbereitung ok: ${n} Lagen auf 8 Bildschirmen, Kämpfen immer sichtbar.`); process.exit(bad ? 1 : 0); })();
