<script lang="typescript">
  import Verto from "@verto/lib";
  import { address } from "../../stores/keyfileStore";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import { fade } from "svelte/transition";

  const client = new Verto();
  let transactions: Promise<
    {
      id: string;
      amount: number;
      type: string;
      status: string;
      timestamp: number;
    }[]
  > = client.getTransactions($address);
</script>

<div class="section">
  <h1 class="title">Transactions</h1>
  <table>
    <tr>
      <th style="text-transform: none">TxID</th>
      <th>Amount</th>
    </tr>
    {#await transactions}
      {#each Array(5) as _}
        <tr in:fade="{{ duration: 100 }}">
          <td style="width: 70%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
          <td style="width: 20%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
        </tr>
      {/each}
    {:then loadedTxs}
      {#each loadedTxs as tx}
        <tr in:fade="{{ duration: 300 }}">
          <td style="width: 70%">
            <a
              href="https://viewblock.io/arweave/tx/{tx.id}"
              class="transaction">
              <span class="direction">{tx.type}</span>
              {tx.id}
            </a>
            <span class="status {tx.status}"></span>
          </td>
          <td style="width: 20%">{tx.amount} AR</td>
        </tr>
      {/each}
    {/await}
  </table>
  <a href="/app/all-transactions" class="view-all">View all {'->'}</a>
</div>

<style lang="sass">

  @import "../../styles/tables.sass"
  @import "../../styles/general.sass"

  .section
    @include table
    padding-bottom: 2.5em

    @media screen and (max-width: 720px)
      width: 100vw - $mobileSidePadding * 2
      overflow-x: auto

    a.view-all
      display: block
      text-align: center
      color: rgba(#000, .5)
      font-weight: 500
      padding: .8em 0
      transition: all .3s

      &:hover
        opacity: .7

    &:first-child
      padding-top: 3.5em

    a.transaction
      text-decoration: none
      color: black

</style>
