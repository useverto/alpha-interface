<script lang="typescript">

  import Notification from "../components/Notification.svelte";
  import { notification, NotificationType } from "../stores/notificationStore.js";

  notification.notify("test", "tttttttttttttttttest", NotificationType.error)

</script>

<Notification />
<main>
  <slot></slot>
</main>