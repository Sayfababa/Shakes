// Würfelquelle: sonst Math.random; seeded() setzt für die Dauer eines Aufrufs einen festen Würfel ein
let src = null;
export const rand = () => (src ? src() : Math.random());
// Gekoppelter Zufall (Siegchance mit/ohne Tränke, Bester Gürtel): gleicher Keim → gleiche Würfel
export function seeded(seed, fn) {
  const old = src; let t = seed | 0;
  src = () => { t = t + 0x6D2B79F5 | 0; let x = Math.imul(t ^ t >>> 15, 1 | t); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  try { return fn(); } finally { src = old; }
}
export const roll = (a, b) => Math.floor(a + rand() * (b - a + 1));
export const pick = arr => arr[Math.floor(rand() * arr.length)];
export const chance = p => rand() < p;
export const weighted = (arr, key = 'w') => {
  let r = rand() * arr.reduce((s, x) => s + x[key], 0);
  for (const x of arr) if ((r -= x[key]) < 0) return x;
  return arr[arr.length - 1];
};
export const uid = () => Math.random().toString(36).slice(2, 10);
