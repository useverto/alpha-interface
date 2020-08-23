<script lang="typescript">

  import { fade } from "svelte/transition";
  import { loggedIn, logOut } from "../stores/keyfileStore.js";
  import { goto } from "@sapper/app";

  export let hero: boolean = false;
  let y: number;

  function _logOut (e: MouseEvent) {
    if(!process.browser) return;
    if(!$loggedIn) return;
    e.preventDefault();
    logOut();
    goto("/");
  }

</script>

<svelte:window bind:scrollY={y} />
<div class="NavBar" class:scrolled={y > 20} class:hero={hero} in:fade={{ duration: 750 }}>
  <a href={$loggedIn ? "/app" : "/"} class="title">
    <img src="/logo_light.svg" alt="v" />
    <span class="beta">alpha</span>
  </a>
  <div class="menu">
    {#if $loggedIn}
      <a href="/trade">Trade</a>
      <a href="/gallery">Posts</a>
      <a href="/tokens">Tokens</a>
      <a href="/" on:click={_logOut}>Sign Out</a>
    {:else}
      <a href="/">Home</a>
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
      -webkit-tap-highlight-color: transparent
      display: flex
      align-items: start
      transition: all .3s

      img
        height: 1em

      span.beta
        margin-left: 4px
        font-size: .3em
        color: #fff
        padding: 1px 3px
        background-color: #000
        border-radius: 2px
        text-transform: uppercase

    &.hero
      a.title
        opacity: 0

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
          color: #B075CD
          margin-right: $sideMargin * 2

        &::after
          content: ""
          position: absolute
          top: 101%
          left: $sideMargin * 4
          height: 2px
          width: 0
          opacity: 0
          background-color: #000
          transition: all .18s

          @media screen and (max-width: 720px)
            display: none

        &:first-child
        
          &::before
            display: none

          &::after
            left: 0

        &:hover

          &::after
            width: calc(100% - #{$sideMargin * 4})
            opacity: 1

          &:first-child::after
            width: 100%

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