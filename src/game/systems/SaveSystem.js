const LS_META = 'meta-save-v1';

export default class SaveSystem {
  loadMeta(){
    const def = {
      soft: 0, hard: 0,
      unlocks: {}, trees: {}, stats: {},
      spend: { weapons:{} },                    // ★ 记录每把武器累计花费（用于回收）
      inventory: {
        weapons: {
          mg: { owned:true, level:0, rarity:'common', skins:{ owned:['default'], equipped:'default' } }
        }
      }
    };
    let meta;
    try { meta = JSON.parse(localStorage.getItem(LS_META)) || def; } catch { meta = def; }
    meta.spend ||= { weapons:{} };
    meta.inventory ||= { weapons:{} };
    const w = meta.inventory.weapons;
    if (!w.mg) w.mg = { owned:true, level:0, rarity:'common', skins:{ owned:['default'], equipped:'default' } };
    for (const id of Object.keys(w)){
      const it = w[id];
      if (!it.skins) it.skins = { owned:['default'], equipped:'default' };
      if (!it.skins.owned?.length) it.skins.owned = ['default'];
      if (!it.skins.equipped) it.skins.equipped = 'default';
      if (!it.rarity) it.rarity = 'common';
      if (typeof it.level!== 'number') it.level = 0;
    }
    return meta;
  }
  saveMeta(meta){ localStorage.setItem(LS_META, JSON.stringify(meta)); }
}
