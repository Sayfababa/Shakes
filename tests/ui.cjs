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
  await Promise.all(['iPhone SE', 'iPhone 13', 'iPhone 15 Pro Max', 'App 430x867'].map(async dev => {   // 4 Handys gleichzeitig
    const c = await b.newContext(dev === 'App 430x867' ? { ...devices['iPhone 15 Pro Max'], viewport: { width: 430, height: 867 }, deviceScaleFactor: 1 } : { ...devices[dev], deviceScaleFactor: 1 }); const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    const tag = dev.replace(/ /g, '');
    const chk = async n => {
      await p.waitForTimeout(120);
      const over = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect();
        return [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect();
          return (r.bottom > m.bottom + 1 || r.right > m.right + 1) && !e.closest('.vscroll, .log, .note p, .fnum, .goldpop, .proj, .burst, .spellname'); }).length; });
      if (over) { failures++; console.log(`FEHLER ${tag} ${n}: ${over} Elemente ragen heraus`); }
      // Item-Felder dürfen nie über ihr Panel hinausragen (Laden, Beutel, Figur, Schmiede)
      const spill = await p.evaluate(() => [...document.querySelectorAll('.panel .sitem, .panel .cellitem, .panel .eslot, .panel .fslot, .panel .mtile')].filter(e => {
        if (e.closest('.vscroll')) return false; const r = e.getBoundingClientRect(), q = e.closest('.panel').getBoundingClientRect(); return r.bottom > q.bottom + 1 || r.right > q.right + 1 || r.left < q.left - 1 || r.top < q.top - 1; }).length);
      if (spill) { failures++; console.log(`FEHLER ${tag} ${n}: ${spill} Item-Felder ragen über ihr Panel`); }
      // Abgeschnittener Inhalt in Karten (z. B. Ortskarte: „Stufe/Zeit“ unten weg)
      const clip = await p.evaluate(() => [...document.querySelectorAll('main .trip *, main .crypt *, main .tcard *')].filter(e => { const r = e.getBoundingClientRect(), q = e.closest('.trip, .crypt, .tcard').getBoundingClientRect(); return r.height && r.bottom > q.bottom + 1; }).map(e => e.className || e.tagName));
      if (clip.length) { failures++; console.log(`FEHLER ${tag} ${n}: abgeschnitten: ${clip.slice(0, 3).join(' | ')}`); }
      await p.screenshot({ path: `${OUT}/${tag}-${n}.png` });
    };
    // Tippen mit kurzer Frist: gesperrte/verdeckte Knöpfe blockieren den Test nicht 30 s, sondern werden gemeldet
    const tap = async s => { const el = await p.$(s); if (!el) return false;
      try { await el.tap({ timeout: 3000 }); return true; } catch { console.log(`Hinweis ${tag}: nicht tippbar: ${s}`); return false; } };
    await p.goto('http://localhost:8765/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
    await tap('[data-c="witch"]'); await chk('create'); await p.fill('#nm', 'Test'); await tap('[data-action=create]'); await chk('tut1');
    await tap('[data-t=kaspar]'); await chk('kaspar');
    for (let i = 0; i < 8; i++) { await tap('[data-v=trips]'); if (await tap('[data-action=bank]')) await tap('[data-v=trips]');
      await tap('.trip[data-action=trip]'); if (!i) await chk('trackpick'); await tap(`[data-tr=${i === 3 ? 'blood' : 'safe'}]`); if (!i) await chk('wait');
      await tap('[data-action=rush]'); await tap('[data-action=resolve]'); if (!i) await chk('fight'); await tap('[data-action=skip]'); if (!i) await chk('result');
      if (i === 1 && await tap('[data-action=delve]')) { await tap('[data-action=skip]'); await chk('delve'); }
      if (i === 2) { await tap('[data-v=trips]'); await chk('haulpanel'); }
      await tap('[data-action=bank]'); }
    for (const v of ['trips', 'hero', 'stats', 'talents', 'spells', 'crypt', 'arena']) { await tap('[data-v=hero]'); await tap(`[data-v=${v}]`); await chk(v); }
    await tap('[data-v=hero]'); await tap('[data-v=spells]'); if (await tap('[data-action=ways]')) await chk('ways'); else { failures++; console.log(`FEHLER ${tag}: Zauber-Wege nicht erreichbar`); }
    await tap('[data-v=traders]'); for (const t of ['halvar', 'ysolde', 'kaspar']) { await tap(`[data-t=${t}]`); await chk(t); }
    if (await tap('[data-action=turnin]')) await chk('turnin');
    // Regression: Kaufen über das Touch-Fenster muss funktionieren (früher schloss 'mouseleave' das Fenster)
    await p.evaluate(() => { const s = JSON.parse(localStorage.aschenkrone_v1); s.gold = 9999; localStorage.aschenkrone_v1 = JSON.stringify(s); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=traders]'); await tap('[data-t=kaspar]');
    const g0 = await p.evaluate(() => JSON.parse(localStorage.aschenkrone_v1).gold);
    if (await tap('.sitem')) { await p.waitForTimeout(150); await tap('#tip button[data-action=buy]'); await p.waitForTimeout(200);
      const g1 = await p.evaluate(() => JSON.parse(localStorage.aschenkrone_v1).gold);
      if (g1 >= g0) { failures++; console.log(`FEHLER ${tag}: Kaufen per Touch hat nichts gekauft`); } }
    for (const [tab, n] of [['crypt', 'ilse'], ['arena', 'vargo'], ['trips', 'prophet']]) { await tap(`[data-v=${tab}]`); await tap('.speaker'); await chk(n); }
    // Auftragsliste im Helden-Bildschirm führt zum Auftraggeber
    await tap('[data-v=hero]'); if (await tap('.cellitem')) { await chk('itemtip'); await tap('#tip button[data-action=equip]'); await p.waitForTimeout(250); await p.screenshot({ path: `${OUT}/${tag}-toast.png` }); }
    // Hohe Stufe mit freien Punkten: Werte (mit Kampfkraft je Punkt) und alle drei Zauber
    await p.evaluate(() => { const s = JSON.parse(localStorage.aschenkrone_v1); s.lvl = 20; s.points = 25; localStorage.aschenkrone_v1 = JSON.stringify(s); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=hero]'); await tap('[data-v=stats]'); await chk('stats-points');
    await tap('[data-v=hero]'); await tap('[data-v=spells]'); await chk('spells20');
    // Schmiede: Material + Teil wählen, 5 Schläge, Ergebnis
    await p.evaluate(() => { const s = JSON.parse(localStorage.aschenkrone_v1); s.mats.zahn = 6; localStorage.aschenkrone_v1 = JSON.stringify(s); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=traders]'); await tap('[data-t=halvar]'); await tap('[data-v=forge]');
    await tap('[data-m=zahn]'); await tap('[data-s=weapon]'); await chk('forge'); await tap('[data-action=forgestart]');
    for (let i = 0; i < 5; i++) { await p.waitForTimeout(260); await tap('[data-action=forgehit]'); if (!i) await p.screenshot({ path: `${OUT}/${tag}-forgeplay.png` }); }
    await p.waitForTimeout(700); await chk('forgeres');
    if (!(await p.$('.forgeres'))) { failures++; console.log(`FEHLER ${tag}: Schmieden ohne Ergebnis`); }
    // Umschmieden: seltenes Item, Bonus versiegeln, Werte würfeln, Siegel muss halten
    const rid = await p.evaluate(async () => { const L = await import('./js/loot.js'); const G = await import('./js/state.js');
      let it; do it = L.makeItem(25, { slot: 'amulet', minRarity: 3 }); while (it.unique || it.rarity !== 'rare');
      G.S.bag = []; G.addToBag(it); for (const k of ['siegel', 'asche', 'staub', 'blutstein', 'leinen']) G.S.mats[k] = 20; G.S.gold = 99999; G.save(); return it.id; });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=traders]'); await tap('[data-t=halvar]'); await tap('[data-v=forge]');
    await tap('[data-action=forgemode][data-m=craft]'); await tap(`.cpick [data-id="${rid}"]`); await chk('craft');
    const k = await p.evaluate(() => document.querySelector('.caff')?.dataset.k); await tap(`.caff[data-k="${k}"]`); await tap('[data-o=seal]');
    const v0 = await p.evaluate(() => document.querySelector('.caff.sealed span')?.textContent);
    for (let i = 0; i < 3; i++) if (!(await tap('[data-o=values]'))) { failures++; console.log(`FEHLER ${tag}: Werte würfeln gesperrt:`, await p.evaluate(() => document.querySelector('.cmsg')?.textContent)); }
    const v1 = await p.evaluate(() => document.querySelector('.caff.sealed span')?.textContent); await chk('craft2');
    if (!v0 || v0 !== v1) { failures++; console.log(`FEHLER ${tag}: Siegel hält nicht (${v0} → ${v1})`); }
    // Item antippen → Schmieden: Schmiede öffnet direkt mit diesem Item, angelegte Teile grün umrandet
    await p.evaluate(async () => { const L = await import('./js/loot.js'); const G = await import('./js/state.js'); let r; do r = L.makeItem(25, { slot: 'ring', minRarity: 2 }); while (r.unique); G.S.equip.ring1 = r; G.save(); });
    await p.reload(); await p.waitForTimeout(300);
    await tap('[data-v=hero]'); await tap(`[data-tip="${rid}"]`); await tap('#tip [data-action=forgeitem]'); await chk('forgeitem');
    const fi = await p.evaluate(() => [document.querySelector('.cpick .fslot.on')?.dataset.id, document.querySelectorAll('.cpick .fslot.eq').length]);
    if (fi[0] !== rid || !fi[1]) { failures++; console.log(`FEHLER ${tag}: Schmieden aus dem Item-Fenster`, fi); }
    // Alchemie: brauen, in den Gürtel, Vorbereitung vor der Krypta, Kampf mit Trank
    await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.herbs = { rotwurz: 6, grabmoos: 6, silberstaub: 6, nachtschatten: 6, schwefel: 6, herz: 2 }; G.S.gold += 2000; G.S.crypt.cd = 0; G.save(); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=traders]'); await tap('[data-t=ysolde]');
    if (!(await tap('[data-action=alch]'))) { failures++; console.log(`FEHLER ${tag}: Alchemie nicht erreichbar`); }
    await tap('[data-action=potsel][data-id=rotwurz]'); await tap('[data-action=brew]'); await tap('[data-action=beltin]');
    await tap('[data-action=potsel][data-id=falkenauge]'); await tap('[data-action=brew]'); await tap('[data-action=beltin]'); await chk('alch');
    const belt = await p.evaluate(async () => (await import('./js/state.js')).S.belt.filter(Boolean).map(b => b.id).join());
    if (belt !== 'rotwurz,falkenauge') { failures++; console.log(`FEHLER ${tag}: Gürtel ${belt}`); }
    await tap('[data-v=crypt]'); if (await tap('[data-action=crypt]')) { await chk('prep'); await tap('[data-action=prepPot]'); await tap('[data-action=bestBelt]'); await chk('prep2'); await tap('[data-action=trig]'); await tap('[data-action=cryptgo]'); await p.waitForTimeout(600); await chk('fightpot');
      if (!(await p.$('.pbelt img'))) { failures++; console.log(`FEHLER ${tag}: Tränke im Kampf nicht sichtbar`); } }
    else { failures++; console.log(`FEHLER ${tag}: Krypta nicht antippbar`); }
    // Expedition: ohne Glut los, Krypta gesperrt, heimholen zeigt die Beute
    await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.glut = 0; G.S.active = null; G.S.haul = null; G.S.exp = null; G.save(); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=trips]');
    if (!(await tap('.expbar.ready'))) { failures++; console.log(`FEHLER ${tag}: Expedition-Leiste fehlt/leuchtet nicht bei leerer Glut`); }
    await tap('[data-h="8"]'); await chk('exped');
    for (let i = 0; i < 4; i++) { const nn = await p.$$('.node.next'); let n = nn[0]; for (const q of nn) if (await q.$('img[src*="event.webp"]')) n = q; if (!n) break; await n.tap(); await p.waitForTimeout(60); }
    await chk('exped2'); if (await p.$('[data-action=expgo][disabled]')) { failures++; console.log(`FEHLER ${tag}: Weg lässt sich nicht vollständig wählen`); }
    await tap('[data-action=expgo]'); await chk('expaway');
    await tap('[data-v=crypt]'); await chk('expcrypt'); if (await p.$('[data-action=crypt]')) { failures++; console.log(`FEHLER ${tag}: Krypta während Expedition offen`); }
    await tap('[data-v=trips]'); await tap('[data-action=expask]'); await chk('expask');
    if (!(await p.$('[data-action=expno]'))) { failures++; console.log(`FEHLER ${tag}: Heimrufen ohne Rückfrage`); }
    await tap('[data-action=expno]'); if (!(await p.$('[data-action=expask]'))) { failures++; console.log(`FEHLER ${tag}: Weiter warten geht nicht`); }
    await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.exp.start -= 9 * 3600e3; G.S.exp.end -= 9 * 3600e3; });
    await tap('[data-v=trips]'); await tap('[data-action=expclaim]');
    let evn = 0; while (evn < 5 && await p.$('[data-action=expchoose]')) { await chk('expevent'); await tap('[data-action=expchoose]:not([disabled])'); evn++; }
    if (!evn) { failures++; console.log(`FEHLER ${tag}: Weg über „?“ ohne Ereignis`); }
    await chk('expres'); if (!(await p.$('.steps p'))) { failures++; console.log(`FEHLER ${tag}: Expedition ohne Ergebnis`); }
    await tap('[data-action=expok]'); if (!(await p.$('.expbar'))) { failures++; console.log(`FEHLER ${tag}: nach Expedition kein Streifzug`); }
    if (errs.length) { failures++; console.log(`FEHLER ${tag} JS:`, errs); }
    await c.close();
  }));
  await b.close(); srv.kill();
  console.log(failures ? `${failures} Probleme` : 'UI ok – Screenshots in tests/out/');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); srv.kill(); process.exit(1); });
