<script lang="typescript">
  import { loggedIn, keyfile } from "../stores/keyfileStore";
  import { goto } from "@roxi/routify";
  import Verto from "@verto/lib";
  import { onMount } from "svelte";
  import NavBar from "../components/NavBar.svelte";
  import { fade } from "svelte/transition";
  import Loading from "../components/Loading.svelte";
  import { displayTheme } from "../stores/themeStore";
  import { DisplayTheme } from "../utils/types";
  import Footer from "../components/Footer.svelte";

  // @ts-ignore
  if (process.browser && !$loggedIn) $goto("/");

  let client = new Verto();
  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
  });
  let tokens: Promise<
    { id: string; name: string; ticker: string }[]
  > = client.popularTokens();

  export const update = () => {
    client = new Verto(JSON.parse($keyfile));
  };
</script>

<svelte:head>
  <title>Verto — Tokens</title>
</svelte:head>

<NavBar {update} />
<div class="tokens" in:fade={{ duration: 300 }}>
  <div class="tokens-head">
    <h1 class="title">Popular Tokens</h1>
  </div>
  <div class="tokens-content">
    {#await tokens}
      <Loading />
    {:then loadedTokens}
      {#each loadedTokens as token}
        <a
          class="token"
          href="https://viewblock.io/arweave/tx/{token.id}"
          target="_blank"
          style="
            --hover-transparency: {$displayTheme === DisplayTheme.Dark ? '.8' : '1'};
            --hover-background: {$displayTheme === DisplayTheme.Dark ? '#161616' : '#000000'};    
            ">
          <h1 class="short">{token.ticker}</h1>
          <div class="info">
            <h1><span>[PST]</span>{token.name}</h1>
            <p><span>ID:</span>{token.id}</p>
          </div>
        </a>
      {/each}
    {/await}
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../styles/general.sass"

  .tokens
    @include page

    @media screen and (max-width: 720px)
      padding-top: 2em

    .tokens-head
      display: flex
      justify-content: space-between
      margin-bottom: 2em

      @media screen and (max-width: 720px)
        display: block

      h1.title
        margin: 0

        @media screen and (max-width: 720px)
          font-size: 1.35em
          margin-bottom: .3em

    .tokens-content
      @media screen and (max-width: 720px)
        width: 100vw - $mobileSidePadding * 2

      a.token
        $sidePadding: 2.3em
        padding: 1em $sidePadding
        background-color: #161616
        text-decoration: none
        color: #fff
        display: flex
        align-items: center
        border-radius: 5px
        margin-bottom: 2.8em
        transition: all .3s

        @media screen and (max-width: 720px)
          padding: 1em 1.1em
          display: block

        &:last-child
          margin-bottom: 0

        &:hover
          background-color: var(--hover-background)
          opacity: var(--hover-transparency)

        h1
          margin: 0
          
          &.short
            font-size: 3.1em
            color: #fff
            font-weight: 500
            text-transform: uppercase
            display: inline-block

            @media screen and (max-width: 1500px)
              font-size: 2.87em

            @media screen and (max-width: 720px)
              font-size: 2.1em

          &.val
            margin-left: auto
            font-size: 1.9em
            font-weight: 400

            @media screen and (max-width: 1500px)
              font-size: 1.67em

            span
              text-transform: uppercase
              font-size: .43em

        .info
          margin-left: 2em

          @media screen and (max-width: 720px)
            margin-left: 0

          h1
            font-size: 1.5em
            margin-bottom: .3em
            font-weight: 400

            @media screen and (max-width: 1500px)
              font-size: 1.27em

          p
            margin: 0
            font-size: 1.05em
            color: #fff

            @media screen and (max-width: 1500px)
              font-size: .82em
              overflow-wrap: anywhere

          span
            text-transform: uppercase
            color: #828282
            margin-right: .5em

  \:global(.Modal.cancelled input.contract-id) // opt out from scoped style
    border-color: #ff0000 // on modal close cancelled, show that the contract-id field was wrong
    animation: inputError .6s cubic-bezier(.36, .07, .19, .97) both
    transform: translate3d(0, 0, 0)
    backface-visibility: hidden

    @keyframes inputError
      10%, 90%
        transform: translate3d(-1px, 0, 0)
      
      20%, 80%
        transform: translate3d(2px, 0, 0)

      30%, 50%, 70%
        transform: translate3d(-4px, 0, 0)

      40%, 60%
        transform: translate3d(4px, 0, 0)

</style>
