<template>
  <div class="armory">
    <div class="card" v-for="w in list" :key="w.id">
      <img :src="icons[w.id]" :alt="$t(w.nameKey)" />
      <div class="meta">
        <div class="name">{{ $t(w.nameKey) }}</div>
        <div class="desc">{{ $t(w.descKey) }}</div>
        <div class="lv" v-if="isOwned(w.id)">
          {{ $t('home.level') }} {{ levelOf(w.id) }}
        </div>
        <div class="lv" v-else>{{ $t('home.notOwned') }}</div>
      </div>
      <div class="ops">
        <button v-if="isOwned(w.id)" @click="equip(w.id)" :disabled="equipped===w.id">
          {{ equipped===w.id ? $t('home.owned') : $t('home.equip') }}
        </button>
        <button v-if="isOwned(w.id)" @click="upgrade(w.id)">
          {{ $t('home.upgrade') }} {{ priceUpgrade(levelOf(w.id)) }}
        </button>
        <button v-else disabled>{{ $t('home.buy') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import cfg from '@/game/config/weapons.config.js'
import econ from '@/game/config/economy.config.js'
import * as WIcons from '@/assets/icons/weapons.js'
export default {
  name:'ArmoryPanel',
  props:{ inventory:Object, gold:Number, weaponPrices:Object, equipped:String },
  emits:['upgrade','equip','unequip'],
  data(){ return {
    list:[cfg.mg, cfg.rocket, cfg.laser],
    icons:{ mg:WIcons.ICON_MG, rocket:WIcons.ICON_ROCKET, laser:WIcons.ICON_LASER }
  }},
  methods:{
    isOwned(id){ return !!(this.inventory?.weapons?.[id]?.owned); },
    levelOf(id){ return this.inventory?.weapons?.[id]?.level || 0; },
    equip(id){ this.$emit('equip', { weaponId:id }); },
    upgrade(id){ this.$emit('upgrade', { weaponId:id }); },
    priceUpgrade(lv){
      return Math.floor(econ.prices.weaponUpgradeBase * Math.pow(econ.prices.weaponUpgradeGrowth, lv||0));
    }
  }
}
</script>

<style scoped>
.armory{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.card{ display:flex; gap:10px; align-items:center; background:#141c26; border:1px solid #1d2836; border-radius:10px; padding:10px; }
.card img{ width:48px; height:48px; }
.meta{ flex:1; }
.name{ font-weight:700; }
.desc{ font-size:12px; opacity:.8; }
.lv{ margin-top:4px; font-size:12px; opacity:.9; }
.ops{ display:flex; flex-direction:column; gap:6px; }
.ops button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
</style>
