<script lang="ts">

  import blob1 from "../../assets/blob1.svg";
  import blob2 from "../../assets/blob2.svg";
  import Button from "../Button.svelte";

</script>

<div class="Hero">
  <div class="blobs">
    <img src={blob2} alt="blob2" class="blob blob2" draggable={false}>
    <img src={blob1} alt="blob1" class="blob blob1" draggable={false}>
  </div>
  <div class="content">
    <h1 class="welcome">Welcome to <span>coinary</span></h1>
    <p>A decentralized token exchange for <a href="https://arweave.org">Arweave</a> <br>Profit Sharing Tokens</p>
    <Button reverse={true} clear={true}>Read more</Button>
    <Button reverse={true}>Sign In</Button>
  </div>
</div>

<style lang="sass">

  .Hero
    height: 100vh
    overflow: hidden
    position: relative

    .blobs
      position: absolute
      top: 0
      bottom: 0
      left: 0
      right: 0

      .blob
        position: absolute
        user-select: none
        -webkit-user-select: none
        height: 200%
        transform: translateY(-50%)

        @media screen and (max-width: 720px)
          left: 50% !important
          transform: translate(-50%, -50%) !important

      .blob1
        left: -30%
        top: 25%

      .blob2
        left: -15%
        top: 20%

    .content
      z-index: 10
      position: absolute
      top: 50%
      left: 10%
      transform: translateY(-50%)

      @media screen and (max-width: 720px)
        left: 0
        padding: 0 1.5em

      \:global(.Button)
        margin-bottom: 10px

      h1, p
        color: #fff
        margin: 0

      h1.welcome
        font-family: "Inter", sans-serif
        font-weight: 600
        font-size: 3.2em
        margin-bottom: .6em

        @media screen and (max-width: 720px)
          font-size: 3em

        span
          background: -webkit-linear-gradient(#9300B8, #C54DFD, #E1A1FF)
          -webkit-background-clip: text
          -webkit-text-fill-color: transparent

      p
        font-size: 1.4em
        line-height: 1.5em
        margin-bottom: 1em

        @media screen and (max-width: 720px)
          font-size: 1.2em
          line-height: 1.3em

          br
            display: none
        
      a
        transition: color linear 0.1s
        color: #fff

        &:hover
          transition: color linear 0.1s
          color: #C54DFD

</style>