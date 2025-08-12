import { createStore } from 'vuex'

const VOL_KEY = 'zombie-volume'
const MUTE_KEY = 'zombie-muted'
const BGM_KEY = 'zombie-bgm'

const volume = Number(localStorage.getItem(VOL_KEY))
const muted = localStorage.getItem(MUTE_KEY) === '1'
const bgmSaved = localStorage.getItem(BGM_KEY)

export default createStore({
  state: () => ({
    settings: {
      volume: Number.isNaN(volume) ? 0.8 : volume,
      muted,
      bgmOn: bgmSaved === null ? true : bgmSaved === '1',
      minimapOpen: true,
      minimapAlerts: true,
      minimapSize: 'medium',
      telegraphOn: true
    }
  }),
  mutations: {
    setVolume(state, v) {
      state.settings.volume = v
      localStorage.setItem(VOL_KEY, String(v))
    },
    setMuted(state, v) {
      state.settings.muted = v
      localStorage.setItem(MUTE_KEY, v ? '1' : '0')
    },
    setBgmOn(state, v) {
      state.settings.bgmOn = v
      localStorage.setItem(BGM_KEY, v ? '1' : '0')
    },
    setMinimapOpen(state, v) { state.settings.minimapOpen = v },
    setMinimapAlerts(state, v) { state.settings.minimapAlerts = v },
    setMinimapSize(state, v) { state.settings.minimapSize = v },
    setTelegraphOn(state, v) { state.settings.telegraphOn = v }
  }
})
