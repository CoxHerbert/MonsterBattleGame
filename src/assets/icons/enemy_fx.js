const svg = (s)=> `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;

export const FX_ACID = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#eaffb8"/><stop offset="100%" stop-color="#34d399"/></radialGradient></defs>
  <circle cx="10" cy="10" r="6" fill="url(#g)"/>
</svg>`);

export const FX_ARROW = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <path d="M4 10 L12 10" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
  <path d="M12 10 L8 7 M12 10 L8 13" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/>
</svg>`);

export const FX_BOMB = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <circle cx="10" cy="10" r="5" fill="#ef4444"/>
</svg>`);

export const FX_CONE = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <path d="M2 10 L18 6 L18 14 Z" fill="#f59e0b" opacity="0.8"/>
</svg>`);

export const FX_HEAL = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <circle cx="10" cy="10" r="6" fill="#86efac"/>
  <path d="M10 6 v8 M6 10 h8" stroke="#065f46" stroke-width="2"/>
</svg>`);
