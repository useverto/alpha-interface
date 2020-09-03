<script lang="typescript">
  import { loggedIn } from "../../stores/keyfileStore.js";
  import NavBar from "../../components/NavBar.svelte";
  import Footer from "../../components/Footer.svelte";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { query } from "../../api-client";
  import exchangesQuery from "../../queries/exchanges.gql";
  import { address } from "../../stores/keyfileStore";
  import Arweave from "arweave";
  import tokensQuery from "../../queries/tokens.gql";
  import { exchangeWallet } from "../../utils/constants";
  import moment from "moment";
  import SkeletonLoading from "../../components/SkeletonLoading.svelte";
  import Loading from "../../components/Loading.svelte";

  let client, element, windowHeight, y;
  let exchanges: {
    id: string;
    timestamp: string;
    type: string;
    ar: string;
    pst: string;
    status: string;
    duration: string;
  }[] = [];
  let lastCursor = "";
  let hasNext = true,
    loadedExchanges = false,
    loading = false;

  onMount(() => loadMoreExchanges());

  async function loadMoreExchanges() {
    if (!process.browser) return;
    if (!hasNext) return;

    let _exchanges: {
      id: string;
      timestamp: string;
      type: string;
      ar: string;
      pst: string;
      status: string;
      duration: string;
    }[] = [];
    loading = true;

    const txsQuery = (
        await query({
          query: exchangesQuery,
          variables: {
            owners: [$address],
            cursor: lastCursor,
          },
        })
      ).data.transactions,
      txs = txsQuery.edges;

    hasNext = txsQuery.pageInfo.hasNextPage;

    const psts = await getSupportedPSTs();

    txs.map(({ node, cursor }) => {
      lastCursor = cursor;
      const tradeType = node.tags.find((tag) => tag.name === "Trade-Opcode")
        ?.value;
      if (tradeType) {
        const arVal = node.tags.find((tag) => tag.name === "Buy-For")?.value;
        const pstVal = node.tags.find((tag) => tag.name === "Sell-Qty")?.value;

        const tokenId = node.tags.find((tag) => tag.name === "Target-Token")
          ?.value;
        const token = psts.find((pst) => pst.id === tokenId)?.ticker;

        _exchanges.push({
          id: node.id,
          timestamp: moment
            .unix(node.block.timestamp)
            .format("YYYY-MM-DD hh:mm:ss"),
          type: tradeType,
          ar: arVal + " AR",
          pst: pstVal + " " + token,
          status: "pending",
          duration: "not completed",
        });
      }
    });

    for (let i = 0; i < _exchanges.length; i++) {
      const inverseTradeType = _exchanges[i].type === "Buy" ? "Sell" : "Buy";

      const match = (
        await query({
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
                  values: "${_exchanges[i].id}"
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
        })
      ).data.transactions.edges;

      if (match[0]) {
        _exchanges[i].status = "success";

        const start = moment(_exchanges[i].timestamp);
        const end = moment(
          moment
            .unix(match[0].node.block.timestamp)
            .format("YYYY-MM-DD hh:mm:ss")
        );
        const duration = moment.duration(end.diff(start));

        _exchanges[i].duration = duration.humanize();
      }
    }

    exchanges = exchanges.concat(_exchanges);
    loadedExchanges = true;
    setTimeout(() => (loading = false), 400); // wait for animation and latency to complete (needed for the scroll)
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

  $: {
    if (element !== undefined) {
      let componentY = element.offsetTop + element.offsetHeight;
      if (
        componentY <= y + windowHeight + 120 &&
        loadedExchanges &&
        !loading &&
        hasNext
      )
        loadMoreExchanges();
    }
  }
</script>

<!-- prettier-ignore -->
<style lang="sass">
  @import "../../styles/tables.sass" @import "../../styles/general.sass"
    .all-exchanges @include page @include table;
</style>

<svelte:head>
  <title>Verto — All Exchanges</title>
</svelte:head>

<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} />
<NavBar />
<div class="all-exchanges" in:fade={{ duration: 300 }}>
  <h1 class="title">All Trades</h1>
  <table>
    <tr>
      <th>Timestamp</th>
      <th>Trade</th>
      <th>Duration</th>
    </tr>
    {#if !loadedExchanges}
      {#each Array(10) as _}
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
    {:else if exchanges.length === 0}
      <p
        in:fade={{ duration: 150 }}
        style="position: absolute; left: 50%; transform: translateX(-50%);">
        No trades found
      </p>
      <tr>
        <td><br /></td>
        <td />
      </tr>
      <!-- empty line to push "view-all" down -->
    {:else}
      {#each exchanges as exchange}
        <tr in:fade={{ duration: 300 }}>
          <td style="width: 30%">{exchange.timestamp}</td>
          <td style="width: 45%">
            {#if exchange.type === 'Buy'}{exchange.ar}{:else}{exchange.pst}{/if}
            {'->'}
            {#if exchange.type === 'Buy'}{exchange.pst}{:else}{exchange.ar}{/if}
            <span class="status {exchange.status}" />
          </td>
          <td style="text-transform: uppercase">{exchange.duration}</td>
        </tr>
        <tr />
      {/each}
      {#if loading}
        <!-- if the site is loading, but there are transactions already loaded  -->
        <Loading style="position: absolute; left: 50%;" />
        <tr>
          <td><br /></td>
          <td />
        </tr>
        <!-- empty line to push "view-all" down -->
      {/if}
    {/if}
  </table>
</div>
<Footer />
<span style="width: 100%; height: 1px" bind:this={element} />
