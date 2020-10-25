import { writable, get } from "svelte/store";
import type { IWatchlistElement } from "../utils/types";
import { saveSetting, getSetting } from "src/utils/settings";
import { address } from "./keyfileStore";

export const watchlist = createWatchListStore();

function createWatchListStore() {
  const watchedPsts: IWatchlistElement[] = [],
    { set, subscribe, update } = writable(watchedPsts);

  if (
    // @ts-ignore
    process.browser &&
    getSetting("watchlist", get(address))
  ) {
    set(getSetting("watchlist", get(address)));
  }

  return {
    addPst({ id, name, ticker, period }: IWatchlistElement) {
      update((curr: IWatchlistElement[]) => {
        curr.push({ id, name, ticker, period });
        saveSetting("watchlist", curr, get(address));
        return curr;
      });
    },
    removePst(pstName: string) {
      update((curr: IWatchlistElement[]) => {
        const updatedList = curr.filter(
          (el: IWatchlistElement) => el.ticker !== pstName
        );
        saveSetting("watchlist", updatedList, get(address));
        return updatedList;
      });
    },
    subscribe,
  };
}
