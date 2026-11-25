// Schmiede bleibt ruhig (Besitzer 2026-11-25: „beim Schmieden verschiebt sich das UI, Anzeigen werden größer, kleiner"):
// 100 Eingriffe im Umschmieden und 100 Tipps im Fusionieren wie mit dem Finger, iPhone 13 als App (Safe-Area nachgestellt).
// Geprüft nach jedem Schritt: jeder Kasten an derselben Stelle, kein Sparschritt, kein Tippziel unter 40×36 px,
// nichts ragt aus <main>, kein Text in den festen Zeilen abgeschnitten, keine JS-Fehler.
const { chromium, devices } = require('playwright'); const { spawn } = require('child_process');
const srv = spawn('python3', ['-m', 'http.server', '8783'], { cwd: require('path').join(__dirname, '..'), stdio: 'ignore' });
const SAFE = '#app { padding-top: 47px !important; } .tabs { padding-bottom: 40px !important; }';
const N = +(process.argv[2] || 100);
const snap = p => p.evaluate(() => { const m = document.querySelector('main').getBoundingClientRect(), col = document.querySelector('main > .col');
  const panels = [...col.children].filter(e => e.matches('.panel')).map(e => { const q = e.getBoundingClientRect(); return Math.round(q.top - m.top) + '+' + Math.round(q.height); }).join(' | ');
  const small = [...document.querySelectorAll('main [data-action]')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.width < 40 || q.height < 36); })
    .map(e => `${e.dataset.action} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
  const over = [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().bottom > m.bottom + 1).length;
  const cut = [...document.querySelectorAll('.fbot .cmsg, .cfoot span, .otile small, .otake')].filter(e => e.scrollHeight > e.clientHeight + 3 || e.scrollWidth > e.clientWidth + 3).map(e => e.textContent.slice(0, 60));
  return { panels, small, over, cut, tight: /tight/.test(col.className) }; });
(async () => { await new Promise(r => setTimeout(r, 700)); const b = await chromium.launch(); let bad = 0; const out = [];
  try {
    const c = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(css => addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }), SAFE);
    await p.goto('http://localhost:8783/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
    await p.tap('[data-c="assassin"]'); await p.fill('#nm', 'Test'); await p.tap('[data-action=create]'); await p.waitForTimeout(300);
    // Viele Teile (die Leiste muss seitlich wischen), gemischte Seltenheiten, Paare fürs Fusionieren, genug Material
    await p.evaluate(async () => { const G = await import('./js/state.js'), L = await import('./js/loot.js'), D = await import('./js/data.js'); G.S.tut = 99; G.S.lvl = 30; G.S.gold = 9e6; G.S.bag = [];
      for (let i = 0; i < 18; i++) { const it = L.makeItem(30, { slot: ['helm', 'gloves', 'boots', 'weapon', 'amulet', 'ring'][i % 6], kind: 'dagger', minRarity: 2 + (i % 3 === 2 ? 1 : 0) }); if (!it.unique && !it.set) G.addToBag(it); }
      for (const k of Object.keys(D.MATS)) G.S.mats[k] = 999; G.S.mats.kronsplitter = 20; G.save(); });
    await p.reload(); await p.waitForTimeout(400); await p.tap('[data-v=forge]'); await p.waitForTimeout(200);
    for (const mode of ['craft', 'fuse']) {
      await p.tap(`[data-action=forgemode][data-m=${mode}]`); await p.waitForTimeout(200);
      const lay = new Map(), issues = new Set(); let tight = 0;
      const items = await p.$$eval('.cpick [data-action=craftpick], .cpick [data-action=fusepick]', l => l.map(e => e.dataset.id));
      for (let i = 0; i < N; i++) {
        if (mode === 'craft') {
          if (i % 12 === 0) { await p.tap(`.cpick [data-id="${items[(i / 12 | 0) % items.length]}"]`); await p.waitForTimeout(60); }
          if (await p.$('.otile')) { const o = await p.$$('.otile'); await o[i % o.length].tap(); await p.waitForTimeout(50); await p.tap('[data-action=offertake]:not([disabled])').catch(() => {}); }
          else { const rows = await p.$$('.ccard .caff:not(.sealed)'); if (rows.length && !(await p.$('.ccard .caff.on'))) { await rows[i % rows.length].tap(); await p.waitForTimeout(50); }
            const en = await p.$$('.cop:not([disabled])'); if (en.length) await en[i % en.length].tap(); }
        } else {
          const els = await p.$$('main [data-action]:not([data-action=forgemode]):not([data-action=go]):not([disabled])');
          if (els.length) await els[(i * 7) % els.length].tap().catch(() => {});
          if (!(await p.$('[data-action=forgemode][data-m=fuse].on'))) { await p.tap('[data-v=forge]').catch(() => {}); await p.tap('[data-action=forgemode][data-m=fuse]').catch(() => {}); }
        }
        await p.waitForTimeout(70);
        const s = await snap(p); lay.set(s.panels, (lay.get(s.panels) || 0) + 1); if (s.tight) tight++;
        for (const x of s.small) issues.add('Tippziel zu klein: ' + x); if (s.over) issues.add('ragt heraus'); for (const x of s.cut) issues.add('abgeschnitten: ' + x);
      }
      if (lay.size !== 1) { bad++; out.push(`FEHLER ${mode}: ${lay.size} verschiedene Lagen – ${[...lay.keys()].slice(0, 3).join(' / ')}`); }
      if (tight) { bad++; out.push(`FEHLER ${mode}: ${tight}× Sparschritt (Größen springen)`); }
      for (const x of issues) { bad++; out.push(`FEHLER ${mode}: ${x}`); }
      await p.screenshot({ path: `${__dirname}/out/iPhone13App-forge-${mode}.png` });
    }
    if (errs.length) { bad++; out.push('FEHLER JS: ' + errs.join(' | ')); }
  } finally { await b.close(); srv.kill(); }
  console.log(out.join('\n') + (bad ? `\n${bad} Probleme` : `Schmiede ruhig: ${N} Eingriffe Umschmieden + ${N} Tipps Fusionieren, jeder Kasten an einer Stelle, kein Sparschritt, Tippziele groß genug, nichts abgeschnitten.`));
  process.exit(bad ? 1 : 0); })();
