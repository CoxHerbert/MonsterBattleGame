export default class Loop {
  constructor(onUpdate, onDraw) {
    this.onUpdate = onUpdate;
    this.onDraw = onDraw;
    this.last = 0;
    this.req = 0;
  }
  start = () => {
    this.last = performance.now();
    this.tick(this.last);
  };
  stop = () => cancelAnimationFrame(this.req);
  tick = (t) => {
    const dt = Math.min(0.033, (t - this.last) / 1000 || 0);
    this.last = t;
    this.onUpdate(dt);
    this.onDraw();
    this.req = requestAnimationFrame(this.tick);
  };
}
