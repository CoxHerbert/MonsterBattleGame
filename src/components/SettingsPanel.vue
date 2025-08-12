<template>
  <div class="panel">
    <h2>{{ $t('settings.title') }}</h2>

    <!-- 音频 -->
    <section>
      <h3>{{ $t('settings.audio') }}</h3>
      <div class="row">
        <label>{{ $t('settings.volume') }}</label>
        <input type="range" min="0" max="1" step="0.01"
               :value="settings.volume"
               @input="$store.commit('setVolume', Number($event.target.value))" />
        <span class="hint">{{ Math.round(settings.volume*100) }}%</span>
      </div>
      <div class="row">
        <label>{{ $t('settings.muted') }}</label>
        <input type="checkbox"
               :checked="settings.muted"
               @change="$store.commit('setMuted', $event.target.checked)" />
      </div>
      <div class="row">
        <label>{{ $t('settings.bgmOn') }}</label>
        <input type="checkbox"
               :checked="settings.bgmOn"
               @change="$store.commit('setBgmOn', $event.target.checked)" />
      </div>
    </section>

    <!-- 小地图 -->
    <section>
      <h3>{{ $t('settings.minimap') }}</h3>
      <div class="row">
        <label>{{ $t('settings.minimapOpen') }}</label>
        <input type="checkbox"
               :checked="settings.minimapOpen"
               @change="$store.commit('setMinimapOpen', $event.target.checked)" />
      </div>
      <div class="row">
        <label>{{ $t('settings.minimapSize') }}</label>
        <select :value="settings.minimapSize"
                @change="$store.commit('setMinimapSize', $event.target.value)">
          <option value="small">{{ $t('settings.size.small') }}</option>
          <option value="medium">{{ $t('settings.size.medium') }}</option>
          <option value="large">{{ $t('settings.size.large') }}</option>
        </select>
      </div>
    </section>

    <!-- 画质/体验 -->
    <section>
      <h3>{{ $t('settings.visual') }}</h3>

      <div class="row">
        <label>{{ $t('settings.effectsQuality') }}</label>
        <select :value="settings.effectsQuality"
                @change="$store.commit('setEffectsQuality', $event.target.value)">
          <option value="high">{{ $t('settings.effectsQualityHigh') }}</option>
          <option value="low">{{ $t('settings.effectsQualityLow') }}</option>
        </select>
        <span class="hint">{{ $t('settings.effectsQualityHint') }}</span>
      </div>

      <div class="row">
        <label>{{ $t('settings.screenShake') }}</label>
        <input type="checkbox"
               :checked="settings.screenShake"
               @change="$store.commit('setScreenShake', $event.target.checked)" />
        <span class="hint">{{ $t('settings.screenShakeHint') }}</span>
      </div>
    </section>

    <footer class="actions">
      <button @click="$emit('restart')" v-if="showRestart">{{ $t('settings.restart') }}</button>
      <button @click="$emit('save')" v-if="allowSave">{{ $t('settings.saveAndExit') }}</button>
      <button @click="$emit('close')">{{ $t('settings.close') }}</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'SettingsPanel',
  props: {
    showRestart: { type: Boolean, default: false },
    allowSave: { type: Boolean, default: false }
  },
  computed: {
    settings(){ return this.$store.state.settings; }
  }
}
</script>

<style scoped>
.panel{ background:#0f1320; color:#e6f0ff; border:1px solid #2a3346; border-radius:12px; padding:16px; width:min(680px, 92vw); }
h2{ margin:0 0 10px; font:700 18px ui-sans-serif,system-ui; }
h3{ margin:14px 0 8px; font:700 14px ui-sans-serif,system-ui; color:#bcd7ff; }
section{ padding:8px 0; border-top:1px solid rgba(255,255,255,.06); }
section:first-of-type{ border-top:none; }
.row{ display:flex; align-items:center; gap:10px; padding:6px 0; }
.row label{ width:180px; color:#cfe3ff; }
.row .hint{ opacity:.7; font-size:12px; }
select, input[type="checkbox"], input[type="range"], button{
  accent-color:#60a5fa;
}
.actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:10px; }
.actions button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
.actions button:hover{ filter:brightness(1.1); }
</style>
