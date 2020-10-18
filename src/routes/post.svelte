<script lang="typescript">
  import Verto from "@verto/lib";
  import { loggedIn } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import Arweave from "arweave";
  import NavBar from "../components/NavBar.svelte";
  import { fade } from "svelte/transition";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";
  import Button from "../components/Button.svelte";
  import Footer from "../components/Footer.svelte";

  const client = new Verto();

  let activeMenu: string = "transactions";
  let addr: string = "";

  if (process.browser && !$loggedIn) goto("/");

  if (process.browser) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("addr") === null) goto("/gallery");
    addr = params.get("addr");
  }

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  let balance = getPostBalance();
  let stake = client.getPostStake(addr);
  let reputation = client.getReputation(addr);

  let transactions: Promise<
    {
      id: string;
      amount: number;
      type: string;
      status: string;
      timestamp: number;
    }[]
  > = client.getTransactions(addr);
  let balances: Promise<
    { id: string; name: string; ticker: string; balance: number }[]
  > = client.getAssets(addr);
  let supportedTokens: Promise<
    {
      id: string;
      name: string;
      ticker: string;
    }[]
  > = client.getTPTokens(addr);

  async function getPostBalance(): Promise<string> {
    if (!process.browser) return "";

    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    return client.ar.winstonToAr(await client.wallets.getBalance(addr));
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
        <p>
          <SkeletonLoading style="height: 1em; width: 100px" />
        </p>
        <h1>
          <SkeletonLoading style="height: 1em; width: 100px" />
        </h1>
      {:then loadedReputation}
        <p>reputation</p>
        <h1>{loadedReputation}</h1>
      {/await}
    </div>
  </div>
  <div class="post-info big">
    <div class="long-cell">
      {#await balance}
        <p>
          <SkeletonLoading style="height: 1em; width: 120px" />
        </p>
        <h1>
          <SkeletonLoading style="height: 1em; width: 300px" />
        </h1>
      {:then loadedBalance}
        <p in:fade={{ duration: 150 }}>total balance</p>
        <h1 in:fade={{ duration: 150 }}>
          {roundCurrency(loadedBalance)}<span class="currency">AR</span>
        </h1>
      {/await}
    </div>
    <div class="short-cell">
      {#await stake}
        <p>
          <SkeletonLoading style="height: 1em; width: 120px" />
        </p>
        <h1>
          <SkeletonLoading style="height: 1em; width: 180px" />
        </h1>
      {:then loadedStake}
        <p>total stake</p>
        <h1>{loadedStake}<span class="currency">VRT</span></h1>
      {/await}
    </div>
  </div>
  <br />
  <div class="information">
    <div class="menu">
      <button
        class:active={activeMenu === 'transactions'}
        on:click={() => (activeMenu = 'transactions')}>Transactions</button>
      <button
        class:active={activeMenu === 'assets'}
        on:click={() => (activeMenu = 'assets')}>Assets</button>
      <button
        class:active={activeMenu === 'supported'}
        on:click={() => (activeMenu = 'supported')}>Supported Assets</button>
      <div class="trade">
        <Button
          href="/trade?post={addr}"
          style={"font-family: 'JetBrainsMono', monospace; text-transform: uppercase;"}>
          Trade now
        </Button>
      </div>
    </div>
    <div class="content">
      {#if activeMenu === 'assets'}
        {#await balances}
          <table>
            <tr style="width: 100%">
              <th>Name</th>
              <th>ID</th>
              <th>Amount</th>
            </tr>
            {#each Array(4) as _}
              <tr>
                <td style="width: 20%">
                  <SkeletonLoading style="width: 100%;" />
                </td>
                <td style="width: 60%">
                  <SkeletonLoading style="width: 100%;" />
                </td>
                <td style="width: 20%">
                  <SkeletonLoading style="width: 100%;" />
                </td>
              </tr>
            {/each}
          </table>
        {:then loadedBalances}
          {#if loadedBalances.length === 0}
            <p>You don't have any tokens!</p>
          {:else}
            <table>
              <tr style="width: 100%">
                <th>Name</th>
                <th>ID</th>
                <th>Amount</th>
              </tr>
              {#each loadedBalances as balance}
                <tr>
                  <td style="width: 20%">{balance.name}</td>
                  <td style="width: 60%">{balance.id}</td>
                  <td style="width: 20%">
                    {balance.balance}
                    <span class="currency">{balance.ticker}</span>
                  </td>
                </tr>
              {/each}
            </table>
          {/if}
        {/await}
      {:else if activeMenu === 'transactions'}
        <table in:fade={{ duration: 400 }}>
          <tr>
            <th style="text-transform: none">TxID</th>
            <th>Amount</th>
          </tr>
          {#await transactions}
            {#each Array(5) as _}
              <tr>
                <td style="width: 70%">
                  <SkeletonLoading style={'width: 100%'} />
                </td>
                <td style="width: 20%">
                  <SkeletonLoading style={'width: 100%'} />
                </td>
              </tr>
            {/each}
          {:then loadedTxs}
            {#each loadedTxs as tx}
              <tr>
                <td style="width: 70%">
                  <a
                    href="https://viewblock.io/arweave/tx/{tx.id}"
                    class="transaction">
                    <span class="direction">{tx.type}</span>
                    {tx.id}
                  </a>
                  <span class="status {tx.status}" />
                </td>
                <td style="width: 20%">{tx.amount} AR</td>
              </tr>
            {/each}
          {/await}
        </table>
      {:else if activeMenu === 'supported'}
        <table in:fade={{ duration: 400 }}>
          {#await supportedTokens}
            {#each Array(5) as _}
              <tr>
                <td style="width: 30%">
                  <SkeletonLoading style={'width: 100%'} />
                </td>
                <td style="width: 20%">
                  <SkeletonLoading style={'width: 100%'} />
                </td>
                <td style="width: 50%">
                  <SkeletonLoading style={'width: 100%'} />
                </td>
              </tr>
            {/each}
          {:then loadedTokens}
            <tr>
              <th>Token</th>
              <th>Ticker</th>
              <th>ID</th>
            </tr>
            {#if loadedTokens.length === 0}
              <p
                style="position: absolute; left: 50%; transform: translateX(-50%);">
                No transactions found
              </p>
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
        color: var(--primary-text-color)
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
        color: var(--secondary-text-color)
        font-weight: 600
        font-size: .9em
        margin: 0 0 .8em 0
        text-transform: uppercase

    .information
      @include table

      .content
        @media screen and (max-width: 720px)
          width: 100vw - $mobileSidePadding
          overflow-x: auto

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
        @include menu-style

</style>
