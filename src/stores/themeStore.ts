import { writable } from "svelte/store";
import { Theme } from "../utils/types";

export const theme = createThemeStore();

function createThemeStore () {
  const 
    { set, subscribe } = writable(Theme.Light),
    setTheme = (themeValue: Theme) => {
      set(themeValue);
      localStorage.setItem("theme", themeValue);
    };

  // @ts-ignore
  if(process.browser && localStorage.getItem("theme")) {
    set(Theme[localStorage.getItem("theme")])
  }

  return {
    set: setTheme,
    subscribe
  }
}