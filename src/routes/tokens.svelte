<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Button from "../components/Button.svelte";
  import Loading from "../components/Loading.svelte";
  import { loggedIn } from "../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { and, equals } from "arql-ops";

  if(process.browser && !$loggedIn) goto("/");

  let supportedTokens = getSupportedPSTs();

    async function getSupportedPSTs (): Promise<{ id: string, name: string, ticker: string }[]> {
    if(!process.browser) return [];

    // @ts-ignore
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let 
      query = and(
        equals("from", "pvPWBZ8A5HLpGSEfhEmK1A3PfMgB_an8vVS6L14Hsls"),
        equals("App-Name", "Verto"),
        equals("Support", "PST")
      ),
      _txs: { id: string, name: string, ticker: string }[] = [],
      allTxs = await client.arql(query);

    for(let i = 0; i < allTxs.length; i++) {
      try {
        let res = await client.transactions.get(allTxs[i]);
        _txs.push({
          id: allTxs[i],
          name: res.name,
          ticker: res.ticker
        });
      } catch (error) {
        console.log(error);
      }
    }
    return _txs;
  }

</script>

<svelte:head>
  <title>Verto — Tokens</title>
</svelte:head>

<NavBar />
<div class="gallery" in:fade={{ duration: 300 }}>
  <div class="gallery-head">
    <h1 class="title">Supported Tokens</h1>
    <Button style={"font-family: 'JetBrainsMono', monospace; text-transform: uppercase;"}>Add token</Button>
  </div>
  <div class="gallery-content">
    {#await supportedTokens}
      <Loading style="position: absolute; left: 50%;" />
    {:then loadedTokens} 
      {#each loadedTokens as token}
        <a href="https://viewblock.io/arweave/tx/{token.id}" class="token">
          <h1>{token.name}</h1>
          <div class="token-info">
            <p>Ticker <span>{token.ticker}</span></p>
            <p>ID <span>{token.id}</span></p>
          </div>
        </a>
      {/each}
    {/await}
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"

  .gallery
    padding: 4.4em 15vw 3em

    .gallery-head
      display: flex
      justify-content: space-between
      margin-bottom: .6em

      h1.title
          margin: 0

      .sorting
        display: flex
        align-items: center

        p
          font-size: 1.2em
          color: rgba(#000, .3)
          font-weight: 600
          margin: 0
          text-transform: uppercase

        select
          position: relative
          border: none
          outline: none
          background-color: transparent
          cursor: pointer
          font-size: 1em
          color: rgba(#000, .8)
          margin: 0
          font-weight: 600
          text-transform: uppercase
          
          option
            text-transform: normal
            font-size: .8em
            color: #000

    .gallery-content
      @media screen and (max-width: 720px)
        overflow-x: hidden

      a.token
        display: block
        margin: 2em 0
        text-decoration: none
        transition: all .3s

        &:hover
          opacity: .63

        h1
          font-size: 1.7em
          color: #000
          font-weight: 400
          margin: 0 0 .65em 0

        .token-info
          display: flex
          justify-content: space-between

          @media screen and (max-width: 720px)
            display: block
            margin: 1.5em 0 2.3em

          p
            font-size: 1.1em
            font-weight: 600
            color: rgba(#000, .4)
            margin: 0
            text-transform: uppercase

            @media screen and (max-width: 720px)
              margin-bottom: 1em

            span
              color: #000

              &.reputation
                text-decoration: underline

    .pagination
      margin-top: 1em
      @include pagination

</style>