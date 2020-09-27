<script lang="ts">
  import Verto from "@verto/lib";
  import { address } from "../../stores/keyfileStore";
  import SkeletonLoading from "../SkeletonLoading.svelte";

  const client = new Verto();
  let balances: Promise<
    { id: string; name: string; ticker: string; balance: number }[]
  > = client.getAssets($address);
</script>

<div class="section">
  <div class="assets-table">
    <h1 class="title">Assets</h1>
    {#await balances}
      <table>
        <tr style="width: 100%">
          <th>Name</th>
          <th>ID</th>
          <th>Amount</th>
        </tr>
        {#each Array(4) as _}
          <tr>
            <td style="width: 20%">
              <SkeletonLoading style="width: 100%;" />
            </td>
            <td style="width: 60%">
              <SkeletonLoading style="width: 100%;" />
            </td>
            <td style="width: 20%">
              <SkeletonLoading style="width: 100%;" />
            </td>
          </tr>
        {/each}
      </table>
    {:then loadedBalances}
      {#if loadedBalances.length === 0}
        <p>You don't have any tokens!</p>
      {:else}
        <table>
          <tr style="width: 100%">
            <th>Name</th>
            <th>ID</th>
            <th>Amount</th>
          </tr>
          {#each loadedBalances as balance}
            <tr>
              <td style="width: 20%">{balance.name}</td>
              <td style="width: 60%">{balance.id}</td>
              <td style="width: 20%">
                {balance.balance}
                <span class="currency">{balance.ticker}</span>
              </td>
            </tr>
          {/each}
        </table>
      {/if}
    {/await}
  </div>
</div>

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
