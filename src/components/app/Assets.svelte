<script lang="ts">
  import Verto from "@verto/lib";
  import { address } from "../../stores/keyfileStore";
  import SkeletonLoading from "../../components/SkeletonLoading.svelte";

  const client = new Verto();
  let balances: Promise<
    { id: string; ticker: string; balance: number }[]
  > = client.getAssets($address);
</script>

<div class="section">
  <div class="assets-table">
    <h1 class="title">Assets</h1>
    <table>
      <tr style="width: 100%">
        <th>Token</th>
        <th>Amount</th>
      </tr>
      {#await balances}
        {#each Array(4) as _}
          <tr>
            <td style="width: 80%">
              <SkeletonLoading style="width: 100%;" />
            </td>
            <td style="width: 20%">
              <SkeletonLoading style="width: 100%;" />
            </td>
          </tr>
        {/each}
      {:then loadedBalances}
        {#if loadedBalances.length === 0}
          <p
            style="position: absolute; top: 1.8em; left: 0; right: 0; text-align: center;">
            You don't have any tokens!
          </p>
        {/if}
        {#each loadedBalances as balance}
          <tr>
            <td>{balance.id}</td>
            <td>
              {balance.balance}
              <span class="currency">{balance.ticker}</span>
            </td>
          </tr>
        {/each}
      {/await}
    </table>
  </div>
</div>



<!-- prettier-ignore -->
<style lang="sass">
  
  @import "../../styles/tables.sass"
  @import "../../styles/general.sass"

  .section
    @include table
    padding-bottom: 2.5em
    display: flex
    justify-content: space-between
    align-items: center

    @media screen and (max-width: 720px)
      width: 100vw - $mobileSidePadding * 2
      overflow-x: auto

    .assets-table
      width: 100%
      transition: all .3s

      a.view-all
        display: block
        text-align: center
        color: rgba(#000, .5)
        font-weight: 500
        padding: .8em 0
        transition: all .3s

        &:hover
          opacity: .7

      a.transaction
        text-decoration: none
        color: black

</style>