<script lang="typescript">
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Balance from "../components/app/Balance.svelte";
  import Watchlist from "../components/app/Watchlist.svelte";
  import { watchlist } from "../stores/watchlistStore";
  import Assets from "../components/app/Assets.svelte";
  import LatestExchanges from "../components/app/LatestExchanges.svelte";
  import LatestTransactions from "../components/app/LatestTransactions.svelte";
  import { loggedIn } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";

  if (process.browser && !$loggedIn) goto("/");

  let watchlistComponent;
  let assetsComponent;
  let exchangesComponent;
  let transactionsComponent;

  function update() {
    watchlist.reload();
    watchlistComponent.update();
    assetsComponent.update();
    exchangesComponent.update();
    transactionsComponent.update();
  }
</script>

<svelte:head>
  <title>Verto — Dashboard</title>
</svelte:head>

<NavBar {update} />
<div class="dashboard" in:fade={{ duration: 300 }}>
  <Balance showThemeSwitcher={true} />
  <Watchlist bind:this={watchlistComponent} />
  <Assets bind:this={assetsComponent} />
  <LatestExchanges bind:this={exchangesComponent} />
  <LatestTransactions bind:this={transactionsComponent} />
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
