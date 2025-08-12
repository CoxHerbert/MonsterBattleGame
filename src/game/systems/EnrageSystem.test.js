import { describe, it, expect } from 'vitest';
import EnrageSystem from './EnrageSystem.js';

describe('EnrageSystem', () => {
  it('does not revive dead enemies when intensity changes', () => {
    const state = { zombies: [{ hp: 0, hpMax: 100, maxHp: 100, speed: 10, dmg: 5 }] };
    const enr = new EnrageSystem({ state });
    enr.setGlobalIntensity(2);
    expect(state.zombies[0].hp).toBe(0);
  });
});
