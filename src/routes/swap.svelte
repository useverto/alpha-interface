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

  // @ts-ignore
  if (process.browser && !$loggedIn) goto("/");

  let hasMetaMask: boolean = true;
  let client = new Verto();
  let swapMode: SwapMode = SwapMode.AR;
  let sendAmount: number = 0.01;
  let rate: number = 0.01;

  let switchSwap = () =>
    swapMode === SwapMode.AR ? SwapMode.CHAIN : SwapMode.AR;

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

      @media screen and (max-width: 720px)
        width: 100%

      .input
        +input
        
        p.label
          margin-top: 0

        .input-wrapper
          .select-container
            select
              height: 100%

      .switch-icon
        display: flex
        padding-top: .6em
        margin-bottom: -.6em
        cursor: pointer

        object
          margin-left: auto
          height: 1.4em
          width: 1.4em
          padding: .16em
          border-radius: 100%
          filter: var(--svg-color)
          border: 2px solid transparent
          transition: all .3s

        &:hover object
          opacity: .75
          // we need to leave this black, even on dark theme, cuz we are already invertin it above with "filter: var(--svg-color)"
          border-color: #000

</style>
