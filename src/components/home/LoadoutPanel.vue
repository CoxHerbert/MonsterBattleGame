<template>
  <div class="loadout">
    <label>{{ $t('home.loadout') }}</label>
    <div class="weapons">
      <button
        v-for="w in list" :key="w.id"
        :title="$t(w.descKey)"
        :class="{ on: local.weaponId===w.id, locked: !isUnlocked(w.id) }"
        @click="select(w.id)"
      >
        <img :alt="$t(w.nameKey)" :src="icons[w.id]" />
        <div class="name">{{ $t(w.nameKey) }}</div>
      </button>
    </div>
  </div>
</template>

<script>
import cfg from '@/game/config/weapons.config.js'
import * as WIcons from '@/assets/icons/weapons.js'

export default {
  name:'LoadoutPanel', emits:['change'],
  props:{ loadout:Object, unlocks:Object },
  data(){ return {
    local: { ...this.loadout },
    list: [ cfg.mg, cfg.rocket, cfg.laser ],
    icons: { mg: WIcons.ICON_MG, rocket: WIcons.ICON_ROCKET, laser: WIcons.ICON_LASER }
  }},
  methods:{
    isUnlocked(id){
      if (id==='mg') return true;
      return !!(this.unlocks && this.unlocks[`weapon:${id}`]);
    },
    select(id){
      if (!this.isUnlocked(id)) return;
      this.local.weaponId = id;
      this.$emit('change', { ...this.local });
    }
  }
}
</script>

<style scoped>
.loadout{ display:flex; align-items:flex-start; gap:12px; }
.weapons{ display:flex; gap:8px; }
.weapons button{
  width:120px; background:#1a2431; border:1px solid #213146; border-radius:10px; padding:8px; color:#cfe3ff; cursor:pointer;
}
.weapons button.on{ outline:2px solid #3b82f6; }
.weapons button.locked{ opacity:.5; cursor:not-allowed; }
.weapons img{ width:48px; height:48px; display:block; margin:0 auto 6px; }
.name{ text-align:center; font-size:12px; }
</style>
