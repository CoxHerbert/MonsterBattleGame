export default {
  mg: { // 机枪：高射速、中伤害、可少量散射
    fireInterval: 0.12,
    bulletSpeed: 780,
    baseDamageMul: 1.0,    // 实际伤害 = attack * baseDamageMul
    life: 0.9,
    spreadRad: 0.045,      // 低幅随机扩散
    pierce: 0, bounce: 0,
    sfx: 'shot_mg'
  },
  rocket: { // 火箭炮：低射速、范围爆炸、击退
    fireInterval: 0.85,
    rocketSpeed: 560,
    baseDamageMul: 2.2,    // 命中点直伤
    splash: { radius: 120, falloff: 0.5 }, // 半径与中心->边缘伤害衰减
    life: 1.6,
    sfx: 'shot_rocket', sfxBoom: 'boom_med',
    knockback: 220
  },
  laser: { // 激光：持续引导，按 Tick 结算
    warmup: 0.12,          // 起手延迟
    tick: 0.06,            // 伤害Tick
    dpsMul: 1.4,           // 每秒伤害 = attack * dpsMul
    range: 720,
    width: 8,              // 像素
    overheatSec: 3.6,      // 过热时间（持续开火累计）
    cooldownSec: 1.8,      // 过热冷却
    sfx: 'laser_loop'
  }
};
