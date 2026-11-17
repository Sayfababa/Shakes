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
      // Namen und Überstand mitgeben – sonst sucht man beim nächsten Fehler lange
      const over = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect();
        return [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect();
          return (r.bottom > m.bottom + 1 || r.right > m.right + 1) && !e.closest('.vscroll, .log, .note p, .fnum, .goldpop, .proj, .burst, .spellname'); })
          .map(e => { const r = e.getBoundingClientRect(); return (e.className || e.tagName) + ' +' + Math.round(Math.max(r.bottom - m.bottom, r.right - m.right)); }); });
      if (over.length) { failures++; console.log(`FEHLER ${tag} ${n}: ${over.length} Elemente ragen heraus`, over.slice(0, 3)); }
      // Item-Felder dürfen nie über ihr Panel hinausragen (Laden, Beutel, Figur, Schmiede)
      const spill = await p.evaluate(() => [...document.querySelectorAll('.panel .sitem, .panel .cellitem, .panel .eslot, .panel .fslot, .panel .mtile')].filter(e => {
        if (e.closest('.vscroll')) return false; const r = e.getBoundingClientRect(), q = e.closest('.panel').getBoundingClientRect(); return r.bottom > q.bottom + 1 || r.right > q.right + 1 || r.left < q.left - 1 || r.top < q.top - 1; }).length);
      if (spill) { failures++; console.log(`FEHLER ${tag} ${n}: ${spill} Item-Felder ragen über ihr Panel`); }
      // Abgeschnittener Inhalt in Karten (z. B. Ortskarte: „Stufe/Zeit“ unten weg)
      const clip = await p.evaluate(() => [...document.querySelectorAll('main .trip *, main .crypt *, main .tcard *')].filter(e => { const r = e.getBoundingClientRect(), q = e.closest('.trip, .crypt, .tcard').getBoundingClientRect(); return r.height && r.bottom > q.bottom + 1; }).map(e => e.className || e.tagName));
      if (clip.length) { failures++; console.log(`FEHLER ${tag} ${n}: abgeschnitten: ${clip.slice(0, 3).join(' | ')}`); }
      // Schrift nie unter 11 px (sichtbarer Text)
      const tiny = await p.evaluate(() => { const out = new Set(); for (const e of document.querySelectorAll('#app *')) { if (![...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim())) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const f = parseFloat(getComputedStyle(e).fontSize); if (f < 10.9) out.add(`${e.tagName.toLowerCase()}.${(e.className || '').toString().split(' ')[0]} ${f.toFixed(1)}px`); } return [...out]; });
      if (tiny.length) { failures++; console.log(`FEHLER ${tag} ${n}: Schrift unter 11 px: ${tiny.slice(0, 4).join(' | ')}`); }
      await p.screenshot({ path: `${OUT}/${tag}-${n}.png` });
    };
    // Tippen mit kurzer Frist: gesperrte/verdeckte Knöpfe blockieren den Test nicht 30 s, sondern werden gemeldet
    const tap = async s => { const el = await p.$(s); if (!el) return false;
      try { await el.tap({ timeout: 3000 }); return true; } catch { console.log(`Hinweis ${tag}: nicht tippbar: ${s}`); return false; } };
    await p.goto('http://localhost:8765/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
    await tap('[data-c="witch"]'); await chk('create'); await p.fill('#nm', 'Test'); await tap('[data-action=create]'); await chk('tut1');
    await tap('[data-t=kaspar]'); await chk('kaspar');
    for (let i = 0; i < 6; i++) { await tap('[data-v=trips]'); if (!i) await chk('acts');
      if (!(await tap('.act[data-action=act]'))) { failures++; console.log(`FEHLER ${tag}: Akt nicht antippbar`); break; } if (!i) await chk('act');
      await tap('.actv .two [data-action=zone]'); if (!i) await chk('zoneprep');
      await tap('[data-action=actgo]'); if (!i) await chk('fight'); await tap('[data-action=skip]'); if (!i) await chk('result'); }
    await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.acts.prog.a1 = 8; G.save(); }); await p.reload(); await p.waitForTimeout(300);
    await tap('[data-v=trips]'); await tap('.act[data-action=act]'); await tap('[data-v=trips]'); await tap('[data-v=wplan]'); await chk('wplan'); for (let r = 0; r < 6; r++) await tap('.wplan .node.next'); await chk('wplan6'); await tap('[data-action=wstart]'); await chk('wander');
    await p.evaluate(async () => { const G = await import('./js/state.js'); const W = G.S.wander; W.t -= 7 * 120000; W.start -= 7 * 120000; W.last = Date.now(); }); await p.waitForTimeout(1500); await chk('wander7');
    await tap('[data-v=crypt]'); await chk('wanderaway'); await tap('[data-v=trips]'); await tap('[data-action=wclaim]'); await chk('wanderres'); await tap('[data-action=wok]');
    await tap('.act[data-action=act]'); await chk('actboss'); await tap('.zone.boss'); await chk('zoneboss'); await tap('.pback'); await tap('.zone.done'); await chk('zonereplay');
    for (const v of ['trips', 'hero', 'stats', 'talents', 'spells', 'crypt', 'forge', 'alch']) { await tap('[data-v=hero]'); await tap(`[data-v=${v}]`); await chk(v); }
    // Das Brett: JEDE Klasse mit TREE, nicht nur die erste – die Beschreibungen der Schlüsselsteine
    // sind je Klasse verschieden lang, und `.tdet` hat eine feste Höhe (sonst springt das Brett).
    const boards = await p.evaluate(async () => Object.keys((await import('./js/data.js')).TREE));
    for (const bcls of boards) {
      await p.evaluate(async c => { const G = await import('./js/state.js'), D = await import('./js/data.js');
        G.S.cls = c; const T = D.TREE[c]; G.S.lvl = 30; G.S.tal = {};
        T.cols[0].nodes.slice(0, -1).forEach(n => G.S.tal[n.id] = n.max); G.save(); }, bcls);
      await p.reload(); await p.waitForTimeout(300); await tap('[data-v=hero]'); await tap('[data-v=talents]');
      if (!(await p.$('.tree2'))) continue;
      await chk(`tree_${bcls}`);
      if (!(await tap('.nd.key'))) { failures++; console.log(`FEHLER ${tag}: Schlüsselstein nicht antippbar (${bcls})`); }
      await chk(`treekey_${bcls}`);
      if (!(await p.$('.tdet .row button'))) { failures++; console.log(`FEHLER ${tag}: Schlüsselstein ohne Knopf (${bcls})`); }
      await tap('.nd.br'); await chk(`treebridge_${bcls}`);
    }
    // „Zurück" muss dorthin fuehren, wo man herkam. Der Knopf der Alchemie kannte nur zwei
    // Rueckwege (Krypta-Vorbereitung und Abgrund) – aus der Gruben- und der Gebiets-Vorbereitung
    // landete man bei Ysolde im Laden. Gemeldet hat es der Besitzer: „Guertel vor Kampf, kurz
    // Traenke brauen, zack bin ich bei der Alchemistin."
    const zurueck = async (von, hin) => {
      if (!(await p.$(von))) { failures++; console.log(`FEHLER ${tag}: ${von} nicht offen`); return; }
      if (!(await tap('[data-action=alch][data-b=prep], [data-action=alch][data-b=desc]'))) { failures++; console.log(`FEHLER ${tag}: „Alle Tränke" fehlt in ${von}`); return; }
      if (!(await p.$('.alch'))) { failures++; console.log(`FEHLER ${tag}: Alchemie nicht geoeffnet aus ${von}`); return; }
      if (!(await tap('.alch h2 .tiny'))) { failures++; console.log(`FEHLER ${tag}: Alchemie ohne Zurück aus ${von}`); return; }
      if (!(await p.$(hin))) { failures++; console.log(`FEHLER ${tag}: Zurück aus der Alchemie landet nicht wieder in ${hin} (von ${von})`); }
    };
    // aus der Gebiets-Vorbereitung (Streifzug)
    await tap('[data-v=trips]'); await tap('.act[data-action=act]'); await tap('.actv .two [data-action=zone]');
    await zurueck('.prep', '.prep');
    await tap('[data-v=crypt]'); await tap('.ctabs [data-v=arena]'); await chk('arena'); await tap('.riv'); await chk('pitprep');
    // aus der Gruben-Vorbereitung
    await zurueck('.pitprep', '.pitprep');
    await tap('[data-v=crypt]'); await tap('.ctabs [data-v=arena]'); await tap('.riv');
    // Vargos Laden mit allen verdienten Titeln (der schlimmste Fall für die Höhe). Aus der Vorbereitung
    // führt kein Reiter zurück, darum neu laden statt zu tippen – sonst zeigte „pitshop“ die Vorbereitung.
    await p.evaluate(async () => { const G = await import('./js/state.js'), D = await import('./js/data.js');
      G.S.pit.titles = D.PIT_RANKS.filter(r => r.title).map(r => r.title); G.S.title = G.S.pit.titles[0];
      G.S.honor = 500; G.S.pit.best = 1; G.S.pit.shop = {}; G.save(); });   // best 1 = jede Rangstufe offen, der Laden zeigt alle Waren
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=crypt]'); await tap('.ctabs [data-v=arena]');
    if (!(await tap('[data-action=pitshop]'))) { failures++; console.log(`FEHLER ${tag}: Vargos Laden nicht erreichbar`); }
    await chk('pitshop');
    // Und mit nur EINEM offenen Rang: die Warenreihen teilen sich die Resthoehe, eine einzelne Reihe
    // bekam dadurch das ganze Panel und die Kacheln wurden mannshoch (vom Besitzer gemeldet).
    await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.pit.best = 40; G.S.pit.shop = {}; G.save(); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=crypt]'); await tap('.ctabs [data-v=arena]'); await tap('[data-action=pitshop]');
    await chk('pitshop1');
    const hoch = await p.evaluate(() => { const t = document.querySelector('.pitrow .sitem'); if (!t) return 'keine Ware';
      const r = t.getBoundingClientRect(); return r.height > r.width ? `Kachel ${Math.round(r.width)}x${Math.round(r.height)}` : ''; });
    if (hoch) { failures++; console.log(`FEHLER ${tag}: Vargos Ware zu hoch bei einem Rang: ${hoch}`); }
    await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.pit.best = 1; G.S.pit.shop = {}; G.save(); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=crypt]'); await tap('.ctabs [data-v=arena]'); await tap('[data-action=pitshop]');
    if (!(await tap('[data-action=titles]'))) { failures++; console.log(`FEHLER ${tag}: Titel-Fenster nicht erreichbar`); }
    await chk('titles'); await tap('[data-action=pitshop]'); await tap('.ctabs [data-v=desc]'); await chk('desclocked');
    // Vargo steht jetzt auch bei den Händlern: vierter Reiter, sein Laden hinter einem Knopf,
    // und „Zurück“ muss von dort in den Händler-Tab führen, nicht in die Grube.
    await tap('[data-v=traders]'); await tap('[data-t=vargo]'); await chk('vargotrader');
    if (!(await tap('[data-action=pitshop][data-b=traders]'))) { failures++; console.log(`FEHLER ${tag}: Vargos Laden vom Händler nicht erreichbar`); }
    await chk('pitshoptrader');
    await tap('.pitshopv [data-action=trader][data-t=vargo]');
    if (!(await p.$('.trader [data-action=pitshop]'))) { failures++; console.log(`FEHLER ${tag}: Zurück aus dem Laden landet nicht bei Vargo`); }
    // Das Titel-Fenster hat dieselben zwei Türen wie der Laden (Händler und Grube).
    if (!(await tap('.trader [data-action=titles]'))) { failures++; console.log(`FEHLER ${tag}: Titel von Vargos Händlerseite nicht erreichbar`); }
    await tap('.titlev [data-action=trader][data-t=vargo]');
    if (!(await p.$('.trader [data-action=pitshop]'))) { failures++; console.log(`FEHLER ${tag}: Zurück aus den Titeln landet nicht bei Vargo`); }
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
    for (const [tab, n] of [['crypt', 'ilse'], ['arena', 'vargo'], ['trips', 'prophet']]) { if (tab === 'arena') await tap('[data-v=crypt]'); await tap(`[data-v=${tab}]`); await tap('.speaker'); await chk(n); }
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
    // Fusionieren: zwei gleiche Dolche, ein Bonus wandert herüber, das Futter zerfällt
    const fu = await p.evaluate(async () => { const L = await import('./js/loot.js'); const G = await import('./js/state.js');
      const mk = n => { for (let i = 0; i < 6000; i++) { const it = L.makeItem(22, { slot: 'weapon', kind: 'dagger' });
        if (it.rarity === 'magic' && !it.unique && Object.keys(it.mods).length === n) return it; } };
      // Das Paar braucht mindestens einen Bonus, den das andere nicht hat – sonst kann nichts wandern
      const a = mk(2); let b = null;
      for (let i = 0; i < 40 && !b; i++) { const c = mk(2); if (c && Object.keys(c.mods).some(k => !(k in a.mods))) b = c; }
      if (!a || !b) return null;
      G.addToBag(a); G.addToBag(b); G.S.gold = 99999; G.S.lvl = 22; G.save();   // Beutel NICHT leeren – spätere Fälle hängen daran
      return { a: a.id, b: b.id, n: G.S.bag.length }; });
    if (!fu) { failures++; console.log(`FEHLER ${tag}: keine zwei magischen Dolche erzeugt`); }
    else {
      await p.reload(); await p.waitForTimeout(300); await tap('[data-v=traders]'); await tap('[data-t=halvar]'); await tap('[data-v=forge]');
      await tap('[data-action=forgemode][data-m=fuse]'); await chk('fuse0');
      await tap(`.cpick [data-action=fusepick][data-id="${fu.a}"]`); await chk('fuse1');
      await tap(`.cpick [data-action=fusefood][data-id="${fu.b}"]`); await chk('fuse2');
      const fk = await p.evaluate(() => document.querySelector('.fside.food .caff[data-action=fusefood]:not(.no)')?.dataset.k);
      if (!fk) { failures++; console.log(`FEHLER ${tag}: kein übertragbarer Bonus im Futter`); }
      await tap(`.fside.food .caff[data-k="${fk}"]`);
      // volles magisches Teil: entweder Aufstieg oder ein Bonus muss weichen – beides muss gehen
      if (!(await p.$('[data-action=fusego]'))) { const mk2 = await p.evaluate(() => document.querySelector('.fside.main .caff[data-action=fusemain]')?.dataset.k);
        await tap(`.fside.main .caff[data-k="${mk2}"]`); }
      await chk('fuse3');
      if (!(await tap('[data-action=fusego]'))) { failures++; console.log(`FEHLER ${tag}: Fusionieren gesperrt:`, await p.evaluate(() => document.querySelector('.cmsg')?.textContent)); }
      await p.waitForTimeout(250); await chk('fuse4');
      const after = await p.evaluate(async () => { const G = await import('./js/state.js');
        return { n: G.S.bag.length, fused: G.S.bag.map(x => x.fused || 0) }; });
      if (after.n !== fu.n - 1) { failures++; console.log(`FEHLER ${tag}: Futter nicht zerfallen (${fu.n} → ${after.n})`); }
      if (!after.fused.some(x => x === 1)) { failures++; console.log(`FEHLER ${tag}: Fusion nicht am Teil vermerkt`); }
    }

    // Item antippen → Schmieden: Schmiede öffnet direkt mit diesem Item, angelegte Teile grün umrandet
    await p.evaluate(async () => { const L = await import('./js/loot.js'); const G = await import('./js/state.js'); let r; do r = L.makeItem(25, { slot: 'ring', minRarity: 2 }); while (r.unique); G.S.equip.ring1 = r; G.save(); });
    await p.reload(); await p.waitForTimeout(300);
    await tap('[data-v=hero]'); await tap(`[data-tip="${rid}"]`); await tap('#tip [data-action=forgeitem]'); await chk('forgeitem');
    const fi = await p.evaluate(() => [document.querySelector('.cpick .fslot.on')?.dataset.id, document.querySelectorAll('.cpick .fslot.eq').length]);
    if (fi[0] !== rid || !fi[1]) { failures++; console.log(`FEHLER ${tag}: Schmieden aus dem Item-Fenster`, fi); }
    // Alchemie: brauen, in den Gürtel, Vorbereitung vor der Krypta, Kampf mit Trank
    await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.herbs = { rotwurz: 6, grabmoos: 6, silberstaub: 6, nachtschatten: 6, schwefel: 6, herz: 2 }; G.S.gold += 2000; G.S.crypt.cd = 0; G.S.acts.prog.a1 = 9; G.save(); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=traders]'); await tap('[data-t=ysolde]');
    if (!(await tap('[data-action=alch]'))) { failures++; console.log(`FEHLER ${tag}: Alchemie nicht erreichbar`); }
    await tap('[data-action=potsel][data-id=rotwurz]'); await tap('[data-action=brew]'); await tap('[data-action=beltin]');
    await tap('[data-action=potsel][data-id=falkenauge]'); await tap('[data-action=brew]'); await tap('[data-action=beltin]'); await chk('alch');
    const belt = await p.evaluate(async () => (await import('./js/state.js')).S.belt.filter(Boolean).map(b => b.id).join());
    if (belt !== 'rotwurz,falkenauge') { failures++; console.log(`FEHLER ${tag}: Gürtel ${belt}`); }
    await tap('[data-v=crypt]'); if (await tap('[data-action=crypt]')) { await chk('prep'); await tap('[data-action=prepPot]'); await tap('[data-action=bestBelt]'); await chk('prep2'); await tap('[data-action=trig]'); await tap('[data-action=cryptgo]'); await p.waitForTimeout(600); await chk('fightpot');
      if (!(await p.$('.pbelt img'))) { failures++; console.log(`FEHLER ${tag}: Tränke im Kampf nicht sichtbar`); } }
    else { failures++; console.log(`FEHLER ${tag}: Krypta nicht antippbar`); }
    // Grab-Sets: Übersicht bei Ilse und das volle Ergebnis eines hohen Krypta-Bosses (3 Fundstücke + Set-Teil)
    await p.evaluate(async () => { const G = await import('./js/state.js'); const L = await import('./js/loot.js');
      const D = await import('./js/data.js');
      Object.assign(G.S, { lvl: 30, glut: 900, gold: 9000 }); G.S.crypt.cd = 0; G.S.crypt.prog = { c1: 5 };
      G.S.attrs.str = G.S.attrs.int = G.S.attrs.con = 600; G.S.attrs.lck = 120;
      G.S.equip.helm = L.makeSetItem('s1', 0, 28); G.S.equip.chest = L.makeSetItem('s1', 1, 28);
      for (const s of ['gloves', 'boots', 'belt', 'amulet', 'offhand', 'ring1']) G.S.equip[s] = L.makeItem(28, { slot: s === 'ring1' ? 'ring' : s, minRarity: 3 });
      G.S.equip.weapon = L.makeItem(28, { slot: 'weapon', kind: D.CLASSES[G.S.cls].weapon, minRarity: 4 });
      G.S.bag = []; G.save(); });
    await p.reload(); await p.waitForTimeout(300);
    await tap('[data-v=crypt]'); await tap('.speaker'); await tap('[data-v=sets]'); await chk('sets');
    let gotLoot = false;
    // 4 Fundstücke sind Zufall – mit 10 Versuchen schlug der Test gelegentlich grundlos fehl
    for (let i = 0; i < 25; i++) {
      await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.crypt.cd = 0; G.S.glut = 400; G.S.bag = []; G.save(); });
      await p.reload(); await p.waitForTimeout(250); await tap('[data-v=crypt]');
      if (!(await tap('[data-action=crypt]'))) break;
      await tap('[data-action=cryptgo]'); await tap('[data-action=skip]'); await p.waitForTimeout(250);
      if (await p.$('.drops.many')) { await p.waitForTimeout(1300); await chk('cryptloot'); await tap('.drop[data-tip]'); await chk('settip'); gotLoot = true; break; }
    }
    if (!gotLoot) { failures++; console.log(`FEHLER ${tag}: Krypta-Ergebnis mit 4 Fundstücken nie erreicht`); }
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
    // Der Abstieg: Knopf in der Krypta, Start, Karte, Raum wählen, Kampf, Stiege (zwei Tipps), Bilanz; Tod zeigt den Verlust
    await p.evaluate(async () => { const G = await import('./js/state.js'), D = await import('./js/data.js'); const S = G.S;
      if (!S.trophies.some(t => t.key === 'c1:0')) S.trophies.push({ key: 'c1:0', name: 'x', diff: 'Normal', eff: D.CRYPTS[0].trophy });
      S.attrs.int += 400; S.attrs.con += 300; S.active = null; S.haul = null; S.exp = null; S.desc = null; S.descDay = null; G.save(); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=crypt]');
    if (!(await tap('.ctabs [data-v=desc]'))) { failures++; console.log(`FEHLER ${tag}: kein Reiter „Abgrund“ in der Krypta`); }
    await chk('descstart'); await tap('[data-action=descgo]'); await chk('descmap');
    if ((await p.$$('.node.next')).length < 2) { failures++; console.log(`FEHLER ${tag}: Abstieg ohne Wahl im ersten Raum`); }
    for (let k = 0; k < 2; k++) {
      const n = await p.$('[data-action=descsel]:not(.exit)'); if (!n) break;
      await n.tap(); await chk('descsel' + k); await tap('[data-action=descgo2]'); await tap('[data-action=skip]'); if (!k) await chk('descfight'); await tap('[data-action=go][data-v=desc]');
      if (!(await p.$('.descv'))) break; }
    if (await p.$('.descv')) { await chk('descrun'); await tap('[data-action=descstair]'); await chk('descask');
      if (!(await p.$('[data-action=descstair].red'))) { failures++; console.log(`FEHLER ${tag}: Stiege ohne Rückfrage`); }
      await tap('[data-action=descstair]'); await tap('[data-action=skip]'); await tap('[data-action=go][data-v=desc]'); }
    await chk('descres'); if (!(await p.$('.descres'))) { failures++; console.log(`FEHLER ${tag}: Abstieg ohne Bilanz`); }
    await tap('[data-action=descok]');
    await p.evaluate(async () => { const G = await import('./js/state.js'); const S = G.S; S.attrs = { str: 5, dex: 5, int: 5, con: 6, lck: 3 }; S.equip = {}; G.save(); });
    await p.reload(); await p.waitForTimeout(300); await tap('[data-v=crypt]'); await tap('.ctabs [data-v=desc]'); await tap('[data-action=descgo]');
    await p.evaluate(async () => { const G = await import('./js/state.js'); G.S.desc.hpf = 0.02; G.S.desc.sack.gold = 50; });
    await tap('[data-v=trips]'); await chk('descaway'); if (!(await p.$('[data-action=go][data-v=desc]'))) { failures++; console.log(`FEHLER ${tag}: Streifzug während des Abstiegs nicht gesperrt`); }
    await tap('[data-action=go][data-v=desc]'); const n0 = await p.$('[data-action=descsel]:not(.exit)'); if (n0) await n0.tap(); await tap('[data-action=descgo2]'); await tap('[data-action=skip]'); await tap('[data-action=go][data-v=desc]');
    await chk('desclost'); if (!(await p.$('.descres h2.hot'))) { failures++; console.log(`FEHLER ${tag}: Tod im Abstieg ohne Verlust-Anzeige`); }
    if (errs.length) { failures++; console.log(`FEHLER ${tag} JS:`, errs); }
    await c.close();
  }));
  await b.close(); srv.kill();
  console.log(failures ? `${failures} Probleme` : 'UI ok – Screenshots in tests/out/');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); srv.kill(); process.exit(1); });
