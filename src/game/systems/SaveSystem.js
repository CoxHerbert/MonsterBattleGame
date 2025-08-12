const LS_RUN = 'run-save-v1';
const LS_META = 'meta-save-v1';

export default class SaveSystem {
  loadRun(){
    try { return JSON.parse(localStorage.getItem(LS_RUN) || 'null'); }
    catch(e){ return null; }
  }
  saveRun(data){
    localStorage.setItem(LS_RUN, JSON.stringify(data));
  }
  clearRun(){ localStorage.removeItem(LS_RUN); }

  loadMeta(){
    const def = { soft:0, hard:0, unlocks:{}, trees:{}, stats:{ totalBossKills:0, firstClears:{} } };
    try { return JSON.parse(localStorage.getItem(LS_META)) || def; }
    catch(e){ return def; }
  }
  saveMeta(meta){ localStorage.setItem(LS_META, JSON.stringify(meta)); }
}
