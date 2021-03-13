<script lang="typescript">
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";
  import { loggedIn } from "../stores/keyfileStore";
  import NavBar from "../components/NavBar.svelte";
  import usa from "../assets/usa.svg";
  import { fade } from "svelte/transition";

  onMount(async () => {
    const ip = await (await fetch("/loc")).json();
    const res = await (await fetch(`https://ipapi.co/${ip.ip}/json`)).json();

    if (res.country !== "US") {
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
<div class="usa" in:fade={{ duration: 400 }}>
  <div class="container">
    <div class="text">
      <h1>
        4 <img src={usa} class="emoji" draggable="false" alt="american flag" /> 3
      </h1>
      <h2>ACCESS DENIED</h2>
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
      color: var(--primary-text-color)
      font-size: 8em
      font-weight: bold
      margin-block-start: 0em
      margin-block-end: 0em
      
      @media screen and (max-width: 720px)
        font-size: 4em
    
    h2
      color: var(--primary-text-color)
      font-size: 3em
      margin-block-start: 0em

      @media screen and (max-width: 720px)
        font-size: 2.3em
    
    p
      color: var(--primary-text-color)
      font-size: 1.1em
      line-height: 2rem
  
  img.emoji
    height: 1em
    width: 1em
    margin: 0 .05em 0 .1em
    vertical-align: -0.1em

</style>
