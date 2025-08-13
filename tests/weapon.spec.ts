import { computeWeapon } from '@/game/weapons/factory';
import { WeaponRegistry } from '@/game/weapons/registry';
import { AmmoRegistry } from '@/game/ammo/ammoTypes';
import { ModRegistry } from '@/game/mods/modRegistry';
import { describe, it, expect } from 'vitest';

describe('weapon compute pipeline', () => {
  it('AP + ExtMag modifies stats predictably', () => {
    const w = computeWeapon(
      WeaponRegistry['AR-01'],
      AmmoRegistry['AP'],
      [ModRegistry['ExtMag']],
      0,
      []
    );
    expect(w.finalStats.magSize).toBe(45);
    expect(w.finalStats.pierce).toBeGreaterThan(0);
    expect(w.finalStats.damage).toBeGreaterThan(0);
  });
});
