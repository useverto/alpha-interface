<script lang="ts">
  import Verto from "@verto/lib";
  import { address } from "../../stores/keyfileStore";
  import SkeletonLoading from "../SkeletonLoading.svelte";

  const client = new Verto();
  let exchanges: Promise<
    {
      id: string;
      timestamp: string;
      type: string;
      sent: string;
      received: string;
      status: string;
      duration: string;
    }[]
  > = client.getExchanges($address);
</script>

<div class="section">
  <h1 class="title">Trades</h1>
  {#await exchanges}
    <table>
      <tr>
        <th>Timestamp</th>
        <th>Trade</th>
        <th>Duration</th>
      </tr>
      {#each Array(5) as _}
        <tr>
          <td style="width: 30%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
          <td style="width: 45%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
          <td style="width: 25%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
        </tr>
      {/each}
    </table>
  {:then loadedExchanges}
    {#if loadedExchanges.length === 0}
      <p>No trades found.</p>
    {:else}
      <table>
        <tr>
          <th>Timestamp</th>
          <th>Trade</th>
          <th>Duration</th>
        </tr>
        {#each loadedExchanges as exchange}
          <tr>
            <td style="width: 30%">{exchange.timestamp}</td>
            <td style="width: 45%">
              {exchange.sent}
              {'->'}
              {exchange.received}
              <span class="status {exchange.status}"></span>
            </td>
            <td style="width: 25%; text-transform: uppercase">
              {exchange.duration}
            </td>
          </tr>
        {/each}
      </table>
    {/if}
  {/await}
  <a href="/app/all-exchanges" class="view-all">View all {'->'}</a>
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

    p
      color: var(--primary-text-color)

    a.view-all
      display: block
      text-align: center
      color: var(--darker-secondary-text-color)
      font-weight: 500
      padding: .8em 0
      transition: all .3s

      &:hover
        opacity: .7

    &:first-child
      padding-top: 3.5em

    a.transaction
      text-decoration: none
      color: var(--primary-text-color)

</style>
