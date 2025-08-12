<template>
  <div class="grid">
    <div v-for="ch in chapters" :key="ch.id" class="cell" @click="$emit('pick', ch)">
      <div class="name">{{ $t(`chap.${ch.id}`) }}</div>
      <div class="meta">{{ ch.minutes }} min</div>
      <div class="badge" v-if="unlocks[`chapter:${ch.id}`]">{{ $t('home.selected') }}</div>
    </div>
  </div>
</template>
<script>
export default { name:'ChapterGrid', props:{ chapters:Array, unlocks:Object } }
</script>
<style scoped>
.grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
.cell{ background:#141c26; border:1px solid #1d2836; border-radius:10px; padding:10px; cursor:pointer; }
.name{ font-weight:700; }
.meta{ font-size:12px; opacity:.8; }
.badge{ margin-top:6px; font-size:12px; opacity:.8; }
</style>
