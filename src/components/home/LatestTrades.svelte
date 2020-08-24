<script lang="typescript">

  import { fade } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import { onMount } from "svelte";
  import Arweave from "arweave";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import latestTradesQuery from "../../queries/latestTrades.gql";
  import { query } from "../../api-client";

  let element, y, windowHeight, shown = false;
  let txs = getLatestTrades();

  // fade animation
  $: {
    if(element !== undefined) {
      let componentY = element.offsetTop + element.offsetHeight;
      if(componentY <= (y + windowHeight + 120) && !shown) shown = true;
    }
  }

  async function getLatestTrades (): Promise<{ id: string, amount: number, pst: string }[]> {
    if(!process.browser) return [];

    let txs: { id: string, amount: number, pst: string }[] = [];

    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    const _txs = (await query({ 
      query: latestTradesQuery, 
      variables: null
    })).data.transactions.edges;

    _txs.map(async ({ node }) => {
      console.log(node);
      let 
        amount = node.quantity.ar, 
        token = "AR";
      for (let i = 0; i < node.tags.length; i++) {
        if (node.tags[i].name === "Contract") {
          let tx = await client.transactions.getData(node.tags[i].value, {decode: true, string: true});
          // @ts-ignore
          token = JSON.parse(tx).ticker;
        } else if (node.tags[i].name === "Input") {
          amount = JSON.parse(node.tags[i].value).qty;
        }
      }
      txs.push({
        id: node.id,
        amount: amount,
        pst: token
      });
    })

    return txs;
  }

</script>

<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} />
<div class="LatestTrades" bind:this={element}>
  {#if shown}
    <div in:fade={{ duration: 400, delay: 411, easing: backOut }}>
      <h1 class="title">Latest Activity</h1>
      <table>
        <tr>
          <th>TxID</th>
          <th>AMOUNT</th>
          <th>PST</th>
        </tr>
        {#await txs}
          {#each Array(5) as _}
            <tr>
              <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
              <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
              <td style="width: 10%"><SkeletonLoading style={"width: 100%"} /></td>
            </tr>
          {/each}
        {:then loadedTxs}
          {#each loadedTxs as tx}
            <tr in:fade={{ duration: 185 }}>
              <td>{tx.id}</td>
              <td>{tx.amount}</td>
              <td class="pst">{tx.pst}</td>
            </tr>
          {/each}
        {/await}
      </table>
    </div>
  {/if}
</div>

<style lang="sass">

  .LatestTrades
    padding: 1em 15vw 3em

    @media screen and (max-width: 720px)
      overflow-x: auto
      margin-right: 15vw

    h1.title
      font-size: 2.3em
      font-weight: 600

      @media screen and (max-width: 720px)
        width: 100%
        font-size: 2.01em

    table
      width: 100%

      tr
        th, td
          text-align: left

        th
          font-weight: 600
          padding-bottom: 1.15em
          text-decoration: underline

        td
          width: 20%
          padding-bottom: .7em

          &:first-child
            width: 70%

          &:last-child
            width: 10%

          &.pst
            text-transform: uppercase

</style>