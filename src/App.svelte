<script lang="ts">

  import router from "page";
  import Home from "./views/Home.svelte";
  import LogIn from "./views/LogIn.svelte";
  import NotFound from "./views/NotFound.svelte";

  let
    page, // the current page
    params; // params that get passed to the current page

  router("/", () => page = Home);
  router("/login", () => page = LogIn);
  router("*", () => page = NotFound); // a 404 route

  router.start();

</script>

<svelte:component this={page} params={params} />