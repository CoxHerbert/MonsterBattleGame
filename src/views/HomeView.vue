<template>
  <div class="home">
    <header class="topbar">
      <h1>僵尸突围</h1>
      <CurrencyBar :gold="meta.soft" :core="meta.hard" />
    </header>

    <section class="modes">
      <ModeCard title="无尽模式" icon="♾"
        desc="请选择模式开始游戏"
        @click="selectMode('ENDLESS')" />
      <ModeCard title="养成模式" icon="🗺"
        desc="关卡"
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
        <ShopPanel
          :gold="meta.soft"
          :inventory="meta.inventory"
          :prices="prices"
          @buy="onShopBuy"
          @buy-skin="onShopBuySkin" />
      </div>
      <div v-else-if="tab==='armory'">
        <ArmoryPanel
          :inventory="meta.inventory"
          :weaponPrices="prices"
          :gold="meta.soft"
          :equipped="loadout.weaponId"
          @upgrade="onArmoryUpgrade"
          @upgrade-bulk="onArmoryUpgradeBulk"
          @equip="onArmoryEquip"
          @unequip="onArmoryUnequip"
          @sell="onArmorySell"
          @equip-skin="onArmoryEquipSkin" />
      </div>
    </section>

    <footer class="bottom">
      <LoadoutPanel v-if="mode==='PROGRESSION'" :loadout="loadout" :inventory="meta.inventory" @change="loadout=$event" />
      <div class="actions">
        <button class="btn" :disabled="!latestSave" @click="continueLatest">
          {{ $t('home.continue') }}
        </button>
        <button class="btn" @click="openSaves">
          {{ $t('home.openSaves') }}
        </button>
        <button class="btn" @click="openSettings">
          {{ $t('home.openSettings') }}
        </button>
        <button class="btn ghost" @click="confirmReset">
          {{ $t('home.resetDefaults') }}
        </button>
        <button class="cta" :disabled="!canStart" @click="startGame">
          {{ $t('home.startGame') }}
        </button>
      </div>
    </footer>

    <div v-if="settingsOpen" class="modal" @click.self="closeSettings">
      <div class="modal-body">
        <SettingsPanel
          :showRestart="false"
          :allowSave="false"
          @close="closeSettings"
        />
      </div>
    </div>

    <div v-if="savesOpen" class="modal" @click.self="closeSaves">
      <div class="modal-body">
        <SavesPanel
          :saves="saves"
          @continue="continueById"
          @delete="deleteById"
          @clearAll="clearAll"
          @close="closeSaves"
        />
      </div>
    </div>

    <p class="hint">{{ $t('home.tip') }}</p>
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
import ArmoryPanel from '@/components/home/ArmoryPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import SavesPanel from '@/components/SavesPanel.vue'

import modes from '@/game/config/modes.config.js'
import metaCfg from '@/game/config/meta.config.js'
import econ from '@/game/config/economy.config.js'
import wcfg from '@/game/config/weapons.config.js'
import SaveSystem from '@/game/systems/SaveSystem.js'

const save = new SaveSystem()

