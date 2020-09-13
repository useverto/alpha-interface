<script lang="typescript">
  import { address } from "../../stores/keyfileStore.ts";
  import moment from "moment";
  import Loading from "../Loading.svelte";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import { fade } from "svelte/transition";
  import latestTransactionsQuery from "../../queries/latestTransactions.gql";
  import { query } from "../../api-client";
  import Arweave from "arweave";

  let transactions = getLatestTransactions();

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  async function getLatestTransactions(): Promise<
    {
      id: string;
      amount: number;
      type: string;
      status: string;
      timestamp: number;
    }[]
  > {
    if (!process.browser) return [];

    let txs: {
      id: string;
      amount: number;
      type: string;
      status: string;
      timestamp: number;
    }[] = [];

    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    const outTxs = (
        await query({
          query: latestTransactionsQuery,
          variables: {
            recipients: null,
            owners: [$address],
          },
        })
      ).data.transactions.edges,
      inTxs = (
        await query({
          query: latestTransactionsQuery,
          variables: {
            recipients: [$address],
            owners: null,
          },
        })
      ).data.transactions.edges;

    outTxs.map(({ node }) => {
      txs.push({
        id: node.id,
        amount: node.quantity.ar,
        type: "out",
        status: "",
        timestamp: node.block.timestamp,
      });
    });
    inTxs.map(({ node }) => {
      txs.push({
        id: node.id,
        amount: node.quantity.ar,
        type: "in",
        status: "",
        timestamp: node.block.timestamp,
      });
    });

    txs.sort((a, b) => b.timestamp - a.timestamp);
    txs = txs.slice(0, 5);

    for (let i = 0; i < txs.length; i++) {
      try {
        let res = await client.transactions.getStatus(txs[i].id);
        if (res.status === 200) txs[i].status = "success";
        else txs[i].status = "pending";
      } catch (error) {
        console.log(error);
      }
    }

    return txs;
  }
</script>

<!-- prettier-ignore -->
<style lang="sass">

  @import "../../styles/tables.sass"
  @import "../../styles/general.sass"

  .section
    @include table
    padding-bottom: 2.5em

    @media screen and (max-width: 720px)
      width: 100vw - $mobileSidePadding * 2
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

    &:first-child
      padding-top: 3.5em

    a.transaction
      text-decoration: none
      color: black

</style>

<div class="section">
  <h1 class="title">Transactions</h1>
  <table>
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
      {#if loadedTxs.length === 0}
        <p style="position: absolute; left: 50%; transform: translateX(-50%);">
          No transactions found
        </p>
        <tr>
          <td><br /></td>
          <td />
        </tr>
        <!-- empty line to push "view-all" down -->
      {/if}
      {#each loadedTxs as tx}
        <tr in:fade={{ duration: 300 }}>
          <td style="width: 70%">
            <a
              href="https://viewblock.io/arweave/tx/{tx.id}"
              class="transaction">
              <span class="direction">{tx.type}</span>
              {tx.id}
            </a>
            <span class="status {tx.status}" />
          </td>
          <td style="width: 20%">{roundCurrency(tx.amount)} AR</td>
        </tr>
        <tr />
      {/each}
    {/await}
  </table>
  <a href="/app/all-transactions" class="view-all">View all {'->'}</a>
</div>
