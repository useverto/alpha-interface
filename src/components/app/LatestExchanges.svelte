<script lang="ts">
  import { fade } from "svelte/transition";

  import { query } from "../../api-client";
  import exchangesQuery from "../../queries/exchanges.gql";
  import Arweave from "arweave";
  import tokensQuery from "../../queries/tokens.gql";
  import { exchangeWallet, pstContract } from "../../utils/constants";
  import moment from "moment";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import { address } from "../../stores/keyfileStore.ts";

  let exchanges = getLatestExchanges();

  async function getLatestExchanges(): Promise<
    {
      id: string;
      timestamp: string;
      type: string;
      sent: string;
      received: string;
      status: string;
      duration: string;
    }[]
  > {
    if (!process.browser) return [];

    let exchanges: {
      id: string;
      timestamp: string;
      type: string;
      sent: string;
      received: string;
      status: string;
      duration: string;
    }[] = [];

    const txs = (
      await query({
        query: exchangesQuery,
        variables: {
          owners: [$address],
          num: 5,
        },
      })
    ).data.transactions.edges;

    const psts = await getSupportedPSTs();

    txs.map(({ node }) => {
      const tradeType = node.tags.find((tag) => tag.name === "Type")?.value;
      if (tradeType) {
        const tokenTag = tradeType === "Buy" ? "Token" : "Contract";
        const token = node.tags.find((tag: any) => tag.name === tokenTag)
          ?.value!;
        const ticker = psts.find((pst) => pst.id === token)?.ticker;

        const sent =
          tradeType === "Buy"
            ? node.quantity.ar + " AR"
            : JSON.parse(
                node.tags.find((tag: any) => tag.name === "Input")?.value!
              )["qty"] +
              " " +
              ticker;
        const received = "??? " + (tradeType === "Buy" ? ticker : "AR");

        exchanges.push({
          id: node.id,
          timestamp: node.block
            ? moment.unix(node.block.timestamp).format("YYYY-MM-DD hh:mm:ss")
            : "NOT MINED YET",
          type: tradeType,
          sent,
          received,
          status: "pending",
          duration: "not completed",
        });
      }
    });

    for (let i = 0; i < exchanges.length; i++) {
      const match = (
        await query({
          query: `
          query {
            transactions(
              tags: [
                { name: "Exchange", values: "Verto" }
                { name: "Type", values: "Confirmation" }
                { name: "Match", values: "${exchanges[i].id}" }
              ]
            ) {
              edges {
                node {
                  block {
                    timestamp
                  }
                  tags {
                    name
                    value
                  }
                }
              }
            }
          }
        `,
        })
      ).data.transactions.edges;

      if (match[0]) {
        exchanges[i].status = "success";

        if (match[0].node.block) {
          const start = moment(exchanges[i].timestamp);
          const end = moment(
            moment
              .unix(match[0].node.block.timestamp)
              .format("YYYY-MM-DD hh:mm:ss")
          );
          const duration = moment.duration(end.diff(start));

          exchanges[i].duration = duration.humanize();
        } else {
          exchanges[i].duration = "NOT MINED YET";
        }

        const receivedTag = match[0].node.tags.find(
          (tag: any) => tag.name === "Received"
        );
        if (receivedTag) {
          exchanges[i].received = receivedTag.value;
        }
      }
    }

    return exchanges;
  }

  async function getSupportedPSTs(): Promise<
    { id: string; name: string; ticker: string }[]
  > {
    if (!process.browser) return [];

    let psts: { id: string; name: string; ticker: string }[] = [];

    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let txIds = [];
    const _txIds = (
      await query({
        query: tokensQuery,
        variables: {
          owners: [exchangeWallet],
          contractSrc: pstContract,
        },
      })
    ).data.transactions.edges;
    _txIds.map(({ node }) => {
      txIds.push(node.id);
    });

    for (const id of txIds) {
      try {
        const contractId = (
          await client.transactions.getData(id, { decode: true, string: true })
        ).toString();
        const contractData = JSON.parse(
          (
            await client.transactions.getData(contractId, {
              decode: true,
              string: true,
            })
          ).toString()
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
  <h1 class="title">Trades</h1>
  <table>
    <tr>
      <th>Timestamp</th>
      <th>Trade</th>
      <th>Duration</th>
    </tr>
    {#await exchanges}
      {#each Array(5) as _}
        <tr>
          <td style="width: 30%">
            <SkeletonLoading style={'width: 100%'} />
          </td>
          <td style="width: 60%">
            <SkeletonLoading style={'width: 100%'} />
          </td>
          <td style="width: 15%">
            <SkeletonLoading style={'width: 100%'} />
          </td>
        </tr>
      {/each}
    {:then loadedExchanges}
      {#if loadedExchanges.length === 0}
        <p style="position: absolute; left: 50%; transform: translateX(-50%);">
          No trades found
        </p>
        <tr>
          <td><br /></td>
          <td />
        </tr>
        <!-- empty line to push "view-all" down -->
      {/if}
      {#each loadedExchanges as exchange}
        <tr in:fade={{ duration: 300 }}>
          <td style="width: 30%">{exchange.timestamp}</td>
          <td style="width: 45%">
            {exchange.sent}
            {'->'}
            {exchange.received}
            <span class="status {exchange.status}" />
          </td>
          <td style="text-transform: uppercase">{exchange.duration}</td>
        </tr>
        <tr />
      {/each}
    {/await}
  </table>
  <a href="/app/all-exchanges" class="view-all">View all {'->'}</a>
</div>
