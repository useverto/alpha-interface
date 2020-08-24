<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Button from "../components/Button.svelte";
  import { loggedIn, address, keyfile } from "../stores/keyfileStore.js";
  import { fade } from "svelte/transition";
  import { goto } from "@sapper/app";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";

  import { query } from "../api-client";
  import latestTransactionsQuery from "../queries/latestTransactions.gql";
  import postTokensQuery from "../queries/postTokens.gql";
  import Arweave from "arweave";
  import Community from "community-js";
  import { pstContract, exchangeWallet } from "../utils/constants";
  import { interactRead } from "smartweave";

  let activeMenu: string = "transactions";
  let addr: string = "";
  
  if(process.browser && !$loggedIn) goto("/");

  if(process.browser) {
    const params = new URLSearchParams(window.location.search);
    if(params.get("addr") === null) goto("/gallery");
    addr = params.get("addr");
  }

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  let transactions = getLatestTransactions();

  async function getLatestTransactions (): Promise<{ id: string, amount: number, type: string, status: string, timestamp: number }[]> {
    if(!process.browser) return [];

    let txs: { id: string, amount: number, type: string, status: string, timestamp: number }[] = [];

    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    const
      outTxs = (await query({
        query: latestTransactionsQuery,
        variables: {
          recipients: null,
          owners: [addr]
        }
      })).data.transactions.edges,
      inTxs = (await query({
        query: latestTransactionsQuery,
        variables: {
          recipients: [addr],
          owners: null
        }
      })).data.transactions.edges;

    outTxs.map(({ node }) => {
      txs.push({
        id: node.id,
        amount: node.quantity.ar,
        type: "out",
        status: "",
        timestamp: node.block.timestamp,
      })
    })
    inTxs.map(({ node }) => {
      txs.push({
        id: node.id,
        amount: node.quantity.ar,
        type: "in",
        status: "",
        timestamp: node.block.timestamp,
      })
    })

    txs.sort((a, b) => b.timestamp - a.timestamp)
    txs = txs.slice(0, 5)

    for (let i = 0; i < txs.length; i++) {
      try {
        let res = await client.transactions.getStatus(txs[i].id);
        if (res.status === 200)
          txs[i].status = "success";
        else
          txs[i].status = "pending";
      } catch (error) {
        console.log(error);
      }
    }

    return txs;
  }

  let stake = getPostStake();

  async function getPostStake (): Promise<number> {
    if(!process.browser) return 0;

    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let community = new Community(client);
    await community.setCommunityTx(pstContract);

    return await community.getVaultBalance(addr);
  }

  let timeStaked = getTimeStaked();

  async function getTimeStaked (): Promise<number> {
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let community = new Community(client);
    await community.setCommunityTx(pstContract);

    let currentHeight = (await client.network.getInfo()).height;

    let vaults = (await community.getState()).vault[addr];
    for (const vault of vaults) {
      if (vault.end > currentHeight) {
        return vault.end - vault.start;
      }
    }

    return 0;
  }

  let balance = getPostBalance();

  async function getPostBalance (): Promise<string> {
    if(!process.browser) return "";

    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    return client.ar.winstonToAr(await client.wallets.getBalance(addr));
  }

  let reputation = getReputation();

  async function getReputation (): Promise<number> {
    // Reputation determined from this diagram:
    // https://github.com/useverto/trading-post/blob/master/diagrams/reputation_calculation/reputation_calculation.png

    let
    stakeWeighted = await stake * 1/2,
    timeStakedWeighted = await timeStaked * 1/3,
    balanceWeighted = parseFloat(await balance) * 1/6;
    
    return parseFloat((stakeWeighted + timeStakedWeighted + balanceWeighted).toFixed(3));
  }

  let supportedTokens = getSupportedTokens();

  async function getSupportedTokens(): Promise<{ id: string, name: string, ticker: string }[]> {
    if(!process.browser) return [];

    let tokenList = [];
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    const supported = (await query({
      query: postTokensQuery,
      variables: {
        owners: [addr],
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

  let balances = getTokenBalances();

  async function getTokenBalances() {
    if(!process.browser) return [];

    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    const tokens = await supportedTokens;
    
    let tokenBalances = [];
    for (let i = 0; i < tokens.length; i++) {
      let pstContract = await interactRead(client, JSON.parse($keyfile), tokens[i].id, {
        function: "unlockedBalance",
        target: addr
      });
      console.log(pstContract)
      if (pstContract.balance > 0) {
        tokenBalances.push({
          token: tokens[i].name,
          ticker: tokens[i].ticker,
          balance: pstContract.balance
        });
      }
    }

    return tokenBalances;
  }

</script>

<svelte:head>
  <title>Verto — Trading Post</title>
</svelte:head>

<NavBar />
<div class="post" in:fade={{ duration: 300 }}>
  <div class="post-info">
    <div class="long-cell">
      <p>trading post address</p>
      <h1 class="address">{addr}</h1>
    </div>
    <div class="short-cell">
      {#await reputation}
        <p><SkeletonLoading style="height: 1em; width: 100px" /></p>
        <h1><SkeletonLoading style="height: 1em; width: 100px" /></h1>
      {:then loadedReputation} 
        <p>reputation</p>
        <h1>{loadedReputation}</h1>
      {/await}
    </div>
  </div>
  <div class="post-info big">
    <div class="long-cell">
      {#await balance}
        <p><SkeletonLoading style="height: 1em; width: 120px" /></p>
        <h1><SkeletonLoading style="height: 1em; width: 300px" /></h1>
      {:then loadedBalance}
        <p in:fade={{ duration: 150 }}>total balance</p>
        <h1 in:fade={{ duration: 150 }}>{roundCurrency(loadedBalance)}<span class="currency">AR</span></h1>
      {/await}
    </div>
    <div class="short-cell">
      {#await stake}
        <p><SkeletonLoading style="height: 1em; width: 120px" /></p>
        <h1><SkeletonLoading style="height: 1em; width: 180px" /></h1>
      {:then loadedStake}
        <p>total stake</p>
        <h1>{roundCurrency(loadedStake.toString())}<span class="currency">VRT</span></h1>
      {/await}
    </div>
  </div>
  <br>
  <div class="information">
    <div class="menu">
      <button class:active={activeMenu === "transactions"} on:click={() => activeMenu = "transactions"}>Transactions</button>
      <button class:active={activeMenu === "assets"} on:click={() => activeMenu = "assets"}>Assets</button>
      <button class:active={activeMenu === "supported"} on:click={() => activeMenu = "supported"}>Suppported Assets</button>
      <div class="trade">
        <Button href="/trade?post={addr}" style={"font-family: 'JetBrainsMono', monospace; text-transform: uppercase;"}>Trade now</Button>
      </div>
    </div>
    <div class="content">
      {#if activeMenu === "assets"}
        <table in:fade={{ duration: 400 }}>
          <tr>
            <th>Token</th>
            <th>Amount</th>
          </tr>
          {#await balances}
            {#each Array(5) as _}
              <tr>
                <td style="width: 80%"><SkeletonLoading style="width: 100%;" /></td>
                <td style="width: 20%"><SkeletonLoading style="width: 100%;" /></td>
              </tr>
            {/each}
          {:then loadedBalances}
            {#if loadedBalances.length === 0}
              <p>This trading post doesn't have any tokens!</p>
            {/if}
            {#each loadedBalances as balance}
              <tr>
                <td>{balance.token}</td>
                <td>{roundCurrency(balance.balance)} <span class="currency">{balance.ticker}</span></td>
              </tr>
            {/each}
          {/await}
        </table>
      {:else if activeMenu === "transactions"}
        <table in:fade={{ duration: 400 }}>
          {#await transactions}
            {#each Array(5) as _}
              <tr>
                <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
                <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
              </tr>
            {/each}
          {:then loadedTxs}
            <tr>
              <th style="text-transform: none; width: 70%">TxID</th>
              <th style="width: 20%">Amount</th>
            </tr>
            {#if loadedTxs.length === 0}
              <p style="position: absolute; left: 50%; transform: translateX(-50%);">No transactions found</p>
            {/if}
            {#each loadedTxs as tx}
              <tr in:fade={{ duration: 300 }}>
                <td style="width: 70%">
                  <a href="https://viewblock.io/arweave/tx/{tx.id}" class="transaction">
                    <span class="direction">{tx.type}</span>
                    {tx.id}
                  </a>
                  <span class="status {tx.status}"></span>
                </td>
                <td style="width: 20%">{roundCurrency(tx.amount)} AR</td>
              </tr>
            {/each}
          {/await}
        </table>
      {:else if activeMenu === "supported"}
        <table in:fade={{ duration: 400 }}>
          {#await supportedTokens}
            {#each Array(5) as _}
              <tr>
                <td style="width: 30%"><SkeletonLoading style={"width: 100%"} /></td>
                <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
                <td style="width: 50%"><SkeletonLoading style={"width: 100%"} /></td>
              </tr>
            {/each}
          {:then loadedTokens} 
            <tr>
              <th>Token</th>
              <th>Ticker</th>
              <th>ID</th>
            </tr>
            {#if loadedTokens.length === 0}
              <p style="position: absolute; left: 50%; transform: translateX(-50%);">No transactions found</p>
            {/if}
            {#each loadedTokens as token}
              <tr>
                <td>{token.name}</td>
                <td>{token.ticker}</td>
                <td>{token.id}</td>
              </tr>
            {/each}
          {/await}
        </table>
      {/if}
    </div>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"
  @import "../styles/general.sass"

  .post
    @include page

    @media screen and (max-width: 720px)
      overflow: hidden
      padding-top: 2em

    .post-info
      display: flex
      justify-content: space-between
      margin-bottom: 1.6em

      @media screen and (max-width: 720px)
        display: block
        justify-content: unset

      .long-cell
        width: 78%

        @media screen and (max-width: 720px)
          width: auto
          margin-bottom: 2em

      .short-cell
        p, h1
          text-align: right

          @media screen and (max-width: 720px)
            text-align: left

      h1
        color: #000
        font-size: 1.25em
        margin: 0

      &.big
        h1
          font-size: 2em

      h1
        span.currency
          font-size: .6em
          text-transform: uppercase

        @media screen and (max-width: 720px)
          white-space: nowrap
          overflow: hidden
          position: relative
          transition: font-size .3s

          &::after
            content: ""
            position: absolute
            top: 0
            bottom: 0
            right: 0
            width: 1px
            box-shadow: -3px 0px 20px 20px #fff
            background-color: #fff
            transition: opacity .3s

          &:hover
            font-size: .65em

            &::after
              opacity: 0

      p
        color: rgba(#000, .3)
        font-weight: 600
        font-size: .9em
        margin: 0 0 .8em 0
        text-transform: uppercase

    .information
      @include table

      a.view-all
        display: block
        text-align: center
        color: rgba(#000, .5)
        font-weight: 500
        padding: .8em 0
        transition: all .3s

        &:hover
          opacity: .7

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
            padding: .18em 0
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