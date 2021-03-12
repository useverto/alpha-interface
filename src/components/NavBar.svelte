<script lang="typescript">
  import { fade } from "svelte/transition";
  import { address, logOut } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import swapIcon from "../assets/nav/swap.svg";
  import tokensIcon from "../assets/nav/tokens.svg";
  import chatIcon from "../assets/nav/chat.svg";
  import signoutIcon from "../assets/nav/signout.svg";
  import { DisplayTheme } from "../utils/types";
  import { displayTheme } from "../stores/themeStore";
  import { onMount } from "svelte";

  let hasWallet: boolean = false;
  let connected: boolean = false;
  let wallet: string = "";
  let windowWidth = 0;

  export let hero: boolean = false;
  export let update: Function = null;

  let y: number;
  let navHeight: number = 0;

  onMount(() => {
    // @ts-ignore
    if (window.arweaveWallet) {
      tryToConnect();
    } else {
      addEventListener("arweaveWalletLoaded", tryToConnect);
    }
  });

  async function tryToConnect() {
    hasWallet = true;
    // @ts-ignore
    const permissions = await window.arweaveWallet.getPermissions();
    if (
      permissions.indexOf("ACCESS_ADDRESS") > -1 &&
      permissions.indexOf("ACCESS_ALL_ADDRESSES") > -1 &&
      permissions.indexOf("SIGN_TRANSACTION") > -1
    ) {
      connected = true;

      // @ts-ignore
      const address = await window.arweaveWallet.getActiveAddress();
      // @ts-ignore
      const names = await window.arweaveWallet.getWalletNames();
      wallet = names[address];
    }
  }
</script>

