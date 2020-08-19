<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Button from "../components/Button.svelte";
  import Loading from "../components/Loading.svelte";
  import Modal from "../components/Modal.svelte";
  import { loggedIn } from "../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { query } from "../api-client.js";
  import Arweave from "arweave";

  if(process.browser && !$loggedIn) goto("/");

  let supportedTokens = getSupportedPSTs();
  let addTokenModalOpened: boolean = false;
  let newContractID: string;

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
        const contractId = (await client.transactions.getData(
          id,
          {decode: true, string: true},
        )).toString();
        const contractData = JSON.parse(
          (await client.transactions.getData(
            contractId,
            {decode: true, string: true},
          )).toString()
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

  async function addToken() {
    addTokenModalOpened = true;
  }

  function confirmAdd() {
    console.log(newContractID);
  }

  function cancelAdd() {
    addTokenModalOpened = false;
    newContractID = "";
  }

</script>

<svelte:head>
  <title>Verto — Tokens</title>
</svelte:head>

<NavBar />
<div class="tokens">
  <div class="tokens-head">
    <h1 class="title">Supported Tokens</h1>
    <Button click={addToken}>Add Token</Button>
  </div>
  <div class="tokens-content">
    {#await supportedTokens}
      <Loading />
    {:then loadedPSTs} 
      {#each loadedPSTs as pst}
        <a class="token" href="https://viewblock.io/arweave/tx/{pst.id}">
          <h1 class="short">{pst.ticker}</h1>
          <div class="info">
            <h1><span>[PST]</span>{pst.name}</h1>
            <p><span>ID</span>{pst.id}</p>
          </div>
          <h1 class="val">0<span>Ar</span></h1>
        </a>
      {/each}
    {/await}
  </div>
</div>
<Modal bind:opened={addTokenModalOpened} confirmation={true} onConfirm={confirmAdd} onCancel={cancelAdd}>
  <h3 style="text-align: center;">Token Contract ID</h3>
  <input type="text" bind:value="{newContractID}">
</Modal>
<Footer />

<style lang="sass">

  .tokens
    padding: 4.4em 15vw 3em

    .tokens-head
      display: flex
      justify-content: space-between
      margin-bottom: 2em

      h1.title
        margin: 0

    .tokens-content
      a.token
        $sidePadding: 2.3em
        display: block
        padding: 1em $sidePadding
        background-color: #121212
        text-decoration: none
        color: #fff
        display: flex
        justify-content: space-between
        align-items: center
        border-radius: 5px
        margin-bottom: 2.8em
        transition: all .3s

        &:last-child
          margin-bottom: 0

        &:hover
          opacity: .8

        h1
          margin: 0
          
          &.short
            font-size: 3.1em
            color: #fff
            font-weight: 500
            text-transform: uppercase
            display: inline-block
            margin-right: $sidePadding

          &.val
            font-size: 1.9em
            font-weight: 400

            span
              text-transform: uppercase
              font-size: .43em

        .info
          h1
            font-size: 1.5em
            margin-bottom: .3em
            font-weight: 400

          p
            margin: 0
            font-size: 1.05em
            color: #fff

          span
            text-transform: uppercase
            color: #828282
            margin-right: .5em
</style>