<script lang="typescript">

  import Notification from "../components/Notification.svelte";
  import { loggedIn } from "../stores/keyfileStore.ts";
  import { goto, stores } from "@sapper/app";

  const { page } = stores();

  $: {
    if(process.browser) {
      if($loggedIn) {
        if($page.path === "/index" || $page.path === "/login" || $page.path === "/") goto("/app");
      }else {
        if($page.path !== "/index" || $page.path !== "/login" || $page.path !== "/") goto("/");
      }
    }
  }

</script>

<Notification />
<main>
  <slot></slot>
</main>