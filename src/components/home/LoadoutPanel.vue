<template>
  <div class="loadout">
    <label>{{ $t('home.loadout') }}</label>
    <select v-model="local.weaponId" @change="emit">
      <option value="mg">Machine Gun</option>
      <option value="rocket">Rocket (if unlocked)</option>
      <option value="laser">Laser (if unlocked)</option>
    </select>
  </div>
</template>
<script>
export default {
  name:'LoadoutPanel', props:{ loadout:Object }, emits:['change'],
  data(){ return { local: { ...this.loadout } } },
  methods:{ emit(){ this.$emit('change', { ...this.local }) } }
}
</script>
<style scoped>
.loadout{ display:flex; align-items:center; gap:8px; }
select{ background:#1a2431; color:#cfe3ff; border:1px solid #213146; border-radius:8px; padding:6px 8px; }
</style>
