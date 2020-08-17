<script lang="typescript">

  import { address } from "../../stores/keyfileStore.js";
  import NavBar from "../../components/NavBar.svelte";
  import Footer from "../../components/Footer.svelte";
  import Loading from "../../components/Loading.svelte";
  import moment from "moment";
  import { loggedIn } from "../../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import ApolloClient from 'apollo-boost';
  import gql from 'graphql-tag';

  if(process.browser && !$loggedIn) goto("/");

  let client, element;
  let transactions: { id: string, amount: number, type: string, status: string, timestamp: number }[] = [];
  let lastCursorOut = "", lastCursorIn = "";
  let hasNextOut = true, hasNextIn = true;
  let y: number, windowHeight: number, transactionsLength = 0;

  function roundCurrency (val: number | string): string {
    if(val === "?") return val;
    if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  onMount(() => loadMoreTransactions());

  async function loadMoreTransactions () {
    if(!process.browser) return [];

    // @ts-ignore
    const 
      client = new Arweave({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 20000,
      }),
      gqlClient = new ApolloClient({
        uri: "https://arweave.dev/graphql"
      });

    const 
      outQuery = hasNextOut ? (await gqlClient.query({
        query: gql`
          query {
            transactions(
              owners: ["${ /*$address*/'pvPWBZ8A5HLpGSEfhEmK1A3PfMgB_an8vVS6L14Hsls' }"]
              after: "${ lastCursorOut }"
            ) {
              pageInfo {
                hasNextPage
              }
              edges {
                cursor
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
          }
        `
      })).data : null,
      inQuery = hasNextIn ? (await gqlClient.query({
        query: gql`
          query {
            transactions(
              recipients: ["${ /*$address*/'pvPWBZ8A5HLpGSEfhEmK1A3PfMgB_an8vVS6L14Hsls' }"]
              after: "${ lastCursorIn }"
            ) {
              pageInfo {
                hasNextPage
              }
              edges {
                cursor
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
          }
        `
      })).data : null;

    const 
      outTxs = hasNextOut ? outQuery.transactions.edges : null,
      inTxs = hasNextIn ? inQuery.transactions.edges : null;

    hasNextOut = hasNextOut ? outQuery.transactions.pageInfo.hasNextPage : false;
    hasNextIn = hasNextIn ? inQuery.transactions.pageInfo.hasNextPage : false;

    let _transactions: { id: string, amount: number, type: string, status: string, timestamp: number }[] = [];

    if(outTxs !== null)
      outTxs.map(({ node, cursor }) => {
        lastCursorOut = cursor;
        _transactions.push({
          id: node.id,
          amount: node.quantity.ar,
          type: "out",
          status: "",
          timestamp: node.block.timestamp,
        });
      });
    
    if(inTxs !== null)
      inTxs.map(({ node, cursor }) => {
        lastCursorIn = cursor;
        _transactions.push({
          id: node.id,
          amount: node.quantity.ar,
          type: "in",
          status: "",
          timestamp: node.block.timestamp,
        });
      });

    if(_transactions.length > 0) _transactions.sort((a, b) => b.timestamp - a.timestamp);

    for (let i = 0; i < _transactions.length; i++) {
      try {
        let res = await client.transactions.getStatus(_transactions[i].id);
        if (res.status === 200)
          _transactions[i].status = "success";
        else
          _transactions[i].status = "pending";
      } catch (error) {
        console.log(error);
      }
    }

    transactions = transactions.concat(_transactions);
  }

  $: {
    if(element !== undefined) {
      let componentY = element.offsetTop + element.offsetHeight;
      if(componentY <= (y + windowHeight + 120)) loadMoreTransactions();
    }
  }

</script>

<svelte:head>
  <title>Transactions overview</title>
</svelte:head>

<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} />
<NavBar />
<div class="all-transactions" in:fade={{ duration: 300 }}>
  <h1 class="title">All Transactions</h1>
  <table>
    <tr>
      <th style="text-transform: none">TxID</th>
      <th>Amount</th>
    </tr>
    {#each transactions as tx}
      <tr in:fade={{ duration: 150 }}>
        <td style="width: 70%">
          <a href="https://viewblock.io/arweave/tx/{tx.id}">
            <span class="direction">{tx.type}</span>
            {tx.id}
          </a>
          <span class="status {tx.status}"></span>
        </td>
        <td style="width: 20%">{roundCurrency(tx.amount)} AR</td>
      </tr>
    {/each}
  </table>
</div>
<Footer />
<span style="width: 100%; height: 1px" bind:this={element}></span>

<style lang="sass">

  @import "../../styles/tables.sass"

  .all-transactions
    padding: 3em 15vw
    @include table 

    .pagination
      margin-top: 1.3em
      @include pagination

    td
      a
        text-decoration: none
        color: black

</style>