import { Assets as PixiAssets, Spritesheet, Texture } from 'pixi.js'

let sheet: Spritesheet
const extras: Record<string, Texture> = {}

export const Assets = {
  async load() {
    sheet = (await PixiAssets.load(new URL('../../assets/sprites/tiles.json', import.meta.url).href)) as Spritesheet
    const icons = await PixiAssets.load({
      arrow: new URL('../../assets/sprites/arrow.svg', import.meta.url).href,
      cannon: new URL('../../assets/sprites/cannon.svg', import.meta.url).href,
      ice: new URL('../../assets/sprites/ice.svg', import.meta.url).href,
      tesla: new URL('../../assets/sprites/tesla.svg', import.meta.url).href
    })
    const fx = await PixiAssets.load({
      fx_beam_grad: new URL('../../assets/fx/fx_beam_grad.svg', import.meta.url).href,
      fx_muzzle_flash: new URL('../../assets/fx/fx_muzzle_flash.svg', import.meta.url).href,
      fx_particle_dot: new URL('../../assets/fx/fx_particle_dot.svg', import.meta.url).href,
      fx_ring_soft: new URL('../../assets/fx/fx_ring_soft.svg', import.meta.url).href,
      fx_spark_hex: new URL('../../assets/fx/fx_spark_hex.svg', import.meta.url).href
    })
    Object.assign(extras, icons as Record<string, Texture>, fx as Record<string, Texture>)
  },
  texture(name: string): Texture {
    return extras[name] || sheet.textures[name]
  }
}
