<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import LatestTransactions from "../components/app/LatestTransactions.svelte";
  import { loggedIn, address, balance } from "../stores/keyfileStore.ts";
  import moment from "moment";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { and, equals } from "arql-ops";
  import { roundCurrency } from "../utils.ts";

  let client;

  if(process.browser && !$loggedIn) goto("/");

</script>

<svelte:head>
  <title>Verto — Dashboard</title>
</svelte:head>

<NavBar />
<div class="dashboard" in:fade={{ duration: 300 }}>
  <div class="section balance">
    <p>Total balance</p>
    <h1 class="total-balance">
      {roundCurrency($balance)}<span style="text-transform: uppercase; font-size: .5em; display: inline-block">Ar</span>
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
        <th>Duration</th>
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
  <LatestTransactions />
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