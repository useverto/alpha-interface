  <script lang="typescript">

  import { address } from "../../stores/keyfileStore.js";
  import moment from "moment";
  import { equals } from "arql-ops";

  let client;
  let transactions = getLatestTransactions();

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  async function getLatestTransactions (): Promise<{ id: string, amount: number, time: string }[]> {
    if(!process.browser) return [];

    // @ts-ignore
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let 
      query = equals("from", $address),
      _txs: { id: string, amount: number, time: string }[] = [],
      allTxs = await client.arql(query);

    for(let i = 0; i < 5; i++) {
      try {
        let res = await client.transactions.get(allTxs[i]);
        _txs.push({
          id: allTxs[i],
          amount: client.ar.winstonToAr(res.quantity),
          time: res.get('timestamp', {decode: true, string: true})
        });
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
          <th>Time</th>
      </tr>
      {#await transactions}
          <p>Loading...</p>
      {:then loadedTxs}
          {#each loadedTxs as tx}
          <tr>
              <td style="width: 70%">{tx.id} <span class="status success"></span></td>
              <td style="width: 20%">{roundCurrency(tx.amount)}</td>
              <td style="text-transform: uppercase">{tx.time}</td>
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
</style>