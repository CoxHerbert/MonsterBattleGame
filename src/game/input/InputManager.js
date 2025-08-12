export default class InputManager {
  constructor({ canvas, bus }) {
    this.canvas = canvas;
    this.bus = bus;
    this.keys = new Set();
    this.fireIntent = false;
    window.addEventListener('keydown', e => {
      this.keys.add(e.key);
      if (e.key === ' ') this.fireIntent = true;
    });
    window.addEventListener('keyup', e => {
      this.keys.delete(e.key);
      if (e.key === ' ') this.fireIntent = false;
    });
  }
  bind(state) { this.state = state; }
  update(state, dt) {
    // TODO: compute movement vectors and firing intent
  }
  keyPressed(k){ return this.keys.has(k); }
}
