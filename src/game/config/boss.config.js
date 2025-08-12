export default {
  // 基础数值（再被 chapter & stage 放大）
  base: { r: 28, hp: 2400, speed: 70, dmg: 30, def: 8 },

  // 阶段放大：stage 1/2/3 …
  stageMul: (stage) => 1 + (stage-1)*0.35,

  // 技能表（权重/冷却/行为）
  skills: [
    // 冲锋横扫
    { id: 'rush',  weight: 30, cd: [3.2, 0.8],
      params: { wind:0.35, dur:0.7, mult:3.6, sweepAngle: Math.PI*0.6 } },

    // 扇形弹幕（近程/中程）
    { id: 'fan',   weight: 40, cd: [2.4, 0.6],
      params: { waves:3, perWave:12, spread:Math.PI*0.8, speed:420, life:2.2, gap:0.14 } },

    // 召唤援军（带精英）
    { id: 'call',  weight: 30, cd: [7, 2],
      params: { elites:1, mobs:6, ringR: 520 } },
  ],

  // 掉落：稀有装备 + 大量资源
  dropTier: 'legendary',
};
