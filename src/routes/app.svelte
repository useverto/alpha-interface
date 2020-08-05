<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import { loggedIn, address, balance } from "../stores/keyfileStore.js";
  import moment from "moment";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";

  if(process.browser && !$loggedIn) goto("/");

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<NavBar />
<div class="dashboard" in:fade={{ duration: 300 }}>
  <div class="section balance">
    <p>Total balance</p>
    <h1 class="total-balance">
      {roundCurrency($balance)}<span style="text-transform: uppercase; font-size: .5em; display: inline-block">Ar</span><span style="vertical-align: super; font-size: .4em; color: #FF375D; font-weight: 600">(-0.01%)</span>
    </h1>
    <p class="wallet">Wallet: {$address}</p>
  </div>
  <div class="section">
    <h1 class="title">Assets</h1>
    <table>
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
  </div>
  <div class="section">
    <h1 class="title">Exchanges</h1>
    <table>
      <tr>
        <th>Timestamp</th>
        <th>Exchange</th>
        <th>Durration</th>
      </tr>
      <tr>
        <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
        <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
        <td style="text-transform: uppercase">4hrs 20min</td>
      </tr>
      <tr>
        <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
        <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status success"></span></td>
        <td style="text-transform: uppercase">4hrs 20min</td>
      </tr>
      <tr>
        <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
        <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status failure"></span></td>
        <td style="text-transform: uppercase">4hrs 20min</td>
      </tr>
      <tr>
        <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
        <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
        <td style="text-transform: uppercase">4hrs 20min</td>
      </tr>
    </table>
    <a href="/app/all-exchanges" class="view-all">View all {"->"}</a>
  </div>
  <div class="section">
    <h1 class="title">Transactions</h1>
    <table>
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
    <a href="/app/all-transactions" class="view-all">View all {"->"}</a>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"

  .dashboard
    padding: 1em 15vw 3em
    @include table

    .section
      padding-bottom: 2.5em

      a.view-all
        display: block
        text-align: center
        color: rgba(#000, .5)
        font-weight: 500
        padding: .8em 0
        transition: all .3s

        &:hover
          opacity: .7

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