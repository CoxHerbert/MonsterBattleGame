export function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
export function load(key, def=null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}
