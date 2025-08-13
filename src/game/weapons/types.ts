export type ScalarOp = 'ADD' | 'MULT' | 'OVERRIDE';

export interface StatModifier {
  key:
    | 'damage'
    | 'critChance'
    | 'critMultiplier'
    | 'fireRate'
    | 'reloadTime'
    | 'magSize'
    | 'pierce'
    | 'statusChance'
    | 'elemental:fire'
    | 'elemental:shock'
    | 'elemental:ice';
  op: ScalarOp;
  value: number;
  sourceTag: string;
  stackingGroup?: string;
}

export interface FireMode {
  type: 'semi' | 'burst' | 'auto' | 'shotgun';
  burstCount?: number;
  pellets?: number;
  rpm: number;
}

export interface AmmoProfile {
  id: string;
  displayKey: string;
  baseModifiers: StatModifier[];
}

export interface WeaponBase {
  id: string;
  displayKey: string;
  slot: 'primary' | 'secondary';
  baseStats: {
    damage: number;
    critChance: number;
    critMultiplier: number;
    fireRate: number;
    reloadTime: number;
    magSize: number;
    pierce: number;
    statusChance: number;
  };
  fireModes: FireMode[];
  allowedMods: string[];
  allowedAmmo: string[];
}

export interface ModItem {
  id: string;
  type: 'mag' | 'barrel' | 'sight' | 'stock' | 'underbarrel' | 'perk';
  displayKey: string;
  modifiers: StatModifier[];
  exclusiveGroup?: string;
}

export interface ComputedWeapon {
  baseId: string;
  ammoId: string;
  modIds: string[];
  finalStats: {
    damage: number;
    critChance: number;
    critMultiplier: number;
    fireRate: number;
    reloadTime: number;
    magSize: number;
    pierce: number;
    statusChance: number;
    elementals: Record<string, number>;
  };
  fireMode: FireMode;
}
