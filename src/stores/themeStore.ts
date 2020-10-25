import { writable, derived, get } from "svelte/store";
import { Theme, DisplayTheme } from "../utils/types";
import { saveSetting, getSetting } from "src/utils/settings";
import { address } from "./keyfileStore";

export const theme = createThemeStore();

function createThemeStore() {
  const { set, subscribe } = writable(Theme.Light),
    setTheme = (themeValue: Theme) => {
      set(themeValue);
      // @ts-ignore
      if (process.browser) saveSetting("theme", themeValue, get(address));
    };

  // @ts-ignore
  if (process.browser && getSetting("theme", get(address)))
    set(Theme[getSetting("theme", get(address))]);

  return {
    set: setTheme,
    subscribe,
  };
}

export const displayTheme = derived(theme, ($theme) => {
  let returnTheme = DisplayTheme.Light;
  switch ($theme) {
    case Theme.Dark:
      returnTheme = DisplayTheme.Dark;
      break;
    case Theme.Auto:
      if (
        // @ts-ignore
        process.browser &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
        returnTheme = DisplayTheme.Dark;
      break;
  }
  return returnTheme;
});
