<template>
  <div class="tree">
    <div v-for="t in data" :key="t.id" class="branch">
      <h4>{{ $t(`talent.${t.id}`) }}</h4>
      <div class="nodes">
        <button v-for="n in t.nodes" :key="n.id" class="node" @click="upgrade(t.id, n)">
          <div class="title">{{ $t(`talent.${n.id}`) }}</div>
          <div class="lv">Lv {{ (levels[t.id]?.[n.id]||0) }}/{{ n.maxLv }}</div>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name:'TalentTree',
  props:{ data:Array, levels:Object, gold:Number },
  emits:['upgrade'],
  methods:{
    upgrade(treeId, node){ this.$emit('upgrade', { treeId, nodeId: node.id }) }
  }
}
</script>
<style scoped>
.branch{ margin-bottom:14px; }
.nodes{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.node{ background:#152030; color:#cfe3ff; border:1px solid #213146; border-radius:10px; padding:10px; text-align:left; }
.title{ font-weight:600; }
.lv{ font-size:12px; opacity:.8; }
</style>
