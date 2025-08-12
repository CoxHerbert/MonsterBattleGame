import { Assets as PixiAssets, Spritesheet, Texture } from 'pixi.js'

let sheet: Spritesheet

export const Assets = {
  async load() {
    sheet = (await PixiAssets.load(new URL('../../assets/sprites/tiles.json', import.meta.url).href)) as Spritesheet
  },
  texture(name: string): Texture {
    return sheet.textures[name]
  }
}
