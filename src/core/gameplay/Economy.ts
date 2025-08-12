export class Economy {
  gold = 0

  canAfford(amount: number): boolean {
    return this.gold >= amount
  }

  spend(amount: number): boolean {
    if (this.canAfford(amount)) {
      this.gold -= amount
      return true
    }
    return false
  }

  gain(amount: number): void {
    this.gold += amount
  }
}
