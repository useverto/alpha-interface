import { writable } from "svelte/store";
import type { IWatchlistElement } from "../utils/types";

export const watchlist = createWatchListStore();

function createWatchListStore () {

  const 
    watchedPsts: IWatchlistElement[] = [], 
    { set, subscribe, update } = writable(watchedPsts);

  if (
    // @ts-ignore
    process.browser &&
    localStorage.getItem("watchlist") !== null &&
    localStorage.getItem("watchlist") !== "" &&
    localStorage.getItem("watchlist") !== "null" &&
    localStorage.getItem("watchlist") !== undefined
  ) {
    // load watchlist from localstroage
    set(JSON.parse(localStorage.getItem("watchlist")));
  // @ts-ignore  
  }else if(process.browser) {
    localStorage.setItem("watchlist", JSON.stringify(watchedPsts));
  }

  return {
    addPst ({ pst, period }: IWatchlistElement) {
      update((curr: IWatchlistElement[]) => {
        curr.push({ pst, period });
        localStorage.setItem("watchlist", JSON.stringify(curr));
        return curr;
      });
    },
    removePst (pstName: string) {
      update((curr: IWatchlistElement[]) => {
        const updatedList = curr.filter((el: IWatchlistElement) => el.pst !== pstName);
        localStorage.setItem("watchlist", JSON.stringify(updatedList));
        return updatedList;
      });
    },
    subscribe
  }

}