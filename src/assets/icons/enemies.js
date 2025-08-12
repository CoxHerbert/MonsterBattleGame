const svg = (s)=> `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;

// 通用风格：圆形基底 + 面部/花纹，确保小尺寸可读
export const EN_ZOMBIE = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><radialGradient id="g" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="#c0ffbf"/><stop offset="100%" stop-color="#4caf50"/></radialGradient></defs>
  <circle cx="32" cy="32" r="14" fill="url(#g)" stroke="#1b5e20" stroke-width="2"/>
  <circle cx="26" cy="28" r="2" fill="#fff"/><circle cx="38" cy="30" r="2" fill="#fff"/>
  <path d="M24 38 Q32 35 40 38" stroke="#093" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`);

export const EN_BRUTE = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><radialGradient id="g" cx="50%" cy="40%" r="60%">
    <stop offset="0%" stop-color="#ffd9a8"/><stop offset="100%" stop-color="#ff7b3a"/></radialGradient></defs>
  <circle cx="32" cy="32" r="16" fill="url(#g)" stroke="#8b2c0c" stroke-width="2"/>
  <rect x="22" y="22" width="8" height="6" rx="2" fill="#fff"/>
  <rect x="34" y="22" width="8" height="6" rx="2" fill="#fff"/>
  <path d="M22 42 Q32 46 42 42" stroke="#6a1b09" stroke-width="3" fill="none"/>
</svg>`);

export const EN_SPITTER = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="14" fill="#7cd992" stroke="#1b5e20" stroke-width="2"/>
  <path d="M20 32 h24" stroke="#3cffb0" stroke-width="4" stroke-linecap="round"/>
  <circle cx="26" cy="26" r="2" fill="#fff"/><circle cx="38" cy="28" r="2" fill="#fff"/>
</svg>`);

export const EN_CHARGER = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="14" fill="#ffd166" stroke="#8a5a00" stroke-width="2"/>
  <polygon points="20,32 44,32 36,24 36,40" fill="#ffb703"/>
</svg>`);

export const EN_BOMBER = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="13" fill="#ff9aa2" stroke="#8b0000" stroke-width="2"/>
  <circle cx="32" cy="32" r="5" fill="#ef4444"/>
  <path d="M32 16 v6" stroke="#8b0000" stroke-width="3"/>
</svg>`);

export const EN_RANGER = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="13" fill="#a1c4ff" stroke="#1e40af" stroke-width="2"/>
  <path d="M22 32 h20" stroke="#93c5fd" stroke-width="3"/>
  <circle cx="40" cy="32" r="3" fill="#93c5fd"/>
</svg>`);

export const EN_SUMMONER = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="14" fill="#d1c4e9" stroke="#4527a0" stroke-width="2"/>
  <circle cx="32" cy="32" r="6" fill="#b39ddb"/>
  <circle cx="20" cy="40" r="3" fill="#b39ddb"/><circle cx="44" cy="24" r="3" fill="#b39ddb"/>
</svg>`);

export const EN_SHIELD = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="14" fill="#9fe0ff" stroke="#0e7490" stroke-width="2"/>
  <path d="M32 22 l10 5 v8 c0 6-5 9-10 11-5-2-10-5-10-11 v-8z" fill="#38bdf8"/>
</svg>`);

export const EN_CRAWLER = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <ellipse cx="32" cy="34" rx="16" ry="10" fill="#6ee7b7" stroke="#047857" stroke-width="2"/>
  <rect x="20" y="28" width="6" height="3" rx="1" fill="#fff"/>
</svg>`);

export const EN_GHOST = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M16 40 Q20 20 32 20 Q44 20 48 40 Q40 36 32 44 Q24 36 16 40Z" fill="#cbd5e1" stroke="#475569" stroke-width="2" opacity="0.86"/>
  <circle cx="28" cy="28" r="2" fill="#334155"/><circle cx="36" cy="28" r="2" fill="#334155"/>
</svg>`);

export const EN_BOSS_TYRANT = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><radialGradient id="b" cx="50%" cy="45%" r="60%">
    <stop offset="0%" stop-color="#ff9a9a"/><stop offset="100%" stop-color="#d10000"/></radialGradient></defs>
  <circle cx="32" cy="32" r="18" fill="url(#b)" stroke="#6b0000" stroke-width="3"/>
  <path d="M22 40 Q32 48 42 40" stroke="#6b0000" stroke-width="4" fill="none"/>
</svg>`);

export const EN_BOSS_MATRIARCH = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><radialGradient id="m" cx="50%" cy="40%" r="60%">
    <stop offset="0%" stop-color="#ffb6e6"/><stop offset="100%" stop-color="#ad1457"/></radialGradient></defs>
  <circle cx="32" cy="32" r="18" fill="url(#m)" stroke="#6d0029" stroke-width="3"/>
  <circle cx="32" cy="32" r="6" fill="#ffe3f4"/>
  <circle cx="22" cy="42" r="3" fill="#ffe3f4"/><circle cx="42" cy="22" r="3" fill="#ffe3f4"/>
</svg>`);

