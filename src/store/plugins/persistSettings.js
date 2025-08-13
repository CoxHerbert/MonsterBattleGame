// 持久化 Settings 到 localStorage，并提供加载方法
const LS_KEY = 'game-settings-v1';

export function loadSettingsFromStorage(defaults){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...defaults };
    const obj = JSON.parse(raw);
    return { ...defaults, ...obj };
  }catch(e){
    return { ...defaults };
  }
}

export function createPersistSettingsPlugin(){
  let timer = null;
  return (store) => {
    store.subscribe((mutation, state) => {
      // 仅监听 set* / resetSettings 这类更改设置的操作
      const t = mutation.type || '';
      if (!t.startsWith('set') && t !== 'resetSettings') return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        try{
          localStorage.setItem(LS_KEY, JSON.stringify(state.settings));
        }catch(e){}
      }, 50); // 轻微节流
    });
  };
}
