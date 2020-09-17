<script lang="typescript">
  import { watchlist } from "../../stores/watchlistStore.ts";
  import editIcon from "../../assets/edit.svg";
  import closeIcon from "../../assets/close.svg";
  import Line from "svelte-chartjs/src/Line.svelte";

  let editMode = false;
</script>

<!-- prettier-ignore -->
<style lang="sass">

  .watchlist
    padding-bottom: 2.5em

    h1.title
      font-family: "Inter", sans-serif
      font-size: 2.3em
      font-weight: 600
      display: flex
      align-items: center
      justify-content: space-between

      img
        height: .57em
        cursor: pointer

    p
      display: block
      text-align: center

    .psts
      width: 100%
      display: flex
      flex-wrap: wrap
      justify-content: space-between

      .pst
        flex: 1 0 33%
        width: 33%
        height: 10em
        margin-bottom: 1em
        transition: all .3s

        .graph-container
          width: 75%
          display: 
          transition: all .3s

          &.edit
            cursor: pointer

            &:hover
              box-shadow: 0 0 9px 8px rgba(0, 0, 0, .1)

</style>

<div class="watchlist">
  <h1 class="title">
    Watchlist <img
      src={editMode ? closeIcon : editIcon}
      alt="edit"
      on:click={() => {
        editMode = !editMode;
      }} />
  </h1>
  {#if $watchlist.length === 0}
    <p>No PSTs watched.</p>
  {:else}
    <div class="psts">
      {#each $watchlist as pst}
        <div class="pst{editMode ? ' edit' : ''}">
          <div class="graph-container">
            <Line
              data={{ labels: ['test', 'fd', 'fdfd', 'tgffgf'], datasets: [{ data: [10, 20, 10, 40, 60, 80, 100, 61, 50, 70, 80, 60, 90], backgroundColor: 'transparent', borderColor: '#FF375D', pointBackgroundColor: '#FF375D' }] }}
              options={{ elements: { point: { radius: 0 } }, legend: { display: false }, scales: { xAxes: [{ ticks: { display: false }, gridLines: { display: false } }], yAxes: [{ ticks: { display: false }, scaleLabel: { display: false, fontFamily: '"JetBrainsMono", monospace', fontSize: 18 }, gridLines: { display: false } }] } }} />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
