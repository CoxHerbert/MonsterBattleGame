export const DEFAULT_GAME_META = {
  mode: 'endless',      // 'endless' | 'growth'
  difficulty: 'normal'  // 'easy' | 'normal' | 'hard' | 'hell'
};

export default {
  namespaced: true,
  state: () => ({ ...DEFAULT_GAME_META }),
  mutations: {
    setMode(state, v){ state.mode = (v === 'growth' ? 'growth' : 'endless'); },
    setDifficulty(state, v){
      const allow = ['easy','normal','hard','hell'];
      state.difficulty = allow.includes(v) ? v : 'normal';
    },
    reset(state){ state.mode = 'endless'; state.difficulty = 'normal'; }
  }
};
