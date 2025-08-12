import { mulberry32, seedFrom } from '../core/RNG.js';
export default class ChunkMap {
  constructor({ bus, chunkSize = 512 }) {
    this.bus = bus;
    this.cs = chunkSize;
    this.cache = new Map();
    this.visible = [];
  }
  getChunk(cx, cy, worldSeed) {
    // TODO: implement obstacle/decor generation using RNG
    const key = `${cx},${cy}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, { obstacles: [], decor: [] });
    }
    return this.cache.get(key);
  }
  refreshVisibleObstacles(state) {
    // TODO: sample chunks around camera and populate this.visible
    state.visibleObstacles = this.visible;
  }
}
