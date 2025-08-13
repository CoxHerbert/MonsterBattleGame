<template>
  <div class="home">
    <h1 class="title">Top-Down Shooter</h1>

    <!-- ★ 开局选择器 -->
    <div class="selectors">
      <div class="sel">
        <label>{{ $t('home.mode') }}</label>
        <select :value="mode" @change="setMode($event.target.value)">
          <option value="endless">{{ $t('saves.mode.endless') }}</option>
          <option value="growth">{{ $t('saves.mode.growth') }}</option>
        </select>
      </div>
      <div class="sel">
        <label>{{ $t('home.difficulty') }}</label>
        <select :value="difficulty" @change="setDifficulty($event.target.value)">
          <option value="easy">{{ $t('saves.difficulty.easy') }}</option>
          <option value="normal">{{ $t('saves.difficulty.normal') }}</option>
          <option value="hard">{{ $t('saves.difficulty.hard') }}</option>
          <option value="hell">{{ $t('saves.difficulty.hell') }}</option>
        </select>
      </div>
    </div>

    <div class="actions">
      <button class="btn primary" @click="startNew">
        {{ $t('home.startGame') }}
      </button>

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
    </div>

    <!-- 设置面板 -->
    <div v-if="settingsOpen" class="modal" @click.self="closeSettings">
      <div class="modal-body">
        <SettingsPanel :showRestart="false" :allowSave="false" @close="closeSettings" />
      </div>
    </div>

    <!-- 存档面板 -->
    <div v-if="savesOpen" class="modal" @click.self="closeSaves">
      <div class="modal-body">
        <SavesPanel
          :saves="saves"
          @continue="continueById"
          @delete="deleteById"
          @clearAll="clearAll"
          @close="closeSaves"
          @rename="renameById"
        />
      </div>
    </div>

    <p class="hint">{{ $t('home.tip') }}</p>
  </div>
</template>

<script>
import SettingsPanel from '@/components/SettingsPanel.vue'
import SavesPanel from '@/components/SavesPanel.vue'

export default {
  name: 'HomeView',
  components: { SettingsPanel, SavesPanel },
  data(){
    return { settingsOpen:false, savesOpen:false, saves:[] }
  },
  computed:{
    mode(){ return this.$store.state.game.mode; },
    difficulty(){ return this.$store.state.game.difficulty; },
    latestSave(){
      if (!this.saves.length) return null;
      return this.saves.slice().sort((a,b)=>b.time - a.time)[0];
    }
  },
  mounted(){ this.loadSaves(); },
  methods: {
    // —— 选择器 —— //
    setMode(v){ this.$store.commit('game/setMode', v); },
    setDifficulty(v){ this.$store.commit('game/setDifficulty', v); },
    startNew(){
      this.$router.push({ name:'game', query:{ mode:this.mode, difficulty:this.difficulty } });
    },

    // —— 设置 —— //
    openSettings(){ this.settingsOpen = true; },
    closeSettings(){ this.settingsOpen = false; },
    confirmReset(){
      const ok = window.confirm(this.$t('home.resetConfirm'));
      if (ok){ this.$store.commit('resetSettings'); }
    },

    // —— 存档 —— //
    openSaves(){ this.savesOpen = true; },
    closeSaves(){ this.savesOpen = false; },
    loadSaves(){
      try{
        const arr = JSON.parse(localStorage.getItem('saves') || '[]');
        this.saves = Array.isArray(arr) ? arr.sort((a,b)=>b.time - a.time) : [];
      }catch(e){ this.saves = []; }
    },
    continueLatest(){
      if (!this.latestSave) return;
      this.$router.push({ name:'game', query:{ save:String(this.latestSave.id) } });
    },
    continueById(id){
      this.$router.push({ name:'game', query:{ save:String(id) } });
    },
    deleteById(id){
      const ok = window.confirm(this.$t('saves.deleteConfirm'));
      if (!ok) return;
      const arr = this.saves.filter(s => String(s.id) !== String(id));
      this.saves = arr;
      localStorage.setItem('saves', JSON.stringify(arr));
    },
    clearAll(){
      const ok = window.confirm(this.$t('saves.clearConfirm'));
      if (!ok) return;
      this.saves = [];
      localStorage.setItem('saves', '[]');
    },
    renameById({ id, name }){
      const arr = this.saves.slice();
      const i = arr.findIndex(s => String(s.id) === String(id));
      if (i === -1) return;
      arr[i] = { ...arr[i], name: String(name).trim() || arr[i].name };
      this.saves = arr;
      localStorage.setItem('saves', JSON.stringify(arr));
    }
  }
}
</script>

<style scoped>
.home{
  min-height: 100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center;
  background: radial-gradient(60% 60% at 50% 40%, #0f1320, #0b0e16 60%, #080a12);
  color:#e6f0ff; text-align:center; padding:20px;
}
.title{ font: 800 42px/1.1 ui-sans-serif, system-ui; margin: 0 0 18px; }
.selectors{
  display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin: 6px 0 10px;
}
.sel{ display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.04); border:1px solid #2a3346; padding:8px 10px; border-radius:10px; }
.sel label{ color:#cfe3ff; font-size:14px; }
.sel select{ background:#0f1320; color:#e6f0ff; border:1px solid #2a3346; border-radius:8px; padding:4px 8px; }
.actions{ display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin: 6px 0 18px; }
.btn{ background:#1f2937; color:#e5e7eb; border:1px solid #2a3346; padding:10px 16px; border-radius:12px; cursor:pointer; }
.btn:hover{ filter:brightness(1.08); }
.btn.primary{ background:#2563eb; border-color:#1d4ed8; color:white; }
.btn.ghost{ background:transparent; }
.btn:disabled{ opacity:.5; cursor:not-allowed; }
.modal{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:50; }
.modal-body{ background:#0f1320; border:1px solid #2a3346; border-radius:12px; padding:14px; width:min(820px, 94vw); }
.hint{ opacity:.7; margin-top: 8px; font-size: 14px; }
</style>
