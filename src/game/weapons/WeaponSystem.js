import WEAPONS from '../config/weapons.config.js'
import BulletFactory from './BulletFactory.js'

export default class WeaponSystem {
  constructor({ state, audio }) {
    this.s = state
    this.audio = audio
    this.currentId = 'mg'
    this.levels = { mg:0, rocket:0, laser:0 }
    this.cooldown = 0
    this.bf = new BulletFactory({ state, sfx:{
      shot: ()=> this.s.sfxShot?.(),
      hit: ()=> this.s.sfxHit?.()
    }})
    this._applyWeaponStats()
  }

  switch(id){
    if (!WEAPONS[id]) return
    this.currentId = id
    this._applyWeaponStats()
  }

  upgrade(id){
    this.levels[id] = (this.levels[id]||0)+1
    if (id===this.currentId) this._applyWeaponStats()
  }

  applyLevel(id, lv){
    this.levels[id] = lv
    if (id===this.currentId) this._applyWeaponStats()
  }

  _applyWeaponStats(){
    const def = WEAPONS[this.currentId]
    const lv = this.levels[this.currentId]||0
    const agg = structuredClone(def.stats)
    for (const g of (def.growth||[])){
      if (lv >= g.level){
        for (const [k,v] of Object.entries(g.delta)){
          if (k.endsWith('Mul')) {
            const baseK = k.replace('Mul','')
            agg[baseK] = (agg[baseK]||0) * v
          } else if (k==='splashRadius'){
            agg.splash = agg.splash || {}
            agg.splash.radius = (agg.splash.radius||0) + v
          } else if (k==='tick' && g.delta.clampMin){
            agg.tick = Math.max(g.delta.clampMin, agg.tick + v)
          } else {
            agg[k] = (agg[k]||0) + v
          }
        }
      }
    }
    this.s.weapon = { id:def.id, stats:agg, iconKey:def.icon, bulletIconKey:def.bulletIcon }
    this.cooldown = 0
  }

  update(dt, aimDir, isTriggerHeld){
    const cdr = this.s.player?.cdr || 0
    this.cooldown = Math.max(0, this.cooldown - dt * (1 + cdr))
    if (this.currentId==='laser'){
      if (isTriggerHeld){
        if (this.cooldown<=0){
          this.bf.fireLaser({ dir: aimDir })
          this.cooldown = this.s.weapon.stats.fireInterval
        }
      }
      return
    }
    if (isTriggerHeld && this.cooldown<=0){
      if (this.currentId==='mg') this.bf.fireMG({ dir: aimDir })
      if (this.currentId==='rocket') this.bf.fireRocket({ dir: aimDir })
      this.cooldown = this.s.weapon.stats.fireInterval
    }
  }

  getWeaponIcon(){
    return this._resolveIcon(this.s.weapon?.iconKey)
  }
  getAmmoIcon(){
    return this._resolveIcon(this.s.weapon?.bulletIconKey)
  }
  _resolveIcon(key){
    if (!key) return ''
    return (async ()=>{
      const modW = await import(/* @vite-ignore */'../../assets/icons/weapons.js')
      const modB = await import(/* @vite-ignore */'../../assets/icons/bullets.js')
      return modW[key] || modB[key] || ''
    })()
  }
}
