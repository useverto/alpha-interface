<script lang="typescript">
  import { watchlist } from "../../stores/watchlistStore.ts";
  import editIcon from "../../assets/edit.svg";
  import closeIcon from "../../assets/close.svg";
  import addIcon from "../../assets/add.svg";
  import Line from "svelte-chartjs/src/Line.svelte";
  import { fade, scale } from "svelte/transition";
  import type { IWatchlistElement } from "../../utils/types.ts";
  import Modal from "../Modal.svelte";
  import { notification } from "../../stores/notificationStore.ts";
  import { NotificationType } from "../../utils/types.ts";

  import { onMount } from "svelte";

  import Verto from "@verto/lib";
  const client = new Verto();

  let tokens;
  onMount(async () => {
    tokens = await client.getTokens();
    for (const element of $watchlist) {
      const index = tokens.indexOf(
        tokens.find((token) => token.ticker === element.ticker)
      );
      if (index > -1) {
        tokens.splice(index, 1);
      }
    }
  });

  let editMode = false;
  let addModalOpened = false;
  let addPst;
  let addPeriod: number = 24;

  function add() {
    const element = tokens.find((token) => token.ticker === addPst);
    const index = tokens.indexOf(element);
    tokens.splice(index, 1);

    watchlist.addPst({
      id: element.id,
      name: element.name,
      ticker: element.ticker,
      period: addPeriod,
    });

    addPeriod = 24;
    notification.notify(
      "Added",
      `Added ${element.ticker} to watchlist.`,
      NotificationType.success,
      2000
    );

    addPst = tokens[0] && tokens[0].ticker;
  }

  function remove(pst: IWatchlistElement) {
    tokens.push({
      id: pst.id,
      name: pst.name,
      ticker: pst.ticker,
    });
    watchlist.removePst(pst.ticker);
    notification.notify(
      "Removed",
      `Removed ${pst.ticker} from watchlist.`,
      NotificationType.error,
      2000
    );
  }

  function openAddModal() {
    if (tokens.length === 0) {
      notification.notify(
        "Error",
        `No more PSTs available to add.`,
        NotificationType.error,
        1000
      );
      return;
    }
    addModalOpened = true;
  }
</script>

<div class="watchlist">
  <h1 class="title">
    Watchlist
    <div>
      {#if editMode}
        <img
          src="{addIcon}"
          alt="add"
          on:click="{() => {
            openAddModal();
          }}"
          in:fade />
        <img
          src="{closeIcon}"
          alt="close"
          on:click="{() => {
            editMode = !editMode;
          }}"
          in:fade />
      {:else}
        <img
          src="{editIcon}"
          alt="edit"
          on:click="{() => {
            editMode = !editMode;
          }}"
          in:fade />
      {/if}
    </div>
  </h1>
  {#if $watchlist.length === 0}
    <p>No PSTs watched.</p>
  {:else}
    <div class="psts">
      {#each $watchlist as pst}
        <div
          class="pst"
          in:fade="{{ duration: 500 }}"
          out:scale="{{ duration: 250 }}">
          <div class="graph-container{editMode ? ' edit' : ''}">
            {#if editMode}
              <img
                src="{closeIcon}"
                alt="close"
                on:click="{() => {
                  remove(pst);
                }}"
                in:fade />
            {/if}
            <!-- TODO @johnletey -->
            <!-- Don't forget to change the color too :) -->
            <!-- Color depends on increase or decrease (decrease: #FF375D, increase: #00D46E) -->
            <!-- Make sure to change both the borderColor and the pointBackgroundColor, but not the backgroundColor in the graph -->
            <!-- Change the color of the increase/decrease percentage too -->
            <div class="pst-info">
              <h1>{pst.ticker}</h1>
              <div class="pst-price">
                {#await client.latestPrice(pst.id) then latestPrice}
                  <h1>{latestPrice.toFixed(4)}<span> Ar</span></h1>
                {/await}
                <span class="percentage" style="color: #FF375D">-6.04%</span>
              </div>
            </div>
            {#await client.price(pst.id) then price}
              <Line
                data="{{ labels: price.dates, datasets: [{ data: price.prices, backgroundColor: 'transparent', borderColor: '#FF375D', pointBackgroundColor: '#FF375D' }] }}"
                options="{{ elements: { point: { radius: 0 } }, legend: { display: false }, scales: { xAxes: [{ ticks: { display: false }, gridLines: { display: false } }], yAxes: [{ ticks: { display: false }, scaleLabel: { display: false, fontFamily: '"JetBrainsMono", monospace', fontSize: 18 }, gridLines: { display: false } }] } }}" />
            {/await}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
<Modal bind:opened="{addModalOpened}" confirmation="{true}" onConfirm="{add}">
  <h1 style="text-align: center; font-weight: 600; margin-top: 0;">
    Add to watchlist
  </h1>
  <h2 style="margin-bottom: 0; font-weight: 400; font-size: 1.24em;">PST</h2>
  <select
    bind:value="{addPst}"
    style="display: block; color: #fff; width: 100%; background-color: transparent; outline: none; border: 1px solid #fff; border-radius: 4px; font-size: 1.4em; padding: 0.18em 0.6em;">
    {#each tokens as pst}
      <option value="{pst.ticker}" style="background-color: #000;">
        {pst.ticker}
      </option>
    {/each}
  </select>
  <h2 style="margin-bottom: 0; font-weight: 400; font-size: 1.24em;">
    Period (hours)
  </h2>
  <input
    type="number"
    class="light"
    style="width: calc(100% - 1.2em);"
    bind:value="{addPeriod}" />
</Modal>

<style lang="sass">

  .watchlist

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

      .pst
        width: 33%
        height: 10em
        margin-bottom: 1em
        transition: all .3s

        &:nth-child(3n)
          order: 1

        @media screen and (max-width: 720px)
          width: 100%
          order: 1

        .graph-container
          width: calc(75% - .75em)
          position: relative
          padding-right: .75em
          border-radius: 3px
          margin: 0 auto
          transition: all .3s

          .pst-info
            position: absolute
            top: 0
            left: 0
            right: 0
            display: flex
            align-items: flex-start
            justify-content: space-between

            h1
              font-size: 1.3em
              color: #000
              font-weight: 600
              text-transform: uppercase
              margin: 0

              span
                font-size: .9em

            .pst-price
              text-align: right

              h1
                text-align: right
                margin-bottom: .38em

              span.percentage
                text-transform: uppercase
                font-size: .93em
                text-align: right  

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
              z-index: 100
              border-radius: 100%
              background-color: #fff
              box-shadow: 0 0 4px 4px rgba(0, 0, 0, .1)

            &:hover
              box-shadow: 0 0 9px 8px rgba(0, 0, 0, .1)

</style>
