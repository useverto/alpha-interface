<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import { balance } from "../stores/keyfileStore.ts";
  import Button from "../components/Button.svelte";
  import Modal from "../components/Modal.svelte";
  import { fade } from "svelte/transition";

  let selectedPost;
  let sendAmount: number = 1;
  let sendCurrency: string;
  let recieveCurrency: string;
  let confirmModalOpened: boolean = false;

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  // open confirmation modal
  function exchange () {
    confirmModalOpened = true;
  }

  // todo exchange logic
  function confirmTrade () {
    console.log("Confirmed trade");
  }

  function cancelTrade () {
    console.log("Cancelled trage");
  }

</script>

<svelte:head>
  <title>Verto — Trade</title>
</svelte:head>

<NavBar />
<div class="trade" in:fade={{ duration: 300 }}>
  <div class="trade-head">
    <div class="balance">
      <p>Total balance</p>
      <h1>{roundCurrency($balance)}<span>AR</span></h1>
    </div>
    <div class="recommended-post">
      <p>Recommended trading post</p>
      <select bind:value={selectedPost}>
        <option value="5483fchfe485FHJEndheUv7443434435uhjf49f">5483fchfe485FHJEndheUv7443434435uhjf49f</option>
      </select>
    </div>
  </div>
  <div class="trade-container">
    <table>
      <tr>
        <th>Token</th>
        <th>Amount</th>
      </tr>
      <tr>
        <td>nest.land token</td>
        <td>0.00696969 <span class="currency">egg</span></td>
      </tr>
      <tr>
        <td>Light Bulb Coin</td>
        <td>0.00413056 <span class="currency">lum</span></td>
      </tr>
      <tr>
        <td>SoundWave Inc.</td>
        <td>0.00505455 <span class="currency">wav</span></td>
      </tr>
      <tr>
        <td>Reddit Coin</td>
        <td>0.00240055 <span class="currency">red</span></td>
      </tr>
    </table>
    <div class="exchange">
      <p>You send</p>
      <div class="input">
        <input type="number" bind:value={sendAmount} min={0} />
        <select bind:value={sendCurrency}>
          <option value="egg">EGG</option>
        </select>
      </div>
      <p>You recieve</p>
      <div class="input">
        <input type="number" value={sendAmount * 3} disabled /><!-- logic here (calculate the exchange receive amount) -->
        <select bind:value={recieveCurrency}>
          <option value="lum">LUM</option>
        </select>
      </div>
      <p class="info">1 {sendCurrency} ~= 0.3255 {recieveCurrency}</p>
      <Button click={exchange} style={"width: 100%; padding-left: 0; padding-right: 0; font-family: 'JetBrainsMono', monospace; text-transform: uppercase;"}>EXCHANGE</Button>
    </div>
  </div>
</div>
<Modal bind:opened={confirmModalOpened} confirmation={true} onConfirm={confirmTrade} onCancel={cancelTrade}>
  <p style="text-align: center;">Exchange {sendAmount} {sendCurrency} to {recieveCurrency}</p>
</Modal>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"

  .trade
    @include table
    padding: 4em 15vw 3em

    table
      td:last-child, th:last-child
        text-align: left !important

    .trade-head
      display: flex
      justify-content: space-between
      margin-bottom: 2.65em

      @media screen and (max-width: 720px)
        display: block

      p
        color: rgba(#000, .3)
        font-weight: 600
        font-size: 1.2em
        margin: 0
        text-transform: uppercase
        margin-bottom: .5em

      .balance
        width: 40%

        @media screen and (max-width: 720px)
          width: auto
          margin-bottom: 2em

        h1
          font-size: 2.35em
          color: #000
          font-weight: 400
          margin: 0

          span
            font-size: .4em

      .recommended-post
        width: 60%

        @media screen and (max-width: 720px)
          width: auto

        select
          width: 100%

    .trade-container
      display: flex

      @media screen and (max-width: 720px)
        display: block

      table, .exchange
        width: 50%

        @media screen and (max-width: 720px)
          width: auto

      table
        padding-right: 2.5em

        @media screen and (max-width: 720px)
          padding: 0
          margin-bottom: 2em

      .exchange
        padding-left: 2.5em

        @media screen and (max-width: 720px)
          padding: 0

        p
          color: rgba(#000, .3)
          font-weight: 600
          font-size: .95em
          margin: 0
          text-transform: uppercase

          &.info
            color: #000
            font-weight: 400
            font-size: .74em
            text-transform: normal
            margin-bottom: 1.7em

        .input
          display: flex
          align-items: center
          border: 1px solid #000
          border-radius: .4em
          height: 2.35em
          margin-bottom: 1.7em
          overflow: hidden

          input
            width: 80%
            height: 100%
            border: none
            outline: none
            font-size: 1.2em
            padding: 0 .5em
            color: #000

          select
            width: 20%
            height: 100%
            border-radius: 0  

    select
      $sidePadding: .65em
      position: relative
      color: #fff
      background-color: #000
      font-size: 1em
      padding: .34em ($sidePadding * 3 + .3em) .34em $sidePadding
      cursor: pointer
      border-radius: .3em
      outline: none
      border: none
      background-image: url(/down-arrow.svg)
      background-position: calc(100% - #{$sidePadding}) center
      background-repeat: no-repeat
      background-size: $sidePadding * 1.35
      -webkit-appearance: none
      -moz-appearance: none
      transition: all .3s

      &:hover
        opacity: .8

</style>