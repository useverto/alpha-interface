<script lang="typescript">

  import { goto } from "@sapper/app";
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
  import postTokensQuery from "../queries/postTokens.gql";
  import exchangesQuery from "../queries/exchanges.gql";
  import Arweave from "arweave";
  import { interactRead } from "smartweave";
  import Community from "community-js";
  import { fetchRootNode, createNode, getNodeTags } from "../trackweave";
  import { getLatestNode } from "../utils/get_latest_node";
  import Transaction from "arweave/node/lib/transaction";
  import { notification, NotificationType } from "../stores/notificationStore.js";
  import { exchangeWallet, pstContract } from "../utils/constants";

  let selectedPost;
  let sendAmount: number = 1;
  let recieveAmount: number = 1;
  let sendCurrency: string;
  let recieveCurrency: string;
  let activeMenu: string = "open";
  let confirmModalOpened: boolean = false;

  if(process.browser) {
    const params = new URLSearchParams(window.location.search);
    if(params.get("post")) selectedPost = params.get("post");
  }

  let posts = getTradingPosts();
  let psts = getExchangeSupportedTokens();
  let supportedPSTs = getTradingPostSupportedTokens();
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

  async function getExchangeSupportedTokens (): Promise<{ id: string, name: string, ticker: string }[]> {
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

  async function getTradingPostSupportedTokens(): Promise<{ id: string, name: string, ticker: string }[]> {
    if(!process.browser) return [];

    let tokenList = [];
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    await posts;

    const supported = (await query({
      query: postTokensQuery,
      variables: {
        owners: [selectedPost],
        recipients: [exchangeWallet]
      }
    })).data.transactions.edges;

    // @ts-ignore
    const txData = JSON.parse(await client.transactions.getData(supported[0].node.id, {decode: true, string: true}));
    for (let x = 0; x < txData.acceptedTokens.length; x++) {
      // @ts-ignore
      let pstInfo = JSON.parse(await client.transactions.getData(txData.acceptedTokens[x], {decode: true, string: true}));
      tokenList.push({
        id: txData.acceptedTokens[x],
        name: pstInfo.name,
        ticker: pstInfo.ticker
      })
    }
    
    return tokenList;
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
    if ($address === selectedPost) {
      notification.notify("Error", "You can not make trades from your own trading post!", NotificationType.error, 5000);
      return;
    }
    if(sendCurrency.toLowerCase() === "ar" || recieveCurrency.toLowerCase() === "ar") confirmModalOpened = true;
    exchangeTX = await createExchangeTx();
    fees = await getFee(exchangeTX);
  }

  async function createExchangeTx (): Promise<Transaction> {
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    const latestNode = await getLatestNode(client, selectedPost);
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
      "App-Name": "SmartWeaveAction",
      "App-Version": "0.3.0",
      "Contract": pstTxId,
      "Input": `{ "function": "transfer", "target": "${selectedPost}", "qty": ${sendAmount.toString()} }`
    };

    const tags = getNodeTags(node);
    const tx = await client.createTransaction({
      target: selectedPost,
      data: Math.random().toString().slice(-4)
    }, JSON.parse($keyfile));
    
    for (const [key, value] of Object.entries(tags)) {
      tx.addTag(key, value);
    }
    return tx;
  }

  async function createTipTx(): Promise<Transaction> {
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });
    let community = new Community(client);
    await community.setCommunityTx(pstContract);

    let tipReceiver = await community.selectWeightedHolder();

    let tipTx = await client.createTransaction({
      target: tipReceiver,
      quantity: sendCurrency === "AR" ? (sendAmount * 0.0025).toString() : (recieveAmount * 0.0025).toString()
    }, JSON.parse($keyfile));

    console.log(sendCurrency === "AR" ? (sendAmount * 0.0025).toString() : (recieveAmount * 0.0025).toString());
    return tipTx;
  }
  
  async function confirmTrade () {
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    let tx = await createExchangeTx();
    let tip = await createTipTx();

    try {
      await client.transactions.sign(tip, JSON.parse($keyfile));
      await client.transactions.post(tip);
    } catch (err) {
      notification.notify("Error", err, NotificationType.error, 5000);
      return;
    }
    try {
      await client.transactions.sign(tx, JSON.parse($keyfile));
      await client.transactions.post(tx);
    } catch (err) {
      notification.notify("Error", err, NotificationType.error, 5000);
      return;
    }

    notification.notify("Sent", "We're processing your trade now! This may take a few minutes.", NotificationType.success, 5000);
    goto("/app");
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
    await selectedPost;
    await posts;

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

  let latestExchanges = getLatestExchanges();

  async function getLatestExchanges (): Promise<{ id: string, type: string, ar: string, pst: string, matched: boolean }[]> {
    if(!process.browser) return [];
    let loadedPsts = await psts;
    let exchanges: { id: string, type: string, ar: string, pst: string, matched: boolean }[] = [];
    
    const txs = (await query({
      query: exchangesQuery,
      variables: {
        recipients: [selectedPost]
      }
    })).data.transactions.edges;
    txs.map(({ node }) => {
      const tradeType = node.tags.find(tag => tag.name === "Trade-Opcode")?.value;
      if (tradeType) {
        const arVal = node.tags.find(tag => tag.name === "Buy-For")?.value;
        const pstVal = node.tags.find(tag => tag.name === "Sell-Qty")?.value;

        const tokenId = node.tags.find(tag => tag.name === "Target-Token")?.value;
        const token = loadedPsts.find(pst => pst.id === tokenId)?.ticker;

        exchanges.push({
          id: node.id,
          type: tradeType,
          ar: arVal + " AR",
          pst: pstVal + " " + token,
          matched: false
        });
      }
    })

    for (let i = 0; i < exchanges.length; i++) {
      const inverseTradeType = exchanges[i].type === "Buy" ? "Sell" : "Buy";
      
      const match = (await query({
        query: `
          query {
            transactions(
              tags: [
                {
                  name: "Exchange",
                  values: "Verto"
                },
                {
                  name: "${inverseTradeType}ing-Tx",
                  values: "${exchanges[i].id}"
                }
              ]
            ) {
              edges {
                node {
                  block {
                    timestamp
                  }
                }
              }
            }
          }
        `,
      })).data.transactions.edges;
      
      if (match && match[0]) {
        exchanges[i].matched = true;
      }
    }
    console.log(exchanges);
    return exchanges;
  }

  let openTrades = latestOpenExchanges();

  async function latestOpenExchanges(): Promise<{ id: string, type: string, ar: string, pst: string, matched: boolean }[]> {
    let txs = await latestExchanges;

    let openExchanges = [];
    for (let i = 0; i < txs.length; i++) {
      if (txs[i].matched === false){
        openExchanges.push(txs[i]);
      }
    }
    return openExchanges;
  }

  let closedTrades = latestClosedExchanges();

  async function latestClosedExchanges(): Promise<{ id: string, type: string, ar: string, pst: string, matched: boolean }[]> {
    let txs = await latestExchanges;

    let closedExchanges = [];
    for (let i = 0; i < txs.length; i++) {
      if (txs[i].matched === true) closedExchanges.push(txs[i]);
    }

    return closedExchanges;
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
      <select bind:value={selectedPost} on:change={() => {
        supportedPSTs = getTradingPostSupportedTokens(); 
        latestExchanges = getLatestExchanges();
        openTrades = latestOpenExchanges();
        closedTrades = latestClosedExchanges();
      }}>
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
            <th style="width: 80%"><SkeletonLoading style="width: 100%" /></th>
            <th style="width: 20%"><SkeletonLoading style="width: 100%" /></th>
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
          {#await supportedPSTs}
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
          {#await supportedPSTs}
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
<div class="exchanges-section">
  <div class="information">
    <div class="menu">
      <button class:active={activeMenu === "open"} on:click={() => activeMenu = "open"}>Open Orders</button>
      <button class:active={activeMenu === "closed"} on:click={() => activeMenu = "closed"}>Closed Orders</button>
    </div>
  </div>
  <div class="content">
    {#if activeMenu === "open"}
      <table in:fade={{ duration: 400 }}>
        {#await openTrades}
          {#each Array(5) as _}
            <tr>
              <td style="width: 100%"><SkeletonLoading style="width: 100%;" /></td>
            </tr>
          {/each}
        {:then loadedOpenTrades}
          {#if loadedOpenTrades.length === 0}
            <p>This trading post doesn't have any open orders!</p>
          {/if}
          {#each loadedOpenTrades as trade}
            <tr>
              <td style="text-align: left">
                {#if trade.type === "Buy"}
                  {trade.ar}
                {:else}
                  {trade.pst}
                {/if}
                {"->"}
                {#if trade.type === "Buy"}
                  {trade.pst}
                {:else}
                  {trade.ar}
                {/if}
              </td>
            </tr>
          {/each}
        {/await}
      </table>
    {:else if activeMenu === "closed"}
      <table in:fade={{ duration: 400 }}>
        {#await closedTrades}
          {#each Array(5) as _}
            <tr>
              <td style="width: 100%"><SkeletonLoading style="width: 100%;" /></td>
            </tr>
          {/each}
        {:then loadedOpenTrades}
          {#if loadedOpenTrades.length === 0}
            <p>This trading post doesn't have any completed trades!</p>
          {/if}
          {#each loadedOpenTrades as trade}
            <tr>
              <td style="text-align: left">
                {#if trade.type === "Buy"}
                  {trade.ar}
                {:else}
                  {trade.pst}
                {/if}
                {"->"}
                {#if trade.type === "Buy"}
                  {trade.pst}
                {:else}
                  {trade.ar}
                {/if}
              </td>
            </tr>
          {/each}
        {/await}
      </table>
    {/if}
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
  @import "../styles/general.sass"

  .trade
    @include table
    @include page

    @media screen and (max-width: 720px)
      padding-top: 2em

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

            @media screen and (max-width: 720px)
              width: 62%

          select
            width: 20%
            height: 100%
            border-radius: 0
            text-transform: uppercase

            @media screen and (max-width: 720px)
              width: 38%

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

  .exchanges-section
    @include table
    @include page

    .menu
      position: relative
      display: flex
      margin-bottom: 1.5em

      @media screen and (max-width: 720px)
        justify-content: space-between
        padding-top: 4em

      button
        position: relative
        padding: .4em 1.8em
        font-family: "JetBrainsMono", monospace
        text-transform: uppercase
        font-weight: 600
        color: #000
        background-color: transparent
        border: none
        font-size: 1.15em
        outline: none
          text-align: center
          cursor: pointer

        @media screen and (max-width: 720px)
          padding: .18em .14em
          font-size: .75em

        &::after
          content: ""
          position: absolute
          bottom: 0
          left: 0
          width: 100%
          height: 0
          opacity: 0
          background-color: #000
          transition: all .2s

        &.active::after
          opacity: 1
          height: 3px

      .trade
        position: absolute
        right: 0
        top: 0

        @media screen and (max-width: 720px)
          right: unset
          left: 0

</style>