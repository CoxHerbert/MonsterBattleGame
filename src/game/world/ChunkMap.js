import mapcfg from '../config/map.config.js';
import TerrainGenerator from './TerrainGenerator.js';

export default class ChunkMap {
  constructor({ state }){
    this.s = state;
    this.cs = mapcfg.chunkSize;
    this.cache = new Map();
    this.visible = [];
    this.safeRadius = mapcfg.safeRadius;
    this.gen = new TerrainGenerator(this.s.worldSeed >>> 0);
  }

  setSafeRadius(px){ this.safeRadius = px; }

  clearCache(){
    this.cache.clear();
  }

  getChunk(cx, cy){
    const key = `${cx},${cy}`;
    let ch = this.cache.get(key);
    if (!ch){
      ch = this.gen.generateChunk(cx, cy);
      this.cache.set(key, ch);
    }
    return ch;
  }

  refreshVisibleObstacles(camX, camY, camW, camH){
    const margin = 160;
    const minX = camX - margin, minY = camY - margin;
    const maxX = camX + camW + margin, maxY = camY + camH + margin;
    const minCx = Math.floor(minX / this.cs), maxCx = Math.floor(maxX / this.cs);
    const minCy = Math.floor(minY / this.cs), maxCy = Math.floor(maxY / this.cs);

    const obs = [];
    for (let cy=minCy; cy<=maxCy; cy++){
      for (let cx=minCx; cx<=maxCx; cx++){
        const ch = this.getChunk(cx, cy);
        obs.push(...ch.obstacles);
      }
    }
    this.visible = obs;
    this.s.visibleObstacles = obs;

    const pcx = Math.floor(this.s.player.x / this.cs);
    const pcy = Math.floor(this.s.player.y / this.cs);
    for (const key of this.cache.keys()){
      const [cx, cy] = key.split(',').map(Number);
      if (Math.abs(cx - pcx) > mapcfg.cacheKeepRadius || Math.abs(cy - pcy) > mapcfg.cacheKeepRadius){
        this.cache.delete(key);
      }
    }
  }

  forEachVisibleChunk(camX, camY, camW, camH, fn){
    const minCx = Math.floor(camX / this.cs), maxCx = Math.floor((camX + camW) / this.cs);
    const minCy = Math.floor(camY / this.cs), maxCy = Math.floor((camY + camH) / this.cs);
    for (let cy=minCy; cy<=maxCy; cy++){
      for (let cx=minCx; cx<=maxCx; cx++){
        fn(this.getChunk(cx, cy));
      }
    }
  }
}
