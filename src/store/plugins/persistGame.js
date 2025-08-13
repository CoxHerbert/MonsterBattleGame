const LS_KEY = 'game-meta-v1';

export function loadGameMeta(defaults){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...defaults };
    const obj = JSON.parse(raw);
    return { ...defaults, ...obj };
  }catch{ return { ...defaults }; }
}

export function createPersistGamePlugin(){
  let timer = null;
  return (store) => {
    const cur = store.state.game;
    const next = loadGameMeta(cur);
    if (next.mode !== cur.mode || next.difficulty !== cur.difficulty){
      store.commit('game/setMode', next.mode);
      store.commit('game/setDifficulty', next.difficulty);
    }

    store.subscribe((mutation, state) => {
      const ns = (mutation.type || '').split('/')[0];
      if (ns !== 'game') return;
      clearTimeout(timer);
      timer = setTimeout(()=>{
        try{
          localStorage.setItem(LS_KEY, JSON.stringify(state.game));
        }catch{}
      }, 50);
    });
  };
}
