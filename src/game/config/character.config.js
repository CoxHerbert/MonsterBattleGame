export default {
  // 基础与成长（可叠加到初始）
  base: { hp: 100, attack: 24, defense: 4, moveSpeed: 220, critRate: 0.12, cdr: 0.00 },
  growthPerLevel: { hp: 12, attack: 2.5, defense: 0.3, critRate: 0.002 }, // 每级增量（示例）

  // 能量与CD上限
  energy: { max: 100, nukeCost: 60, regenPerSec: 10 }, // 轰炸消耗/自然回能
  cdrClamp: { min: 0, max: 0.45 },                     // 冷却缩减上限

  // 伤害公式权重（见 formulas.js）
  damage: {
    defenseK: 60,           // 防御曲线系数
    critMul: 1.8,           // 暴击伤害倍数
    dotTick: 0.15           // Dot 默认 Tick 时间
  }
};
