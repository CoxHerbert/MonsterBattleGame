import { Assets as PixiAssets, Spritesheet, Texture } from 'pixi.js'
import fxBeamGrad from '../../assets/fx/fx_beam_grad.svg'
import fxMuzzleFlash from '../../assets/fx/fx_muzzle_flash.svg'
import fxParticleDot from '../../assets/fx/fx_particle_dot.svg'
import fxRingSoft from '../../assets/fx/fx_ring_soft.svg'
import fxSparkHex from '../../assets/fx/fx_spark_hex.svg'

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
      fx_beam_grad: fxBeamGrad,
      fx_muzzle_flash: fxMuzzleFlash,
      fx_particle_dot: fxParticleDot,
      fx_ring_soft: fxRingSoft,
      fx_spark_hex: fxSparkHex
    })
    Object.assign(extras, icons as Record<string, Texture>, fx as Record<string, Texture>)
  },
  texture(name: string): Texture {
    return extras[name] || sheet.textures[name]
  }
}
