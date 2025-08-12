<template>
  <div class="bar">
    <span>🪙 {{ $t('home.currency.gold') }}: {{ gold }}</span>
    <span>💠 {{ $t('home.currency.core') }}: {{ core }}</span>
  </div>
</template>
<script>
export default { name:'CurrencyBar', props:{ gold:Number, core:Number } }
</script>
<style scoped>
.bar{ display:flex; gap:12px; align-items:center; }
</style>
