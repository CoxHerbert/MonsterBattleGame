<template>
  <div class="tabs">
    <button v-for="it in items" :key="it.key"
      :class="{ on: modelValue===it.key }"
      @click="$emit('update:modelValue', it.key)">
      {{ it.label }}
    </button>
  </div>
</template>
<script>
export default { name:'Tabs', props:{ modelValue:String, items:Array } }
</script>
<style scoped>
.tabs{ display:flex; gap:8px; margin-bottom:10px; }
.tabs button{ background:#1a2431; color:#cfe3ff; border:0; padding:6px 10px; border-radius:10px; }
.tabs button.on{ background:#25405f; }
</style>
