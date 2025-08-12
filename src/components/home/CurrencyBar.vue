<template>
  <div class="bar">
    <span>🪙 金币: {{ gold }}</span>
    <span>💠 核心: {{ core }}</span>
  </div>
</template>
<script>
export default {
  name:'CurrencyBar',
  props:{
    gold:{ type:Number, default:0 },
    core:{ type:Number, default:0 }
  }
}
</script>
<style scoped>
.bar{ display:flex; gap:12px; align-items:center; }
</style>
