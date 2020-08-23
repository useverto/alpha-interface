<script>

  import { notification, NotificationType } from "../stores/notificationStore.js";
  import { cubicOut } from "svelte/easing";

  $: notificationClass = $notification === null ? "" : Object.keys(NotificationType).find(key => NotificationType[key] === $notification.type);

  function notificationTransition (node, { duration }) {
    return {
      duration,
      css (t) {
        const eased = cubicOut(t);
        return `
          transform: scale(${ eased }) transform()
        `;
      }
    }
  }

</script>

{#if $notification !== null}
  <div class="notification {notificationClass}">
    <h1>{$notification.title}</h1>
    <p>{$notification.description}</p>
  </div>
{/if}

<style lang="sass">


</style>