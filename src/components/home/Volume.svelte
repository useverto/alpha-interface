<script lang="typescript">
  import { query } from "../../api-client";
  import { exchangeWallet } from "../../utils/constants";
  import moment from "moment";
  import Line from "svelte-chartjs/src/Line.svelte";

  const volume = getVolume();

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
            { name: "Type", values: "Buy" }
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
        amnt: parseFloat(order.node.quantity.ar),
        timestamp: order.node.block.timestamp,
      });
    });

    let volume: number[] = [];
    let days: string[] = [];

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

    return [volume.reverse(), days.reverse()];
  }
</script>

<style lang="sass">

  .volume
    padding: 2em 15vw 2em

</style>

<div class="volume">
  {#await volume}
    <p />
  {:then loadedVolume}
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
      options={{ legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ gridLines: { display: false } }] } }} />
  {/await}
</div>
