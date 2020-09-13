<script lang="typescript">
  import { query } from "../../api-client";
  import { exchangeWallet } from "../../utils/constants";

  const volume = getVolume();

  async function getVolume() {
    //

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

    //

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

    //

    return [];
  }
</script>

<div>
  {#await volume}{/await}
</div>
