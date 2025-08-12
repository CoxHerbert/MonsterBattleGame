const svg = (s)=> `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;

// 机枪
export const ICON_MG = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="10" y="28" width="30" height="8" rx="3" fill="#7aa2ff"/>
  <rect x="40" y="30" width="14" height="4" rx="2" fill="#cfe3ff"/>
  <rect x="16" y="24" width="8" height="16" rx="2" fill="#3b6cb7"/>
  <circle cx="18" cy="42" r="4" fill="#2a3a52"/>
</svg>`);

// 火箭炮
export const ICON_ROCKET = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M14 32 L30 24 L46 32 L30 40 Z" fill="#f97316"/>
  <rect x="18" y="28" width="22" height="8" rx="3" fill="#ffb703"/>
  <circle cx="48" cy="32" r="6" fill="#ef4444"/>
</svg>`);

// 激光
export const ICON_LASER = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="12" y="28" width="22" height="8" rx="3" fill="#8b5cf6"/>
  <rect x="34" y="30" width="18" height="4" rx="2" fill="#d6b3ff"/>
  <circle cx="20" cy="42" r="4" fill="#3b2c5a"/>
  <line x1="40" y1="32" x2="60" y2="32" stroke="#c084fc" stroke-width="3" />
</svg>`);
