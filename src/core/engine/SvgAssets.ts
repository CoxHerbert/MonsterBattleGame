import { Texture } from 'pixi.js'

const cache = new Map<string, Texture>()

export const SvgAssets = {
  async load(path: string): Promise<Texture> {
    if (cache.has(path)) return cache.get(path)!
    const tex = Texture.from(path)
    await new Promise<void>(res => requestAnimationFrame(() => res()))
    ;(tex.baseTexture as any).resource?.update?.()
    cache.set(path, tex)
    return tex
  },
  async preload(paths: string[]): Promise<void> {
    await Promise.all(paths.map(p => this.load(p)))
  },
  texture(path: string): Texture {
    const t = cache.get(path)
    if (!t) throw new Error(`SVG not loaded: ${path}`)
    return t
  },
  replaceColor(tex: Texture, cssVar: string, color: string) {
    const res: any = tex.baseTexture.resource
    if (res && typeof res.source === 'string') {
      const re = new RegExp(`--${cssVar}:[^;]+`, 'i')
      res.source = res.source.replace(re, `--${cssVar}:${color}`)
      res.update()
    }
  }
}

export const TowerBasePad = '/src/assets/svg/towers/tower_base_pad.svg'
export const TowerSpriteMap = {
  arrow: '/src/assets/svg/towers/tower_arrow_lvl1.svg',
  cannon: '/src/assets/svg/towers/tower_cannon_lvl1.svg',
  ice: '/src/assets/svg/towers/tower_ice_lvl1.svg',
  tesla: '/src/assets/svg/towers/tower_tesla_lvl1.svg',
} as const
