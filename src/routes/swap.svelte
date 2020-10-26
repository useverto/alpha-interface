<script lang="typescript">
  import { loggedIn, keyfile } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { SwapMode } from "../utils/types";
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
  let connected: boolean = true;
  let client = new Verto();
  let swapMode: SwapMode = SwapMode.CHAIN;
  let sendAmount: number = 0.01;
  let rate: number = 0.01;
  let receive: number = 0.001; //TODO john

  let switchSwap = () =>
    (swapMode = swapMode === SwapMode.AR ? SwapMode.CHAIN : SwapMode.AR);

  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
    // @ts-ignore
    hasMetaMask = typeof window.ethereum !== "undefined";
    if (hasMetaMask) {
      // @ts-ignore
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length == 0) connected = false;
    }
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
        <img src={switchIcon} alt="switch-icon" />
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
          <div class="select-container">
            <select>
              <option value="ETH">ETH</option>
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
              title="down-icon" />
          </div>
        </div>
      </div>
      <div class="switch-icon" on:click={switchSwap}>
        <img src={switchIcon} alt="switch-icon" />
      </div>
      <div class="input">
        <p class="label">You receive</p>
        <div class="input-wrapper">
          <input
            type="number"
            step={1}
            pattern="\d+"
            bind:value={receive}
            min={0.000001}
            disabled />
          <select class="fake-select" style="opacity: 1 !important" disabled>
            <option>AR</option>
          </select>
        </div>
      </div>
    </div>
  {/if}
  {#if hasMetaMask}
    <div class="swap-interact">
      {#if connected}
        <Button
          click={() => {}}
          style="font-family: 'JetBrainsMono', monospace; text-transform: uppercase; display: block;">
          Swap
        </Button>
      {:else}
        <Button
          click={async () => {
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts',
            });
            if (accounts.length > 0) connected = true;
          }}
          style="font-family: 'JetBrainsMono', monospace; text-transform: uppercase; display: block;">
          Connect
        </Button>
      {/if}
    </div>
  {:else}
    <div class="swap-interact">
      <Button
        disabled
        style="font-family: 'JetBrainsMono', monospace; text-transform: uppercase; display: block;">
        Install MetaMask
      </Button>
    </div>
  {/if}
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

        img
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

        &:hover img
          opacity: .75
          // we already have an invert filter for the img tag here, so we don't need to use css variables for the border color
          border-color: #000

    .swap-interact
      margin: 0 auto
      width: 42%

      @media screen and (max-width: 720px)
        width: 100%

</style>
