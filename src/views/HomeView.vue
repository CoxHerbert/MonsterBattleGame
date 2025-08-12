<template>
  <div class="home">
    <header class="topbar">
      <h1>{{ $t('home.title') }}</h1>
      <CurrencyBar :gold="meta.soft" :core="meta.hard" />
    </header>

    <section class="modes">
      <ModeCard :title="$t('home.endless')" icon="♾"
        :desc="$t('home.tipSelectMode')"
        @click="selectMode('ENDLESS')" />
      <ModeCard :title="$t('home.progression')" icon="🗺"
        :desc="$t('home.chapters')"
        @click="selectMode('PROGRESSION')" />
    </section>

    <section class="panels">
      <Tabs v-model="tab" :items="tabs" />
      <div v-if="tab==='chapters'">
        <ChapterGrid :chapters="chapters" :unlocks="meta.unlocks"
                     @pick="onPickChapter" />
      </div>

      <div v-else-if="tab==='talents'">
        <TalentTree :data="trees" :levels="meta.trees"
                    :gold="meta.soft"
                    @upgrade="onUpgradeNode" />
      </div>

      <div v-else-if="tab==='shop'">
        <ShopPanel :prices="prices" :unlocks="meta.unlocks" :gold="meta.soft"
                   @unlock="onUnlock" />
      </div>
    </section>

    <footer class="bottom">
      <LoadoutPanel v-if="mode==='PROGRESSION'" :loadout="loadout" :unlocks="meta.unlocks" @change="loadout=$event" />
      <button class="cta" :disabled="!canStart" @click="startGame">
        {{ $t('btn.play') }}
      </button>
    </footer>
  </div>
</template>

<script>
import CurrencyBar from '@/components/home/CurrencyBar.vue'
import ModeCard from '@/components/home/ModeCard.vue'
import Tabs from '@/components/home/Tabs.vue'
import ChapterGrid from '@/components/home/ChapterGrid.vue'
import TalentTree from '@/components/home/TalentTree.vue'
import ShopPanel from '@/components/home/ShopPanel.vue'
import LoadoutPanel from '@/components/home/LoadoutPanel.vue'

import modes from '@/game/config/modes.config.js'
import metaCfg from '@/game/config/meta.config.js'
import econ from '@/game/config/economy.config.js'
import SaveSystem from '@/game/systems/SaveSystem.js'

const save = new SaveSystem()

export default {
  name: 'HomeView',
  components: { CurrencyBar, ModeCard, Tabs, ChapterGrid, TalentTree, ShopPanel, LoadoutPanel },
  data(){ return {
    mode: null,
    chapterId: null,
    tab: 'chapters',
    tabs: [
      { key:'chapters', label: this.$t('home.chapters') },
      { key:'talents',  label: this.$t('home.talents') },
      { key:'shop',     label: this.$t('home.shop') }
    ],
    meta: save.loadMeta(),
    trees: metaCfg.trees,
    chapters: modes.PROGRESSION.chapters,
    prices: econ.prices,
    loadout: { weaponId: 'mg', perks: [] }
  }},
  computed:{
    canStart(){
      if (!this.mode) return false
      if (this.mode==='PROGRESSION' && !this.chapterId) return false
      return true
    }
  },
  methods:{
    selectMode(m){
      this.mode = m
      if (m==='PROGRESSION') this.tab='chapters'
    },
    onPickChapter(ch){ this.chapterId = ch.id },
    onUpgradeNode({ treeId, nodeId }){
      const tree = metaCfg.trees.find(t=>t.id===treeId)
      const node = tree.nodes.find(n=>n.id===nodeId)
      const lv = (this.meta.trees[treeId]?.[nodeId] || 0)
      if (lv >= node.maxLv) return
      const cost = Math.floor((node.costBase || 80) * Math.pow(1.25, lv))
      if (this.meta.soft < cost) return
      this.meta.soft -= cost
      this.meta.trees[treeId] = this.meta.trees[treeId] || {}
      this.meta.trees[treeId][nodeId] = lv + 1
      save.saveMeta(this.meta)
    },
    onUnlock({ type, id, cost }){
      if (this.meta.soft < cost) return
      this.meta.soft -= cost
      this.meta.unlocks[`${type}:${id}`] = true
      save.saveMeta(this.meta)
    },
    startGame(){
      const q = new URLSearchParams()
      q.set('mode', this.mode || 'ENDLESS')
      if (this.mode==='PROGRESSION') q.set('chapterId', this.chapterId)
      q.set('weapon', this.loadout.weaponId)
      this.$router.push({ path: '/game', query: Object.fromEntries(q.entries()) })
    }
  }
}
</script>

<style scoped>
.home{ max-width:1024px; margin:0 auto; padding:16px; color:#e7f4ff; }
.topbar{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.modes{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin:12px 0 16px; }
.panels{ background:#11161d; border:1px solid #1e2835; border-radius:12px; padding:12px; }
.bottom{ display:flex; align-items:center; justify-content:space-between; margin-top:16px; }
.cta{ background:#2563eb; color:#fff; border:0; border-radius:10px; padding:10px 18px; cursor:pointer; }
.cta:disabled{ opacity:.5; cursor:not-allowed; }
</style>
