export default {
  // —— 通用数值成长（受 GameDirector 的 intensity 进一步相乘）——
  scale: {
    hp:      (wave, chapter) => 1 + wave*0.08 + (chapter-1)*0.25,
    speed:   (wave, chapter) => 1 + wave*0.01 + (chapter-1)*0.05,
    damage:  (wave, chapter) => 1 + wave*0.06 + (chapter-1)*0.18,
  },

  // —— 普通怪模板 —— //
  common: {
    melee: {
      r: 14, base: { hp: 60, speed: 80, dmg: 10, def: 2 },
      ai:  { kind: 'melee', avoid: true },
      weight: 60
    },
    ranged: {
      r: 12, base: { hp: 45, speed: 70, dmg: 8, def: 1 },
      ai:  { kind: 'ranged', range: 520, burst: [2, 0.15], cd: [1.6, 0.6] },
      weight: 40
    }
  },

  // —— 精英怪（在普通模板之上叠词缀）—— //
  elites: [
    {
      id: 'dasher', name: 'Dasher',
      mul: { hp: 2.2, speed: 1.25, dmg: 1.3, r: 1.1 },
      ai:  { dash: { cd: [3.2, 1.2], dur: 0.45, mult: 3.2, wind: 0.18 } },
      aura: { color: '#ffcf33' }, weight: 60, dropTier: 'rare'
    },
    {
      id: 'summoner', name: 'Summoner',
      mul: { hp: 2.4, speed: 0.95, dmg: 1.2, r: 1.15 },
      ai:  { summon: { cd: [6, 2], count: [2, 4], kindPool: ['melee','ranged'] } },
      aura: { color: '#a67bff' }, weight: 40, dropTier: 'rare'
    }
  ],

  // —— 生成权重/上限 —— //
  spawn: {
    eliteChance: (wave, chapter) => Math.min(0.25, 0.06 + wave*0.01 + (chapter-1)*0.02),
    rangedBiasByWave: (wave) => Math.min(0.6, 0.25 + wave*0.02),
  }
};
