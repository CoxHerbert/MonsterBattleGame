export default {
  trees: [
    {
      id: 'offense',
      nameKey: 'meta.offense',
      nodes: [
        { id: 'atk_1', nameKey:'meta.atk_1', maxLv:5, perLv:{ attack:+2 }, req:[], costBase:80 },
        { id: 'crit_1', nameKey:'meta.crit_1', maxLv:5, perLv:{ critRate:+0.02 }, req:['atk_1'], costBase:120 },
        { id: 'cdr_1', nameKey:'meta.cdr_1', maxLv:3, perLv:{ cdr:+0.05 }, req:['crit_1'], costBase:160 }
      ]
    },
    {
      id: 'survive',
      nameKey: 'meta.survive',
      nodes: [
        { id: 'hp_1', nameKey:'meta.hp_1', maxLv:5, perLv:{ maxHp:+12 }, req:[], costBase:80 },
        { id: 'def_1', nameKey:'meta.def_1', maxLv:5, perLv:{ defense:+0.5 }, req:['hp_1'], costBase:120 },
        { id: 'dash_i', nameKey:'meta.dash_i', maxLv:1, perLv:{ dodgeCharges:+1 }, req:['def_1'], costBase:200 }
      ]
    }
  ],
  unlocks: [
    { id:'unlock_rocket', type:'weapon', target:'rocket', condition:{ bossKills:3 } },
    { id:'unlock_laser',  type:'weapon', target:'laser',  condition:{ firstClear:'1-2' } }
  ],
  clamps: { critRate: 0.45, cdr: 0.45 }
};
