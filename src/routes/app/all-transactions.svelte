<script lang="typescript">

  import moment from "moment";
  import NavBar from "../../components/NavBar.svelte";
  import Footer from "../../components/Footer.svelte";
  import Loading from "../../components/Loading.svelte";
  import { ITransaction } from "../../types.ts";
  import { address } from "../../stores/keyfileStore.ts";
  import { loggedIn } from "../../stores/keyfileStore.ts";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { equals, or } from "arql-ops";

  if(process.browser && !$loggedIn) goto("/");

  let currentPage = 1, lastPage = 1;
  let client;
  let transactions = getAllTransactions();

  // set current page
  // redirect to first page if the current page is greater than the last page
  if(process.browser) {
    const params = new URLSearchParams(window.location.search);
    if(params.get("page") !== null) currentPage = parseInt(params.get("page"));
    if(currentPage > lastPage) goto("/app/all-transactions");
  }

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  async function getAllTransactions (): Promise<ITransaction[]> {
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
      _txs: ITransaction[] = [],
      allTxs = await client.arql(query);

    for(let i = 0; i < allTxs.length; i++) {
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

<svelte:head>
  <title>Transactions overview</title>
</svelte:head>

<NavBar />
<div class="all-transactions" in:fade={{ duration: 300 }}>
  <h1 class="title">All Transactions</h1>
  <table>
    <tr>
      <th style="text-transform: none">TxID</th>
      <th>Amount</th>
    </tr>
    {#await transactions}
      <Loading style="position: absolute; left: 50%;" />
      <tr><td><br></td><td></td></tr> <!-- empty line to push "view-all" down -->
    {:then loadedTxs}
      {#if loadedTxs.length === 0}
        <p style="position: absolute; left: 50%; transform: translateX(-50%);">No transactions found</p>
        <tr><td><br></td><td></td></tr> <!-- empty line to push "view-all" down -->
      {/if}
      {#each loadedTxs as tx}
        <tr>
          <td style="width: 70%">
            <a href="https://viewblock.io/arweave/tx/{tx.id}">
              {tx.id} 
              <span class="status {tx.status}"></span>
            </a>
          </td>
          <td style="width: 20%">{roundCurrency(tx.amount)} AR</td>
        </tr>
      {/each}
    {/await}
  </table>
  <div class="pagination">
    <a href="/app/all-transactions{currentPage <= 1 ? "" : ("?page=" + (currentPage - 1))}" class="prev">{"<-"}</a>
    <span class="current">{currentPage}</span>
    <a href="/app/all-transactions{lastPage >= currentPage ? "" : ("?page=" + (currentPage + 1))}" class="next">{"->"}</a>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../../styles/tables.sass"

  .all-transactions
    padding: 3em 15vw
    @include table 

    .pagination
      margin-top: 1.3em
      @include pagination

    td
      a
        text-decoration: none
        color: black

</style>