<template>
  <div class="shop">
    <div class="row">
      <div>Rocket</div>
      <button @click="$emit('unlock', { type:'weapon', id:'rocket', cost:500 })">
        {{ $t('btn.unlock') }} 500
      </button>
    </div>
    <div class="row">
      <div>Laser</div>
      <button @click="$emit('unlock', { type:'weapon', id:'laser', cost:800 })">
        {{ $t('btn.unlock') }} 800
      </button>
    </div>
  </div>
</template>
<script>
export default { name:'ShopPanel', props:{ prices:Object, unlocks:Object, gold:Number } }
</script>
<style scoped>
.shop .row{ display:flex; align-items:center; justify-content:space-between; padding:8px; border-bottom:1px solid #1c2736; }
.shop button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
</style>
