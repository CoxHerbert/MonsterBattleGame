export type PointerCb = (gridX: number, gridY: number, x: number, y: number) => void
export type CommandCb = (cmd: string) => void

export class Input {
  private moveCb?: PointerCb
  private leftCb?: PointerCb
  private rightCb?: () => void
  private cmdCb?: CommandCb
  private tileSize: number

  constructor(private canvas: HTMLCanvasElement, tileSize: number) {
    this.tileSize = tileSize
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('contextmenu', e => e.preventDefault())
    window.addEventListener('keydown', this.onKey)
  }

  onPointer(cb: PointerCb) { this.moveCb = cb }
  onClick(cb: PointerCb) { this.leftCb = cb }
  onRightClick(cb: () => void) { this.rightCb = cb }
  onCommand(cb: CommandCb) { this.cmdCb = cb }

  private getPos(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const gridX = Math.floor(x / this.tileSize)
    const gridY = Math.floor(y / this.tileSize)
    return { gridX, gridY, x, y }
  }

  private onMove = (e: PointerEvent) => {
    if (!this.moveCb) return
    const p = this.getPos(e)
    this.moveCb(p.gridX, p.gridY, p.x, p.y)
  }

  private onDown = (e: PointerEvent) => {
    const p = this.getPos(e)
    if (e.button === 2) {
      this.rightCb && this.rightCb()
    } else if (e.button === 0) {
      this.leftCb && this.leftCb(p.gridX, p.gridY, p.x, p.y)
    }
  }

  private onKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        this.cmdCb && this.cmdCb('toggle-pause')
        break
      case '1':
        this.cmdCb && this.cmdCb('speed1')
        break
      case '2':
        this.cmdCb && this.cmdCb('speed2')
        break
      case '3':
        this.cmdCb && this.cmdCb('speed3')
        break
      case 'r':
      case 'R':
        this.cmdCb && this.cmdCb('restart')
        break
      case 'l':
      case 'L':
        this.cmdCb && this.cmdCb('toggle-lane')
        break
    }
  }

  dispose() {
    this.canvas.removeEventListener('pointermove', this.onMove)
    this.canvas.removeEventListener('pointerdown', this.onDown)
    window.removeEventListener('keydown', this.onKey)
  }
}
