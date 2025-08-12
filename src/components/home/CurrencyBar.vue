<template>
  <div class="bar">
    <span>🪙 {{ $t('home.currency.gold') }}: {{ gold }}</span>
    <span>💠 {{ $t('home.currency.core') }}: {{ core }}</span>
    <button @click="$emit('switchLang')">{{ $i18n.locale.value.toUpperCase() }}</button>
  </div>
</template>
<script>
export default { name:'CurrencyBar', props:{ gold:Number, core:Number } }
</script>
<style scoped>
.bar{ display:flex; gap:12px; align-items:center; }
.bar button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
</style>
