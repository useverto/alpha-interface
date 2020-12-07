import { readable } from "svelte/store";
import limestone from "@limestonefi/api";

export const usd = readable(null, (set) => {
  // @ts-ignore
  if (!process.browser) return;
  const getUSD = () => limestone.getPrice("AR").then((res) => set(res.price));
  getUSD();
  // refresh in every minute
  const clearBalanceInterval = setInterval(getUSD, 60000);

  return function stop() {
    clearInterval(clearBalanceInterval);
  };
});
