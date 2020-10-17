<script lang="ts">
  import { fade } from "svelte/transition";
  import { address, balance } from "../../stores/keyfileStore";
  import { theme } from "../../stores/themeStore";
  import { Theme } from "../../utils/types";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import downArrowIcon from "../../assets/down-arrow.svg";

  export let showThemeSwitcher: boolean = false;

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }
</script>

<div class="balance">
  {#if $balance === 0}
    {#if showThemeSwitcher}
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
    {/if}
    <h1 class="total-balance">
      <SkeletonLoading style="height: 1em; width: 300px" />
    </h1>
    <p class="wallet">
      <SkeletonLoading style="height: 1em; width: 400px" />
    </p>
  {:else}
    <div in:fade={{ duration: 150 }}>
      Total balance {#if showThemeSwitcher}
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
      {/if}
    </div>
    <h1 class="total-balance" in:fade={{ duration: 150 }}>
      {roundCurrency($balance)}<span style="text-transform: uppercase; font-size: .5em; display: inline-block">Ar</span>
    </h1>
    <p class="wallet" in:fade={{ duration: 150 }}>Wallet: {$address}</p>
  {/if}
</div>

<style lang="sass">

  @import "../../styles/selects.sass"

  .balance
    padding-bottom: 2.5em

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

</style>
