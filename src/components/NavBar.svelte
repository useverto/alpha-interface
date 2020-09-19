<script lang="typescript">
  import { fade } from "svelte/transition";
  import { loggedIn, logOut } from "../stores/keyfileStore.ts";
  import { notification } from "../stores/notificationStore.ts";
  import { goto } from "@sapper/app";
  import tradeLogo from "../assets/nav/trade.svg";
  import tokensLogo from "../assets/nav/tokens.svg";
  import postsLogo from "../assets/nav/posts.svg";
  import logoutLogo from "../assets/nav/logout.svg";
  import Modal from "../components/Modal.svelte";
  import { NotificationType } from "../utils/types.ts";

  export let hero: boolean = false;
  let y: number;
  let confirmModalOpened: boolean = false;

  function _logOut(e?: MouseEvent) {
    if (!process.browser) return;
    if (!$loggedIn) return;
    if (e !== undefined && e.preventDefault) e.preventDefault();
    logOut();
    goto("/");
    notification.notify(
      "Logged out",
      "You've successfully logged out.",
      NotificationType.log,
      5000
    );
  }

  function mobileLogOut(e: MouseEvent) {
    if (!process.browser) return;
    if (!$loggedIn) return;
    e.preventDefault();
    confirmModalOpened = true;
  }
</script>


<svelte:window bind:scrollY="{y}" />
<div
  class="NavBar {$loggedIn ? '' : 'logged-out'}"
  class:scrolled="{y > 20}"
  class:hero
  in:fade="{{ duration: 750 }}">
  <a href="{$loggedIn ? '/app' : '/'}" class="title">
    <img src="/logo_light.svg" alt="v" />
    <span class="beta">alpha</span>
  </a>
  <div class="menu">
    {#if $loggedIn}
      <a href="/trade">Trade</a>
      <a href="/gallery">Posts</a>
      <a href="/tokens">Tokens</a>
      <a href="/" on:click="{_logOut}">Sign Out</a>
    {:else}<a href="/">Home</a> <a href="/login">Sign In</a>{/if}
  </div>
</div>
<div class="NavBarSpacer {$loggedIn ? '' : 'logged-out'}"></div>
<div class="mobile-nav">
  {#if $loggedIn}
    <a href="/trade"><img src="{tradeLogo}" alt="trade" /></a>
    <a href="/gallery"><img src="{postsLogo}" alt="gallery" /></a>
    <a href="/app"><img class="verto" src="/logo_light.svg" alt="v" /></a>
    <a href="/tokens"><img src="{tokensLogo}" alt="tokens" /></a>
    <a href="/" on:click="{mobileLogOut}"><img
        src="{logoutLogo}"
        alt="logout" /></a>
  {/if}
</div>
<Modal
  bind:opened="{confirmModalOpened}"
  confirmation="{true}"
  onConfirm="{_logOut}">
  <p style="text-align: center">Are you sure you want to log out?</p>
</Modal>

<!-- prettier-ignore -->
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

    @media screen and (max-width: 720px)
      &:not(.logged-out)
        display: none

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

  .NavBarSpacer
    width: 100%
    height: 30px

    &.logged-out
      display: none
    
    @media screen and (max-width: 720px)
      &:not(.logged-out)
        display: none

  .mobile-nav
    display: none
    position: fixed
    bottom: 0
    left: 0
    right: 0
    align-items: center
    justify-content: space-between
    z-index: 1000
    padding: .24em 2em
    background-color: rgba(#fff, .7)
    backdrop-filter: blur(5px)
    -webkit-backdrop-filter: blur(5px)
    border-top: 1px solid rgba(#000, .075)

    @media screen and (max-width: 720px)
      display: flex

    a
      color: #000
      text-decoration: none
      transition: all .3s
      -webkit-tap-highlight-color: transparent

      &:hover
        opacity: .85

      img
        height: 1.435em

        &.verto
          height: 2.17em

</style>