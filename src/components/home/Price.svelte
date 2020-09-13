<script lang="typescript">
  import { query } from "../../api-client";
  import { exchangeWallet } from "../../utils/constants";
  import moment from "moment";
  import Line from "svelte-chartjs/src/Line.svelte";

  const price = getPrice();

  async function getPrice() {
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
            { name: "Type", values: "Buy" }
            { name: "Token", values: "usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A" }
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

</style>

<div class="price">
  {#await price}
    <p />
  {:then loadedPrice}
    <Line
      data={{ labels: loadedPrice[1], datasets: [{ data: loadedPrice[0], fill: false, borderColor: '#B075CD', pointBackgroundColor: '#B075CD' }] }}
      options={{ legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ gridLines: { display: false } }] } }} />
  {/await}
</div>
