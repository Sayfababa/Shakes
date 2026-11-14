// Handgezeichnete Item-Grafiken als SVG. 1 Rasterzelle = 20 Einheiten.
// Farbverläufe (Metall, Holz, Leder, Gold, Knochen) liegen einmalig in index.html (#defs).
const G = { m: 'url(#gMetal)', md: 'url(#gMetalDark)', w: 'url(#gWood)', l: 'url(#gLeather)', g: 'url(#gGold)', b: 'url(#gBone)', c: 'url(#gCloth)' };
const S = 'stroke="#000" stroke-width="1" stroke-linejoin="round"';
const GEM = { broken: '#555', normal: '#8a8a8a', magic: '#4646e0', rare: '#d6c23a', legendary: '#c76a1e', set: '#2a9a2a' };

const grip = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${G.l}" ${S}/>` +
  Array.from({ length: Math.floor(h / 3) }, (_, i) => `<path d="M${x} ${y + 2 + i * 3}l${w} -1.5" stroke="#1a0f08" stroke-width=".8"/>`).join('');

const ART = {
  sword: (g) => `<path d="M10 3 L13 40 L7 40 Z" fill="${G.m}" ${S}/><path d="M10 6 V38" stroke="#5a5a5a" stroke-width=".8"/>
    <path d="M2 40 h16 l-1 3 h-14 z" fill="${G.md}" ${S}/>${grip(8.5, 43, 3, 11)}<circle cx="10" cy="57" r="2.6" fill="${G.md}" ${S}/>`,
  longsword: (g) => `<path d="M10 2 L13.5 56 L6.5 56 Z" fill="${G.m}" ${S}/><path d="M10 6 V54" stroke="#5a5a5a" stroke-width=".8"/>
    <path d="M1 56 q9 -3 18 0 l-1 3.5 q-8 -2 -16 0 z" fill="${G.md}" ${S}/>${grip(8.3, 59.5, 3.4, 14)}<path d="M10 74 l3 3 -3 3 -3 -3z" fill="${G.md}" ${S}/>`,
  dagger: (g) => `<path d="M10 2 Q14 14 12.5 24 L7.5 24 Q6 14 10 2Z" fill="${G.m}" ${S}/><path d="M3 24h14v2.5H3z" fill="${G.md}" ${S}/>${grip(8.5, 26.5, 3, 9)}<circle cx="10" cy="37.5" r="2" fill="${G.md}" ${S}/>`,
  claw: (g) => `<path d="M4 4 Q2 20 7 34 M10 2 Q9 20 10 34 M16 4 Q18 20 13 34" stroke="#000" stroke-width="3.4" fill="none"/>
    <path d="M4 4 Q2 20 7 34 M10 2 Q9 20 10 34 M16 4 Q18 20 13 34" stroke="${G.m}" stroke-width="2" fill="none"/>
    <path d="M4 34h12v4H4z" fill="${G.md}" ${S}/>${grip(7.5, 38, 5, 12)}<path d="M5 50h10v4H5z" fill="${G.md}" ${S}/>`,
  hatchet: (g) => `<path d="M19 6 L22 6 L23 58 L19 58 Z" fill="${G.w}" ${S}/><path d="M21 7 L36 3 Q40 13 36 23 L21 18 Z" fill="${G.m}" ${S}/>
    <path d="M36 4 Q39 13 36 22" stroke="#d9d9d9" stroke-width=".8" fill="none"/>`,
  waraxe: (g) => `<path d="M18.5 4 L21.5 4 L22.5 58 L18.5 58 Z" fill="${G.w}" ${S}/>
    <path d="M21 8 L33 2 Q40 14 33 28 L21 20 Z M19 8 L7 2 Q0 14 7 28 L19 20 Z" fill="${G.m}" ${S}/><circle cx="20" cy="14" r="2" fill="${G.md}" ${S}/>`,
  bow: (g) => `<path d="M12 3 Q36 30 12 57" stroke="#000" stroke-width="4.5" fill="none"/><path d="M12 3 Q36 30 12 57" stroke="${G.w}" stroke-width="3" fill="none"/>
    <path d="M12 3 V57" stroke="#cbbf9e" stroke-width=".7"/>${grip(20.5, 25, 4, 10)}`,
  longbow: (g) => `<path d="M12 3 Q40 40 12 77" stroke="#000" stroke-width="4.5" fill="none"/><path d="M12 3 Q40 40 12 77" stroke="${G.w}" stroke-width="3" fill="none"/>
    <path d="M12 3 V77" stroke="#cbbf9e" stroke-width=".7"/>${grip(23, 33, 4, 14)}`,
  staff: (g) => `<path d="M9 18 Q12 45 9 78 L12 78 Q14 45 12 18 Z" fill="${G.w}" ${S}/><path d="M10.5 18 Q2 12 5 4 Q10 9 10.5 2 Q12 9 16 4 Q18 12 10.5 18Z" fill="${G.w}" ${S}/>
    <circle cx="10.5" cy="10" r="3.5" fill="${GEM[g]}" stroke="#000"/><circle cx="9.5" cy="9" r="1" fill="#fff" opacity=".6"/>`,
  runestaff: (g) => `<path d="M9 14 L11 78 L13 78 L11.5 14 Z" fill="${G.md}" ${S}/><path d="M10.5 1 L15 9 L10.5 16 L6 9 Z" fill="${GEM[g]}" ${S}/>
    ${[26, 38, 50, 62].map(y => `<path d="M9 ${y}h4M10 ${y - 2}l2 4" stroke="#c9a24a" stroke-width=".8"/>`).join('')}`,
  wand: (g) => `<path d="M9 14 L11 38 L12 38 L12 14 Z" fill="${G.b}" ${S}/><circle cx="10.5" cy="9" r="6" fill="${G.b}" ${S}/>
    <circle cx="8.3" cy="8.5" r="1.4" fill="#000"/><circle cx="12.7" cy="8.5" r="1.4" fill="#000"/><path d="M8.5 13h4" stroke="#000"/>`,
  scepter: (g) => `<path d="M9 16 L10 58 L12 58 L12 16 Z" fill="${G.md}" ${S}/><path d="M10.5 2 L17 9 L14 16 H7 L4 9 Z" fill="${G.m}" ${S}/>
    <circle cx="10.5" cy="9" r="2.5" fill="${GEM[g]}" stroke="#000"/>`,
  cap: () => `<path d="M6 26 Q6 8 20 7 Q34 8 34 26 Q20 30 6 26Z" fill="${G.l}" ${S}/><path d="M6 26 Q20 31 34 26 L34 30 Q20 35 6 30Z" fill="${G.l}" ${S}/>
    <path d="M20 8 V27" stroke="#1a0f08" stroke-width=".8"/>`,
  helm: () => `<path d="M6 34 V16 Q6 4 20 4 Q34 4 34 16 V34 Z" fill="${G.m}" ${S}/><path d="M10 18 H18 M22 18 H30" stroke="#000" stroke-width="2.5"/>
    <path d="M20 4 V34" stroke="#555" stroke-width="1.2"/>${[12, 28].map(x => `<circle cx="${x}" cy="28" r="1" fill="#000"/>`).join('')}`,
  mask: () => `<path d="M7 8 Q20 0 33 8 Q36 22 28 34 H12 Q4 22 7 8Z" fill="${G.b}" ${S}/><path d="M11 15 q4 -3 7 1 q-3 5 -7 -1z M29 15 q-4 -3 -7 1 q3 5 7 -1z" fill="#000"/>
    <path d="M18 22 l2 -3 2 3z" fill="#000"/><path d="M14 28 h12 M16 26v4 M20 26v4 M24 26v4" stroke="#000" stroke-width=".9"/>`,
  leather: () => `<path d="M10 4 L16 8 H24 L30 4 L37 12 L33 22 V56 H7 V22 L3 12 Z" fill="${G.l}" ${S}/>
    <path d="M20 9 V54" stroke="#1a0f08"/>${[16, 24, 32, 40].map(y => `<path d="M17 ${y} l6 3 M23 ${y} l-6 3" stroke="#c9a77a" stroke-width=".7"/>`).join('')}`,
  mail: () => `<defs><pattern id="pMail" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="none" stroke="#1b1b1b" stroke-width=".6"/></pattern></defs>
    <path d="M10 4 L16 8 H24 L30 4 L38 14 L33 24 V56 H7 V24 L2 14 Z" fill="${G.m}" ${S}/><path d="M10 4 L16 8 H24 L30 4 L38 14 L33 24 V56 H7 V24 L2 14 Z" fill="url(#pMail)"/>`,
  plate: () => `<path d="M9 4 L16 9 H24 L31 4 L38 12 L34 20 Q35 40 30 56 H10 Q5 40 6 20 L2 12 Z" fill="${G.m}" ${S}/>
    <path d="M20 9 V55" stroke="#ddd" stroke-width="1"/><path d="M8 34 Q20 40 32 34 M9 44 Q20 50 31 44" stroke="#333" fill="none"/>`,
  gloves: () => `<path d="M10 36 V18 Q8 10 11 9 L13 17 L13 6 Q15 4 17 6 V16 V4 Q19 2 21 4 V16 V6 Q23 4 25 6 V20 L29 14 Q32 15 30 19 L26 30 V36 Z" fill="${G.l}" ${S}/>
    <path d="M10 30 H26" stroke="#1a0f08"/>`,
  gauntlets: () => `<path d="M9 37 V18 Q7 10 10 9 L12 17 L12 6 Q14 4 16 6 V16 V4 Q18 2 20 4 V16 V6 Q22 4 24 6 V20 L28 14 Q31 15 29 19 L26 30 V37 Z" fill="${G.m}" ${S}/>
    <path d="M9 28 H26 M9 32 H26" stroke="#333"/><path d="M13 12 h3 M17 10 h3 M21 12 h3" stroke="#333" stroke-width=".8"/>`,
  boots: () => `<path d="M12 3 H25 V24 L34 30 Q36 35 32 36 H8 V30 Z" fill="${G.l}" ${S}/><path d="M12 8 H25" stroke="#1a0f08"/><path d="M8 33 H33" stroke="#1a0f08"/>`,
  greaves: () => `<path d="M11 3 H26 V24 L35 30 Q37 35 33 37 H7 V30 Z" fill="${G.m}" ${S}/><path d="M11 9 H26 M11 15 H26" stroke="#333"/><path d="M7 33 H34" stroke="#333"/>`,
  sash: () => `<path d="M2 6 Q20 2 38 6 V14 Q20 10 2 14 Z" fill="${G.c}" ${S}/><path d="M24 8 l4 10 -6 -2z" fill="${G.c}" ${S}/>`,
  belt: () => `<rect x="2" y="5" width="36" height="10" fill="${G.l}" ${S}/><rect x="15" y="3.5" width="10" height="13" fill="none" stroke="${G.g}" stroke-width="2.4"/>
    <path d="M20 5v10" stroke="${G.g}" stroke-width="1.4"/>`,
  buckler: () => `<circle cx="20" cy="20" r="16" fill="${G.w}" ${S}/><circle cx="20" cy="20" r="16" fill="none" stroke="${G.md}" stroke-width="3"/>
    <circle cx="20" cy="20" r="5" fill="${G.m}" ${S}/>${[0, 90, 180, 270].map(a => `<circle cx="${20 + 11 * Math.cos(a * Math.PI / 180)}" cy="${20 + 11 * Math.sin(a * Math.PI / 180)}" r="1.2" fill="#ccc"/>`).join('')}`,
  tower: () => `<path d="M4 4 H36 V38 Q36 52 20 58 Q4 52 4 38 Z" fill="${G.md}" ${S}/><path d="M7 7 H33 V37 Q33 49 20 54 Q7 49 7 37 Z" fill="#3a1410" stroke="#000"/>
    <path d="M20 10 V50 M11 24 H29" stroke="${G.g}" stroke-width="3"/>`,
  amulet: (g) => `<path d="M3 2 L10 12 L17 2" stroke="${G.g}" stroke-width="1.3" fill="none"/><path d="M10 9 L15 14 L10 19 L5 14 Z" fill="${G.g}" stroke="#000" stroke-width=".7"/>
    <circle cx="10" cy="14" r="2.6" fill="${GEM[g]}" stroke="#000" stroke-width=".5"/><circle cx="9.2" cy="13.2" r=".8" fill="#fff" opacity=".6"/>`,
  ring: (g) => `<circle cx="10" cy="12" r="5.5" fill="none" stroke="#000" stroke-width="3.6"/><circle cx="10" cy="12" r="5.5" fill="none" stroke="${G.g}" stroke-width="2.2"/>
    <circle cx="10" cy="5.5" r="2.8" fill="${GEM[g]}" stroke="#000" stroke-width=".6"/><circle cx="9.3" cy="4.8" r=".8" fill="#fff" opacity=".6"/>`,
};

