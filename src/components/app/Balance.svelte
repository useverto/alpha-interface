<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { address, balance } from "../../stores/keyfileStore";
  import { theme } from "../../stores/themeStore";
  import { Theme } from "../../utils/types";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import { notification } from "../../stores/notificationStore";
  import { NotificationType } from "../../utils/types";
  import downArrowIcon from "../../assets/down-arrow.svg";
  import copyIcon from "../../assets/copy.svg";

  export let showThemeSwitcher: boolean = false;

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  function copyAddress() {
    const copyElement = document.createElement("textarea");
    copyElement.style.opacity = "0";
    copyElement.value = $address;

    document.body.appendChild(copyElement);
    copyElement.select();
    document.execCommand("copy");
    document.body.removeChild(copyElement);
    notification.notify(
      "Copied",
      "Copied address to clipboard",
      NotificationType.log,
      1000
    );
  }
</script>

<div class="balance">
  {#if $balance === null}
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
    <p class="wallet" in:fade={{ duration: 150 }}>
      Wallet: {$address}<img
        src={copyIcon}
        alt="copy-address"
        on:click={copyAddress} />
    </p>
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
        justify-content: normal

        img
          height: .97em
          filter: var(--svg-color)
          margin-left: .56em
          cursor: pointer
          transition: all .3s

          &:hover
            opacity: .7
        
        @media screen and (max-width: 720px)
          overflow-wrap: anywhere
          max-width: 90vw

    h1.total-balance
      font-size: 2.3em
      color: var(--primary-text-color)
      font-weight: 400
      margin: .14em 0

    @media screen and (max-width: 720px)
      padding-top: .65em !important

</style>
