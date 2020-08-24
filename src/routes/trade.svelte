<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import { balance, address, keyfile } from "../stores/keyfileStore.js";
  import Button from "../components/Button.svelte";
  import Modal from "../components/Modal.svelte";
  import { fade } from "svelte/transition";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";

  import { query } from "../api-client";
  import galleryQuery from "../queries/gallery.gql";
  import tokensQuery from "../queries/tokens.gql";
  import Arweave from "arweave";
  import { interactRead } from "smartweave";
  import { fetchRootNode, createNode, getNodeTags } from "trackweave";
  import { getLatestNode } from "../utils/get_latest_node";
  import Transaction from "arweave/node/lib/transaction";

  let selectedPost;
  let sendAmount: number = 1;
  let recieveAmount: number = 1;
  let sendCurrency: string;
  let recieveCurrency: string;
  let confirmModalOpened: boolean = false;

  if(process.browser) {
    const params = new URLSearchParams(window.location.search);
    if(params.get("post")) selectedPost = params.get("post");
  }

  let posts = getTradingPosts();
  let psts = getSupportedPSTs();
  let balances = getTokenBalances();
  let exchangeTX, fees;

  async function getTradingPosts (): Promise<string[]> {
    if(!process.browser) return [];
    
    let posts: string[] = [];

    const _posts = (await query({
      query: galleryQuery
    })).data.transactions.edges;

    _posts.map(({ node }) => {
      posts.push(node.owner.address);
    });

    posts = [...new Set(posts)]; // remove duplicates
    if(selectedPost === undefined || selectedPost === "Loading...") selectedPost = posts[0]; // set initial post if it is not selected in the URL already

    return posts;
  }

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
    const _txIds = (await query({
      query: tokensQuery
    })).data.transactions.edges;
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

  async function getTokenBalances() {
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });
    const supportedPSTs = await psts;
    let tokenBalances = [];

    for (let i = 0; i < supportedPSTs.length; i++) {
      let pstContract = await interactRead(client, JSON.parse($keyfile), supportedPSTs[i].id, {
        function: "unlockedBalance"
      });
      if (pstContract.balance > 0) {
        tokenBalances.push({
          token: supportedPSTs[i].name,
          ticker: supportedPSTs[i].ticker,
          balance: pstContract.balance
        });
      }
    }

    return tokenBalances;
  }

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  // open confirmation modal
  async function exchange () {
    if(sendCurrency.toLowerCase() === "ar" && recieveCurrency.toLowerCase() === "ar") return; // don't allow transactions with only ar values
    if(sendCurrency.toLowerCase() === "ar" || recieveCurrency.toLowerCase() === "ar") confirmModalOpened = true;
    exchangeTX = await createExchangeTx();
    fees = await getFee(exchangeTX);
    console.log(fees)
  }

  async function createExchangeTx (): Promise<Transaction> {
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    const latestNode = getLatestNode(client, selectedPost);
    // @ts-ignore
    const node = createNode(latestNode, false);

    const ticker = sendCurrency === "AR" ? recieveCurrency : sendCurrency;
    const supportedPSTs = await psts;
    let pstTxId;
    for (const pst of supportedPSTs) {
      if (pst.ticker === ticker) {
        pstTxId = pst.id;
      }
    }

    node.otherTags = {
      "Exchange": "Verto",
      "Target-Token": pstTxId,
      "Trade-Ratio": (recieveAmount / sendAmount).toFixed(7),
      "Trade-Opcode": sendCurrency === "AR" ? "Buy" : "Sell",
      "Buy-For": sendCurrency === "AR" ? sendAmount.toString() : recieveAmount.toString(),
      "Sell-Qty": sendCurrency === "AR" ? recieveAmount.toString() : sendAmount.toString(),
    };

    const tags = getNodeTags(node);
    const tx = await client.createTransaction({
      target: selectedPost,
      quantity: "1"
    }, JSON.parse($keyfile));
    
    for (const [key, value] of Object.entries(tags)) {
      tx.addTag(key, value);
    }

    return tx;
  }
  
  async function confirmTrade () {
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    let tx = await createExchangeTx();

    await client.transactions.sign(tx, JSON.parse($keyfile));
    await client.transactions.post(tx);

    console.log("Confirmed trade");
  }

  function cancelTrade () {
    console.log("Cancelled trade");
  }

  // only allow exchange if one of the currencies is AR
  async function checkIfArIsPresent (sendOrRecieve: string) {
    if(sendCurrency.toLowerCase() !== "ar" && recieveCurrency.toLowerCase() !== "ar") {
      if(sendOrRecieve === "send") recieveCurrency = "AR";
      else sendCurrency = "AR";
    }
    // only allow one of the receive/send currencies to be AR
    if(sendCurrency.toLowerCase() === "ar" && recieveCurrency.toLowerCase() === "ar") {
      let currencies = (await psts).filter(pst => pst.ticker.toLowerCase() !== "ar");
      if(sendOrRecieve === "send") recieveCurrency = currencies[0].ticker;
      else sendCurrency = currencies[0].ticker;
    }
  }

  async function getFee(tx: Transaction): Promise<number> {
    let fee, txSize, recipient;
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });
    
    txSize = parseFloat(tx.data_size);
    recipient = tx.target;
    fee = await client.transactions.getPrice(txSize, recipient);

    return parseFloat(client.ar.winstonToAr(fee));
  }

