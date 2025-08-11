<template>
  <div class="settings-panel">
    <div class="audio">
      <button @click="toggleMute" :title="settings.muted ? '取消静音' : '静音'">
        {{ settings.muted ? '🔇' : '🔊' }}
      </button>
      <input
        class="vol"
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="settings.volume"
        @input="onVolumeInput"
        :title="'音量 ' + Math.round(settings.volume * 100) + '%'"
      />
      <button @click="toggleBgm" :title="settings.bgmOn ? '关闭背景音乐' : '开启背景音乐'">
        {{ settings.bgmOn ? '🎵 背景音乐 开' : '🎵 背景音乐 关' }}
      </button>
    </div>
    <button @click="toggleMapOpen">{{ settings.minimapOpen ? '雷达：开' : '雷达：关' }}</button>
    <div class="map-size">
      <label>地图大小：
        <select v-model="localSize" @change="changeMapSize">
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
      </label>
    </div>
    <button v-if="allowSave" @click="$emit('save')">保存并退出</button>
    <button v-if="showRestart" @click="$emit('restart')">重新开始</button>
    <button @click="$emit('close')">关闭</button>
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
    settings() { return this.$store.state.settings },
    localSize: {
      get() { return this.settings.minimapSize },
      set(v) { this.$store.commit('setMinimapSize', v) }
    }
  },
  methods: {
    onVolumeInput(e) { this.$store.commit('setVolume', Number(e.target.value)) },
    toggleMute() { this.$store.commit('setMuted', !this.settings.muted) },
    toggleBgm() { this.$store.commit('setBgmOn', !this.settings.bgmOn) },
    toggleMapOpen() { this.$store.commit('setMinimapOpen', !this.settings.minimapOpen) },
    changeMapSize(e) { this.$store.commit('setMinimapSize', e.target.value); }
  }
}
</script>

<style scoped>
.settings-panel{ pointer-events:auto; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); background:rgba(31,41,55,.95); color:#e5e7eb; padding:20px; border-radius:12px; display:flex; flex-direction:column; gap:12px; align-items:center; }
.settings-panel button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
.settings-panel button:hover{ filter:brightness(1.1); }
.settings-panel .audio{ display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); padding:4px 6px; border-radius:10px; }
.settings-panel .audio .vol{ width:110px; height:6px; accent-color:#9cf; }
</style>
