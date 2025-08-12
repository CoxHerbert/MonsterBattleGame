import itemsCfg from '../config/items.config.js';

export default class ItemSpawner {
  constructor({ state, chunkMap, bus, audio }){
    this.s = state;
    this.map = chunkMap;
    this.bus = bus;
    this.audio = audio;
    this.runtime = new Map();
  }

  update(dt, nowSec){
    const w = this.s.screenW, h = this.s.screenH;
    const camX = this.s.player.x - w/2, camY = this.s.player.y - h/2;
    this.map.forEachVisibleChunk(camX, camY, w, h, ch => {
      for (const sp of ch.items){
        if (!this.runtime.has(sp.id)){
          this.runtime.set(sp.id, { ...sp });
        }
      }
    });

    for (const it of this.runtime.values()){
      if (!it.ready && it.respawnAt && nowSec >= it.respawnAt){
        it.ready = true; it.respawnAt = undefined;
      }
    }
  }

  tryPickupAt(x, y, radius=20){
    for (const it of this.runtime.values()){
      if (!it.ready) continue;
      const dx = it.x - x, dy = it.y - y;
      if (dx*dx + dy*dy <= radius*radius){
        this._applyPickup(it);
        return true;
      }
    }
    return false;
  }

  queryReadyInRect(rect){
    const list = [];
    for (const it of this.runtime.values()){
      if (!it.ready) continue;
      if (it.x >= rect.x && it.x <= rect.x + rect.w && it.y >= rect.y && it.y <= rect.y + rect.h){
        list.push(it);
      }
    }
    return list;
  }

  _applyPickup(it){
    const ps = this.s.player;
    if (it.kind === 'medkit'){
      ps.hp = Math.min(ps.maxHp, ps.hp + (itemsCfg.kinds.medkit.heal || 40));
    } else if (it.kind === 'weaponCrate'){
      this.bus.emit?.('item:weaponCrate:opened', { x:it.x, y:it.y });
    }
    this.audio?.play?.('pickup');
    const resp = (itemsCfg.kinds[it.kind].respawnSec || 30);
    it.ready = false;
    it.respawnAt = (this.s.timeNow || 0) + resp;
  }
}