export default {
  name: 'HomeView',
  components: { CurrencyBar, ModeCard, Tabs, ChapterGrid, TalentTree, ShopPanel, LoadoutPanel, ArmoryPanel, SettingsPanel, SavesPanel },
  data(){ return {
    mode: null,
    chapterId: null,
    tab: 'chapters',
    tabs: [
      { key:'chapters', label:'关卡' },
      { key:'talents',  label:'天赋' },
      { key:'shop',     label:'商店' },
      { key:'armory',   label:'仓库' }
    ],
    meta: save.loadMeta(),
    trees: metaCfg.trees,
    chapters: modes.PROGRESSION.chapters,
    prices: econ.prices,
    loadout: { weaponId: 'mg', perks: [] },
    settingsOpen: false,
    savesOpen: false,
    saves: []
  }},
  computed:{
    canStart(){
      if (!this.mode) return false
      if (this.mode==='PROGRESSION' && !this.chapterId) return false
      return true
    },
    latestSave(){
      if (!this.saves.length) return null
      return this.saves.slice().sort((a,b)=>b.time - a.time)[0]
    }
  },
  mounted(){ this.loadSaves() },
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
    // —— 成本工具 —— //
    weaponCostAt(weaponId, level){
      const rkey = this.meta.inventory.weapons[weaponId]?.rarity || wcfg[weaponId].rarity || 'common';
      const rmul = econ.rarity[rkey]?.upgradeMul || 1;
      return Math.floor(econ.prices.weaponUpgradeBase * Math.pow(econ.prices.weaponUpgradeGrowth, level) * rmul);
    },
    weaponBulkCost(weaponId, count){
      const inv = this.meta.inventory.weapons[weaponId]; if (!inv) return 0;
      const maxLv = (econ.rarity[inv.rarity]?.maxLv) || 5;
      let lv = inv.level, sum = 0;
      for (let i=0;i<count;i++){
        if (lv >= maxLv) break;
        const c = this.weaponCostAt(weaponId, lv);
        sum += Math.floor(c * econ.prices.upgradeBulkDiscount);
        lv++;
      }
      return sum;
    },
    addSpend(weaponId, amount){
      const s = this.meta.spend.weapons; s[weaponId] = (s[weaponId]||0) + amount;
    },

    // —— 商城：买武器/皮肤 —— //
    onShopBuy({ weaponId, price }){
      const inv = this.meta.inventory.weapons;
      if (inv[weaponId]?.owned) return;
      if (this.meta.soft < price) { alert('金币不足'); return; }
      this.meta.soft -= price;
      inv[weaponId] = { owned:true, level:0, rarity: wcfg[weaponId].rarity || 'common', skins:{ owned:['default'], equipped:'default' } };
      this.addSpend(weaponId, price);
      save.saveMeta(this.meta);
    },
    onShopBuySkin({ weaponId, skinId }){
      const price = econ.prices.skin[weaponId]?.[skinId] || 0;
      const inv = this.meta.inventory.weapons[weaponId];
      if (!inv?.owned) return;
      if (inv.skins.owned.includes(skinId)) return;
      if (this.meta.soft < price) { alert('金币不足'); return; }
      this.meta.soft -= price;
      inv.skins.owned.push(skinId);
      save.saveMeta(this.meta);
    },

    // —— 仓库：升级/装备/卸下/批量/回收/皮肤 —— //
    onArmoryUpgrade({ weaponId }){
      const inv = this.meta.inventory.weapons[weaponId]; if (!inv?.owned) return;
      const maxLv = (econ.rarity[inv.rarity]?.maxLv) || 5;
      if (inv.level >= maxLv) return;
      const cost = this.weaponCostAt(weaponId, inv.level);
      if (this.meta.soft < cost) { alert('金币不足'); return; }
      this.meta.soft -= cost; inv.level += 1; this.addSpend(weaponId, cost);
      save.saveMeta(this.meta);
    },
    onArmoryUpgradeBulk({ weaponId, count }){
      const inv = this.meta.inventory.weapons[weaponId]; if (!inv?.owned) return;
      const cost = this.weaponBulkCost(weaponId, count);
      if (cost<=0) return;
      if (this.meta.soft < cost) { alert('金币不足'); return; }
      const maxLv = (econ.rarity[inv.rarity]?.maxLv) || 5;
      let up = 0, lv = inv.level;
      for (; up<count && lv<maxLv; up++, lv++);
      this.meta.soft -= cost; inv.level += up; this.addSpend(weaponId, cost);
      save.saveMeta(this.meta);
    },
    onArmoryEquip({ weaponId }){ this.loadout.weaponId = weaponId; save.saveMeta(this.meta); },
    onArmoryUnequip(){ this.loadout.weaponId = 'mg'; save.saveMeta(this.meta); },
    onArmorySell({ weaponId }){
      if (weaponId==='mg') return;
      const inv = this.meta.inventory.weapons[weaponId]; if (!inv?.owned) return;
      const spent = this.meta.spend.weapons[weaponId] || 0;
      const refund = Math.floor(spent * econ.sellbackRate);
      delete this.meta.inventory.weapons[weaponId];
      delete this.meta.spend.weapons[weaponId];
      if (this.loadout.weaponId === weaponId) this.loadout.weaponId = 'mg';
      this.meta.soft += refund;
      save.saveMeta(this.meta);
    },
    openSettings(){ this.settingsOpen = true; },
    closeSettings(){ this.settingsOpen = false; },
    confirmReset(){
      const ok = window.confirm(this.$t('home.resetConfirm'))
      if (ok) this.$store.commit('resetSettings')
    },
    // —— 存档 —— //
    openSaves(){ this.savesOpen = true },
    closeSaves(){ this.savesOpen = false },
    loadSaves(){
      try{
        const arr = JSON.parse(localStorage.getItem('saves') || '[]')
        this.saves = Array.isArray(arr) ? arr.sort((a,b)=>b.time - a.time) : []
      }catch(e){ this.saves = [] }
    },
    continueLatest(){
      if (!this.latestSave) return
      this.$router.push({ name:'game', query:{ save:String(this.latestSave.id) } })
    },
    continueById(id){
      this.$router.push({ name:'game', query:{ save:String(id) } })
    },
    deleteById(id){
      const ok = window.confirm(this.$t('saves.deleteConfirm'))
      if (!ok) return
      const arr = this.saves.filter(s => String(s.id) !== String(id))
      this.saves = arr
      localStorage.setItem('saves', JSON.stringify(arr))
    },
    clearAll(){
      const ok = window.confirm(this.$t('saves.clearConfirm'))
      if (!ok) return
      this.saves = []
      localStorage.setItem('saves', '[]')
    },
    onArmoryEquipSkin({ weaponId, skinId }){
      const inv = this.meta.inventory.weapons[weaponId]; if (!inv?.owned) return;
      if (!inv.skins.owned.includes(skinId)) return;
      inv.skins.equipped = skinId;
      save.saveMeta(this.meta);
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
.actions{ display:flex; align-items:center; gap:8px; }
.btn{ background:#1f2937; color:#e5e7eb; border:0; border-radius:10px; padding:8px 12px; cursor:pointer; }
.btn.ghost{ background:transparent; border:1px solid #2a3346; }
.btn:disabled{ opacity:.5; cursor:not-allowed; }
.cta{ background:#2563eb; color:#fff; border:0; border-radius:10px; padding:10px 18px; cursor:pointer; }
.cta:disabled{ opacity:.5; cursor:not-allowed; }
.modal{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:50; }
.modal-body{ background:#0f1320; border:1px solid #2a3346; border-radius:12px; padding:14px; width:min(820px, 94vw); }
.hint{ opacity:.7; margin-top:8px; font-size:14px; text-align:center; }
</style>
