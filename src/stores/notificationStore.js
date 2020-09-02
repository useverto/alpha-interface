import { writable } from "svelte/store";

export const notification = createNotificationStore();

function createNotificationStore () {
  const { set, subscribe } = writable({});
  set(null);

  return {
    notify (title, description, type, timeout) {
      if(typeof type !== "number" || type > 3) return;
      set({ title, description, type, timeout });
    },
    subscribe,
    remove: () => set(null)
  }
}

export const NotificationType = {
  error: 0,
  warning: 1,
  log: 2,
  success: 3
}