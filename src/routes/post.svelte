<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Button from "../components/Button.svelte";
  import { loggedIn, address, balance } from "../stores/keyfileStore.js";
  import { fade } from "svelte/transition";
  import { goto } from "@sapper/app";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";

  import { query } from "../api-client";
  import Arweave from "arweave";
  import Community from "community-js";

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

    const outTxs = (await query(`
      query {
        transactions(
          owners: ["${addr}"]
        ) {
          edges {
            node {
              id
              block {
                timestamp
              }
              quantity {
                ar
              }
            }
          }
        }
      }
    `)).data.transactions.edges;
    const inTxs = (await query(`
      query {
        transactions(
          recipients: ["${addr}"]
        ) {
          edges {
            node {
              id
              block {
                timestamp
              }
              quantity {
                ar
              }
            }
          }
        }
      }
    `)).data.transactions.edges;

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
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let community = new Community(client);
    await community.setCommunityTx("d3D9G1sR_cuZFhHJGCzIRF_emQArv3efegnsvJc_0E8");
    return await community.getVaultBalance(addr);
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
      <h1>{addr}</h1>
    </div>
    <div class="short-cell">
      <p>reputation</p>
      <h1>51.7329</h1>
    </div>
  </div>
  <div class="post-info big">
    <div class="long-cell">
      {#if $balance === 0}
        <p><SkeletonLoading style="height: 1em; width: 120px" /></p>
        <h1><SkeletonLoading style="height: 1em; width: 300px" /></h1>
      {:else}
        <p in:fade={{ duration: 150 }}>total balance</p>
        <h1 in:fade={{ duration: 150 }}>{roundCurrency($balance)}<span class="currency">AR</span><span style="vertical-align: super; color: #00D46E; font-size: .5em">(+0.75%)</span></h1>
      {/if}
    </div>
    <div class="short-cell">
      {#await stake}
        <p><SkeletonLoading style="height: 1em; width: 120px" /></p>
        <h1><SkeletonLoading style="height: 1em; width: 180px" /></h1>
      {:then loadedStake}
        <p>total stake</p>
        <h1>{roundCurrency(loadedStake.toString())}<span class="currency">AR</span></h1>
      {/await}
    </div>
  </div>
  <br>
  <div class="information">
    <div class="menu">
      <button class:active={activeMenu === "transactions"} on:click={() => activeMenu = "transactions"}>Transactions</button>
      <button class:active={activeMenu === "assets"} on:click={() => activeMenu = "assets"}>Assets</button>
      <div class="trade">
        <Button href="/trade" style={"font-family: 'JetBrainsMono', monospace; text-transform: uppercase;"}>Trade now</Button>
      </div>
    </div>
    <div class="content">
      {#if activeMenu === "assets"}
        <table in:fade={{ duration: 400 }}>
          <tr>
            <th>Token</th>
            <th>Dist.</th>
            <th>Amount</th>
            <th>Value (AR)</th>
          </tr>
          <tr>
            <td style="width: 45%;">nest.land token</td>
            <td>49.43%</td>
            <td>0.00696969 <span class="currency">egg</span></td>
            <td>1.52317899</td>
          </tr>
          <tr>
            <td style="width: 45%;">Light Bulb Coin</td>
            <td>26.86%</td>
            <td>0.00413056 <span class="currency">lum</span></td>
            <td>0.82853913</td>
          </tr>
          <tr>
            <td style="width: 45%;">SoundWave Inc.</td>
            <td>16.58%</td>
            <td>0.00505455 <span class="currency">wav</span></td>
            <td>0.51124595</td>
          </tr>
          <tr>
            <td style="width: 45%;">Reddit Coin</td>
            <td>07.12%</td>
            <td>0.00240055 <span class="currency">red</span></td>
            <td>0.21954591</td>
          </tr>
        </table>
      {:else}
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
      {/if}
    </div>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"

  .post
    padding: 4.4em 15vw 3em

    .post-info
      display: flex
      margin-bottom: 1.6em

      @media screen and (max-width: 720px)
        display: block

      .long-cell
        width: 78%

        @media screen and (max-width: 720px)
          width: auto
          margin-bottom: 2em

      .short-cell
        width: 22%

        @media screen and (max-width: 720px)
          width: auto

      h1
        color: #000
        font-size: 1.25em
        margin: 0

        span.currency
          font-size: .6em
          text-transform: uppercase

      p
        color: rgba(#000, .3)
        font-weight: 600
        font-size: .9em
        margin: 0 0 .8em 0
        text-transform: uppercase

      &.big
        h1
          font-size: 2em

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
            padding:
              left: 0
              right: 0

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