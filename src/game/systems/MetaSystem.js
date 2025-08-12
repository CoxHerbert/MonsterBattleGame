import metaCfg from '../config/meta.config.js';
import econ from '../config/economy.config.js';
import SaveSystem from './SaveSystem.js';

export default class MetaSystem {
  constructor(){
    this.save = new SaveSystem();
    this.data = this.save.loadMeta();
    this.clamps = metaCfg.clamps;
  }
  saveData(){ this.save.saveMeta(this.data); }
  addSoft(x){ this.data.soft += x; }
  addHard(x){ this.data.hard += x; }
  markFirstClear(id){ this.data.stats.firstClears[id] = true; }

  buyNode(treeId, nodeId){
    const lv = this.data.trees[treeId]?.[nodeId] || 0;
    const tree = metaCfg.trees.find(t=>t.id===treeId);
    if (!tree) return false;
    const node = tree.nodes.find(n=>n.id===nodeId);
    if (!node || lv >= node.maxLv) return false;
    const cost = Math.floor(node.costBase * Math.pow(econ.sinks.upgradeNodeGrowth, lv));
    if (this.data.soft < cost) return false;
    this.data.soft -= cost;
    if (!this.data.trees[treeId]) this.data.trees[treeId] = {};
    this.data.trees[treeId][nodeId] = lv + 1;
    this.saveData();
    return true;
  }

  getAggregatedBuffs(){
    const sum = { attack:0, maxHp:0, defense:0, critRate:0, cdr:0, dodgeCharges:0 };
    for (const tree of metaCfg.trees){
      const lvMap = this.data.trees[tree.id] || {};
      for (const node of tree.nodes){
        const lv = lvMap[node.id] || 0;
        if (!lv) continue;
        for (const [k,v] of Object.entries(node.perLv)){
          sum[k] = (sum[k]||0) + v*lv;
        }
      }
    }
    return sum;
  }
}
