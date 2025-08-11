import { createStore } from 'vuex'

export default createStore({
  state: () => ({
    settings: {
      volume: 0.8,
      muted: false,
      bgmOn: true,
      minimapOpen: true,
      minimapSize: 'medium'
    }
  }),
  mutations: {
    setVolume(state, v) { state.settings.volume = v },
    setMuted(state, v) { state.settings.muted = v },
    setBgmOn(state, v) { state.settings.bgmOn = v },
    setMinimapOpen(state, v) { state.settings.minimapOpen = v },
    setMinimapSize(state, v) { state.settings.minimapSize = v }
  }
})
