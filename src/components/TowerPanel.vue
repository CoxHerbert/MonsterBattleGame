<template>
  <div class="tower-panel">
    <div
      v-for="t in towers"
      :key="t.id"
      class="tower-card"
      :class="{ selected: selected === t.id, disabled: !canAfford(t) }"
      @click="select(t)"
    >
      <img :src="icons[t.id]" class="icon" alt="" />
      <div class="name">{{ t.name }}</div>
      <div class="cost">{{ t.cost }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import type { TowerDef } from '../core/data/types'
import arrow from '../assets/sprites/arrow.svg'
import cannon from '../assets/sprites/cannon.svg'
import ice from '../assets/sprites/ice.svg'
import tesla from '../assets/sprites/tesla.svg'

export default {
  name: 'TowerPanel',
  props: {
    towers: { type: Array as () => TowerDef[], required: true },
    gold: { type: Number, required: true },
    selected: { type: String, default: null }
  },
  emits: ['select'],
  data() {
    return {
      icons: { arrow, cannon, ice, tesla } as Record<string, string>
    }
  },
  methods: {
    canAfford(t: TowerDef) {
      return this.gold >= t.cost
    },
    select(t: TowerDef) {
      if (!this.canAfford(t)) return
      const id = this.selected === t.id ? null : t.id
      this.$emit('select', id)
    }
  }
}
</script>

<style scoped>
.tower-panel { display:flex; flex-direction:column; gap:4px; pointer-events:auto; }
.tower-card { padding:6px; border:1px solid #555; background:#222; color:#fff; cursor:pointer; display:flex; align-items:center; gap:4px; }
.tower-card .icon { width:32px; height:32px; }
.tower-card.disabled { opacity:0.4; pointer-events:none; }
.tower-card.selected { border-color:yellow; }
</style>
