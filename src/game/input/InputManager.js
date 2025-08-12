export default class InputManager {
  constructor({ canvas, bus }) {
    this.canvas = canvas;
    this.bus = bus;
    // TODO: bind listeners and track keyboard/mouse/touch/gamepad
  }
  bind(state) {
    this.state = state;
    // TODO: inject state properties if needed
  }
  update(state, dt) {
    // TODO: compute movement vectors and firing intent
  }
}
