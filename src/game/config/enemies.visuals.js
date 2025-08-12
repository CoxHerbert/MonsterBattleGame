/* 
  ENEMY_VFX：敌人可视化统一表
  - alerts：小地图与地面提示共享的“前摇/警戒”基础模板
  - world.defaults：地面提示（Telegraph）默认参数
  - types：按 enemy.type 覆盖 alerts/world
*/
export const ENEMY_VFX = {
  alerts: {
    charge:    { speed: 8,  pre: 0.00, scale: 0.25, alpha:[0.60,1.00], line:2.0, color:'#f59e0b' },
    shoot:     { speed:10,  pre: 0.30, scale: 0.18, alpha:[0.45,0.85], line:1.5, color:'#93c5fd' },
    spit:      { speed:10,  pre: 0.30, scale: 0.18, alpha:[0.45,0.85], line:1.5, color:'#34d399' },
    summon:    { speed: 9,  pre: 0.60, scale: 0.22, alpha:[0.50,0.95], line:2.0, color:'#b39ddb' },
    suicide:   { speed:12,  pre: 0.00, scale: 0.28, alpha:[0.55,0.95], line:2.0, color:'#ef4444', radiusFactor:1.0 },
    boss_cone: { speed:11,  pre: 0.35, scale: 0.30, alpha:[0.60,0.95], line:2.5, color:'#ff4757' },
    boss_nova: { speed:11,  pre: 0.40, scale: 0.30, alpha:[0.60,0.95], line:2.5, color:'#ff4ea3' }
  },

  world: {
    defaults: {
      ringRadiusScale: 1.4,
      chargeRadiusScale: 1.8,
      shootRadius: 70,
      spitRadius: 90,
      summonRadius: 110,
      suicideRadiusExtra: 0,
      coneAngleDeg: 70,
      coneRange: 420,
      novaRadius: 220
    }
  },

  // 按类型覆盖（示例，按需追加）
  types: {
    charger: {
      alerts: { charge: { pre: 0.2 } },
      world:  { chargeRadiusScale: 2.0 }
    },
    spitter: {
      alerts: { spit: { color:'#5af5b7' } },
      world:  { spitRadius: 110 }
    },
    ranger:  {
      world:  { shootRadius: 90 }
    },
    summoner:{
      world:  { summonRadius: 140 }
    },
    boss_tyrant: {
      alerts: { boss_cone: { pre: 0.25 } },
      world:  { coneAngleDeg: 80, coneRange: 520 }
    },
    boss_matriarch: {
      alerts: { boss_nova: { pre: 0.45 } },
      world:  { novaRadius: 260 }
    }
  }
};

/* ——（可选）旧接口兼容层，方便渐进迁移 —— */
export const ENEMY_ALERTS = ENEMY_VFX.alerts;
export const ENEMY_ALERTS_OVERRIDE = Object.fromEntries(
  Object.entries(ENEMY_VFX.types || {}).map(([type, conf]) => [type, conf.alerts || {}])
);
export const ENEMY_TELEGRAPH_WORLD = {
  defaults: ENEMY_VFX.world?.defaults || {},
  ...Object.fromEntries(Object.entries(ENEMY_VFX.types || {}).map(([type, conf]) => [type, conf.world || {}]))
};
