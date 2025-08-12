import TerrainRenderer from './TerrainRenderer.js';
import EntityRenderer from './EntityRenderer.js';
import MinimapRenderer from './MinimapRenderer.js';

export default class Renderer2D {
  constructor({ canvas, ctx, state, world, t }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.s = state;
    this.terrain = new TerrainRenderer(ctx, world, state);
    this.entities = new EntityRenderer(ctx, state);
    this.minimap = new MinimapRenderer(ctx, state, world);
  }
  drawFrame() {
    // TODO: clear screen and render world & overlays
  }
  resize() {
    // TODO: handle DPR and canvas size
  }
}
