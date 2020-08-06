<script lang="typescript">

  import { fade } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { and, equals } from "arql-ops";

  export let txs = [];

  let element, y, windowHeight, shown = false;
  let client, allTxs;

    // let's create a new client
  if(process.browser) {
    // @ts-ignore
    client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });
  }

  // fade animation
  $: {
    if(element !== undefined) {
      let componentY = element.offsetTop + element.offsetHeight;
      if(componentY <= (y + windowHeight + 120) && !shown) shown = true;
    }
  }

  onMount(async () => {
    //let query = equals("App-Name", "verto");
    let query = equals("from", "pvPWBZ8A5HLpGSEfhEmK1A3PfMgB_an8vVS6L14Hsls");
    allTxs = await client.arql(query);
    console.log(allTxs);
    for (let i = 0; i < 5; i++) {
      try {
        let res = await client.transactions.get(allTxs[i]);
        txs.push({
          id: allTxs[i],
          amount: client.ar.winstonToAr(res.quantity),
          pst: "AR"
        });
      } catch (error) {
        console.log(error);
      }
    }
    console.log(txs);
	});

</script>

<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} />
<div class="LatestTrades" bind:this={element}>
  {#if shown}
    <div in:fade={{ duration: 1100, delay: 411, easing: backOut }}>
      <h1 class="title">Latest Trades</h1>
      <table>
        <tr>
          <th>TxID</th>
          <th>AMOUNT</th>
          <th>PST</th>
        </tr>
        {#each txs as tx}
        <tr>
          <td>{tx.id}</td>
          <td>{tx.amount}</td>
          <td class="pst">{tx.pst}</td>
        </tr>
        {/each}
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