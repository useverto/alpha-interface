<script lang="typescript">

  import { loggedIn } from "../../stores/keyfileStore.js";
  import NavBar from "../../components/NavBar.svelte";
  import Footer from "../../components/Footer.svelte";
  import { fade } from "svelte/transition";

  import { query } from "../../api-client";
  import exchangesQuery from "../../queries/exchanges.gql";
  import moment from "moment";

  if(process.browser && !$loggedIn) goto("/");

  let exchanges = getLatestExchanges();

  async function getLatestExchanges (): Promise<{ timestamp: string, status: string }[]> {
    if(!process.browser) return [];
    
    let exchanges: { timestamp: string, status: string }[] = [];
    
    const txs = (await query({
      query: exchangesQuery
    })).data.transactions.edges;
    
    txs.map(({ node }) => {
      exchanges.push({
        timestamp: moment.unix(node.block.timestamp).format("YYYY-MM-DD hh:mm:ss"),
        status: "pending"
      })
    })

    return exchanges;
  }

</script>

<svelte:head>
  <title>Verto — All Exchanges</title>
</svelte:head>

<NavBar />
<div class="all-exchanges" in:fade={{ duration: 300 }}>
  <h1 class="title">All Exchanges</h1>
  <table>
    <tr>
      <th>Timestamp</th>
      <th>Exchange</th>
      <th>Duration</th>
    </tr>
    {#await exchanges}
      <!-- TODO: Loading state -->
    {:then loadedExchanges}
      {#if loadedExchanges.length === 0}
        <p style="position: absolute; left: 50%; transform: translateX(-50%);">No exchanges found</p>
        <tr><td><br></td><td></td></tr>
      {/if}
      {#each loadedExchanges as exchange}
        <tr in:fade={{ duration: 300 }}>
          <td style="width: 30%">{exchange.timestamp}</td>
          <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status {exchange.status}"></span></td>
          <td style="text-transform: uppercase">4hrs 20min</td>
        </tr>
        <tr>
      </tr>
      {/each}
    {/await}
  </table>
</div>
<Footer />

<style lang="sass">

  @import "../../styles/tables.sass"

  .all-exchanges
    padding: 3em 15vw
    @include table 

</style>