import { reactive } from 'vue'

export function createStore(options) {
  const state = reactive(options.state())
  const store = {
    state,
    commit(type, payload) {
      const m = options.mutations && options.mutations[type]
      if (m) m(state, payload)
    }
  }
  store.install = (app) => { app.config.globalProperties.$store = store }
  return store
}
