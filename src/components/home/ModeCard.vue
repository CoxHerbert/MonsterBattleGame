<template>
  <div class="card" @click="$emit('click')">
    <div class="icon">{{ icon }}</div>
    <div class="title">{{ title }}</div>
    <div class="desc"><slot name="desc">{{ desc }}</slot></div>
  </div>
</template>
<script>
export default { name:'ModeCard', props:{ title:String, icon:String, desc:String } }
</script>
<style scoped>
.card{ background:#121822; border:1px solid #222c3a; border-radius:12px; padding:14px; cursor:pointer; }
.icon{ font-size:28px; }
.title{ font-weight:700; margin-top:6px; }
.desc{ opacity:.8; font-size:12px; margin-top:4px; }
.card:hover{ filter:brightness(1.08); }
</style>
