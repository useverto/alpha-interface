<script lang="typescript">

  import NavBar from "../../components/NavBar.svelte";
  import Footer from "../../components/Footer.svelte";
  import { balance } from "../../stores/keyfileStore.js";

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

</script>

<svelte:head>
  <title>Trade</title>
</svelte:head>

<NavBar />
<div class="trade">
  <div class="trade-head">
    <div class="balance">
      <p>Total balance</p>
      <h1>{roundCurrency($balance)}<span>AR</span></h1>
    </div>
    <div class="recommended-post">
      <p>Recommended trading post</p>
      <select>
        <option value="5483fchfe485FHJEndheUv7443434435uhjf49f">5483fchfe485FHJEndheUv7443434435uhjf49f</option>
      </select>
    </div>
  </div>
</div>
<Footer />

<style lang="sass">

  .trade
    padding: 4em 15vw 3em

    .trade-head
      display: flex
      justify-content: space-between

      p
        color: rgba(#000, .3)
        font-weight: 600
        font-size: 1.2em
        margin: 0
        text-transform: uppercase
        margin-bottom: .5em

      .balance
        h1
          font-size: 2.35em
          color: #000
          font-weight: 400
          margin: 0

          span
            font-size: .4em

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
        opacity: .85

</style>