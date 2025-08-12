export default {
  kinds: {
    weaponCrate: {
      icon: '\u{1F4E6}',
      color: '#9ad3bc',
      respawnSec: 45,
      loot: [ ['ammo',50], ['weapon_mod',35], ['rare_weapon',15] ]
    },
    medkit: {
      icon: '\u{1F48A}',
      color: '#ff9aa2',
      respawnSec: 30,
      heal: 50
    }
  },
  perChunk: {
    weaponCrate: [0, 2],
    medkit: [1, 2]
  },
  avoidObstacleMargin: 24
};
