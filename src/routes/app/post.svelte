<script lang="typescript">

  import NavBar from "../../components/NavBar.svelte";
  import Footer from "../../components/Footer.svelte";
  import { userinfo } from "../../stores/userStore.js";

  function roundCurrency (val: number | string): string {
    if(typeof val === "string") val = parseFloat(val)
    return val.toFixed(5)
  }

</script>

<svelte:head>
  <title>Post</title>
</svelte:head>

<NavBar showLogout={true} />
<div class="post">
  <div class="post-info">
    <div class="long-cell">
      <p>trading post address</p>
      <h1>{$userinfo.address}</h1>
    </div>
    <div class="short-cell">
      <p>reputation</p>
      <h1>51.7329</h1>
    </div>
  </div>
  <div class="post-info big">
    <div class="long-cell">
      <p>total balance</p>
      <h1>{roundCurrency($userinfo.balance)}<span class="currency">AR</span><span style="vertical-align: super; color: #00D46E; font-size: .5em">(+0.75%)</span></h1>
    </div>
    <div class="short-cell">
      <p>total stake</p>
      <h1>{roundCurrency("80.0234")}<span class="currency">AR</span></h1>
    </div>
  </div>
</div>
<Footer />

<style lang="sass">

  .post
    padding: 3em 15vw

    .post-info
      display: flex
      margin-bottom: 1.6em

      .long-cell
        width: 78%

      .short-cell
        width: 22%

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

</style>