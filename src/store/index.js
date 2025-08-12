import { createStore } from 'vuex'

import i18n from '../i18n'

const VOL_KEY = 'zombie-volume'
const MUTE_KEY = 'zombie-muted'
const BGM_KEY = 'zombie-bgm'

const FX_KEY = 'zombie-fx'

const LANG_KEY = 'zombie-lang'

const volume = Number(localStorage.getItem(VOL_KEY))
const muted = localStorage.getItem(MUTE_KEY) === '1'
const bgmSaved = localStorage.getItem(BGM_KEY)

const langSaved = localStorage.getItem(LANG_KEY) || 'zh'
const fxSaved = localStorage.getItem(FX_KEY) || 'medium'

export default createStore({
  state: () => ({
    settings: {
      volume: Number.isNaN(volume) ? 0.8 : volume,
      muted,
      bgmOn: bgmSaved === null ? true : bgmSaved === '1',
      minimapOpen: true,

      minimapSize: 'medium',
      language: langSaved,
      fxIntensity: fxSaved
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

    setMinimapSize(state, v) { state.settings.minimapSize = v },
    setLanguage(state, v) {
      state.settings.language = v
      localStorage.setItem(LANG_KEY, v)
      i18n.global.locale.value = v
    },
    setFxIntensity(state, v) {
      state.settings.fxIntensity = v
      localStorage.setItem(FX_KEY, v)
    }
  }
})
