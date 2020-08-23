<script lang="typescript">

  import Notification from "../components/Notification.svelte";
  import { notification, NotificationType } from "../stores/notificationStore.js"

  setTimeout(() =>notification.notify('Trade error', 'There was a problem with trading!', NotificationType.warning, 50000), 200)

</script>

<Notification />
<main>
  <slot></slot>
</main>