<script lang="typescript">
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Watchlist from "../components/app/Watchlist.svelte";
  import Assets from "../components/app/Assets.svelte";
  import LatestExchanges from "../components/app/LatestExchanges.svelte";
  import LatestTransactions from "../components/app/LatestTransactions.svelte";
  import { loggedIn, address, balance } from "../stores/keyfileStore";
  import { theme } from "../stores/themeStore";
  import { Theme } from "../utils/types";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";
  import downArrowIcon from "../assets/down-arrow.svg";

  if (process.browser && !$loggedIn) goto("/");

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
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
      <div>
        <SkeletonLoading style="height: 1em; width: 120px" />
        <div class="select-container">
          <select class="theme-picker" bind:value={$theme}>
            {#each Object.values(Theme) as themeOption}
              <option value={themeOption}>{themeOption}</option>
            {/each}
          </select>
          <object
            data={downArrowIcon}
            type="image/svg+xml"
            title="select-icon" />
        </div>
      </div>
      <h1 class="total-balance">
        <SkeletonLoading style="height: 1em; width: 300px" />
      </h1>
      <p class="wallet">
        <SkeletonLoading style="height: 1em; width: 400px" />
      </p>
    {:else}
      <div in:fade={{ duration: 150 }}>
        Your balance
        <div class="select-container">
          <select class="theme-picker" bind:value={$theme}>
            {#each Object.values(Theme) as themeOption}
              <option value={themeOption}>{themeOption}</option>
            {/each}
          </select>
          <object
            data={downArrowIcon}
            type="image/svg+xml"
            title="select-icon" />
        </div>
      </div>
      <h1 class="total-balance" in:fade={{ duration: 150 }}>
        {roundCurrency($balance)}<span style="text-transform: uppercase; font-size: .5em; display: inline-block">Ar</span>
      </h1>
      <p class="wallet" in:fade={{ duration: 150 }}>Wallet: {$address}</p>
    {/if}
  </div>
  <Watchlist />
  <Assets />
  <LatestExchanges />
  <LatestTransactions />
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"
  @import "../styles/general.sass"
  @import "../styles/selects.sass"

  .dashboard
    @include page
    @include table

    @media screen and (max-width: 720px)
      padding-top: 2em

    .section
      padding-bottom: 2.5em

    .balance
      p, div
        display: flex
        align-items: center
        justify-content: space-between
        color: var(--secondary-text-color)
        text-transform: uppercase
        font-size: .9em
        margin: 0
        font-weight: 600

        .select-container
          display: inline-block

        &.wallet
          text-transform: none

      h1.total-balance
        font-size: 2.3em
        color: var(--primary-text-color)
        font-weight: 400
        margin: .14em 0

      @media screen and (max-width: 720px)
        padding-top: .65em !important

    h1.title
      font-size: 2.3em
      font-weight: 600

      @media screen and (max-width: 720px)
        width: 100%
        font-size: 2.01em

</style>
