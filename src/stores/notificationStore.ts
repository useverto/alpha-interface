import { writable } from "svelte/store";
import type { NotificationType } from "../types";

export const notification = createNotificationStore();

function createNotificationStore () {
  const { set, subscribe } = writable({});
  set(null);

  return {
    notify (title: string, description: string, type: NotificationType, timeout: number) {
      set({ title, description, type, timeout });
    },
    subscribe,
    remove: () => set(null)
  }
}