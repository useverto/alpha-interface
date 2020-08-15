  <script lang="typescript">

  import { address } from "../../stores/keyfileStore.js";
  import moment from "moment";
  import Loading from "../Loading.svelte";
  import { equals, or } from "arql-ops";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import { fade } from "svelte/transition";

  let client;
  let transactions = getLatestTransactions();

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  async function getLatestTransactions (): Promise<{ id: string, amount: number, status: string }[]> {
    if(!process.browser) return [];

    // @ts-ignore
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let 
      query = or(
        equals("from", $address),
        equals("to", $address),
      ),
      _txs: { id: string, amount: number, status: string }[] = [],
      allTxs = await client.arql(query);

    for(let i = 0; i < 5; i++) {
      try {
        let res = await client.transactions.get(allTxs[i]);
        _txs.push({
          id: allTxs[i],
          amount: client.ar.winstonToAr(res.quantity),
          status: ""
        });
      } catch (error) {
        console.log(error);
      }

      try {
        let res = await client.transactions.getStatus(allTxs[i]);
        if (res.status === 200)
          _txs[i].status = "success";
        else
          _txs[i].status = "pending";
      } catch (error) {
        console.log(error);
      }
    }

    return _txs;
  }

</script>

<div class="section">
  <h1 class="title">Transactions</h1>
  <table>
    <tr>
      <th style="text-transform: none">TxID</th>
      <th>Amount</th>
    </tr>
    {#await transactions}
      <tr>
        <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
        <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
      </tr>
      <tr>
        <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
        <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
      </tr>
      <tr>
        <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
        <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
      </tr>
      <tr>
        <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
        <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
      </tr>
      <tr>
        <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
        <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
      </tr>
    {:then loadedTxs}
      {#if loadedTxs.length === 0}
        <p style="position: absolute; left: 50%; transform: translateX(-50%);">No transactions found</p>
        <tr><td><br></td><td></td></tr> <!-- empty line to push "view-all" down -->
      {/if}
      {#each loadedTxs as tx}
        <tr in:fade={{ duration: 300 }}>
          <td style="width: 70%">
            <a href="https://viewblock.io/arweave/tx/{tx.id}" class="transaction">
              {tx.id} 
              <span class="status {tx.status}"></span>
            </a>
          </td>
          <td style="width: 20%">{roundCurrency(tx.amount)} AR</td>
        </tr>
        <tr>
      </tr>
      {/each}
    {/await}
  </table>
  <a href="/app/all-transactions" class="view-all">View all {"->"}</a>
</div>

<style lang="sass">

  @import "../../styles/tables.sass"

  .section
    @include table
    padding-bottom: 2.5em

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