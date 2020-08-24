<script lang="ts">

  import { fade } from "svelte/transition";

  import { query } from "../../api-client";
  import exchangesQuery from "../../queries/exchanges.gql";
  import Arweave from "arweave";
  import tokensQuery from "../../queries/tokens.gql";
  import { exchangeWallet } from "../../utils/constants";
  import moment from "moment";
  import SkeletonLoading from "../SkeletonLoading.svelte";

  let exchanges = getLatestExchanges();

  async function getLatestExchanges (): Promise<{ id: string, timestamp: string, type: string, ar: string, pst: string, status: string, duration: string }[]> {
    if(!process.browser) return [];
    
    let exchanges: { id: string, timestamp: string, type: string, ar: string, pst: string, status: string, duration: string }[] = [];
    
    const txs = (await query({
      query: exchangesQuery,
      variables: {
        num: 5
      }
    })).data.transactions.edges;
    
    const psts = await getSupportedPSTs();

    txs.map(({ node }) => {
      const tradeType = node.tags.find(tag => tag.name === "Trade-Opcode")?.value;
      if (tradeType) {
        const arVal = node.tags.find(tag => tag.name === "Buy-For")?.value;
        const pstVal = node.tags.find(tag => tag.name === "Sell-Qty")?.value;

        const tokenId = node.tags.find(tag => tag.name === "Target-Token")?.value;
        const token = psts.find(pst => pst.id === tokenId)?.ticker;

        exchanges.push({
          id: node.id,
          timestamp: moment.unix(node.block.timestamp).format("YYYY-MM-DD hh:mm:ss"),
          type: tradeType,
          ar: arVal + " AR",
          pst: pstVal + " " + token,
          status: "pending",
          duration: "not completed"
        })
      }
    })

    for (let i = 0; i < exchanges.length; i++) {
      console.log(exchanges[i].timestamp);
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
      
      if (match[0]) {
        exchanges[i].status = "success";

        const start = moment(exchanges[i].timestamp);
        const end = moment(
          moment.unix(match[0].node.block.timestamp).format("YYYY-MM-DD hh:mm:ss")
        );
        const duration = moment.duration(end.diff(start));

        exchanges[i].duration = duration.humanize();
      }
    }

    return exchanges;
  }

  async function getSupportedPSTs (): Promise<{ id: string, name: string, ticker: string }[]> {
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
      query: tokensQuery,
        variables: {
          owners: [exchangeWallet]
        }
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
          <td style="width: 45%"><span class="direction">{exchange.type}</span> {exchange.pst} {"->"} {exchange.ar} <span class="status {exchange.status}"></span></td>
          <td style="text-transform: uppercase">{exchange.duration}</td>
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
