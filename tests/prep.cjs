// Vorbereitung-Layout auf vielen Bildschirmen (auch iOS-App, wo unten ein Stück fehlt): Kämpfen-Knopf muss sichtbar sein
const { chromium, devices } = require('playwright'); const { spawn } = require('child_process');
const OUT = __dirname + '/out/prep'; require('fs').mkdirSync(OUT, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', '8782'], { cwd: '/home/user/Shakes', stdio: 'ignore' });
// `cut` schneidet unten von der gezeichneten Flaeche ab – so frisst auf dem iPhone ein Band oben
// (Karten-Navigation, Telefonat) Hoehe, waehrend `vh` auf der vollen Bildschirmhoehe bleibt.
// `i13band180` ist genau dieser Fall: nur dort greift der zweite Sparschritt (.prep.tighter).
const SCR = [['i13app', 390, 844, 0], ['i13band', 390, 844, 60], ['i13band180', 390, 844, 180]];
// [Krypta-Index, Ebene, Stufe, Treue (3 Plätze), Tränke vorrätig]
const CASES = [[0, 0, 3, 0, 0], [1, 4, 7, 0, 0], [1, 4, 60, 1, 1], [3, 4, 30, 1, 1], [2, 2, 15, 0, 1]];
(async () => { await new Promise(r => setTimeout(r, 700)); const b = await chromium.launch(); let bad = 0, n = 0, tight = 0;
  await Promise.all(SCR.map(async ([nm, w, h, cut]) => {
    const c = await b.newContext({ ...devices['iPhone 15 Pro Max'], viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const p = await c.newPage();
    await p.goto('http://localhost:8782/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
    await p.tap('[data-c="sorceress"]'); await p.fill('#nm', 'Sayfa'); await p.tap('[data-action=create]'); await p.waitForTimeout(150);
    if (cut) await p.addStyleTag({ content: `#app { bottom: ${cut}px !important; }` });
    for (const [ci, fl, lvl, loy, potsOn] of CASES) {
      const id = await p.evaluate(async ([ci, fl, lvl, loy, potsOn]) => { const D = await import('./js/data.js'); const G = await import('./js/state.js'); const S = G.S;
        Object.assign(S, { lvl, tut: 99, gold: 3000 }); const cr = D.CRYPTS[ci]; S.crypt.cd = 0; S.crypt.prog[cr.id] = fl; S.shards = ['a', 'b', 'c', 'd']; for (const a of D.ACTS) S.acts.prog[a.id] = D.ACT.zones + 1;
        S.traders.ysolde.rep = loy ? 99999 : 0; S.pots = potsOn ? { rotwurz: 3, steinhaut: 3, falkenauge: 1, gegengift: 3 } : {}; S.belt = [null, null, null]; S.view = 'hero'; return cr.id; }, [ci, fl, lvl, loy, potsOn]);
      await p.tap('[data-v=hero]'); await p.tap('[data-v=crypt]'); await p.waitForTimeout(60);
      if (!(await p.$(`[data-action=crypt][data-id=${id}]`))) { console.log(nm, 'Krypta nicht antippbar', id); continue; }
      await p.tap(`[data-action=crypt][data-id=${id}]`); await p.waitForTimeout(80);
      if (potsOn) { await p.tap('[data-action=bestBelt]').catch(() => {}); await p.waitForTimeout(80); }
      n++; if (await p.$('.prep.tighter')) tight++;
      const r = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect(), out = [];
        const go = document.querySelector('[data-action=cryptgo]'); if (!go) out.push('KEIN KÄMPFEN'); else if (go.getBoundingClientRect().bottom > m.bottom + 1) out.push('KÄMPFEN ABGESCHNITTEN');
        for (const e of document.querySelectorAll('main *')) { const q = e.getBoundingClientRect(); if (q.height && q.bottom > m.bottom + 1) { out.push('UNTER MAIN ' + (e.className || e.tagName)); break; } }
        for (const e of document.querySelectorAll('.etag')) { const q = e.getBoundingClientRect(); for (const k of e.children) if (k.getBoundingClientRect().bottom > q.bottom + 1) { out.push('HINWEIS ABGESCHNITTEN'); break; } }
        return out.join(' '); });
      if (r) { bad++; console.log(nm, id, 'Ebene', fl, 'Stufe', lvl, r); await p.screenshot({ path: `${OUT}/${nm}_${id}_${fl}.png` }); }
    }
    // --- Die Vorbereitung eines AKT-GEBIETS (nicht der Krypta). Ihr Kopf ist hoeher: Ortsbild,
    // Akt-/Gebietszeile und bei Elite-Gebieten eine rote Zeile, die oft umbricht. Genau diese
    // Ansicht war nie geprueft – gemeldet hat sie der Besitzer, unten abgeschnitten.
    const aid = await p.evaluate(async () => { const D = await import('./js/data.js'); const G = await import('./js/state.js'); const S = G.S;
      Object.assign(S, { lvl: 11, tut: 99, gold: 10857 });
      for (let i = 0; i < 4; i++) S.acts.prog[D.ACTS[i].id] = i < 3 ? D.ACT.zones + 1 : 6;   // Akt IV bis zum Elite-Gebiet 7
      S.pots = {}; S.herbs = {}; S.belt = [null, null, null]; S.view = 'hero'; G.save(); return D.ACTS[3].id; });
    await p.reload(); await p.waitForTimeout(250);
    if (cut) await p.addStyleTag({ content: `#app { bottom: ${cut}px !important; }` });
    await p.tap('[data-v=trips]'); await p.waitForTimeout(80);
    await p.tap(`.act[data-action=act][data-id=${aid}]`).catch(() => {}); await p.waitForTimeout(100);
    const zs = await p.$$('.actv .two [data-action=zone]');
    if (zs.length) { await zs[Math.min(6, zs.length - 1)].tap(); await p.waitForTimeout(160); n++;
      const z = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect(), out = [];
        const go = document.querySelector('[data-action=actgo]');
        if (!go) out.push('KEIN KÄMPFEN'); else if (go.getBoundingClientRect().bottom > m.bottom + 1) out.push('KÄMPFEN ABGESCHNITTEN');
        for (const e of document.querySelectorAll('main *')) { const q = e.getBoundingClientRect(); if (q.height && q.bottom > m.bottom + 1) { out.push('UNTER MAIN ' + (e.className || e.tagName)); break; } }
        // Ein Hinweis, der seinen eigenen Text verschluckt, ragt nirgends heraus – trotzdem fehlt er.
        for (const e of document.querySelectorAll('.prep .etag')) if (e.scrollHeight > e.clientHeight + 4) { out.push('HINWEIS VERSCHLUCKT'); break; }
        if (!document.querySelectorAll('.prep .etag').length) out.push('KEINE HINWEISE');
        return out.join(' '); });
      if (z) { bad++; console.log(nm, 'Gebiet', z); await p.screenshot({ path: `${OUT}/${nm}_gebiet.png` }); } }
    await c.close(); }));
  // Der zweite Sparschritt muss mindestens einmal greifen, sonst ist er ungeprüft
  if (!tight) { bad++; console.log('.prep.tighter griff auf keinem Bildschirm – zweiter Sparschritt ungeprüft'); }
  await b.close(); srv.kill(); console.log(bad ? `${bad} Probleme (Screenshots in tests/out/prep)` : `Vorbereitung ok: ${n} Lagen (Krypta + Akt-Gebiet) auf ${SCR.length} Bildschirmen, (${tight}× zweiter Sparschritt), Kämpfen immer sichtbar.`); process.exit(bad ? 1 : 0); })();
