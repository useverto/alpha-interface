import { derived, get, readable, writable } from "svelte/store";
import Arweave from "arweave";

function createAddressStore() {
  const { subscribe, set } = writable<string>(null);
  // @ts-ignore
  if (!process.browser) return;

  async function walletLoadedListener() {
    const permissions = await window.arweaveWallet.getPermissions();
    if (!permissions.includes("ACCESS_ADDRESS")) return;
    await setAddress();
    window.addEventListener("walletSwitch", setAddress);
  }
  async function setAddress(e?: any) {
    const addr = e
      ? e.detail.address
      : // @ts-ignore
        await window.arweaveWallet.getActiveAddress();
    set(addr);
  }

  window.addEventListener("arweaveWalletLoaded", walletLoadedListener);
  setAddress();

  return {
    subscribe,
    sync: () => setAddress(),
    reset: () => set(null),
  };
}

export const address = createAddressStore();

// return the balance
export const balance = readable<string>(null, (set) => {
  // @ts-ignore
  if (!process.browser) return;
  const client = new Arweave({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
  });

  async function getBalance() {
    const addr = get(address),
      balance = addr
        ? client.ar.winstonToAr(await client.wallets.getBalance(addr))
        : null;

    set(balance);
  }

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
  address,
  ($address) => $address && $address !== ""
);

// log out
// this removes the keyfile from local stroage
export function logOut() {
  // TODO disconnect
}
