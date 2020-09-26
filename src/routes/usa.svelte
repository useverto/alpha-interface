<script lang="typescript">
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";
  import { loggedIn } from "../stores/keyfileStore";
  import NavBar from "../components/NavBar.svelte";

  onMount(async () => {
    const res = await (await fetch("http://ip-api.com/json")).json();

    if (res.countryCode !== "US") {
      goto("/app");
    }

    if (!$loggedIn) {
      goto("/");
    }
  });
</script>

<svelte:head>
  <title>Verto — USA</title>
</svelte:head>

<NavBar />
<div class="usa">
  <div class="container">
    <div class="text">
      <h1>
        <img
          src="https://twemoji.maxcdn.com/v/latest/svg/1f44b.svg"
          class="emoji"
          draggable="false" />
        <img
          src="https://twemoji.maxcdn.com/v/latest/svg/1f1fa-1f1f8.svg"
          class="emoji"
          draggable="false" />
      </h1>
      <p>Looks like you're in the US.</p>
      <p>At the moment, we unfortunately can't allow trading from the US.</p>
    </div>
  </div>
</div>

<style lang="sass">
    
  .usa
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
  
  img.emoji
    height: 1em
    width: 1em
    margin: 0 .05em 0 .1em
    vertical-align: -0.1em

</style>
