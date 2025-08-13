import { createStore } from 'vuex'
import { createPersistSettingsPlugin, loadSettingsFromStorage } from './plugins/persistSettings'

// 统一默认值（新增的 effectsQuality 与 screenShake 在这）
const DEFAULT_SETTINGS = {
  volume: 0.8,
  muted: false,
  bgmOn: true,
  minimapOpen: true,
  minimapAlerts: true,
  minimapSize: 'medium',
  telegraphOn: true,
  effectsQuality: 'high',   // 'high' | 'low'
  screenShake: true         // 是否启用屏幕震动
};

export default createStore({
  state: {
    settings: loadSettingsFromStorage(DEFAULT_SETTINGS)
  },
  mutations: {
    setVolume(state, v){ state.settings.volume = Number(v); },
    setMuted(state, v){ state.settings.muted = !!v; },
    setBgmOn(state, v){ state.settings.bgmOn = !!v; },
    setMinimapOpen(state, v){ state.settings.minimapOpen = !!v; },
    setMinimapAlerts(state, v){ state.settings.minimapAlerts = !!v; },
    setMinimapSize(state, v){ state.settings.minimapSize = String(v); },
    setTelegraphOn(state, v){ state.settings.telegraphOn = !!v; },

    // 新增：特效质量 & 屏幕震动
    setEffectsQuality(state, v){ state.settings.effectsQuality = (v === 'low' ? 'low' : 'high'); },
    setScreenShake(state, v){ state.settings.screenShake = !!v; },

    // 一键恢复默认
    resetSettings(state){
      state.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
  },
  actions: {
    // （可选）在 App 启动时再次确保合并到最新默认
    hydrateSettings({ state }){
      state.settings = loadSettingsFromStorage(DEFAULT_SETTINGS);
    }
  },
  plugins: [ createPersistSettingsPlugin() ]
});
