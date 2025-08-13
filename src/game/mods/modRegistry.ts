import { ModItem } from '../weapons/types';

export const ModRegistry: Record<string, ModItem> = {
  'ExtMag': {
    id: 'ExtMag',
    type: 'mag',
    displayKey: 'mod.ExtMag',
    modifiers: [
      { key: 'magSize', op: 'ADD', value: 15, sourceTag: 'mod:ExtMag' },
      { key: 'reloadTime', op: 'MULT', value: 0.1, sourceTag: 'mod:ExtMag' },
    ],
  },
  'LongBarrel': {
    id: 'LongBarrel',
    type: 'barrel',
    displayKey: 'mod.LongBarrel',
    modifiers: [
      { key: 'damage', op: 'MULT', value: 0.12, sourceTag: 'mod:LongBarrel' },
      { key: 'statusChance', op: 'ADD', value: 0.05, sourceTag: 'mod:LongBarrel' },
    ],
  },
  'ShockPerk': {
    id: 'ShockPerk',
    type: 'perk',
    displayKey: 'mod.ShockPerk',
    modifiers: [
      { key: 'elemental:shock', op: 'ADD', value: 0.25, sourceTag: 'mod:ShockPerk' },
      { key: 'statusChance', op: 'ADD', value: 0.1, sourceTag: 'mod:ShockPerk' },
    ],
  },
};
