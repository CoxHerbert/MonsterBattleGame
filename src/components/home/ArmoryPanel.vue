<template>
  <div class="armory">
    <div class="card" v-for="w in list" :key="w.id">
      <img :src="skinIcon(w.id, equippedSkinOf(w.id))" :alt="$t(w.nameKey)" />
      <div class="meta">
        <div class="row1">
          <div class="name">{{ $t(w.nameKey) }}</div>
          <span class="rarity" :data-r="rarityOf(w.id)">{{ rarityOf(w.id) }}</span>
        </div>
        <div class="desc">{{ $t(w.descKey) }}</div>
        <div class="lv" v-if="isOwned(w.id)">
          {{ $t('home.level') }} {{ levelOf(w.id) }} / {{ maxLvOf(w.id) }}
        </div>
        <div class="lv" v-else>{{ $t('home.notOwned') }}</div>

        <!-- 皮肤装配 -->
        <div class="skins" v-if="isOwned(w.id)">
          <button v-for="sid in w.skins" :key="sid"
                  :class="{ on: equippedSkinOf(w.id)===sid }"
                  :disabled="!hasSkin(w.id, sid)"
                  @click="$emit('equip-skin', { weaponId:w.id, skinId:sid })">
            <img :src="skinIcon(w.id, sid)" :alt="sid" />
          </button>
        </div>
      </div>

      <div class="ops">
        <button v-if="isOwned(w.id)" @click="$emit('equip', { weaponId:w.id })" :disabled="equipped===w.id">
          {{ equipped===w.id ? $t('home.owned') : $t('home.equip') }}
        </button>

        <!-- 升级一层 -->
        <button v-if="isOwned(w.id) && levelOf(w.id)<maxLvOf(w.id)" @click="$emit('upgrade', { weaponId:w.id })">
          {{ $t('home.upgrade') }} +1 ({{ cost1(w.id) }})
        </button>

        <!-- 批量升级 -->
        <button v-if="isOwned(w.id) && levelOf(w.id)<maxLvOf(w.id)" @click="$emit('upgrade-bulk', { weaponId:w.id, count:5 })">
          {{ $t('home.upgradeX5') }} ({{ cost5(w.id) }})
        </button>

        <!-- 回收 -->
        <button v-if="isOwned(w.id) && w.id!=='mg'" class="danger" @click="$emit('sell', { weaponId:w.id })">
          {{ $t('home.sell') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import cfg from '@/game/config/weapons.config.js'
import econ from '@/game/config/economy.config.js'
import * as Skins from '@/assets/icons/skins.js'
export default {
  name:'ArmoryPanel',
  props:{ inventory:Object, gold:Number, weaponPrices:Object, equipped:String },
  emits:['upgrade','upgrade-bulk','equip','unequip','sell','equip-skin'],
  data(){ return { list:[cfg.mg, cfg.rocket, cfg.laser] } },
  methods:{
    isOwned(id){ return !!(this.inventory?.weapons?.[id]?.owned); },
    levelOf(id){ return this.inventory?.weapons?.[id]?.level || 0; },
    rarityOf(id){ return this.inventory?.weapons?.[id]?.rarity || cfg[id].rarity || 'common'; },
    maxLvOf(id){ return econ.rarity[this.rarityOf(id)]?.maxLv || 5; },
    hasSkin(id, sid){ return !!(this.inventory?.weapons?.[id]?.skins?.owned?.includes(sid)); },
    equippedSkinOf(id){ return this.inventory?.weapons?.[id]?.skins?.equipped || 'default'; },
    cost1(id){
      const lv = this.levelOf(id);
      const mul = econ.rarity[this.rarityOf(id)]?.upgradeMul || 1;
      return Math.floor(econ.prices.weaponUpgradeBase * Math.pow(econ.prices.weaponUpgradeGrowth, lv) * mul);
    },
    cost5(id){
      let lv = this.levelOf(id), sum=0, max=this.maxLvOf(id);
      for (let i=0;i<5 && lv<max;i++,lv++){
        sum += Math.floor(this.cost1WithLv(id, lv) * econ.prices.upgradeBulkDiscount);
      }
      return sum;
    },
    cost1WithLv(id, lv){
      const mul = econ.rarity[this.rarityOf(id)]?.upgradeMul || 1;
      return Math.floor(econ.prices.weaponUpgradeBase * Math.pow(econ.prices.weaponUpgradeGrowth, lv) * mul);
    },
    skinIcon(wid, sid){
      const key = `SKIN_${wid.toUpperCase()}_${sid}`;
      return Skins[key];
    }
  }
}
</script>

<style scoped>
.armory{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.card{ display:flex; gap:10px; align-items:flex-start; background:#141c26; border:1px solid #1d2836; border-radius:10px; padding:10px; }
.card > img{ width:56px; height:56px; }
.meta{ flex:1; }
.row1{ display:flex; align-items:center; gap:8px; }
.rarity{ font-size:12px; padding:2px 6px; border-radius:8px; border:1px solid #2a3a52; text-transform:capitalize; }
.rarity[data-r="rare"]{ border-color:#60a5fa; color:#93c5fd; }
.rarity[data-r="epic"]{ border-color:#a78bfa; color:#c4b5fd; }
.rarity[data-r="legendary"]{ border-color:#f59e0b; color:#fde68a; }
.desc{ font-size:12px; opacity:.85; }
.lv{ margin-top:6px; font-size:12px; opacity:.9; }
.skins{ display:flex; gap:6px; margin-top:8px; }
.skins button{ background:#1a2431; border:1px solid #213146; border-radius:8px; padding:4px; }
.skins button.on{ outline:2px solid #3b82f6; }
.skins img{ width:36px; height:36px; }
.ops{ display:flex; flex-direction:column; gap:6px; }
.ops button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
.ops .danger{ background:#7f1d1d; }
</style>
