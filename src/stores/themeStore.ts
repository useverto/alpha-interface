import { writable, derived } from "svelte/store";
import { Theme, DisplayTheme } from "../utils/types";

export const theme = createThemeStore();

function createThemeStore() {
  const { set, subscribe } = writable(Theme.Light),
    setTheme = (themeValue: Theme) => {
      set(themeValue);
      localStorage.setItem("theme", themeValue);
    };

  if (localStorage.getItem("theme")) {
    set(Theme[localStorage.getItem("theme")]);
  }

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
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
        returnTheme = DisplayTheme.Dark;
      break;
  }
  return returnTheme;
});
