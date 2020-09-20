<script lang="typescript">
  import { goto } from "@sapper/app";

  import { loggedIn } from "../stores/keyfileStore.ts";
  import Button from "../components/Button.svelte";

  if (process.browser && $loggedIn) {
    console.log($loggedIn);
    goto("/app");
  }
</script>

<svelte:head>
  <title>Verto — Gate</title>
</svelte:head>

<div class="gate">
  <div class="container">
    <div class="text">
      <h1>You aren't eligible...</h1>
      <p>
        Verto is in testing and only open to early permaweb adopters right now.
      </p>
      <p>We look forward to welcoming you when you become an Arweaver.</p>
      <Button click="{() => goto('/')}">Go Back</Button>
    </div>
  </div>
</div>

<style lang="sass">
    
  .gate
    .text
      text-align: center
      width: 40%
      min-width: 300px
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
    
    h1
      font-family: "Inter", sans-serif
      font-size: 2.3em
    
    p
      font-size: 1.1em
      line-height: 2rem

</style>
