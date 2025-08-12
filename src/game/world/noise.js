export function mulberry32(seed){ return function(){ seed|=0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function seedFrom(cx, cy, worldSeed){
  return ((cx * 73856093) ^ (cy * 19349663) ^ worldSeed) >>> 0;
}

export function valueNoise2D(x, y, rnd){
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = x0 + 1, y1 = y0 + 1;
  const sx = x - x0, sy = y - y0;
  function r(ix, iy){
    const s = ((ix * 374761393) ^ (iy * 668265263)) >>> 0;
    const n = (s ^ (s >>> 13)) * 1274126177 >>> 0;
    return ((n >>> 16) & 0xffff) / 0xffff;
  }
  const n00 = r(x0, y0), n10 = r(x1, y0), n01 = r(x0, y1), n11 = r(x1, y1);
  const ix0 = lerp(n00, n10, smooth(sx));
  const ix1 = lerp(n01, n11, smooth(sx));
  return lerp(ix0, ix1, smooth(sy));
}
function smooth(t){ return t*t*(3 - 2*t); }
function lerp(a,b,t){ return a + (b - a) * t; }
