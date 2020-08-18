<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Button from "../components/Button.svelte";
  import Loading from "../components/Loading.svelte";
  import { loggedIn } from "../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { query } from "../api-client.js";
  import Arweave from "arweave";

  if(process.browser && !$loggedIn) goto("/");

  let supportedTokens = getSupportedPSTs();

  async function getSupportedPSTs (): Promise<{ id: string, name: string, ticker: string }[]> {
    if(!process.browser) return [];

    let psts: { id: string, name: string, ticker: string }[] = [];

    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let txIds = [];
    const _txIds = (await query(`
      query {
        transactions(
          owners: ["pvPWBZ8A5HLpGSEfhEmK1A3PfMgB_an8vVS6L14Hsls"]
          tags: [
            {name: "App-Name", values: "Verto"}
            {name: "Support", values: "PST"}
          ]
        ) {
          edges {
            node {
              id
            }
          }
        }
      }
    `)).data.transactions.edges;
    _txIds.map(({ node }) => {
      txIds.push(node.id);
    })

    for (const id of txIds) {
      try {
        const contractId = await client.transactions.getData(
          id,
          {decode: true, string: true},
        );
        const contractData = JSON.parse(
          await client.transactions.getData(
            contractId,
            {decode: true, string: true},
          )
        );
        psts.push({
          id: contractId,
          name: contractData["name"],
          ticker: contractData["ticker"],
        });
      } catch (error) {
        console.log(error);
      }
    }

    return psts;
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