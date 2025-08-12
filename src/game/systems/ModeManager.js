import modes from '../config/modes.config.js';
import RunRewards from './RunRewards.js';
import SaveSystem from './SaveSystem.js';

export default class ModeManager {
  constructor({ state, director, economy, meta, bus }){
    this.s = state; this.director = director; this.economy = economy; this.meta = meta; this.bus = bus;
    this.save = new SaveSystem();
    this.mode = null; this.chapter = null;
  }

  startEndless(){
    this.mode = modes.ENDLESS; this.chapter = null;
    this.director.configure?.(this.mode.director);
    this.s.worldSeed = (Math.random()*2**31)>>>0;
    this._applyMetaBuffs();
    this._resetRun();
  }

  startProgression(id){
    this.mode = modes.PROGRESSION;
    this.chapter = this.mode.chapters.find(c=>c.id===id) || this.mode.chapters[0];
    const dirCfg = { ...this.mode.director, bossWindowSec: this.chapter.bossAtSec };
    this.director.configure?.(dirCfg);
    this.s.worldSeed = this.chapter.seed >>> 0;
    this._applyMetaBuffs();
    this._resetRun();
  }

  _applyMetaBuffs(){
    const b = this.meta.getAggregatedBuffs();
    const p = this.s.player;
    p.maxHp += b.maxHp||0; p.hp = p.maxHp;
    p.attack += b.attack||0; p.defense += b.defense||0;
    p.critRate = Math.min(this.meta.clamps.critRate, p.critRate + (b.critRate||0));
    p.cdr = Math.min(this.meta.clamps.cdr, p.cdr + (b.cdr||0));
  }

  _resetRun(){
    this.s.score = 0; this.s.combo = 1; this.s.timeNow = 0;
    this.save.saveRun({ mode:this.mode.id, chapterId:this.chapter?.id, worldSeed:this.s.worldSeed });
  }

  settle(info){
    const rw = RunRewards.calc({ mode:this.mode, chapter:this.chapter, state:this.s });
    this.meta.addSoft(rw.soft); this.meta.addHard(rw.hard); this.meta.saveData();
    this.save.clearRun();
    return { ...rw, cause: info.cause, score:this.s.score, time:this.s.timeNow };
  }
}
