const LS_META = 'meta-save-v1'
export default class SaveSystem {
  loadMeta(){
    const def = { soft: 0, hard: 0, unlocks: {}, trees: {}, stats: {} }
    try{ return JSON.parse(localStorage.getItem(LS_META)) || def }catch{ return def }
  }
  saveMeta(meta){ localStorage.setItem(LS_META, JSON.stringify(meta)) }
}
