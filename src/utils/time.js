export function formatDateTime(ts){
  try{
    const d = new Date(ts);
    const pad = (n)=>String(n).padStart(2,'0');
    const yyyy = d.getFullYear();
    const mm   = pad(d.getMonth()+1);
    const dd   = pad(d.getDate());
    const hh   = pad(d.getHours());
    const mi   = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  }catch(e){
    return String(ts);
  }
}
