// Händler-Layout: alle Händler × alle Aufträge × (offen/fertig) × viele Bildschirme (auch iOS-App: vh größer als sichtbarer Bereich)
const { chromium, devices } = require('playwright'); const { spawn } = require('child_process');
const OUT = __dirname + '/out/trader'; require('fs').mkdirSync(OUT, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', '8781'], { cwd: '/home/user/Shakes', stdio: 'ignore' });
const SCR = [['i13app', 390, 844, 0], ['i13band', 390, 844, 60]];
(async () => { await new Promise(r => setTimeout(r, 700)); const b = await chromium.launch(); let bad = 0;
  await Promise.all(SCR.map(async ([nm, w, h, cut]) => {
    const c = await b.newContext({ ...devices['iPhone 15 Pro Max'], viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const p = await c.newPage();
    await p.goto('http://localhost:8781/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
    await p.tap('[data-c="sorceress"]'); await p.fill('#nm', 'Sayfa'); await p.tap('[data-action=create]'); await p.waitForTimeout(150);
    if (cut) await p.addStyleTag({ content: `#app { bottom: ${cut}px !important; }` });
    const sizes = new Set();
    for (const t of ['halvar', 'ysolde', 'kaspar']) for (let qi = 0; qi < 7; qi++) for (const ready of [0, 1]) for (const lvl of [5, 25]) {
      const ok = await p.evaluate(async ([t, qi, ready, lvl]) => { const D = await import('./js/data.js'); if (qi >= D.QUESTS[t].length + 1) return false;
        const G = await import('./js/state.js'); Object.assign(G.S, { lvl, tut: 99, gold: 300 }); G.S.traders[t].q = qi; G.S.traders[t].prog = ready ? [99, 99, 99] : [0, 0, 0];
        G.S.view = 'traders'; G.S.tv = t; return true; }, [t, qi, ready, lvl]);
      if (!ok) continue;
      await p.tap('[data-v=traders]').catch(() => {}); await p.tap(`[data-t=${t}]`); await p.waitForTimeout(60);
      const r = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect(), out = [];
        for (const e of document.querySelectorAll('main *')) { const q = e.getBoundingClientRect(); if (q.height && q.bottom > m.bottom + 1) { out.push('UNTER MAIN ' + e.className); break; } }
        const n = document.querySelector('.note'), nb = n.getBoundingClientRect().bottom;
        for (const e of n.querySelectorAll('h4, ul, li, .rew, button')) if (e.offsetParent && e.getBoundingClientRect().bottom > nb + 1) out.push('ZETTEL ZU KLEIN ' + e.tagName);
        const k = document.querySelector('.npcrow'), kb = k.getBoundingClientRect().bottom;
        for (const e of k.querySelectorAll('h2, .lore, .loyal, small, .bar')) if (e.offsetParent && e.getBoundingClientRect().bottom > kb - 2) out.push('KOPF ZU KLEIN ' + e.className);
        const sh = document.querySelector('.shop').getBoundingClientRect();
        for (const e of document.querySelectorAll('.sitem')) if (e.getBoundingClientRect().bottom > sh.bottom + 1) { out.push('WARE ABGESCHNITTEN'); break; }
        const si = document.querySelector('.sitem')?.getBoundingClientRect(), sv = document.querySelector('.svc').getBoundingClientRect();
        return { out: out.join(' '), s: si ? `${Math.round(si.width)}x${Math.round(si.height)}/${Math.round(sv.width)}x${Math.round(sv.height)}` : '-' }; });
      sizes.add(r.s); if (r.out) { bad++; console.log(nm, t, qi, ready ? 'fertig' : 'offen', lvl, r.out); await p.screenshot({ path: `${OUT}/${nm}_${t}_${qi}_${ready}.png` }); }
      
    }
    if (sizes.size > 1) { bad++; console.log(nm, 'Ware/Dienste ungleich groß:', [...sizes].join(' ')); }
    // Vargo: vierter Reiter, aber keine Ware – eigene Prüfung (Ehre statt Treue, Laden hinter einem Knopf)
    for (const [honor, titles] of [[0, 0], [9999, 5]]) {
      await p.evaluate(async ([honor, titles]) => { const G = await import('./js/state.js');
        Object.assign(G.S, { lvl: 25, tut: 99, honor }); G.S.pit.titles = Array.from({ length: titles }, (_, i) => 'T' + i); }, [honor, titles]);
      await p.tap('[data-v=traders]').catch(() => {}); await p.tap('[data-t=vargo]'); await p.waitForTimeout(60);
      const r = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect(), out = [];
        if (!document.querySelector('.npcrow')) return { out: 'VARGO-SEITE FEHLT' };
        for (const e of document.querySelectorAll('main *')) { const q = e.getBoundingClientRect(); if (q.height && q.bottom > m.bottom + 1) { out.push('UNTER MAIN ' + e.className); break; } }
        const k = document.querySelector('.npcrow'), kb = k.getBoundingClientRect().bottom;
        for (const e of k.querySelectorAll('h2, .lore, .loyal, small, .bar')) if (e.offsetParent && e.getBoundingClientRect().bottom > kb - 2) out.push('KOPF ZU KLEIN ' + e.className);
        if (!document.querySelector('[data-action=pitshop]')) out.push('LADEN-KNOPF FEHLT');
        const tabs = [...document.querySelectorAll('.subtabs a')].map(a => a.textContent.trim());
        if (tabs.length !== 4) out.push('REITER ' + tabs.length + ' statt 4');
        for (const a of document.querySelectorAll('.subtabs a')) if (a.scrollWidth > a.clientWidth + 1) out.push('REITER-NAME ABGESCHNITTEN ' + a.textContent.trim());
        return { out: out.join(' ') }; });
      if (r.out) { bad++; console.log(nm, 'vargo', honor, r.out); await p.screenshot({ path: `${OUT}/${nm}_vargo_${honor}.png` }); }
    }
    // Ilse und der Prophet sind auch Questgeber, standen aber in KEINEM Layout-Test - und genau
    // ihre Zettel tragen die laengsten Zielzeilen (Prophet p6: 90 Zeichen, seit der Fundort am
    // Boss-Ziel steht). Geprueft wird mit ZUGESPERRTEN Akten, denn dann ist die Zeile am laengsten
    // ("... (Gruft der Waescherinnen, Akt I schaffen)"), und ob ein Ziel seinen Text verschluckt -
    // das ragt nirgends heraus und waere sonst unsichtbar, dieselbe blinde Stelle wie beim Grabsiegel.
    for (const t of ['ilse', 'prophet']) for (let qi = 0; qi < 9; qi++) {
      const ok = await p.evaluate(async ([t, qi]) => { const D = await import('./js/data.js'); if (qi >= D.QUESTS[t].length) return false;
        const G = await import('./js/state.js'); Object.assign(G.S, { lvl: 30, tut: 99 });
        G.S.acts.prog = {}; G.S.traders[t].q = qi; G.S.traders[t].prog = [0, 0, 0];
        const a = document.createElement('b'); a.dataset.action = 'npc'; a.dataset.n = t;
        document.body.appendChild(a); a.click(); a.remove(); return true; }, [t, qi]);
      if (!ok) continue;
      await p.waitForTimeout(60);
      const r = await p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect(), out = [];
        const n = document.querySelector('.trader .note'); if (!n) return { out: 'ZETTEL FEHLT' };
        for (const e of document.querySelectorAll('main *')) { const q = e.getBoundingClientRect(); if (q.height && q.bottom > m.bottom + 1) { out.push('UNTER MAIN ' + e.className); break; } }
        for (const e of n.querySelectorAll('li')) {
          if (e.scrollHeight > e.clientHeight + 1) out.push('ZIEL VERSCHLUCKT TEXT');
          if (parseFloat(getComputedStyle(e).fontSize) < 11) out.push('ZIEL-SCHRIFT ZU KLEIN');
        }
        return { out: out.join(' ') }; });
      if (r.out) { bad++; console.log(nm, t, qi, r.out); await p.screenshot({ path: `${OUT}/${nm}_${t}_${qi}.png` }); }
    }
    await c.close(); }));
  await b.close(); srv.kill(); console.log(bad ? `${bad} Probleme (Screenshots in tests/out/trader)` : 'Händler ok: 3 Händler × alle Aufträge + Vargo + Ilse/Prophet × offen/fertig × ${SCR.length} Bildschirme, gleich groß, nichts abgeschnitten.'); process.exit(bad ? 1 : 0); })();
