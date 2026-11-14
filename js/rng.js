export const rand = Math.random;
export const roll = (a, b) => Math.floor(a + rand() * (b - a + 1));
export const pick = arr => arr[Math.floor(rand() * arr.length)];
export const chance = p => rand() < p;
export const weighted = (arr, key = 'w') => {
  let r = rand() * arr.reduce((s, x) => s + x[key], 0);
  for (const x of arr) if ((r -= x[key]) < 0) return x;
  return arr[arr.length - 1];
};
export const uid = () => Math.random().toString(36).slice(2, 10);
