<script lang="ts">

  import router from "page";
  import Home from "./views/Home.svelte";
  import NotFound from "./views/NotFound.svelte";

  let
    page, // the current page
    params; // params that get passed to the current page

  // describe routes here
  router("/", () => page = Home); // home route
  router("*", () => page = NotFound); // a 404 route

  router.start();

</script>

<svelte:component this={page} params={params} />