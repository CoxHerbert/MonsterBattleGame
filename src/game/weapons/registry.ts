import { WeaponBase } from './types';

export const WeaponRegistry: Record<string, WeaponBase> = {
  'AR-01': {
    id: 'AR-01',
    displayKey: 'weapon.AR01.name',
    slot: 'primary',
    baseStats: {
      damage: 24,
      critChance: 0.15,
      critMultiplier: 1.5,
      fireRate: 9.0,
      reloadTime: 2.2,
      magSize: 30,
      pierce: 0,
      statusChance: 0.1,
    },
    fireModes: [
      { type: 'auto', rpm: 540 },
      { type: 'burst', rpm: 720, burstCount: 3 },
    ],
    allowedMods: ['mag', 'barrel', 'sight', 'stock', 'underbarrel', 'perk'],
    allowedAmmo: ['FMJ', 'AP', 'HP'],
  },
};
