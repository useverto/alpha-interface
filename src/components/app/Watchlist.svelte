<script lang="typescript">
  import { watchlist } from "../../stores/watchlistStore.ts";
</script>

<!-- prettier-ignore -->
<style lang="sass">

  .watchlist
    padding-bottom: 2.5em

    h1.title
      font-family: "Inter", sans-serif
      font-size: 2.3em
      font-weight: 600

    p
      display: block
      text-align: center

</style>

<div class="watchlist">
  <h1 class="title">Watchlist</h1>
  {#if $watchlist.length === 0}
    <p>No PSTs watched.</p>
  {:else}
    <p>{JSON.stringify($watchlist)}</p>
  {/if}
</div>
