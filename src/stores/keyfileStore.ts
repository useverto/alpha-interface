import { writable, derived, get, readable } from "svelte/store";
import Arweave from "arweave";
import type { IProfile } from "../utils/types";

// We store the arweave keyfile here.
// It gets saved to the local stroage of the browser
// It never leaves the user's browser

export const address = createCustomStore("address");
export const keyfile = createCustomStore("keyfile");
export const profiles = createProfilesStore();

// this is a custom store
// it enables saving to local storage
function createCustomStore(storeName) {
  const { subscribe, set } = writable("");

  if (
    localStorage.getItem(storeName) !== null &&
    localStorage.getItem(storeName) !== "" &&
    localStorage.getItem(storeName) !== "null" &&
    localStorage.getItem(storeName) !== undefined
  ) {
    // is logged in according to the browser
    set(localStorage.getItem(storeName));
  }

  return {
    subscribe,
    reset: () => {
      // reset / log out
      set("");
      localStorage.removeItem(storeName);
    },
    set: (val) => {
      // set
      set(val);
      localStorage.setItem(storeName, val);
    },
  };
}

// create store for all keyfiles
function createProfilesStore() {
  const defaultVal: IProfile[] = [],
    { subscribe, set, update } = writable(defaultVal);

  if (
    localStorage.getItem("profiles") !== null &&
    localStorage.getItem("profiles") !== undefined
  ) {
    set(JSON.parse(localStorage.getItem("profiles")));
  }

  // migrate the old system
  update((currentProfiles: IProfile[]) => {
    if (
      currentProfiles.filter((prf) => prf.address === get(address)).length !== 0
    )
      return currentProfiles;
    if (get(address) === "" && get(keyfile) === "") return;

    currentProfiles.push({ address: get(address), keyfile: get(keyfile) });
    localStorage.setItem("profiles", JSON.stringify(currentProfiles));

    return currentProfiles;
  });

  return {
    subscribe,
    removeKeyfile: (removeAddress: string) => {
      if (removeAddress === "") return;
      update((currentProfiles: IProfile[]) => {
        const newVal = currentProfiles.filter(
          (prf) => prf.address !== removeAddress
        );
        localStorage.setItem("profiles", JSON.stringify(newVal));

        return newVal;
      });
    },
    addKeyfile(addAddress: string, addKeyFile: string) {
      if (addAddress === "" || addKeyFile === "") return;
      update((currentProfiles: IProfile[]) => {
        if (currentProfiles === undefined) currentProfiles = [];
        if (
          currentProfiles.filter((prf) => prf.address === addAddress).length > 0
        )
          return;

        currentProfiles.push({ address: addAddress, keyfile: addKeyFile });
        localStorage.setItem("profiles", JSON.stringify(currentProfiles));

        return currentProfiles;
      });
    },
    removeAll() {
      set([]);
      localStorage.removeItem("profiles");
    },
  };
}

// return the balance
export const balance = readable(null, (set) => {
  const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    }),
    getBalance = () =>
      client.wallets
        .getBalance(get(address))
        .then((_balance) => set(client.ar.winstonToAr(_balance)));
  getBalance();
  // update balance on keyfile switch
  const unsubscribe = address.subscribe(getBalance);
  // refresh in every minute
  const clearbalanceInterval = setInterval(getBalance, 60000);

  return function stop() {
    clearInterval(clearbalanceInterval);
    unsubscribe();
  };
});

// a derived store
// acts like a computed variable in Vue
// returns if the user is logged in
export const loggedIn = derived(
  keyfile,
  ($keyfile) =>
    $keyfile !== "" &&
    $keyfile !== "null" &&
    $keyfile !== null &&
    $keyfile !== undefined
);

// log out
// this removes the keyfile from local stroage
export function logOut() {
  keyfile.reset();
  address.reset();
  profiles.removeAll();
}
