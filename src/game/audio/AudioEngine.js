export default class AudioEngine {
  constructor({ store }) {
    this.store = store;
    this.ctx = null;
  }
  async ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
}
