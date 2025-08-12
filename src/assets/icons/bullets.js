const svg = (s)=> `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;

export const ICON_BULLET = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <defs><radialGradient id="g" cx="40%" cy="50%" r="60%">
    <stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#7aa2ff"/>
  </radialGradient></defs>
  <circle cx="10" cy="10" r="6" fill="url(#g)"/>
</svg>`);

export const ICON_ROCKET_AMMO = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <path d="M4 10 L10 5 L16 10 L10 15 Z" fill="#fb923c"/>
  <circle cx="16" cy="10" r="2" fill="#ef4444"/>
</svg>`);

export const ICON_BEAM = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <rect x="3" y="9" width="14" height="2" rx="1" fill="#c084fc"/>
</svg>`);
