import { AmmoProfile } from '../weapons/types';

export const AmmoRegistry: Record<string, AmmoProfile> = {
  'FMJ': {
    id: 'FMJ',
    displayKey: 'ammo.FMJ',
    baseModifiers: [
      { key: 'pierce', op: 'ADD', value: 1, sourceTag: 'ammo:FMJ' },
    ],
  },
  'AP': {
    id: 'AP',
    displayKey: 'ammo.AP',
    baseModifiers: [
      { key: 'pierce', op: 'ADD', value: 2, sourceTag: 'ammo:AP' },
      { key: 'damage', op: 'MULT', value: -0.1, sourceTag: 'ammo:AP' },
    ],
  },
  'HP': {
    id: 'HP',
    displayKey: 'ammo.HP',
    baseModifiers: [
      { key: 'damage', op: 'MULT', value: 0.15, sourceTag: 'ammo:HP' },
      { key: 'pierce', op: 'ADD', value: -1, sourceTag: 'ammo:HP' },
    ],
  },
};
