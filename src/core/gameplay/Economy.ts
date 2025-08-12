export class Economy {
  gold = 0
  add(amount: number) {
    this.gold += amount
  }
  spend(amount: number) {
    if (this.gold >= amount) {
      this.gold -= amount
      return true
    }
    return false
  }
}
