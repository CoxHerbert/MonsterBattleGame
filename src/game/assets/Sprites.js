export async function loadSprites(state) {
  // TODO: load built-in SVG or external PNGs
  state.assets = state.assets || {};
  state.assets.ready = true;
}
