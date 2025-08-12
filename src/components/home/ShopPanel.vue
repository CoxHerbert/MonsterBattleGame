<template>
  <div class="shop">
    <!-- 武器购买区域（与之前一致） -->
    <div class="row" v-for="w in list" :key="'w-'+w.id">
      <div class="left">
        <img :src="weaponIcons[w.id]" :alt="$t(w.nameKey)" />
        <div class="info">
          <div class="name">{{ $t(w.nameKey) }}</div>
          <div class="desc">{{ $t(w.descKey) }}</div>
        </div>
      </div>
      <div class="right">
        <span v-if="isOwned(w.id)" class="owned">{{ $t('home.owned') }}</span>
        <button v-else @click="buyWeapon(w.id)">
          {{ $t('home.buy') }} {{ prices.weapon[w.id] }}
        </button>
      </div>
    </div>

    <!-- ★ 皮肤购买区域 -->
    <h4 class="secTitle">Skins</h4>
    <div class="row" v-for="w in list" :key="'s-'+w.id">
      <div class="left">
        <div class="info">
          <div class="name">{{ $t(w.nameKey) }}</div>
          <div class="desc">Cosmetics</div>
        </div>
      </div>
      <div class="right skins">
        <button
          v-for="sid in w.skins"
          :key="w.id + '-' + sid"
          :disabled="!isOwned(w.id) || hasSkin(w.id, sid)"
          @click="buySkin(w.id, sid)">
          <img :src="skinIcon(w.id, sid)" :alt="sid" />
          <span v-if="hasSkin(w.id, sid)">{{ $t('home.owned') }}</span>
          <span v-else>{{ prices.skin[w.id][sid] }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import cfg from '@/game/config/weapons.config.js'
import * as WIcons from '@/assets/icons/weapons.js'
import * as Skins from '@/assets/icons/skins.js'
export default {
  name:'ShopPanel',
  props:{ gold:Number, prices:Object, inventory:Object },
  emits:['buy','buy-skin'],
  data(){ return {
    list:[cfg.mg, cfg.rocket, cfg.laser],
    weaponIcons:{ mg:WIcons.ICON_MG, rocket:WIcons.ICON_ROCKET, laser:WIcons.ICON_LASER }
  }},
  methods:{
    isOwned(id){ return !!(this.inventory?.weapons?.[id]?.owned); },
    hasSkin(id, sid){ return !!(this.inventory?.weapons?.[id]?.skins?.owned?.includes(sid)); },
    buyWeapon(id){ const price = this.prices.weapon[id] || 0; this.$emit('buy', { weaponId:id, price }); },
    buySkin(id, sid){ this.$emit('buy-skin', { weaponId:id, skinId:sid }); },
    skinIcon(wid, sid){
      const key = `SKIN_${wid.toUpperCase()}_${sid}`;
      return Skins[key];
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
.right{ display:flex; gap:8px; align-items:center; }
.right button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
.skins button{ display:flex; flex-direction:column; align-items:center; gap:4px; padding:6px; }
.skins img{ width:36px; height:36px; }
.owned{ opacity:.8; }
.secTitle{ margin:12px 0 6px; opacity:.85; }
</style>
