<script lang="typescript">

  import { fade } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import { onMount } from "svelte";
  import SkeletonLoading from "../SkeletonLoading.svelte";

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

    const _txs = (await query(`
      query {
        transactions(
          tags: [
            {name: "App-Name", values: "Verto"}
          ]
          first: 5
        ) {
          edges {
            node {
              id
              quantity {
                ar
              }
            }
          }
        }
      }
    `)).data.transactions.edges;

    _txs.map(({ node }) => {
      txs.push({
        id: node.id,
        amount: node.quantity.ar,
        pst: "AR"
      })
    })

    return txs;
  }

</script>

<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} />
<div class="LatestTrades" bind:this={element}>
  {#if shown}
    <div in:fade={{ duration: 400, delay: 411, easing: backOut }}>
      <h1 class="title">Latest Trades</h1>
      <table>
        <tr>
          <th>TxID</th>
          <th>AMOUNT</th>
          <th>PST</th>
        </tr>
        {#await txs}
          <tr>
            <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 10%"><SkeletonLoading style={"width: 100%"} /></td>
          </tr>
          <tr>
            <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 10%"><SkeletonLoading style={"width: 100%"} /></td>
          </tr>
          <tr>
            <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 10%"><SkeletonLoading style={"width: 100%"} /></td>
          </tr>
          <tr>
            <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 10%"><SkeletonLoading style={"width: 100%"} /></td>
          </tr>
          <tr>
            <td style="width: 70%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 20%"><SkeletonLoading style={"width: 100%"} /></td>
            <td style="width: 10%"><SkeletonLoading style={"width: 100%"} /></td>
          </tr>
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