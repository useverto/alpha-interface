<script lang="typescript">

  import { watchlist } from "../../stores/watchlistStore.ts";

  function test () {
    watchlist.addPst({ pst: "test", period: 24 })
  }

</script>

{JSON.stringify($watchlist)}

<button on:click={test}>add</button>