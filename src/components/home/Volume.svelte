<script lang="typescript">
  import Arweave from "arweave";
  import { query } from "../../api-client";
  import { exchangeWallet, pstContract } from "../../utils/constants";
  import moment from "moment";
  import Loading from "../Loading.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";

  let selected: string = "AR";

  const tokens = getTokens();

  async function getTokens() {
    if (!process.browser) return [];

    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    const tokensQuery = (
      await query({
        query: `
        query($owners: [String!], $contractSrc: [String!]!) {
          transactions(
            owners: $owners
            tags: [
              { name: "Exchange", values: "Verto" }
              { name: "Type", values: "PST" }
              { name: "Contract", values: $contractSrc }
            ]
          ) {
            edges {
              node {
                id
              }
            }
          }
        }`,
        variables: {
          owners: [exchangeWallet],
          contractSrc: pstContract,
        },
      })
    ).data.transactions.edges;

    let txIDs: string[] = [];
    tokensQuery.map((tx) => {
      txIDs.push(tx.node.id);
    });

    let tokens: { id: string; ticker: string }[] = [];
    for (const id of txIDs) {
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

      tokens.push({
        id: contractId,
        ticker: contractData.ticker,
      });
    }

    return tokens;
  }

  let volume = getVolume();

  async function getVolume() {
    if (!process.browser) return [];

    const gensisTxs = (
      await query({
        query: `
      query($recipients: [String!]) {
        transactions(
          recipients: $recipients
          tags: [
            { name: "Exchange", values: "Verto" }
            { name: "Type", values: "Genesis" }
          ]
        ) {
          edges {
            node {
              owner {
                address
              }
            }
          }
        }
      }`,
        variables: {
          recipients: [exchangeWallet],
        },
      })
    ).data.transactions.edges;

    let posts: string[] = [];
    gensisTxs.map((tx) => {
      if (!posts.find((addr) => addr === tx.node.owner.address)) {
        posts.push(tx.node.owner.address);
      }
    });

    const maxInt = 2147483647;

    const orderTxs = (
      await query({
        query: `
      query($recipients: [String!]) {
        transactions(
          recipients: $recipients
          tags: [
            { name: "Exchange", values: "Verto" }
            { name: "Type", values: "${selected === "AR" ? "Buy" : "Sell"}" }
            ${
              selected === "AR"
                ? ""
                : `{ name: "Contract", values: "${
                    (await getTokens()).find(
                      (token) => token.ticker === selected
                    ).id
                  }" }`
            }
          ]
          first: ${maxInt}
        ) {
          edges {
            node {
              block {
                timestamp
              }
              quantity {
                ar
              }
              tags {
                name
                value
              }
            }
          }
        }
      }`,
        variables: {
          recipients: posts,
        },
      })
    ).data.transactions.edges;

    let orders: { amnt: number; timestamp: number }[] = [];
    orderTxs.map((order) => {
      orders.push({
        amnt:
          selected === "AR"
            ? parseFloat(order.node.quantity.ar)
            : JSON.parse(
                order.node.tags.find((tag) => tag.name === "Input").value
              ).qty,
        timestamp: order.node.block.timestamp,
      });
    });

    let volume: number[] = [];
    let days: string[] = [];

    if (orders.length > 0) {
      let high = moment().add(1, "days").hours(0).minutes(0).seconds(0);
      while (high.unix() >= orders[orders.length - 1].timestamp) {
        let sum = 0;

        const low = high.clone().subtract(1, "days");
        orders.map((order) => {
          if (order.timestamp <= high.unix() && order.timestamp >= low.unix()) {
            sum += order.amnt;
          }
        });

        volume.push(sum);
        days.push(low.format("MMM DD"));

        high = low;
      }
    }

    return [volume.reverse(), days.reverse()];
  }
</script>

<style lang="sass">

  .volume
    padding: 2em 15vw 2em
    
    @media screen and (max-width: 720px)
      overflow-x: auto
      margin-right: 15vw

    h1.title
      font-size: 2.3em
      font-weight: 600

      @media screen and (max-width: 720px)
        width: 100%
        font-size: 2.01em

  select
    $sidePadding: .65em
    position: relative
    color: #fff
    background-color: #000
    font-size: 1em
    padding: .34em ($sidePadding * 3 + .3em) .34em $sidePadding
    cursor: pointer
    border-radius: .3em
    outline: none
    border: none
    -webkit-appearance: none
    -moz-appearance: none
    transition: all .3s
  
  select
    $sidePadding: .65em
    background-image: url(/down-arrow.svg)
    background-position: calc(100% - #{$sidePadding}) center
    background-repeat: no-repeat
    background-size: $sidePadding * 1.35

    &:hover
      opacity: .8

</style>

<div class="volume">
  <div style="align-items: center; justify-content: space-between">
    <h1 class="title">Trading Volume</h1>
    <select bind:value={selected} on:change={() => (volume = getVolume())}>
      <option value="AR">AR</option>
      {#await tokens then loadedTokens}
        {#each loadedTokens as token}
          <option value={token.ticker}>{token.ticker}</option>
        {/each}
      {/await}
    </select>
  </div>
  {#await volume}
    <Loading />
  {:then loadedVolume}
    {#if loadedVolume[0].length === 0 && loadedVolume[1].length === 0}
      <p>No trading volume.</p>
    {:else}
      <Line
        data={{ labels: loadedVolume[1], datasets: [{ data: loadedVolume[0], backgroundColor: function (context) {
                let gradient = context.chart.ctx.createLinearGradient(0, 0, context.chart.width, context.chart.height);
                gradient.addColorStop(0, 'rgba(230,152,323,0.5)');
                gradient.addColorStop(1, 'rgba(141,95,188,0.5)');
                return gradient;
              }, borderColor: function (context) {
                let gradient = context.chart.ctx.createLinearGradient(0, 0, context.chart.width, context.chart.height);
                gradient.addColorStop(0, '#E698E8');
                gradient.addColorStop(1, '#8D5FBC');
                return gradient;
              }, pointBackgroundColor: function (context) {
                let gradient = context.chart.ctx.createLinearGradient(0, 0, context.chart.width, context.chart.height);
                gradient.addColorStop(0, '#E698E8');
                gradient.addColorStop(1, '#8D5FBC');
                return gradient;
              } }] }}
        options={{ legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ scaleLabel: { display: true, fontFamily: '"JetBrainsMono", monospace', fontSize: 18, labelString: selected }, gridLines: { display: false } }] } }} />
    {/if}
  {/await}
</div>
