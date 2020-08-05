import { writable, derived } from "svelte/store";
import { userinfo } from "./userStore.js";
// import Arweave from "arweave/web";

// We store the arweave keyfile here.
// It gets saved to the local stroage of the browser
// It never leaves the user's browser

export const keyfile = createKeyfileStore();
// export const client = createArweaveClientStore();

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
);

// log out
// this removes the keyfile from local stroage 
// and resets the userinfo (address, balance)
export function logOut () {
  keyfile.reset();
  userinfo.reset();
}

/*

// the client store
// used to connect to arweave
function createArweaveClientStore () {
  const { subscribe, set } = writable({});
  if(process.browser) {
    set(new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    }));
  }
  return { set, subscribe };
}

export async function logIn (keyfile) {
  if(!process.browser) return;
  let address, balance;
  await $client.wallets.jwkToAddress(JSON.parse(keyfile)).then(_address => address = _address);
  await $client.wallets.getBalance(address).then(_balance => balance = $client.ar.winstonToAr(_balance));
  console.log(address, balance);
}*/