// Gemalte Item-Bilder (assets/items/<art>.webp). Fehlt eins, wird das SVG gezeichnet.
const PAINTED = new Set(['cap', 'helm', 'mask', 'leather', 'mail', 'plate', 'gloves', 'gauntlets', 'boots', 'greaves', 'sash', 'belt', 'buckler', 'tower', 'amulet', 'ring']);
export function itemArt(it) {
  if (PAINTED.has(it.art)) return `<img class="iart" src="assets/items/${it.art}.webp" alt="" draggable="false">`;
  const w = (it.w || 1) * 20, h = (it.h || 1) * 20, f = ART[it.art] || ART.ring;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">${f(it.rarity)}</svg>`;
}

// Schmucklose Platzhalter-Silhouetten für leere Ausrüstungsplätze
export const SLOT_ART = { helm: 'helm', chest: 'plate', gloves: 'gauntlets', boots: 'greaves', belt: 'belt', amulet: 'amulet', ring1: 'ring', ring2: 'ring', weapon: 'sword', offhand: 'tower' };
export const SLOT_SIZE = { helm: [2, 2], chest: [2, 3], gloves: [2, 2], boots: [2, 2], belt: [2, 1], amulet: [1, 1], ring1: [1, 1], ring2: [1, 1], weapon: [2, 4], offhand: [2, 3] };
export const ghost = slot => { const [w, h] = SLOT_SIZE[slot]; return itemArt({ art: SLOT_ART[slot], w: slot === 'weapon' ? 1 : w, h: slot === 'weapon' ? 3 : h, rarity: 'normal' }); };

