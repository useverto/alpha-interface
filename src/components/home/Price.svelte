<script lang="typescript">
  import Arweave from "arweave";
  import { query } from "../../api-client";
  import { exchangeWallet, pstContract } from "../../utils/constants";
  import moment from "moment";
  import Loading from "../Loading.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";

  let selected: string;

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

    return tokens.reverse();
  }

  let price = getPrice();

  async function getPrice() {
    if (!process.browser) return [];

    await tokens;

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

    console.log(selected);

    const orderTxs = (
      await query({
        query: `
      query($recipients: [String!]) {
        transactions(
          recipients: $recipients
          tags: [
            { name: "Exchange", values: "Verto" }
            { name: "Type", values: "Buy" }
            { name: "Token", values: "${
              (await getTokens()).find((token) => token.ticker === selected).id
            }" }
          ]
          first: ${maxInt}
        ) {
          edges {
            node {
              id
              block {
                timestamp
              }
              quantity {
                ar
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

    let orders: { id: string; amnt: number; timestamp: number }[] = [];
    orderTxs.map((order) => {
      orders.push({
        id: order.node.id,
        amnt: parseFloat(order.node.quantity.ar),
        timestamp: order.node.block.timestamp,
      });
    });

    let price: number[] = [];
    let days: string[] = [];

    let high = moment().add(1, "days").hours(0).minutes(0).seconds(0);
    while (high.unix() >= orders[orders.length - 1].timestamp) {
      let prices: number[] = [];

      const low = high.clone().subtract(1, "days");
      for (const order of orders) {
        if (order.timestamp <= high.unix() && order.timestamp >= low.unix()) {
          const confirmationTx = (
            await query({
              query: `
            query($txID: [String!]!) {
              transactions(
                tags: [
                  { name: "Exchange", values: "Verto" }
                  { name: "Type", values: "Confirmation" }
                  { name: "Match", values: $txID }
                ]
              ) {
                edges {
                  node {
                    tags {
                      name
                      value
                    }
                  }
                }
              }
            }`,
              variables: {
                txID: order.id,
              },
            })
          ).data.transactions.edges;

          if (confirmationTx.length > 0) {
            prices.push(
              order.amnt /
                parseFloat(
                  confirmationTx[0].node.tags
                    .find((tag) => tag.name === "Received")
                    .value.split(" ")[0]
                )
            );
          }
        }
      }

      price.push(prices.reduce((a, b) => a + b, 0) / prices.length);
      days.push(low.format("MMM DD"));

      high = low;
    }

    return [price.reverse(), days.reverse()];
  }
</script>

<style lang="sass">

  .price
    padding: 2em 15vw 2em
    
    @media screen and (max-width: 720px)
      overflow-x: auto
      padding: 2em 10vw 2em

    .title-section
      display: flex
      align-items: center
      justify-content: space-between

      @media screen and (max-width: 720px)
        display: inline

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
      background-image: url(/down-arrow.svg)
      background-position: calc(100% - #{$sidePadding}) center
      background-repeat: no-repeat
      background-size: $sidePadding * 1.35
      font-size: 1em
      padding: .34em ($sidePadding * 3 + .3em) .34em $sidePadding
      cursor: pointer
      border-radius: .3em
      outline: none
      border: none
      -webkit-appearance: none
      -moz-appearance: none
      transition: all .3s
      width: 15%

      @media screen and (max-width: 720px)
        width: 100%
        margin-bottom: 2em

      &:hover
        opacity: .8

</style>

<div class="price">
  <div class="title-section">
    <h1 class="title">Price</h1>
    <select bind:value={selected} on:change={() => (price = getPrice())}>
      {#await tokens then loadedTokens}
        {#each loadedTokens as token}
          <option value={token.ticker}>{token.ticker}</option>
        {/each}
      {/await}
    </select>
  </div>
  {#await price}
    <Loading />
  {:then loadedPrice}
    {#if loadedPrice[0].every((price) => isNaN(price))}
      <p>No price data.</p>
    {:else}
      <Line
        data={{ labels: loadedPrice[1], datasets: [{ data: loadedPrice[0], fill: false, borderColor: function (context) {
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
        options={{ legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ scaleLabel: { display: false, fontFamily: '"JetBrainsMono", monospace', fontSize: 18, labelString: selected }, gridLines: { display: false } }] } }} />
    {/if}
  {/await}
</div>
