// UI-Fuzz: tippt zufällig auf alles Tippbare in der App (wie ein ungeduldiger Spieler) und meldet
// JS-Fehler, Elemente außerhalb des Bildschirms und Item-Felder über ihrem Panel. Aufruf: node tests/uifuzz.cjs [taps]
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process'); const path = require('path');
const TAPS = +process.argv[2] || 300;
const srv = spawn('python3', ['-m', 'http.server', '8771'], { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
const issues = new Map(); const note = (k, v) => { if (!issues.has(k)) issues.set(k, v); };
(async () => {
  await new Promise(r => setTimeout(r, 800));
  const b = await chromium.launch();
  for (const dev of ['iPhone SE', 'iPhone 13', 'iPhone 15 Pro Max', 'App 430x867']) for (const stage of ['früh', 'spät']) {
    const c = await b.newContext(dev === 'App 430x867' ? { ...devices['iPhone 15 Pro Max'], viewport: { width: 430, height: 867 } } : { ...devices[dev] }); const p = await c.newPage(); const tag = `${dev}/${stage}`;
    let last = '';
    p.on('pageerror', e => note(`JS-Fehler: ${e.message}`, `${tag} nach ${last}`));
    p.on('console', m => m.type() === 'error' && !/favicon|404/.test(m.text()) && note(`Konsole: ${m.text()}`, `${tag} nach ${last}`));
    p.on('dialog', d => d.dismiss().catch(() => {}));   // Bestätigungen (Neu beginnen, Läutern) immer ablehnen
    await p.goto('http://localhost:8771/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
    await p.tap('[data-c="witch"]'); await p.fill('#nm', 'Fuzz'); await p.tap('[data-action=create]'); await p.waitForTimeout(150);
    if (stage === 'spät') await p.evaluate(async () => { const G = await import('./js/state.js'); const L = await import('./js/loot.js');
      Object.assign(G.S, { lvl: 26, points: 60, gold: 50000, tut: 99, shards: ['c1', 'c2', 'c3', 'c4'] });
      for (const k of Object.keys(G.S.mats).concat(['zahn', 'leinen', 'staub', 'schwanz', 'siegel', 'blutstein', 'haar', 'asche'])) G.S.mats[k] = 30;
      for (let i = 0; i < 8; i++) G.addToBag(L.makeItem(26, { minRarity: 2 + (i % 3) })); G.save(); });
    await p.reload(); await p.waitForTimeout(300);
    for (let i = 0; i < TAPS; i++) {
      const els = await p.$$('[data-action]:not([disabled]):not([data-action=wipe])');
      const vis = []; for (const e of els) if (await e.isVisible().catch(() => false)) vis.push(e);
      if (!vis.length) { note('Keine tippbaren Elemente mehr (Sackgasse)', tag); break; }
      const el = vis[Math.floor(Math.random() * vis.length)];
      last = await el.evaluate(e => `${e.dataset.action}${e.dataset.v ? ':' + e.dataset.v : ''}${e.dataset.o ? ':' + e.dataset.o : ''}`).catch(() => '?');
      await el.tap({ timeout: 1500 }).catch(() => {});
      await p.waitForTimeout(40 + Math.random() * 120);
      if (Math.random() < 0.15) await p.waitForTimeout(500);   // Kampf-/Schmiede-Animationen auch mal laufen lassen
      const bad = await p.evaluate(() => {
        const m = document.querySelector('main')?.getBoundingClientRect(); if (!m) return ['main fehlt'];
        const tip = document.getElementById('tip'); const out = [];
        const over = [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.bottom > m.bottom + 1 || r.right > m.right + 1) && !e.closest('.log, .note p, .proj, .burst, .spellname, .fnum, .goldpop, .sparks'); });
        if (over.length) out.push('ragt heraus: ' + (over[0].className || over[0].tagName) + ' in ' + (document.querySelector('main > *')?.className || ''));
        const spill = [...document.querySelectorAll('.panel .sitem, .panel .cellitem, .panel .eslot, .panel .fslot, .panel .mtile')].filter(e => { const r = e.getBoundingClientRect(), q = e.closest('.panel').getBoundingClientRect(); return r.bottom > q.bottom + 1 || r.right > q.right + 1; });
        if (spill.length) out.push('Item-Feld über Panel in ' + (document.querySelector('main > *')?.className || ''));
        if (!tip.hidden) { const r = tip.getBoundingClientRect(); if (r.bottom > innerHeight + 1 || r.top < -1) out.push('Item-Fenster ragt aus dem Bildschirm'); }
        const t = document.querySelector('.tabs')?.getBoundingClientRect(); if (t && t.bottom > innerHeight + 1) out.push('Tabs unter dem Bildschirmrand');
        const txt = document.body.innerText; if (/undefined|NaN|\[object/.test(txt)) out.push('Text enthält undefined/NaN: ' + (txt.match(/.{0,30}(undefined|NaN|\[object).{0,20}/) || [''])[0]);
        return out; });
      for (const x of bad) note(x, `${tag} nach ${last}`);
    }
    await c.close();
  }
  await b.close(); srv.kill();
  if (issues.size) { console.log('PROBLEME:'); for (const [k, v] of issues) console.log(`- ${k}  (${v})`); process.exit(1); }
  console.log(`UI-Fuzz ok: ${TAPS} Taps × 6 Durchläufe ohne Problem.`);
})().catch(e => { console.error(e); srv.kill(); process.exit(1); });
