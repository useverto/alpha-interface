import { writable } from "svelte/store";

export const keyfile = createKeyfileStore();

function createKeyfileStore () {
  const { subscribe, set } = writable("");

  if(process.browser && (localStorage.getItem("keyfile") !== null && localStorage.getItem("keyfile") !== undefined)) {
    set(localStorage.getItem("keyfile"))
  }

  return {
    subscribe,
    reset: () => {
      set("");
      localStorage.setItem("keyfile", null);
    },
    set: (val) => {
      set(val);
      localStorage.setItem("keyfile", val);
    }
  }
}