<script lang="typescript">
  import { loggedIn, keyfile } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { notification } from "../stores/notificationStore";
  import { NotificationType } from "../utils/types";
  import Verto from "@verto/lib";
  import { onMount } from "svelte";

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";

  // @ts-ignore
  if (process.browser && !$loggedIn) goto("/");

  // TODO(@johnletey): Figure out why `window` is undefined.

  // // @ts-ignore
  // const hasMetaMask: boolean = typeof window.ethereum !== "undefined";
  // if (!hasMetaMask) {
  //   notification.notify(
  //     "Warning",
  //     "MetaMask is required for swapping. Consider installing it.",
  //     NotificationType.warning,
  //     10000
  //   );
  // }

  let client = new Verto();

  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
  });
</script>

<svelte:head>
  <title>Verto — Swap</title>
</svelte:head>

<NavBar />
<div class="swap" />
<Footer />
