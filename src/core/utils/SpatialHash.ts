export class SpatialHash<T = any> {
  private cells = new Map<string, T[]>()

  add(x: number, y: number, obj: T) {
    const key = `${x},${y}`
    const arr = this.cells.get(key) ?? []
    arr.push(obj)
    this.cells.set(key, arr)
  }

  get(x: number, y: number): T[] {
    return this.cells.get(`${x},${y}`) ?? []
  }
}
