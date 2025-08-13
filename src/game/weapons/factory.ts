import { WeaponBase, ModItem, AmmoProfile, ComputedWeapon, StatModifier } from './types';
import { applyModifiers, collectElementals } from './modifiers';

export function computeWeapon(
  base: WeaponBase,
  ammo: AmmoProfile,
  mods: ModItem[],
  chosenMode: number,
  extraContextMods: StatModifier[] = []
): ComputedWeapon {
  const allMods: StatModifier[] = [
    ...ammo.baseModifiers,
    ...mods.flatMap(m => m.modifiers),
    ...extraContextMods,
  ];

  const final = applyModifiers(base.baseStats, allMods);
  const el = collectElementals(allMods);

  return {
    baseId: base.id,
    ammoId: ammo.id,
    modIds: mods.map(m => m.id),
    finalStats: {
      ...final,
      elementals: el,
    },
    fireMode: base.fireModes[chosenMode] ?? base.fireModes[0],
  };
}
