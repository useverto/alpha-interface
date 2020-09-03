<script lang="typescript">
  import { loggedIn, logOut } from "../stores/keyfileStore.js";
  import {
    notification,
    NotificationType,
  } from "../stores/notificationStore.js";
  import { goto } from "@sapper/app";
  import Button from "../components/Button.svelte";

  function _logOut() {
    if (!process.browser) return;
    if (!$loggedIn) return;
    logOut();
    goto("/");
    notification.notify(
      "Logged out",
      "You've successfully logged out.",
      NotificationType.log,
      5000
    );
  }
</script>

<style lang="sass">
    
  .gate
    .container
      .text   
        padding-top: 40vh

        h1
          margin: 0
          padding: 20px

        p
          width: 80%
        
      .pepe
        float: left
        height: 100vh
        margin-right: 20px

</style>

<svelte:head>
  <title>Verto — Gate</title>
</svelte:head>

<div class="gate">
  <div class="container">
    <img
      class="pepe"
      src="https://cdn.discordapp.com/attachments/712648360666071090/747279025944133723/unknown.png"
      alt="pepe arweaver" />
    <div class="text">
      <h1>You aren't eligible...</h1>
      <p>
        You must submit at least one data transaction to Arweave in order to be
        eligible to use Verto!
      </p>
      <Button click={_logOut}>Sign Out</Button>
    </div>
  </div>
</div>
