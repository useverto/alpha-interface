<script lang="typescript">
  import { fade } from "svelte/transition";
  import Button from "../components/Button.svelte";
</script>

<!-- prettier-ignore -->
<style lang="sass">

  .NotFound
    width: 100vw
    height: 100vh
    position: relative
    background-color: #000

    .content
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
      text-align: center

      @media screen and (min-width: 720px)
        width: 60vw

      \:global(.Button)
        margin-bottom: 10px

      h1, p
        color: #fff
        text-align: center

      p
        padding: 0
        margin: 1.35em 0

      h1
        font-family: "Inter", sans-serif
        font-weight: 600
        font-size: 3em
        margin: 0

        @media screen and (max-width: 720px)
          font-size: 2.5em

        span
          background: -webkit-linear-gradient(#9300B8, #C54DFD, #E1A1FF)
          -webkit-background-clip: text
          -webkit-text-fill-color: transparent

</style>

<svelte:head>
  <title>Verto — 404</title>
  <meta name="description" content="Not Found" />
  <meta content="Verto 404" property="og:title" />
  <meta content="Not Found" property="og:description" />
  <!--<meta property="og:image" content="https://image">
  <meta name="twitter:card" content="summary_large_image">-->
  <meta name="twitter:title" content="Verto 404" />
  <meta name="twitter:description" content="Not found" />
  <!--<meta name="twitter:image" content="https://iimage">-->
</svelte:head>

<div class="NotFound">
  <div class="content" in:fade={{ duration: 750 }}>
    <h1><span>404</span> Not Found</h1>
    <p>This is not the page you're looking for.</p>
    <Button href="/" reverse={true}>Go home</Button>
  </div>
</div>
