export default {
  prices: {
    weapon: { mg: 0, rocket: 500, laser: 800 },

    weaponUpgradeBase: 300,          // 单级基础价
    weaponUpgradeGrowth: 1.6,        // 每级递增
    upgradeBulkDiscount: 0.9,        // ★ 批量升级折扣（×5时每级乘此系数）

    skin: {                          // ★ 皮肤定价
      mg:     { default:0, desert:200, neon:300 },
      rocket: { default:0, desert:250, neon:350 },
      laser:  { default:0, desert:300, neon:450 }
    }
  },

  rarity: {                          // ★ 稀有度参数
    common:    { maxLv: 5,  upgradeMul: 1.00 },
    rare:      { maxLv: 8,  upgradeMul: 1.15 },
    epic:      { maxLv: 12, upgradeMul: 1.35 },
    legendary: { maxLv: 16, upgradeMul: 1.60 }
  },

  sellbackRate: 0.5                  // ★ 回收比例（基于“累计成本”）
}
