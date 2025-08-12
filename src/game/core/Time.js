export default class Time {
  constructor() {
    this.elapsed = 0;
  }
  update(dt) {
    this.elapsed += dt;
  }
}
