export type LootEntry =
  | { kind: 'currency'; id: 'gold' | 'scrap'; min: number; max: number; weight: number }
  | { kind: 'weapon'; id: string; weight: number }
  | { kind: 'mod'; id: string; weight: number }
  | { kind: 'material'; id: string; weight: number };

export const StageLoot: Record<string, LootEntry[]> = {
  'stage-1': [
    { kind: 'currency', id: 'gold', min: 5, max: 12, weight: 50 },
    { kind: 'weapon', id: 'AR-01', weight: 2 },
    { kind: 'mod', id: 'ExtMag', weight: 6 },
    { kind: 'mod', id: 'LongBarrel', weight: 4 },
  ],
};