</script>

<svelte:head>
  <title>Verto — Trade</title>
</svelte:head>

<NavBar />
<div class="trade" in:fade={{ duration: 300 }}>
  <div class="trade-head">
    <div class="balance">
      {#if $balance === 0}
        <p><SkeletonLoading style="height: 1em; width: 120px" /></p>
        <h1><SkeletonLoading style="height: 1em; width: 300px" /></h1>
      {:else}
        <p in:fade={{ duration: 150 }}>Your balance</p>
        <h1 in:fade={{ duration: 150 }}>{roundCurrency($balance)}<span>AR</span></h1>
      {/if}
    </div>
    <div class="recommended-post">
      <p>Trading post</p>
      <select bind:value={selectedPost}>
        {#await posts}
          <option disabled>Loading...</option>
        {:then loadedPosts}
          {#if loadedPosts.length === 0}
            <option disabled>No posts found</option>
          {/if}
          {#each loadedPosts as post}
            <option value={post} selected={post === selectedPost}>{post}</option>
          {/each}
        {/await}
      </select>
    </div>
  </div>
  <div class="trade-container">
    <table>
      {#await balances}
        {#each Array(5) as _}
          <tr>
            <th><SkeletonLoading style="width: 75px" /></th>
            <th><SkeletonLoading style="width: 75px" /></th>
          </tr>
        {/each}
      {:then loadedBalances} 
        <tr>
          <th>Token</th>
          <th>Amount</th>
        </tr>
        {#if loadedBalances.length === 0}
          <p>You don't have any tokens!</p>
        {/if}
        {#each loadedBalances as balance}
          <tr>
            <td>{balance.token}</td>
            <td>{roundCurrency(balance.balance)} <span class="currency">{balance.ticker}</span></td>
          </tr>
        {/each}
      {/await}
    </table>
    <div class="exchange">
      <p>You send</p>
      <div class="input">
        <input type="number" bind:value={sendAmount} min={0} />
        <select bind:value={sendCurrency} on:change={() => checkIfArIsPresent("send")}>
          <option value="AR">AR</option>
          {#await psts}
            <option disabled>Loading...</option>
          {:then loadedPsts}
            {#each loadedPsts as pst}
              <option value={pst.ticker}>{pst.ticker}</option>
            {/each}
          {/await}
        </select>
      </div>
      <p>You recieve</p>
      <div class="input">
        <input type="number" bind:value={recieveAmount} min={0} />
        <select bind:value={recieveCurrency} on:change={() => checkIfArIsPresent("recieve")}>
          <option value="AR">AR</option>
          {#await psts}
            <option disabled>Loading...</option>
          {:then loadedPsts}
            {#if loadedPsts.length !== 0}
              {#each loadedPsts as pst}
                <option value={pst.ticker}>{pst.ticker}</option>
              {/each}
            {/if}
          {/await}
        </select>
      </div>
      <p class="info">1 {sendCurrency} ~= {(recieveAmount / sendAmount).toFixed(7)} {recieveCurrency}</p>
      <Button click={exchange} style={"width: 100%; padding-left: 0; padding-right: 0; font-family: 'JetBrainsMono', monospace; text-transform: uppercase;"}>EXCHANGE</Button>
    </div>
  </div>
</div>
<Modal bind:opened={confirmModalOpened} confirmation={true} onConfirm={confirmTrade} onCancel={cancelTrade}>
  <p style="text-align: center;">
    Exchanging {sendAmount} {sendCurrency} for {recieveAmount} {recieveCurrency}
  </p>
  <p style="text-align: center">
    {#await fees}
      Loading fees...
    {:then loadedFees}
      {#if sendCurrency === "AR"}
        This action will cost {sendAmount + (sendAmount * 0.0025) + loadedFees} AR
      {:else}
        This action will cost {sendAmount} {sendCurrency} + {loadedFees} AR
      {/if}
    {/await}
  </p>
</Modal>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"

  .trade
    @include table
    padding: 4em 15vw 3em

    table
      td:last-child, th:last-child
        text-align: left !important

    .trade-head
      display: flex
      justify-content: space-between
      margin-bottom: 2.65em

      @media screen and (max-width: 720px)
        display: block

      p
        color: rgba(#000, .3)
        font-weight: 600
        font-size: 1.2em
        margin: 0
        text-transform: uppercase
        margin-bottom: .5em

      .balance
        width: 40%

        @media screen and (max-width: 720px)
          width: auto
          margin-bottom: 2em

        h1
          font-size: 2.35em
          color: #000
          font-weight: 400
          margin: 0

          span
            font-size: .4em

      .recommended-post
        width: 60%

        @media screen and (max-width: 720px)
          width: auto

        select
          width: 100%

    .trade-container
      display: flex

      @media screen and (max-width: 720px)
        display: block

      table, .exchange
        width: 50%

        @media screen and (max-width: 720px)
          width: auto

      table
        padding-right: 2.5em

        @media screen and (max-width: 720px)
          padding: 0
          margin-bottom: 2em

      .exchange
        padding-left: 2.5em

        @media screen and (max-width: 720px)
          padding: 0

        p
          color: rgba(#000, .3)
          font-weight: 600
          font-size: .95em
          margin: 0
          text-transform: uppercase

          &.info
            color: #000
            font-weight: 400
            font-size: .74em
            text-transform: normal
            margin-bottom: 1.7em

        .input
          display: flex
          align-items: center
          border: 1px solid #000
          border-radius: .4em
          height: 2.35em
          margin-bottom: 1.7em
          overflow: hidden

          input
            width: 80%
            height: 100%
            border: none
            outline: none
            font-size: 1.2em
            padding: 0 .5em
            color: #000

          select
            width: 20%
            height: 100%
            border-radius: 0  
            text-transform: uppercase

    select
      $sidePadding: .65em
      position: relative
      color: #fff
      background-color: #000
      font-size: 1em
      padding: .34em ($sidePadding * 3 + .3em) .34em $sidePadding
      cursor: pointer
      border-radius: .3em
      outline: none
      border: none
      background-image: url(/down-arrow.svg)
      background-position: calc(100% - #{$sidePadding}) center
      background-repeat: no-repeat
      background-size: $sidePadding * 1.35
      -webkit-appearance: none
      -moz-appearance: none
      transition: all .3s

      &:hover
        opacity: .8

</style>