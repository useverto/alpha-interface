<script lang="typescript">
  import { loggedIn, keyfile } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { notification } from "../stores/notificationStore";
  import { NotificationType, SwapMode } from "../utils/types";
  import Verto from "@verto/lib";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Balance from "../components/app/Balance.svelte";
  import switchIcon from "../assets/switch.svg";
  import downArrowIcon from "../assets/down-arrow.svg";
  import Button from "../components/Button.svelte";

  // @ts-ignore
  if (process.browser && !$loggedIn) goto("/");

  let hasMetaMask: boolean = true;
  let client = new Verto();
  let swapMode: SwapMode = SwapMode.AR;
  let sendAmount: number = 0.01;
  let rate: number = 0.01;

  let switchSwap = () =>
    (swapMode = swapMode === SwapMode.AR ? SwapMode.CHAIN : SwapMode.AR);

  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
    // @ts-ignore
    hasMetaMask = typeof window.ethereum !== "undefined";
  });

  function update() {
    client = new Verto(JSON.parse($keyfile));
  }
</script>

<svelte:head>
  <title>Verto — Swap</title>
</svelte:head>

<NavBar {update} />
<div class="swap">
  <Balance />
  {#if swapMode === SwapMode.AR}
    <div class="swap-container" in:fade={{ duration: 280 }}>
      <div class="input">
        <p class="label">You send</p>
        <div class="input-wrapper">
          <input
            type="number"
            step={1}
            pattern="\d+"
            bind:value={sendAmount}
            min={0.000001} />
          <select class="fake-select" style="opacity: 1 !important" disabled>
            <option>AR</option>
          </select>
        </div>
      </div>
      <div class="switch-icon" on:click={switchSwap}>
        <object data={switchIcon} type="image/svg+xml" title="switch-icon" />
      </div>
      <div class="input">
        <p class="label">Rate</p>
        <div class="input-wrapper">
          <input
            type="number"
            step={1}
            pattern="\d+"
            bind:value={rate}
            min={0.000001} />
          <div class="select-container">
            <select>
              <option value="ETH">ETH/AR</option>
            </select>
            <!-- TODO: john -->
            <!--
              <select bind:value={chainOrSomethin??}>
                // chains
              </select>
            -->
            <object
              data={downArrowIcon}
              type="image/svg+xml"
              title="select-icon" />
          </div>
        </div>
      </div>
    </div>
  {:else if swapMode === SwapMode.CHAIN}
    <div class="swap-container" in:fade={{ duration: 280 }} />
  {/if}
  <div class="swap-interact">
    <Button
      click={() => {}}
      style="font-family: 'JetBrainsMono', monospace; text-transform: uppercase; display: block;">
      Swap
    </Button>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"
  @import "../styles/general.sass"
  @import "../styles/selects.sass"
  
  .swap
    +table
    +page

    .swap-container
      margin: 0 auto
      width: 42%
      margin-bottom: 2em

      @media screen and (max-width: 720px)
        width: 100%

      .input
        +input
        
        p.label
          margin-top: 0

        .input-wrapper
          @media screen and (max-width: 720px)
            select, .select-container
              width: 45% !important

              select
                width: 100% !important

          .select-container
            select
              height: 100%

      .switch-icon
        $iconSize: 1.4em
        display: flex
        padding:
          top: .6em
          right: calc(15% - #{$iconSize})
        margin-bottom: -.6em
        cursor: pointer

        object
          margin-left: auto
          height: $iconSize
          width: $iconSize
          padding: .16em
          border-radius: 100%
          filter: var(--svg-color)
          border: 2px solid transparent
          user-select: none
          -moz-user-select: none
          -webkit-user-select: none
          transition: all .3s

        &:hover object
          opacity: .75
          // we need to leave this black, even on dark theme, cuz we are already invertin it above with "filter: var(--svg-color)"
          border-color: #000

    .swap-interact
      margin: 0 auto
      width: 42%

      @media screen and (max-width: 720px)
        width: 100%

</style>
