export default {
  mg: {
    id: 'mg',
    nameKey: 'weapon.mg',
    descKey: 'weapon.mg.desc',
    icon: 'ICON_MG',
    bulletIcon: 'ICON_BULLET',
    stats: {
      dpsTier: 1.0,
      dmg: 24,
      fireInterval: 0.12,
      speed: 740,
      life: 0.9,
      pierce: 0
    },
    growth: [
      { level:1, delta:{ dmg:+4 } },
      { level:2, delta:{ pierce:+1 } },
      { level:3, delta:{ fireIntervalMul:0.9 } }
    ],
    fire: 'fireMG'
  },

  rocket: {
    id: 'rocket',
    nameKey: 'weapon.rocket',
    descKey: 'weapon.rocket.desc',
    icon: 'ICON_ROCKET',
    bulletIcon: 'ICON_ROCKET_AMMO',
    stats: {
      dpsTier: 1.1,
      dmg: 120,
      fireInterval: 0.6,
      speed: 520,
      life: 1.2,
      splash: { radius: 96, falloff: 0.5 }
    },
    growth: [
      { level:1, delta:{ dmg:+20 } },
      { level:2, delta:{ splashRadius:+16 } },
      { level:3, delta:{ fireIntervalMul:0.9 } }
    ],
    fire: 'fireRocket'
  },

  laser: {
    id: 'laser',
    nameKey: 'weapon.laser',
    descKey: 'weapon.laser.desc',
    icon: 'ICON_LASER',
    bulletIcon: 'ICON_BEAM',
    stats: {
      dpsTier: 1.0,
      tickDmg: 16,
      tick: 0.06,
      range: 900,
      width: 6,
      channelCost: 0,
      fireInterval: 0.04
    },
    growth: [
      { level:1, delta:{ tickDmg:+4 } },
      { level:2, delta:{ width:+2 } },
      { level:3, delta:{ tick:-0.01, clampMin:0.03 } }
    ],
    fire: 'fireLaser'
  }
}
