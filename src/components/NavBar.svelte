<script lang="typescript">

  import { fade } from "svelte/transition";
  import { keyfile } from "../stores/keyfileStore.js";

  export let blur: boolean = false; // blur when not scrolled ? (used only in the her, as there is a black background)
  let y: number;

  // is the user logged in ?
  $: loggedIn = ($keyfile !== null && $keyfile !== undefined && $keyfile !== "");

</script>

<svelte:window bind:scrollY={y} />
<div class="NavBar" class:scrolled={y > 20 && blur} class:hero={blur} in:fade={{ duration: 750 }}>
  <a href="/" class="title">coinary</a>
  <div class="menu">
    <a href="/">Home</a>
    <a href="/docs">Docs</a>
    {#if loggedIn}
      <a href="/app">Trade</a>
    {:else}
      <a href="/login">Sign In</a>
    {/if}
  </div>
</div>

<style lang="sass">

  .NavBar
    position: fixed
    display: flex
    align-items: center
    justify-content: space-between
    top: 0
    left: 0
    right: 0
    z-index: 1000
    background-color: transparent
    backdrop-filter: blur(0)
    -webkit-backdrop-filter: blur(0)
    border-bottom: 1px solid transparent
    padding: .5em 2em
    transition: all .3s

    a.title
      font-family: "Inter", sans-serif
      text-decoration: none
      color: #000
      font-size: 1.75em
      font-weight: 600
      margin: 0
      opacity: 0
      -webkit-tap-highlight-color: transparent

    .menu
      display: flex
      align-items: center

      a
        $sideMargin: 5px
        color: #000
        position: relative
        text-decoration: none
        font-size: 16px
        margin: 0 $sideMargin
        padding: 4px 0
        -webkit-tap-highlight-color: transparent
        cursor: pointer
        font-weight: 400
        transition: all .3s

        &::before
          content: "/"
          color: #9300B8
          margin-right: $sideMargin * 2

        &:first-child::before
          display: none

        &:hover
          color: rgba(#000, .7)

    &.hero:not(.scrolled)
      padding:
        top: 1.2em
        bottom: 1.2em

      @media screen and (max-width: 720px)
        .menu 
          a
            color: #fff

    &.scrolled
      background-color: rgba(#fff, .7)
      backdrop-filter: blur(5px)
      -webkit-backdrop-filter: blur(5px)
      border-color: rgba(#000, .075)

      a.title
        opacity: 1

</style>