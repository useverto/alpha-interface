import { writable, derived } from "svelte/store";
import { userinfo } from "./userStore.js";

// We store the arweave keyfile here.
// It gets saved to the local stroage of the browser
// It never leaves the user's browser

export const keyfile = createKeyfileStore();

function createKeyfileStore () {
  const { subscribe, set } = writable("");

  if(process.browser && (localStorage.getItem("keyfile") !== null && localStorage.getItem("keyfile") !== "" && localStorage.getItem("keyfile") !== "null" && localStorage.getItem("keyfile") !== undefined)) { // is logged in according to the browser
    set(localStorage.getItem("keyfile"))
  }

  return {
    subscribe,
    reset: () => { // reset the keyfile / log out
      set("");
      localStorage.setItem("keyfile", null);
    },
    set: (val) => { // set the keyfile
      set(val);
      localStorage.setItem("keyfile", val);
    }
  }
}

// a derived store
// acts like a computed variable in Vue
// returns if the user is logged in
export const loggedIn = derived(
  keyfile,
  $keyfile => ($keyfile !== "" && $keyfile !== "null" && $keyfile !== null && $keyfile !== undefined)
)

// log out
// this removes the keyfile from local stroage 
// and resets the userinfo (address, balance)
export function logOut () {
  keyfile.reset();
  userinfo.reset();
}