<script lang="typescript">
  import { fade, fly } from "svelte/transition";
  import {
    address,
    loggedIn,
    logOut,
    profiles,
    keyfile,
  } from "../stores/keyfileStore";
  import { notification } from "../stores/notificationStore";
  import { goto } from "@sapper/app";
  import tradeLogo from "../assets/nav/trade.svg";
  import tokensLogo from "../assets/nav/tokens.svg";
  import postsLogo from "../assets/nav/posts.svg";
  import peopleLogo from "../assets/nav/people.svg";
  import { NotificationType, DisplayTheme } from "../utils/types";
  import { displayTheme } from "../stores/themeStore";
  import downArrow from "../assets/down-arrow.svg";
  import closeIcon from "../assets/close.svg";
  import addIcon from "../assets/add.svg";
  import { getSetting } from "../utils/settings";
  import { onDestroy, onMount } from "svelte";

  export let hero: boolean = false;
  export let update: Function = null;

  let y: number;
  let showProfileSwitcher: boolean = false;
  let navHeight: number = 0;
  let mobileHeight: number = 0;
  let mobile: boolean = false;
  let mediaWatch;

  $: switchMobile = () =>
    (mobile = mediaWatch === undefined ? false : mediaWatch.matches);

  onMount(() => {
    mobile = window.innerWidth <= 720;
    mediaWatch = window.matchMedia("(max-width: 720px)");
    mediaWatch.addListener(switchMobile);
  });

  onDestroy(() => {
    if (mediaWatch === undefined) return;
    mediaWatch.removeListener(switchMobile);
  });

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

  function switchKeyfile(_address: string) {
    if ($address === _address) return;
    const profileData = $profiles.filter(
      (prof) => prof.address === _address
    )[0];

    keyfile.set(profileData.keyfile);
    address.set(profileData.address);
    if (update !== null) update();
    // update the users tokens, used by the library
    localStorage.setItem(
      "tokens",
      JSON.stringify(
        getSetting("tokens", $address) !== undefined
          ? getSetting("tokens", $address)
          : []
      )
    );
    if (mobile) showProfileSwitcher = false;
    notification.notify(
      "Success",
      "Switched profile.",
      NotificationType.success,
      5000
    );
  }

  function removeKeyfile(_address: string) {
    profiles.removeKeyfile(_address);
    if ($address === _address) switchKeyfile($profiles[0].address);
  }
</script>

<svelte:window bind:scrollY={y} />
<div
  class="NavBar {$loggedIn ? '' : 'logged-out'}"
  class:scrolled={y > 20}
  class:hero
  bind:clientHeight={navHeight}
  in:fade={{ duration: 750 }}
  style="--profiles-color: {$displayTheme === DisplayTheme.Dark ? 'unset' : 'invert(45%)'};">
  <a href={$loggedIn ? '/app' : '/'} class="title">
    <img
      src={$displayTheme === DisplayTheme.Dark ? '/logo_dark.svg' : '/logo_light.svg'}
      alt="v" />
    <span class="beta">alpha</span>
  </a>
  <div class="menu">
    {#if $loggedIn}
      <a href="/trade">Trade</a>
      <a href="/gallery">Posts</a>
      <a href="/tokens">Tokens</a>
      <a
        href="/"
        class="profiles"
        on:mouseover={() => (showProfileSwitcher = true)}
        on:click={(e) => e.preventDefault()}>
        Profile <object data={downArrow} type="image/svg+xml" title="down-arrow" />
      </a>
    {:else}<a href="/tokens">Tokens</a> <a href="/login">Sign In</a>{/if}
  </div>
</div>
<div
  class="NavBarSpacer {$loggedIn ? '' : 'logged-out'}"
  style="height: {navHeight}px" />
{#if showProfileSwitcher}
  {#if mobile}
    <div
      class="mobile-switcher-bg"
      on:click={() => (showProfileSwitcher = false)}
      transition:fade={{ duration: 400 }} />
  {/if}
  <div
    class="profile-switcher"
    on:mouseleave={() => (showProfileSwitcher = false)}
    transition:fly={{ duration: 400, y: mobile ? 1000 : 0, opacity: 0 }}
    style="{!mobile ? `top: ${navHeight + 10}px;` : `bottom: ${mobileHeight}px;`} --profile-border: {$displayTheme === DisplayTheme.Dark ? 'rgba(255, 255, 255, .2)' : 'rgba(0, 0, 0, .075)'};">
    {#each $profiles as profile}
      <div class="profile">
        <button
          on:click={() => switchKeyfile(profile.address)}
          class="address"
          style={$address === profile.address ? 'font-weight: 600;' : ''}
          title={profile.address}>{profile.address}</button>
        {#if $profiles.length > 1}
          <button
            class="remove"
            on:click={() => removeKeyfile(profile.address)}><object
              data={closeIcon}
              type="image/svg+xml"
              title="down-arrow" /></button>
        {/if}
      </div>
    {/each}
    <button class="action" on:click={() => goto('/login')}>
      <object data={addIcon} type="image/svg+xml" title="nav-icon" /> Add keyfile
    </button>
    <button
      class="action sign-out"
      title="Remove all keyfiles and sing out"
      on:click={_logOut}>
      Sign Out
    </button>
  </div>
{/if}
<div class="mobile-nav" bind:clientHeight={mobileHeight}>
  {#if $loggedIn}
    <a href="/trade"><object
        data={tradeLogo}
        type="image/svg+xml"
        title="nav-icon" /></a>
    <a href="/gallery"><object
        data={postsLogo}
        type="image/svg+xml"
        title="nav-icon" /></a>
    <a href="/app"><img
        class="verto"
        src={$displayTheme === DisplayTheme.Dark ? '/logo_dark.svg' : '/logo_light.svg'}
        alt="v" /></a>
    <a href="/tokens"><object
        data={tokensLogo}
        type="image/svg+xml"
        title="nav-icon" /></a>
    <a
      href="/"
      on:click={(e) => {
        e.preventDefault();
        showProfileSwitcher = !showProfileSwitcher;
      }}><object data={peopleLogo} type="image/svg+xml" title="nav-icon" /></a>
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

</style>
