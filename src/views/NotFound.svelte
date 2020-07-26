<script lang="ts">

  import Button from "../components/Button.svelte";

</script>

<div class="NotFound">
  <div class="content">
    <h1><span>404</span> Not Found</h1>
    <p>This is not the page you're looking for.</p>
    <Button href="/" reverse={true}>Go home</Button>
    <Button href="/docs" reverse={true} clear={true}>View docs</Button>
  </div>
</div>

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

      \:global(.Button)
        margin-bottom: 10px

      h1, p
        color: #fff
        text-align: center

      h1
        font-family: "Inter", sans-serif
        font-weight: 600
        font-size: 3em

        @media screen and (max-width: 720px)
          font-size: 2.5em

        span
          background: -webkit-linear-gradient(#9300B8, #C54DFD, #E1A1FF)
          -webkit-background-clip: text
          -webkit-text-fill-color: transparent

</style>