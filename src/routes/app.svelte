<script lang="typescript">
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Balance from "../components/app/Balance.svelte";
  import Watchlist from "../components/app/Watchlist.svelte";
  import Assets from "../components/app/Assets.svelte";
  import LatestExchanges from "../components/app/LatestExchanges.svelte";
  import LatestTransactions from "../components/app/LatestTransactions.svelte";
  import { loggedIn } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";

  if (process.browser && !$loggedIn) goto("/");
</script>

<svelte:head>
  <title>Verto — Dashboard</title>
</svelte:head>

<NavBar />
<div class="dashboard" in:fade={{ duration: 300 }}>
  <Balance showThemeSwitcher={true} />
  <Watchlist />
  <Assets />
  <LatestExchanges />
  <LatestTransactions />
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"
  @import "../styles/general.sass"

  .dashboard
    @include page
    @include table

    @media screen and (max-width: 720px)
      padding-top: 2em

</style>
