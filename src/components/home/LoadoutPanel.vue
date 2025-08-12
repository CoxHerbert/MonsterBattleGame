<template>
  <div class="loadout">
    <label>开局预设</label>
    <select v-model="local.weaponId" @change="emit">
      <option v-for="w in ownedWeapons" :key="w.id" :value="w.id">
        {{ w.name }}
      </option>
    </select>
  </div>
</template>

<script>
import cfg from '@/game/config/weapons.config.js'
export default {
  name:'LoadoutPanel', props:{ loadout:Object, inventory:Object }, emits:['change'],
  data(){ return { local:{ ...this.loadout } } },
  computed:{
    ownedWeapons(){
      const inv = this.inventory?.weapons || {}
      const list = [cfg.mg, cfg.rocket, cfg.laser]
      return list.filter(w=>inv[w.id]?.owned)
    }
  },
  methods:{ emit(){ this.$emit('change', { ...this.local }) } }
}
</script>

<style scoped>
.loadout{ display:flex; align-items:center; gap:8px; }
select{ background:#1a2431; color:#cfe3ff; border:1px solid #213146; border-radius:8px; padding:6px 8px; }
</style>
