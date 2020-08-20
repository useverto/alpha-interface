<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Assets from "../components/app/Assets.svelte";
  import LatestExchanges from "../components/app/LatestExchanges.svelte";
  import LatestTransactions from "../components/app/LatestTransactions.svelte";
  import { loggedIn, address, balance } from "../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";

  if(process.browser && !$loggedIn) goto("/");

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

</script>

<svelte:head>
  <title>Verto — Dashboard</title>
</svelte:head>

<NavBar />
<div class="dashboard" in:fade={{ duration: 300 }}>
  <div class="section balance">
    {#if $balance === 0}
      <p><SkeletonLoading style="height: 1em; width: 120px" /></p>
      <h1 class="total-balance"><SkeletonLoading style="height: 1em; width: 300px" /></h1>
      <p class="wallet"><SkeletonLoading style="height: 1em; width: 400px" /></p>
    {:else}
      <p in:fade={{ duration: 150 }}>Your balance</p>
      <h1 class="total-balance" in:fade={{ duration: 150 }}>
        {roundCurrency($balance)}<span style="text-transform: uppercase; font-size: .5em; display: inline-block">Ar</span>
      </h1>
      <p class="wallet" in:fade={{ duration: 150 }}>Wallet: {$address}</p>
    {/if}
  </div>
  <Assets />
  <LatestExchanges />
  <LatestTransactions />
</div>
<Footer />

<style lang="sass">

  .dashboard
    padding: 1em 15vw 3em

    .section
      padding-bottom: 2.5em

      &:first-child
        padding-top: 3.5em

    .balance

      p
        color: rgba(#000, .3)
        text-transform: uppercase
        font-size: .9em
        margin: 0
        font-weight: 600

        &.wallet
          text-transform: none

      h1.total-balance
        font-size: 2.3em
        color: #000
        font-weight: 400
        margin: .14em 0

    h1.title
      font-size: 2.3em
      font-weight: 600

      @media screen and (max-width: 720px)
        width: 100%
        font-size: 2.01em

</style>