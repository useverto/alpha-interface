// round currencies
export function roundCurrency (val: number | string): string {
  if(val === "?") return val;
  if(typeof val === "string") val = parseFloat(val);
  return val.toFixed(7);
}