// Händler-Silhouetten (bis echte Portraits da sind)
export const NPC_ART = {
  smith: `<path d="M50 14c-12 0-20 9-20 21 0 7 3 13 8 16-14 4-26 14-28 40h80c-2-26-14-36-28-40 5-3 8-9 8-16 0-12-8-21-20-21z" fill="#1d1612"/>
    <path d="M36 40 q14 14 28 0 v8 q-14 14 -28 0z" fill="#2c211a"/><rect x="64" y="58" width="22" height="8" fill="#3a3a3a"/><rect x="72" y="58" width="5" height="30" fill="#2a1d12"/>`,
  crone: `<path d="M50 8 L74 46 Q80 70 88 92 H12 Q20 70 26 46 Z" fill="#1a1612"/><path d="M50 30c-9 0-14 8-14 16 0 9 6 16 14 16s14-7 14-16c0-8-5-16-14-16z" fill="#000"/>
    <circle cx="45" cy="45" r="1.6" fill="#7aa05a"/><circle cx="55" cy="45" r="1.6" fill="#7aa05a"/><path d="M30 70 q-10 6 -6 20" stroke="#3a2a1c" stroke-width="3" fill="none"/>`,
  digger: `<path d="M48 18c-11 0-18 8-18 19 0 6 2 11 6 14-12 5-22 15-24 41h74c-2-26-12-36-24-41 4-3 6-8 6-14 0-11-7-19-20-19z" fill="#18130f"/>
    <path d="M28 22 h40 l-6 -8 h-28z" fill="#0f0c09"/><path d="M80 10 L76 92" stroke="#2a1d12" stroke-width="4"/><path d="M70 4 h20 l-4 12 h-12z" fill="#3a3a3a"/>`,
};

