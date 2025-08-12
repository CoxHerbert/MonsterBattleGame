export type DamageType = 'physical' | 'magic' | 'electric' | 'ice';

export interface StatusEffect {
  kind: 'slow' | 'poison' | 'stun';
  value?: number;          // slow: 0~1
  dps?: number;            // poison
  duration: number;        // seconds
  elapsed?: number;
  sourceId?: string;       // tower id
}

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  armor: number;           // flat or %? 采用 flat，配合 armorPen
  moveSpeed: number;       // tiles/s
  bounty: number;
  resist?: Partial<Record<DamageType, number>>; // 0~1 减伤
  size: number;            // 半径（像素）
  tags?: string[];         // 'air','boss' 等
}

export interface TowerDef {
  id: string;
  name: string;
  cost: number;
  range: number;           // 像素
  fireRate: number;        // shots/s
  damage: number;
  damageType: DamageType;
  projectile: 'bullet' | 'shell' | 'beam' | 'chain';
  aoeRadius?: number;
  statusOnHit?: StatusEffect;
  canHitAir?: boolean;
  targetPriority: 'first' | 'last' | 'strong' | 'close';
  upgrades?: TowerUpgrade[];
}

export interface TowerUpgrade {
  level: number;           // 2..3
  cost: number;
  delta: Partial<Omit<TowerDef, 'id' | 'name' | 'upgrades'>>;
  perkNote?: string;
}

export interface SpawnEvent {
  t: number;               // 相对波次开始秒数
  enemyId: string;
  count: number;
  interval: number;        // 两只之间间隔
  lane?: number;           // 多路径
}

export interface WaveDef {
  id: string;
  budget?: number;         // 可选，用于AI平衡
  spawns: SpawnEvent[];
  reward?: number;         // 过波奖励
}

export interface LevelConfig {
  id: string;
  name: string;
  width: number;           // 像素
  height: number;
  tileSize: number;        // 网格尺寸
  paths: { lane: number; waypoints: {x:number; y:number}[] }[];
  buildable: number[][];   // 0/1 网格掩码
  startLife: number;
  startGold: number;
  waves: WaveDef[];
}

export interface SaveData {
  version: number;
  selectedLevelId: string;
  progress: {
    completedWaves: number;
    life: number;
    gold: number;
    towers: Array<{ id: string; gx: number; gy: number; level: number }>;
  };
  settings: { bgm: boolean; sfx: boolean; speed: number };
}
