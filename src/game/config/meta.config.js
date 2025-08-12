export default {
  trees: [
    {
      id: 'offense',
      name: '输出系',
      nodes: [
        { id: 'atk_1', name:'强化攻击', maxLv:5, perLv:{ attack:+2 }, req:[], costBase:80 },
        { id: 'crit_1', name:'致命一击', maxLv:5, perLv:{ critRate:+0.02 }, req:['atk_1'], costBase:120 },
        { id: 'cdr_1', name:'冷却缩减', maxLv:3, perLv:{ cdr:+0.05 }, req:['crit_1'], costBase:160 }
      ]
    },
    {
      id: 'survive',
      name: '生存系',
      nodes: [
        { id: 'hp_1', name:'强健体魄', maxLv:5, perLv:{ maxHp:+12 }, req:[], costBase:80 },
        { id: 'def_1', name:'厚实护甲', maxLv:5, perLv:{ defense:+0.5 }, req:['hp_1'], costBase:120 },
        { id: 'dash_i', name:'额外闪避', maxLv:1, perLv:{ dodgeCharges:+1 }, req:['def_1'], costBase:200 }
      ]
    }
  ],
  unlocks: [
    { id:'unlock_rocket', type:'weapon', target:'rocket', condition:{ bossKills:3 } },
    { id:'unlock_laser',  type:'weapon', target:'laser',  condition:{ firstClear:'1-2' } }
  ],
  clamps: { critRate: 0.45, cdr: 0.45 }
};
