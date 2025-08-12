export async function loadSprites(state) {
  state.assets = state.assets || {};
  const mk = (src)=> new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>res(img); img.onerror=rej; img.src=src; });
  const en = await import('@/assets/icons/enemies.js');
  const fx = await import('@/assets/icons/enemy_fx.js');
  const imgs = {};
  for (const k of Object.keys(en)){
    imgs[k] = await mk(en[k]);
  }
  state.assets.enemies = imgs;
  state.assets.fx = fx;
  state.assets.ready = true;
}
