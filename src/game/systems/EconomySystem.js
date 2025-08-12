import econ from '../config/economy.config.js';

export default class EconomySystem {
  constructor({ meta }){
    this.meta = meta;
  }
  canAfford(amount){ return this.meta.data.soft >= amount; }
  spend(amount){ if (this.canAfford(amount)){ this.meta.data.soft -= amount; return true; } return false; }
  priceForReroll(times){ return Math.floor(econ.prices.rerollPerk(times)); }
}
