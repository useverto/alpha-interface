import { writable } from "svelte/store";

export const notification = createNotificationStore();

function createNotificationStore () {
  const { set, subscribe } = writable({});
  set(null);

  return {
    notify (title, description, type) {
      if(typeof type !== "number" || type > 2) return;
      set({ title, description, type });
    },
    subscribe
  }
}

export const NotificationType = {
  error: 0,
  warning: 1,
  log: 2
}