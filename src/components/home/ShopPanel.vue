<template>
  <div class="shop">
    <div class="row" v-for="w in list" :key="w.id">
      <div class="left">
        <img :src="icons[w.id]" :alt="$t(w.nameKey)" />
        <div class="info">
          <div class="name">{{ $t(w.nameKey) }}</div>
          <div class="desc">{{ $t(w.descKey) }}</div>
        </div>
      </div>
      <div class="right">
        <span v-if="isOwned(w.id)" class="owned">{{ $t('home.owned') }}</span>
        <button v-else @click="buy(w.id)">
          {{ $t('home.buy') }} {{ prices.weapon[w.id] }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import cfg from '@/game/config/weapons.config.js'
import * as WIcons from '@/assets/icons/weapons.js'
export default {
  name:'ShopPanel',
  props:{ gold:Number, prices:Object, inventory:Object },
  emits:['buy'],
  data(){ return {
    list:[cfg.mg, cfg.rocket, cfg.laser],
    icons:{ mg:WIcons.ICON_MG, rocket:WIcons.ICON_ROCKET, laser:WIcons.ICON_LASER }
  }},
  methods:{
    isOwned(id){ return !!(this.inventory?.weapons?.[id]?.owned); },
    buy(id){
      const price = this.prices.weapon[id] || 0;
      this.$emit('buy', { weaponId:id, price });
    }
  }
}
</script>

<style scoped>
.shop .row{ display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid #1c2736; }
.left{ display:flex; gap:10px; align-items:center; }
.left img{ width:44px; height:44px; }
.info .name{ font-weight:700; }
.info .desc{ font-size:12px; opacity:.8; }
.right button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
.owned{ opacity:.8; }
</style>
