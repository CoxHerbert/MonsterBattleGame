import { StatModifier } from './types';

export function applyModifiers<T extends Record<string, number>>(base: T, mods: StatModifier[]): T {
  const result: any = { ...base };
  const grouped = new Map<string, StatModifier[]>();

  for (const m of mods) {
    const g = m.stackingGroup ?? `${m.key}:${m.op}`;
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(m);
  }

  for (const [, list] of grouped) {
    for (const m of list) {
      const key = m.key.split(':')[0];
      switch (m.op) {
        case 'ADD':
          result[key] = (result[key] ?? 0) + m.value;
          break;
        case 'MULT':
          result[key] = (result[key] ?? 0) * (1 + m.value);
          break;
        case 'OVERRIDE':
          result[key] = m.value;
          break;
      }
    }
  }
  return result as T;
}

export function collectElementals(mods: StatModifier[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of mods) {
    if (m.key.startsWith('elemental:')) {
      const el = m.key.split(':')[1];
      out[el] = (out[el] ?? 0) + m.value;
    }
  }
  return out;
}
