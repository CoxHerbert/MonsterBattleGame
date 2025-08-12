export default {
  currencies: {
    soft: { id: 'gold', nameKey: 'currency.gold' },
    hard: { id: 'core', nameKey: 'currency.core' }
  },
  prices: {
    rerollPerk: (times) => 50 * Math.pow(1.6, times),
    unlockWeapon: { mg: 0, rocket: 500, laser: 800 }
  },
  sinks: {
    upgradeNodeBase: 80,
    upgradeNodeGrowth: 1.25
  }
};
