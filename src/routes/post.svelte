<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Button from "../components/Button.svelte";
  import { loggedIn, address, balance } from "../stores/keyfileStore.js";
  import { fade } from "svelte/transition";
  import { goto } from "@sapper/app";
  import SkeletonLoading from "../../components/SkeletonLoading.svelte";

  let activeMenu: string = "transactions";
  let addr: string = "";

  if(process.browser && !$loggedIn) goto("/");

  if(process.browser) {
    const params = new URLSearchParams(window.location.search);
    if(params.get("addr") === null) goto("/gallery");
    addr = params.get("addr");
  }

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

</script>

<svelte:head>
  <title>Verto — Trading Post</title>
</svelte:head>

<NavBar />
<div class="post" in:fade={{ duration: 300 }}>
  <div class="post-info">
    <div class="long-cell">
      <p>trading post address</p>
      <h1>{addr}</h1>
    </div>
    <div class="short-cell">
      <p>reputation</p>
      <h1>51.7329</h1>
    </div>
  </div>
  <div class="post-info big">
    <div class="long-cell">
      {#if $balance === 0}
        <p><SkeletonLoading style="height: 1em; width: 120px" /></p>
        <h1><SkeletonLoading style="height: 1em; width: 300px" /></h1>
      {:else}
        <p in:fade={{ duration: 150 }}>total balance</p>
        <h1 in:fade={{ duration: 150 }}>{roundCurrency($balance)}<span class="currency">AR</span><span style="vertical-align: super; color: #00D46E; font-size: .5em">(+0.75%)</span></h1>
      {/if}
    </div>
    <div class="short-cell">
      <p>total stake</p>
      <h1>{roundCurrency("80.0234")}<span class="currency">AR</span></h1>
    </div>
  </div>
  <br>
  <div class="information">
    <div class="menu">
      <button class:active={activeMenu === "transactions"} on:click={() => activeMenu = "transactions"}>Transactions</button>
      <button class:active={activeMenu === "assets"} on:click={() => activeMenu = "assets"}>Assets</button>
      <div class="trade">
        <Button href="/trade" style={"font-family: 'JetBrainsMono', monospace; text-transform: uppercase;"}>Trade now</Button>
      </div>
    </div>
    <div class="content">
      {#if activeMenu === "assets"}
        <table in:fade={{ duration: 400 }}>
          <tr>
            <th>Token</th>
            <th>Dist.</th>
            <th>Amount</th>
            <th>Value (AR)</th>
          </tr>
          <tr>
            <td style="width: 45%;">nest.land token</td>
            <td>49.43%</td>
            <td>0.00696969 <span class="currency">egg</span></td>
            <td>1.52317899</td>
          </tr>
          <tr>
            <td style="width: 45%;">Light Bulb Coin</td>
            <td>26.86%</td>
            <td>0.00413056 <span class="currency">lum</span></td>
            <td>0.82853913</td>
          </tr>
          <tr>
            <td style="width: 45%;">SoundWave Inc.</td>
            <td>16.58%</td>
            <td>0.00505455 <span class="currency">wav</span></td>
            <td>0.51124595</td>
          </tr>
          <tr>
            <td style="width: 45%;">Reddit Coin</td>
            <td>07.12%</td>
            <td>0.00240055 <span class="currency">red</span></td>
            <td>0.21954591</td>
          </tr>
        </table>
      {:else}
        <!-- the last 5 transactions for this trading post -->
        <table in:fade={{ duration: 400 }}>
          <tr>
            <th style="text-transform: none">TxID</th>
            <th>Amount</th>
            <th>Pst</th>
          </tr>
          <tr>
            <td style="width: 70%">jYKHLCGQuhQyt9uyZNXA6852CzYTu3qVYRKC6pnxIbkzDThbAgip <span class="status success"></span></td>
            <td style="width: 20%">0.00007337</td>
            <td style="text-transform: uppercase">egg</td>
          </tr>
          <tr>
            <td style="width: 70%">cHZG6U7TzXYykn8m5g6s7vpYpbRvVpthUUpgCI4r9n8AXJKD5Gs1 <span class="status pending"></span></td>
            <td style="width: 20%">0.00003450</td>
            <td style="text-transform: uppercase">wav</td>
          </tr>
          <tr>
            <td style="width: 70%">v5ty9DKrcb9Lnk3yJAdkSA9Eg5Lb6tSwr8rjJNS7Mou5eyGxRbnD <span class="status failure"></span></td>
            <td style="width: 20%">0.00000043</td>
            <td style="text-transform: uppercase">arc</td>
          </tr>
          <tr>
            <td style="width: 70%">DHy8qyXUJYA3Ygb9y7jujuvwP8eVr9MTpK8Kbl45zYIj3g5KdzgK <span class="status failure"></span></td>
            <td style="width: 20%">0.02300443</td>
            <td style="text-transform: uppercase">egg</td>
          </tr>
          <tr>
            <td style="width: 70%">vWwPCJWLbFhJ253u25zb3rvtJCB7TvPQ9cxvmQk0qICHLYKfnPgd <span class="status success"></span></td>
            <td style="width: 20%">0.00000242</td>
            <td style="text-transform: uppercase">lum</td>
          </tr>
        </table>
      {/if}
    </div>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"

  .post
    padding: 4.4em 15vw 3em

    .post-info
      display: flex
      margin-bottom: 1.6em

      @media screen and (max-width: 720px)
        display: block

      .long-cell
        width: 78%

        @media screen and (max-width: 720px)
          width: auto
          margin-bottom: 2em

      .short-cell
        width: 22%

        @media screen and (max-width: 720px)
          width: auto

      h1
        color: #000
        font-size: 1.25em
        margin: 0

        span.currency
          font-size: .6em
          text-transform: uppercase

      p
        color: rgba(#000, .3)
        font-weight: 600
        font-size: .9em
        margin: 0 0 .8em 0
        text-transform: uppercase

      &.big
        h1
          font-size: 2em

    .information
      @include table

      a.view-all
        display: block
        text-align: center
        color: rgba(#000, .5)
        font-weight: 500
        padding: .8em 0
        transition: all .3s

        &:hover
          opacity: .7

      .menu
        position: relative
        display: flex
        margin-bottom: 1.5em

        @media screen and (max-width: 720px)
          justify-content: space-between
          padding-top: 4em

        button
          position: relative
          padding: .4em 1.8em
          font-family: "JetBrainsMono", monospace
          text-transform: uppercase
          font-weight: 600
          color: #000
          background-color: transparent
          border: none
          font-size: 1.15em
          outline: none
          text-align: center
          cursor: pointer

          @media screen and (max-width: 720px)
            padding:
              left: 0
              right: 0

          &::after
            content: ""
            position: absolute
            bottom: 0
            left: 0
            width: 100%
            height: 0
            opacity: 0
            background-color: #000
            transition: all .2s

          &.active::after
            opacity: 1
            height: 3px

        .trade
          position: absolute
          right: 0
          top: 0

          @media screen and (max-width: 720px)
            right: unset
            left: 0

</style>