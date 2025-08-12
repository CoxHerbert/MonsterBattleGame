export default {
  mg: {
    id:'mg', name:'机枪', desc:'高射速，中等单发伤害。',
    icon:'ICON_MG', bulletIcon:'ICON_BULLET',
    rarity: 'common',                 // ★ 新增默认稀有度
    skins: ['default','desert','neon'], // ★ 可购皮肤清单
    stats:{ dmg:24, fireInterval:0.12, speed:740, life:0.9, pierce:0 },
    growth:[
      { level:1, delta:{ dmg:+4 } },
      { level:2, delta:{ pierce:+1 } },
      { level:3, delta:{ fireIntervalMul:0.9 } }
    ],
    fire:'fireMG'
  },

  rocket: {
    id:'rocket', name:'火箭炮', desc:'范围爆炸，低射速。',
    icon:'ICON_ROCKET', bulletIcon:'ICON_ROCKET_AMMO',
    rarity: 'rare',
    skins: ['default','desert','neon'],
    stats:{ dmg:120, fireInterval:0.6, speed:520, life:1.2, splash:{ radius:96, falloff:0.5 } },
    growth:[
      { level:1, delta:{ dmg:+20 } },
      { level:2, delta:{ splashRadius:+16 } },
      { level:3, delta:{ fireIntervalMul:0.9 } }
    ],
    fire:'fireRocket'
  },

  laser: {
    id:'laser', name:'激光枪', desc:'持续导引伤害，穿透直线目标。',
    icon:'ICON_LASER', bulletIcon:'ICON_BEAM',
    rarity: 'epic',
    skins: ['default','desert','neon'],
    stats:{ tickDmg:16, tick:0.06, range:900, width:6, fireInterval:0.04 },
    growth:[
      { level:1, delta:{ tickDmg:+4 } },
      { level:2, delta:{ width:+2 } },
      { level:3, delta:{ tick:-0.01, clampMin:0.03 } }
    ],
    fire:'fireLaser'
  }
}