<svelte:window bind:scrollY={y} />
<div
  class="NavBar {connected ? '' : 'logged-out'}"
  class:scrolled={y > 20}
  class:hero
  bind:clientHeight={navHeight}
  in:fade={{ duration: 750 }}
  style="--profiles-color: {$displayTheme === DisplayTheme.Dark ? 'unset' : 'invert(45%)'};">
  <a href={connected ? '/app' : '/'} class="title">
    <img
      src={$displayTheme === DisplayTheme.Dark ? '/logo_dark.svg' : '/logo_light.svg'}
      alt="v" />
    <span class="beta">alpha</span>
  </a>
  <div class="menu">
    {#if connected}
      <a href="/swap">Swap</a>
      <a href="/tokens">Tokens</a>
      <a href="/" on:click={logOut} class="signout">
        {wallet}
        <div class="tooltip">Click to sign out</div>
      </a>
    {:else}
      <a href="/tokens">Tokens</a>
      <a
        target="_blank"
        href={hasWallet ? '' : 'https://chrome.google.com/webstore/detail/arconnect/einnioafmpimabjcddiinlhmijaionap'}
        on:click={async () => {
          await window.arweaveWallet.connect([
            'ACCESS_ADDRESS',
            'ACCESS_ALL_ADDRESSES',
            'SIGN_TRANSACTION',
          ]);
          connected = true;
          address.sync();
          goto('/app');
        }}>{hasWallet ? 'Connect' : 'Install ArConnect'}</a>
    {/if}
  </div>
</div>
<div
  class="NavBarSpacer {connected ? '' : 'logged-out'}"
  style="height: {navHeight}px" />
<div class="mobile-nav">
  {#if connected}
    <a href="/swap"><object
        data={swapIcon}
        type="image/svg+xml"
        title="nav-icon" /></a>
    <a href="/tokens"><object
        data={tokensIcon}
        type="image/svg+xml"
        title="nav-icon" /></a>
    <a href="/app"><img
        class="verto"
        src={$displayTheme === DisplayTheme.Dark ? '/logo_dark.svg' : '/logo_light.svg'}
        alt="v" /></a>
    <a href="/chat"><object
        data={chatIcon}
        type="image/svg+xml"
        title="nav-icon" /></a>
    <a href="/" on:click={logOut}><object
        data={signoutIcon}
        type="image/svg+xml"
        title="nav-icon" /></a>
  {/if}
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

    @media screen and (max-width: 720px)
      &:not(.logged-out)
        display: none

    a.title
      font-family: "Inter", sans-serif
      text-decoration: none
      color: var(--primary-text-color)
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
        color: var(--background-color)
        padding: 1px 3px
        background-color: var(--inverted-elements-color)
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
        color: var(--primary-text-color)
        position: relative
        text-decoration: none
        font-size: 16px
        margin: 0 $sideMargin
        padding: 4px 0
        -webkit-tap-highlight-color: transparent
        cursor: pointer
        font-weight: 400
        transition: all .3s

        &.profiles
          position: relative
          display: flex
          align-items: center
          justify-content: space-between

          object
            filter: var(--profiles-color)
            pointer-events: none
            height: .45em
            margin-left: .45em

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
          background-color: var(--inverted-elements-color)
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
            color: var(--background-color)

    &.scrolled
      background-color: var(--nav-scrolled)
      backdrop-filter: blur(5px)
      -webkit-backdrop-filter: blur(5px)
      border-color: var(--nav-border)

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

  .mobile-switcher-bg
    position: fixed
    z-index: 950
    background-color: rgba(0, 0, 0, .3)
    top: 0
    left: 0
    right: 0
    bottom: 0

  .profile-switcher
    position: fixed
    right: 2em
    top: 4em
    background-color: var(--nav-scrolled)
    backdrop-filter: blur(5px)
    -webkit-backdrop-filter: blur(5px)
    border-radius: 6px
    z-index: 1000
    border: 1px solid var(--profile-border)
    overflow: hidden

    @media screen and (max-width: 720px)
      top: unset
      left: .6em
      right: .6em
      border-bottom-left-radius: 0
      border-bottom-right-radius: 0

    .profile
      position: relative
      display: flex
      justify-content: space-between
      align-items: center
      padding: .7em .28em
      transition: all .3s

      &::after
        content: ''
        position: absolute
        top: 0
        left: 0
        right: 0
        bottom: 0
        background-color: var(--background-color)
        opacity: 0
        z-index: -1
        transition: all .3s

      &:hover::after
        opacity: .55

      button
        background-color: transparent
        outline: none
        border: none
        cursor: pointer
        transition: all .3s

        @media screen and (max-width: 720px)
          user-select: none
          -moz-user-select: none
          -webkit-user-select: none

        &:hover
          opacity: .75

        &.address
          color: var(--primary-text-color)
          font-size: .9em
          width: 22vw
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

          @media screen and (max-width: 720px)
            width: 90%

        &.remove
          margin-left: .8em

          object
            filter: var(--svg-color)
            pointer-events: none

    button.action
      display: flex
      align-items: center
      justify-content: center
      width: 100%
      text-align: center
      border: none
      outline: none
      background-color: transparent
      color: var(--primary-text-color)
      cursor: pointer
      font-size: 1em
      padding: .7em 0
      transition: all .3s

      @media screen and (max-width: 720px)
        user-select: none
        -moz-user-select: none
        -webkit-user-select: none

      &.sign-out
        border-top: 1px solid var(--profile-border)
        padding: .35em 0

      &:hover
        background-color: var(--nav-scrolled)
        opacity: .75

      object
        filter: var(--svg-color)
        pointer-events: none
        margin-right: .38em
        height: .73em

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
    background-color: var(--nav-scrolled)
    backdrop-filter: blur(5px)
    -webkit-backdrop-filter: blur(5px)
    border-top: 1px solid var(--nav-border)

    @media screen and (max-width: 720px)
      display: flex

    a
      color: var(--primary-text-color)
      text-decoration: none
      transition: all .3s
      -webkit-tap-highlight-color: transparent

      &:hover
        opacity: .85

      object
        filter: var(--svg-color)
        pointer-events: none

      object, img
        height: 1.435em

        &.verto
          height: 2.17em

  .signout
    position: relative

    .tooltip
      $borderRadius: 6.5px
      position: absolute
      top: 140%
      right: 50%
      background-color: var(--inverted-elements-color)
      color: var(--background-color)
      border-radius: $borderRadius
      font-size: 1em
      font-weight: 500
      font-family: "Inter", sans-serif
      padding: .2em .37em
      opacity: 0
      display: none
      width: max-content
      transition: all .23s ease-in-out

      &::after
        content: ""
        position: absolute
        bottom: 100%
        right: $borderRadius
        margin-left: -5px
        border-width: 5px
        border-style: solid
        border-color: transparent transparent var(--inverted-elements-color) transparent

    &:hover .tooltip
      opacity: 1
      display: block

</style>
