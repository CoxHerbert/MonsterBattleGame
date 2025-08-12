export class Pool<T> {
  private items: T[] = []

  acquire(create: () => T): T {
    return this.items.pop() ?? create()
  }

  release(item: T) {
    this.items.push(item)
  }
}
