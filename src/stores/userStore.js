import { writable } from "svelte/store";

// We store the userinfo here
// Balance, address...
// TODO: a periodic update maybe?

export const userinfo = createUserStore();

function createUserStore () {
  const { subscribe, set, update } = writable({ address: "", balance: "" });
  if(process.browser) {
    if(localStorage.getItem("userinfo") !== "" && localStorage.getItem("userinfo") !== null && localStorage.getItem("userinfo") !== undefined && localStorage.getItem("userinfo") !== "null") {
      set(JSON.parse(localStorage.getItem("userinfo")));
    }else {
      localStorage.setItem("userinfo", JSON.stringify({ address: "", balance: "" }));
    }
  }

  return {
    subscribe,
    reset () {
      if(process.browser) localStorage.setItem("userinfo", JSON.stringify({ address: "", balance: "" }));
      set({ address: "", balance: "" });
    },
    set (val) {   
      update(originalVal => {
        const update = Object.assign({}, originalVal, val);
        if(process.browser) localStorage.setItem("userinfo", JSON.stringify(update));
        return update;
      });
    }
  }
}