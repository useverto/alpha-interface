<script lang="ts">

  import keyfileSVG from "../assets/keyfile.svg";
  import stroke from "../assets/stroke.svg";
  import { fade } from "svelte/transition";

  let isDragOver = false;
  let files: FileList = [];

  $: {
    if(files[0] !== null && files[0] !== undefined && files[0].type === "application/json") console.log("File uploaded", files[0]); // TODO: login mechanism   
  }

  function drop () {
    isDragOver = false;  
  }
  function drag () {
    isDragOver = true;
  } 

</script>

<input type="file" class="FileInput" class:default={!isDragOver} accept=".json,application/json" on:drop={drop} on:dragover={drag} on:dragleave={drop} bind:files>
{#if isDragOver}
  <div class="drag-overlay" in:fade={{ duration: 350 }} out:fade={{ duration: 160 }}>
    <h1>Drop your file here</h1>
  </div>
{/if}
<div class="Login">
  <div class="instructions">
    <div class="content">
      <h1>Sign in to <span>coinary</span></h1>
      <p>To sign in, just drag and drop your Arweave Key file on this page. <br><br>If you don’t yet have a key file, you can get one by creating an <a href="https://www.arweave.org/wallet">Arweave Wallet</a>.</p>
      <p class="notice">Your Arweave Key file does not leave your system.</p>
    </div>
  </div>
  <div class="arweave-login">
    <img src={stroke} alt="stroke" class="Stroke" draggable={false}>
    <img src={keyfileSVG} alt="keyfile" class="Keyfile" draggable={false}>
  </div>
</div>

<style lang="sass">

  =fixedFull()
    position: fixed
    top: 0
    bottom: 0
    left: 0
    right: 0
    width: 100vw
    height: 100vh

  .FileInput
    +fixedFull()
    opacity: 0
    z-index: 1000

    &.default
      width: 50vw
      left: unset
      right: 0

  .drag-overlay
    +fixedFull()
    z-index: 900
    background-color: rgba(#000, .67)

    h1
      font-family: "Inter", sans-serif
      font-size: 2.3em
      color: #fff
      font-weight: 400
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)

  .Login
    height: 100vh
    background-color: #000
    display: flex

    .instructions, .arweave-login
      position: relative
      width: 50vw
      height: 100%

      .content
        position: absolute
        width: 80%

    .instructions
      background-color: #121212

      .content
        top: 50%
        left: 50%
        transform: translate(-50%, -50%)

        h1
          font-family: "Inter", sans-serif
          font-weight: 600
          color: #fff
          text-align: center
          font-size: 2.5em
          margin-bottom: 1.8em

          span
            background: -webkit-linear-gradient(#9300B8, #C54DFD, #E1A1FF)
            -webkit-background-clip: text
            -webkit-text-fill-color: transparent

        p
          font-size: 1.4em
          line-height: 2rem
          text-align: justify
          color: #fff

        p.notice
          font-size: .75em
          color: #828282
          margin-top: 4em
          text-align: center

    .arweave-login
      .Keyfile
        position: absolute
        width: 5em
        top: 50%
        left: 50%
        transform: translate(-50%, -50%)

      .Stroke
        position: absolute
        width: 30vw
        top: 50%
        left: 50%
        transform: translate(-50%, -50%)

</style>