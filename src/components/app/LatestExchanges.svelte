<script lang="ts">

  import { fade } from "svelte/transition";

  import { query } from "../../api-client";
  import exchangesQuery from "../../queries/exchanges.gql";
  import moment from "moment";
  import SkeletonLoading from "../SkeletonLoading.svelte";

  let exchanges = getLatestExchanges();

  async function getLatestExchanges (): Promise<{ timestamp: string, status: string }[]> {
    if(!process.browser) return [];
    
    let exchanges: { timestamp: string, status: string }[] = [];
    
    const txs = (await query({
      query: exchangesQuery,
      variables: {
        num: 5
      }
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

<div class="section">
  <h1 class="title">Exchanges</h1>
  <table>
    <tr>
      <th>Timestamp</th>
      <th>Exchange</th>
      <th>Duration</th>
    </tr>
    {#await exchanges}
      {#each Array(5) as _}
        <tr>
          <td style="width: 30%"><SkeletonLoading style={"width: 100%"} /></td>
          <td style="width: 60%"><SkeletonLoading style={"width: 100%"} /></td>
          <td style="width: 15%"><SkeletonLoading style={"width: 100%"} /></td>
        </tr>
      {/each}
    {:then loadedExchanges}
      {#if loadedExchanges.length === 0}
        <p style="position: absolute; left: 50%; transform: translateX(-50%);">No exchanges found</p>
        <tr><td><br></td><td></td></tr> <!-- empty line to push "view-all" down -->
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
  <a href="/app/all-exchanges" class="view-all">View all {"->"}</a>
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
