export const ENEMY_ARCH = {
  zombie:  { r:12,  hp:  60, spd: 60, dmg:10,  sprite:'EN_ZOMBIE',  ai:'melee' },
  brute:   { r:16,  hp: 180, spd: 48, dmg:20,  sprite:'EN_BRUTE',   ai:'melee', elite:true },
  spitter: { r:12,  hp:  80, spd: 58, dmg:12,  sprite:'EN_SPITTER', ai:'spit',   shot:{ cd:[1.6,2.4], speed:380, color:'#34d399', fx:'FX_ACID', effects:{ poison:{dps:6,sec:3}, slow:{ratio:0.4,sec:1.2} }} },
  charger: { r:14,  hp: 120, spd: 62, dmg:18,  sprite:'EN_CHARGER', ai:'charge', dash:{ cd:[2.2,3.0], mult:3.4, dur:0.5 } },
  bomber:  { r:13,  hp:  80, spd: 70, dmg: 0,  sprite:'EN_BOMBER',  ai:'suicide', boom:{ radius:96, dmg:30, falloff:0.5, fx:'FX_BOMB' } },
  ranger:  { r:12,  hp:  90, spd: 60, dmg:10,  sprite:'EN_RANGER',  ai:'shoot',  shot:{ cd:[1.3,2.0], speed:460, color:'#93c5fd', fx:'FX_ARROW' } },
  summoner:{ r:14,  hp: 140, spd: 52, dmg:10,  sprite:'EN_SUMMONER',ai:'summon', call:{ cd:[6,8], type:'crawler', count:[2,3], arc:1.6 } },
  shield:  { r:14,  hp: 140, spd: 56, dmg:14,  sprite:'EN_SHIELD',  ai:'melee',  shield:{ hp:120, regenCd:8 } },
  crawler: { r:10,  hp:  40, spd: 88, dmg: 8,  sprite:'EN_CRAWLER', ai:'melee' },
  ghost:   { r:12,  hp:  70, spd: 64, dmg: 9,  sprite:'EN_GHOST',   ai:'melee', ghost:true },

  boss_tyrant:   { r:28, hp: 1600, spd: 62, dmg:35, sprite:'EN_BOSS_TYRANT',   ai:'boss_tyrant',  elite:true, boss:true },
  boss_matriarch:{ r:26, hp: 1400, spd: 66, dmg:28, sprite:'EN_BOSS_MATRIARCH',ai:'boss_matriarch',elite:true, boss:true }
};

export const ENEMY_WEIGHTS = [
  { wave:1,  pool:[['zombie',6],['crawler',2],['spitter',1]] },
  { wave:4,  pool:[['zombie',4],['crawler',3],['spitter',2],['ranger',1]] },
  { wave:8,  pool:[['zombie',3],['crawler',3],['spitter',2],['ranger',2],['charger',1]] },
  { wave:12, pool:[['zombie',2],['crawler',2],['spitter',2],['ranger',2],['charger',2],['shield',1]] },
  { wave:16, pool:[['brute',1],['bomber',2],['spitter',2],['ranger',2],['charger',2],['shield',1],['ghost',1]] },
  { wave:20, pool:[['brute',2],['bomber',2],['spitter',2],['ranger',2],['charger',2],['shield',2],['ghost',2]] }
];

export const BOSS_ROTATION = ['boss_tyrant','boss_matriarch'];

/* ===== Minimap Alerts（前摇/警戒可视化参数表） =====
   说明：
   - speed：闪烁脉冲速度（Hz）
   - pre：倒计时阈值（秒），剩余时间 < pre 时开始闪烁
   - scale：环扩大倍数的最大幅度（基础半径 * (1 + scale * sin)）
   - alpha：[min,max] 透明度范围，随时间脉冲
   - line：描边宽度（像素）
   - color：描边颜色
   - radiusFactor（仅 suicide）：进入 爆炸半径 * radiusFactor 即开始警戒
*/
export const ENEMY_ALERTS = {
  charge:    { speed: 8,  pre: 0.0,  scale: 0.25, alpha:[0.6,1.0],  line:2.0, color:'#f59e0b', dashActive:true },
  shoot:     { speed:10,  pre: 0.30, scale: 0.18, alpha:[0.45,0.85], line:1.5, color:'#93c5fd' },
  spit:      { speed:10,  pre: 0.30, scale: 0.18, alpha:[0.45,0.85], line:1.5, color:'#34d399' },
  summon:    { speed: 9,  pre: 0.60, scale: 0.22, alpha:[0.50,0.95], line:2.0, color:'#b39ddb' },
  suicide:   { speed:12,  pre: 0.00, scale: 0.28, alpha:[0.55,0.95], line:2.0, color:'#ef4444', radiusFactor:1.0 },
  boss_cone: { speed:11,  pre: 0.35, scale: 0.30, alpha:[0.60,0.95], line:2.5, color:'#ff4757' },
  boss_nova: { speed:11,  pre: 0.40, scale: 0.30, alpha:[0.60,0.95], line:2.5, color:'#ff4ea3' }
};

/* —— 可选：按具体敌人类型覆盖 —— */
export const ENEMY_ALERTS_OVERRIDE = {
  // 例：将 charger 的冲锋前摇放宽到 0.2s 开始闪
  // charger: { charge: { pre: 0.2 } },

  // 例：将 spitter 的颜色改更亮
  // spitter: { spit: { color:'#5af5b7' } }
};
