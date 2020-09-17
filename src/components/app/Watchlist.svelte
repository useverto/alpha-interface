<script lang="typescript">
  import { watchlist } from "../../stores/watchlistStore.ts";
  import editIcon from "../../assets/edit.svg";
  import closeIcon from "../../assets/close.svg";
  import addIcon from "../../assets/add.svg";
  import Line from "svelte-chartjs/src/Line.svelte";
  import { fade } from "svelte/transition";
  import type { IWatchlistElement } from "../../utils/types.ts";
  import Modal from "../Modal.svelte";

  let editMode = false;
  let addModalOpened = false;
  let addPst: string = "test";
  let addPeriod: number = 24;
  let addPsts: string[] = ["test", "fff", "xd"];

  function add() {
    watchlist.addPst({ pst: addPst, period: addPeriod });
  }
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
          border-radius: 3px
          transition: all .3s

          &.edit
            position: relative
            cursor: pointer

            img
              position: absolute
              top: -0.7em
              right: -0.7em
              width: 1em
              height: 1em
              padding: .2em
              border-radius: 100%
              background-color: #fff
              box-shadow: 0 0 4px 4px rgba(0, 0, 0, .1)

            &:hover
              box-shadow: 0 0 9px 8px rgba(0, 0, 0, .1)

</style>

<div class="watchlist">
  <h1 class="title">
    Watchlist
    <div>
      {#if editMode}
        <img src={addIcon} alt="add" on:click={() => {
          addModalOpened = true;
        }} in:fade />
        <img
          src={closeIcon}
          alt="close"
          on:click={() => {
            editMode = !editMode;
          }}
          in:fade />
      {:else}
        <img
          src={editIcon}
          alt="edit"
          on:click={() => {
            editMode = !editMode;
          }}
          in:fade />
      {/if}
    </div>
  </h1>
  {#if $watchlist.length === 0}
    <p>No PSTs watched.</p>
  {:else}
    <div class="psts">
      {#each $watchlist as pst}
        <div class="pst" in:fade>
          <div class="graph-container{editMode ? ' edit' : ''}">
            {#if editMode}
              <img
                src={closeIcon}
                alt="close"
                on:click={() => {
                  watchlist.removePst(pst.pst);
                }}
                in:fade />
            {/if}
            <!-- TODO @johnletey -->
            <Line
              data={{ labels: ['test', 'fd', 'fdfd', 'tgffgf'], datasets: [{ data: [10, 20, 10, 40, 60, 80, 100, 61, 50, 70, 80, 60, 90], backgroundColor: 'transparent', borderColor: '#FF375D', pointBackgroundColor: '#FF375D' }] }}
              options={{ elements: { point: { radius: 0 } }, legend: { display: false }, scales: { xAxes: [{ ticks: { display: false }, gridLines: { display: false } }], yAxes: [{ ticks: { display: false }, scaleLabel: { display: false, fontFamily: '"JetBrainsMono", monospace', fontSize: 18 }, gridLines: { display: false } }] } }} />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
<Modal bind:opened={addModalOpened} confirmation={true} onConfirm={add}>
  <h1 style="text-align: center; font-weight: 400; margin-top: 0;">Add to watchlist</h1>
  <h2 style="margin-bottom: 0; font-weight: 400;">PST</h2>
  <select bind:value={addPst} style="display: block; color: #fff; width: 100%; background-color: transparent; outline: none; border: 1px solid #fff; border-radius: 4px; font-size: 1.4em; padding: 0.18em 0.6em;">
    {#each addPsts as pst}
      <option value={pst}>{pst}</option>
    {/each}
  </select>
  <h2 style="margin-bottom: 0; font-weight: 400;">Hours</h2>
  <input type="number" class="light" bind:value={addPeriod}>
</Modal>