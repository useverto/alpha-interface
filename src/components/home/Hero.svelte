<script lang="ts">

  import blob1 from "../../assets/blob1.svg";

</script>

<div class="Hero">
  <div class="blobs">
    <div class="Bg"></div>
    <img src={blob1} alt="blob1">
  </div>
  <div class="content">
    <h1 class="welcome">Welcome to <span>coinary</span></h1>
    <p>A token exchange system for Arweave Profit Sharing Tokens</p>
  </div>
</div>

<style lang="sass">

  .Hero
    height: 100vh
    position: relative
    overflow: hidden

    .blobs
      position: absolute
      top: 0
      bottom: 0
      left: 0
      right: 0

      .Bg
        position: absolute
        top: 0
        bottom: 0
        background-color: #000
        width: 20vw

    .content
      z-index: 10
      position: absolute
      top: 50%
      tranform: translateY(-50%)

      h1, p
        color: #fff
        margin: 0

      h1.welcome
        font-family: "Inter", sans-serif
        font-weight: 600
        font-size: 3em
        margin-bottom: .6em

        span
          background: -webkit-linear-gradient(#9300B8, #C54DFD, #E1A1FF)
          -webkit-background-clip: text
          -webkit-text-fill-color: transparent

      p
        font-size: 1.2em

</style>