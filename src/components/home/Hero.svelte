<script lang="typescript">
  import { fade } from "svelte/transition";
  import * as animateScroll from "svelte-scrollto";
  import blob1 from "../../assets/blob1.svg";
  import blob2 from "../../assets/blob2.svg";
  import Button from "../Button.svelte";

  // is logged in?
  $: loggedIn = process.browser
    ? localStorage.getItem("keyfile") !== null &&
      localStorage.getItem("keyfile") !== undefined
    : false;
</script>

<!-- prettier-ignore -->
<style lang="sass">

  .Hero
    height: 100vh
    overflow: hidden
    position: relative
    top: 0
    left: 0
    right: 0
    padding-bottom: 5vh

    .content
      z-index: 10
      position: absolute
      top: 50%
      left: 10%
      transform: translateY(-50%)

      @media screen and (max-width: 720px)
        left: 50%
        width: 85vw
        overflow-x: hidden
        text-align: center
        transform: translate(-50%, -50%)

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
          &.verto-name
            background: linear-gradient(138.37deg, #E698E8 14.46%, #8D5FBC 85.54%)
            -webkit-background-clip: text
            -webkit-text-fill-color: transparent

          &.beta
            color: #000
            background-color: #fff
            font-size: .22em
            padding: 3px 7px
            border-radius: 3px
            text-transform: uppercase
            vertical-align: top

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
          color: #B075CD

    .blobs
      position: absolute
      width: 200vh

      @media screen and (max-width: 720px)
        height: 100vh
        overflow: hidden

      .blob
        position: absolute
        user-select: none
        -webkit-user-select: none

        &.blob1
          top: -60vh
          left: -10vw
          width: 70%
          animation: rotate 200s linear infinite reverse

        &.blob2
          top: -65vh
          left: -15vw
          width: 80%
          animation: rotate 180s linear infinite

      @keyframes rotate
        0%
          transform: rotate(0deg)
        100%
          transform: rotate(360deg)
</style>

<div class="Hero">
  <div class="blobs">
    <img src={blob2} alt="blob2" class="blob blob2" draggable={false} />
    <img src={blob1} alt="blob1" class="blob blob1" draggable={false} />
  </div>
  <div class="content" in:fade={{ duration: 750 }}>
    <h1 class="welcome">
      Welcome to <span class="verto-name">Verto</span><span
        class="beta">alpha</span>
    </h1>
    <p>
      A decentralized token exchange for <a href="https://arweave.org">Arweave</a>
      <br />Profit Sharing Tokens
    </p>
    <Button
      reverse={true}
      clear={true}
      click={() => animateScroll.scrollTo({ element: '#read-more' })}>
      Read more
    </Button>
    <Button reverse={true} href={loggedIn ? 'app' : 'login'}>
      Exchange now
    </Button>
  </div>
</div>
