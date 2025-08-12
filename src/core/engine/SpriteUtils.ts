import { Sprite } from 'pixi.js'

export function attachShadow(sp: Sprite) {
  const shadow = new Sprite(sp.texture)
  shadow.tint = 0x000000
  shadow.alpha = 0.4
  shadow.anchor.copyFrom(sp.anchor)
  shadow.position.set(3, 3)
  sp.addChildAt(shadow, 0)
}