// Monster-Silhouetten (viewBox 100×100)
export const MON = {
  skull: '<path d="M50 12c-22 0-34 15-34 33 0 12 6 20 12 24v14h44V69c6-4 12-12 12-24 0-18-12-33-34-33z" fill="#2b241c"/><path d="M33 44a8 9 0 1016 0 8 9 0 10-16 0zM51 44a8 9 0 1016 0 8 9 0 10-16 0zM46 60l4-8 4 8z" fill="#000"/><path d="M36 74v9M44 74v9M52 74v9M60 74v9" stroke="#000" stroke-width="2"/>',
  horn: '<path d="M18 10c4 18 10 26 20 28M82 10c-4 18-10 26-20 28" stroke="#3a2a1c" stroke-width="7" fill="none"/><path d="M50 26c-17 0-27 13-27 30 0 18 12 34 27 34s27-16 27-34c0-17-10-30-27-30z" fill="#2b1a14"/><path d="M34 52l12 4-10 3zM66 52l-12 4 10 3z" fill="#b3271a"/><path d="M40 74q10 6 20 0" stroke="#000" stroke-width="3" fill="none"/>',
  hood: '<path d="M50 8C26 8 16 34 14 92h72C84 34 74 8 50 8z" fill="#221b15"/><path d="M50 30c-12 0-18 12-18 26 0 10 8 20 18 20s18-10 18-20c0-14-6-26-18-26z" fill="#000"/><circle cx="43" cy="52" r="2.5" fill="#c46a1e"/><circle cx="57" cy="52" r="2.5" fill="#c46a1e"/>',
  ghoul: '<path d="M50 14c-18 0-28 14-28 30 0 10 4 16 6 22l-4 24h52l-4-24c2-6 6-12 6-22 0-16-10-30-28-30z" fill="#2a2a1c"/><path d="M36 42l10 4-10 3zM64 42l-10 4 10 3z" fill="#9a9a3a"/><path d="M38 66h24l-4 8h-16z" fill="#000"/><path d="M41 66v5M47 66v6M53 66v6M59 66v5" stroke="#6a624a" stroke-width="2"/>',
  rat: '<path d="M14 70c4-24 22-40 44-40 14 0 24 8 28 20l8 6-8 4c-4 10-14 14-28 14H14z" fill="#2a221b"/><circle cx="72" cy="50" r="3" fill="#b3271a"/><path d="M50 32c-2-10 4-16 10-12" stroke="#2a221b" stroke-width="6" fill="none"/><path d="M14 70c-8 4-10 12-2 16" stroke="#3a2a22" stroke-width="3" fill="none"/>',
  imp: '<path d="M30 20l8 18M70 20l-8 18" stroke="#3a1d14" stroke-width="5"/><path d="M50 32c-14 0-22 10-22 24 0 16 10 30 22 30s22-14 22-30c0-14-8-24-22-24z" fill="#3a1d14"/><circle cx="42" cy="54" r="3.5" fill="#ffb02e"/><circle cx="58" cy="54" r="3.5" fill="#ffb02e"/><path d="M42 72l4-4 4 4 4-4 4 4" stroke="#000" stroke-width="2" fill="none"/>',
};
