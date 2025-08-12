const svg = (s)=> `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;

// 可按武器区分，示例：用不同主色给图片“框”出皮肤感
export const SKIN_MG_default = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#1f2937"/><rect x="10" y="28" width="30" height="8" rx="3" fill="#7aa2ff"/><rect x="40" y="30" width="14" height="4" rx="2" fill="#cfe3ff"/></svg>`);
export const SKIN_MG_desert  = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#3f2f1a"/><rect x="10" y="28" width="30" height="8" rx="3" fill="#fbbf24"/><rect x="40" y="30" width="14" height="4" rx="2" fill="#fde68a"/></svg>`);
export const SKIN_MG_neon    = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#0b1020"/><rect x="10" y="28" width="30" height="8" rx="3" fill="#22d3ee"/><rect x="40" y="30" width="14" height="4" rx="2" fill="#a78bfa"/></svg>`);

export const SKIN_ROCKET_default = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#1f2937"/><path d="M14 32 L30 24 L46 32 L30 40 Z" fill="#f97316"/></svg>`);
export const SKIN_ROCKET_desert  = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#3f2f1a"/><path d="M14 32 L30 24 L46 32 L30 40 Z" fill="#f59e0b"/></svg>`);
export const SKIN_ROCKET_neon    = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#0b1020"/><path d="M14 32 L30 24 L46 32 L30 40 Z" fill="#22c55e"/></svg>`);

export const SKIN_LASER_default = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#1f2937"/><rect x="12" y="28" width="22" height="8" rx="3" fill="#8b5cf6"/><rect x="34" y="30" width="18" height="4" rx="2" fill="#d6b3ff"/></svg>`);
export const SKIN_LASER_desert  = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#3f2f1a"/><rect x="12" y="28" width="22" height="8" rx="3" fill="#f59e0b"/><rect x="34" y="30" width="18" height="4" rx="2" fill="#fde68a"/></svg>`);
export const SKIN_LASER_neon    = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#0b1020"/><rect x="12" y="28" width="22" height="8" rx="3" fill="#06b6d4"/><rect x="34" y="30" width="18" height="4" rx="2" fill="#22c55e"/></svg>`);
