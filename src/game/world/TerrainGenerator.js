import mapcfg from '../config/map.config.js';
import itemsCfg from '../config/items.config.js';
import { mulberry32, seedFrom, valueNoise2D } from './noise.js';

export default class TerrainGenerator {
  constructor(worldSeed){ this.worldSeed = worldSeed >>> 0; }

  generateChunk(cx, cy){
    const cs = mapcfg.chunkSize;
    const baseX = cx * cs, baseY = cy * cs;
    const seed = seedFrom(cx, cy, this.worldSeed);
    const rnd = mulberry32(seed);

    const chunk = {
      cx, cy, baseX, baseY,
      tileTint: Math.floor( mapRange(rnd(), 0,1, mapcfg.tileTint[0], mapcfg.tileTint[1] ) ),
      obstacles: [],
      rivers: [],
      grass: [],
      items: []
    };

    this._genObstacles(chunk, rnd);
    this._genWalls(chunk, rnd);
    if (mapcfg.rivers.enable) this._genRivers(chunk, rnd);
    this._genGrass(chunk, rnd);
    this._genItems(chunk, rnd);

    return chunk;
  }

  _genObstacles(ch, rnd){
    const n = randIntRange(rnd, ...mapcfg.obstacle.perChunkRange);
    for (let i=0;i<n;i++){
      const horiz = rnd()<0.5;
      const len = randRange(rnd, ...mapcfg.obstacle.rectSize);
      const thick = randRange(rnd, ...mapcfg.obstacle.thickness);
      const w = horiz ? len : thick, h = horiz ? thick : len;
      const x = ch.baseX + 40 + Math.floor(rnd() * (mapcfg.chunkSize - 80)) - w/2;
      const y = ch.baseY + 40 + Math.floor(rnd() * (mapcfg.chunkSize - 80)) - h/2;
      ch.obstacles.push({ x, y, w, h, r: mapcfg.obstacle.cornerRadius, kind:'obstacle' });
    }
  }

  _genWalls(ch, rnd){
    const n = randIntRange(rnd, ...mapcfg.walls.perChunkRange);
    for (let i=0;i<n;i++){
      const horiz = rnd()<0.5;
      const len = randRange(rnd, ...mapcfg.walls.length);
      const thick = randRange(rnd, ...mapcfg.walls.thickness);
      const w = horiz ? len : thick, h = horiz ? thick : len;
      const x = ch.baseX + 20 + Math.floor(rnd() * (mapcfg.chunkSize - 40)) - w/2;
      const y = ch.baseY + 20 + Math.floor(rnd() * (mapcfg.chunkSize - 40)) - h/2;
      ch.obstacles.push({ x, y, w, h, r: 4, kind:'wall' });
    }
  }

  _genRivers(ch, rnd){
    const freq = mapcfg.rivers.meander;
    const width = randRange(rnd, ...mapcfg.rivers.width);
    const vertical = rnd()<0.5;
    const path = [];
    const steps = 16;
    for (let i=0;i<=steps;i++){
      const t = i/steps;
      const sx = vertical ? (ch.cx + t) : (ch.cx + valueNoise2D(ch.cx + t, ch.cy, rnd)*0.2);
      const sy = vertical ? (ch.cy + valueNoise2D(ch.cx, ch.cy + t, rnd)*0.2) : (ch.cy + t);
      const wx = sx * mapcfg.chunkSize;
      const wy = sy * mapcfg.chunkSize;
      const v = valueNoise2D(sx*freq*mapcfg.chunkSize, sy*freq*mapcfg.chunkSize, rnd);
      if (v < mapcfg.rivers.threshold) path.push({ x: wx, y: wy });
    }
    if (path.length >= 2) ch.rivers.push({ path, width });
  }

  _genGrass(ch, rnd){
    const n = randIntRange(rnd, ...mapcfg.grass.perChunkRange);
    for (let i=0;i<n;i++){
      const r = randRange(rnd, ...mapcfg.grass.radius);
      const x = ch.baseX + Math.floor(rnd()*mapcfg.chunkSize);
      const y = ch.baseY + Math.floor(rnd()*mapcfg.chunkSize);
      const hue = mapcfg.grass.baseColor[0] + Math.floor(rnd()*30 - 15);
      const sat = mapcfg.grass.baseColor[1];
      const light = mapcfg.grass.baseColor[2] + Math.floor(rnd()*10 - 5);
      const color = `hsl(${hue} ${sat}% ${light}% / ${mapcfg.grass.alpha})`;
      ch.grass.push({ x, y, r, color });
    }
  }

  _genItems(ch, rnd){
    for (const [kind, range] of Object.entries(itemsCfg.perChunk)){
      const n = randIntRange(rnd, ...range);
      for (let i=0;i<n;i++){
        let x=0, y=0, safe=0;
        do{
          x = ch.baseX + 30 + Math.floor(rnd()*(mapcfg.chunkSize - 60));
          y = ch.baseY + 30 + Math.floor(rnd()*(mapcfg.chunkSize - 60));
          safe++;
        } while (hitsObstacle({x,y}, ch.obstacles, itemsCfg.avoidObstacleMargin) && safe<16);
        const id = `${ch.cx},${ch.cy}#${kind}${i}`;
        ch.items.push({ id, kind, x, y, ready: true });
      }
    }
  }
}

function randRange(rnd, a,b){ return a + rnd()*(b-a); }
function randIntRange(rnd, a,b){ return Math.floor(randRange(rnd, a, b+1)); }
function hitsObstacle(pt, obs, margin){
  for (const o of obs){
    if (pt.x >= o.x - margin && pt.x <= o.x + o.w + margin &&
        pt.y >= o.y - margin && pt.y <= o.y + o.h + margin) return true;
  }
  return false;
}
function mapRange(t, a,b, A,B){ return A + (t-a)*(B-A)/(b-a); }
