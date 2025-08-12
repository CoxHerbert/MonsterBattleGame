import modes from '../config/modes.config.js';

export default class RunRewards {
  static calc({ mode, chapter, state }){
    const m = mode;
    const score = Math.floor(state.score || 0);
    let exp=0, soft=0, hard=0, rareDrop=null, firstClear=false;
    if (m.id === 'ENDLESS'){
      exp  = Math.floor(score * m.rewards.expPerScore);
      soft = Math.floor(score * m.rewards.softCurrencyPerScore);
      const bossKills = state.stats?.bossKills || 0;
      for (let i=0;i<bossKills;i++){
        if (Math.random()<m.rewards.rareDropChancePerBoss) rareDrop = { tier:'rare' };
      }
    } else {
      const base = m.rewards.expBasePerChapter + (chapter ? 40 : 0);
      const clear = state.flags?.bossDefeated ? m.rewards.clearBonus : 0;
      exp  = base + Math.floor(score * 0.02);
      soft = m.rewards.softCurrencyPerChapter + Math.floor(score * 0.02) + clear;
      if (state.flags?.firstClearOf === chapter?.id && m.rewards.rareDropOnFirstClear){
        rareDrop = { tier:'legendary' }; firstClear = true; hard = 1;
      }
    }
    return { exp, soft, hard, rareDrop, firstClear };
  }
}
