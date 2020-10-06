<script lang="typescript">
  import Verto from "@verto/lib";
  import Loading from "../Loading.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";

  let selected: string;

  const client = new Verto();
  let tokens = client.getTokens();
  let volume = getVolume();

  async function getVolume() {
    if (selected) {
      return await client.volume(
        (await tokens).find((token) => token.ticker === selected).id
      );
    } else {
      return await client.volume((await tokens)[0].id);
    }
  }
</script>

<div class="volume">
  <div class="title-section">
    <h1 class="title">Daily Volume</h1>
    <select bind:value="{selected}" on:change="{() => (volume = getVolume())}">
      <!-- <option value="AR">AR</option> -->
      {#await tokens then loadedTokens}
        {#each loadedTokens as token}
          <option value="{token.ticker}">{token.ticker}</option>
        {/each}
      {/await}
    </select>
  </div>
  {#await volume}
    <Loading />
  {:then loadedVolume}
    {#if loadedVolume.volume.length === 0 && loadedVolume.dates.length === 0}
      <p>No trading volume.</p>
    {:else}
      <Line
        data="{{ labels: loadedVolume.dates, datasets: [{ data: loadedVolume.volume, backgroundColor: function (context) {
                let gradient = context.chart.ctx.createLinearGradient(0, 0, context.chart.width, context.chart.height);
                gradient.addColorStop(0, 'rgba(230,152,323,0.5)');
                gradient.addColorStop(1, 'rgba(141,95,188,0.5)');
                return gradient;
              }, borderColor: function (context) {
                let gradient = context.chart.ctx.createLinearGradient(0, 0, context.chart.width, context.chart.height);
                gradient.addColorStop(0, '#E698E8');
                gradient.addColorStop(1, '#8D5FBC');
                return gradient;
              }, pointBackgroundColor: function (context) {
                let gradient = context.chart.ctx.createLinearGradient(0, 0, context.chart.width, context.chart.height);
                gradient.addColorStop(0, '#E698E8');
                gradient.addColorStop(1, '#8D5FBC');
                return gradient;
              } }] }}"
        options="{{ legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ scaleLabel: { display: false, fontFamily: '"JetBrainsMono", monospace', fontSize: 18, labelString: selected }, gridLines: { display: false } }] } }}" />
    {/if}
  {/await}
</div>

<style lang="sass">

  .volume
    padding: 2em 15vw 2em
    
    @media screen and (max-width: 720px)
      overflow-x: auto
      padding: 2em 10vw 2em

    .title-section
      display: flex
      align-items: center
      justify-content: space-between

      @media screen and (max-width: 720px)
        display: inline

    h1.title
      font-size: 2.3em
      font-weight: 600

      @media screen and (max-width: 720px)
        width: 100%
        font-size: 2.01em

    select
      $sidePadding: .65em
      position: relative
      color: #fff
      background-color: #000
      background-image: url(/down-arrow.svg)
      background-position: calc(100% - #{$sidePadding}) center
      background-repeat: no-repeat
      background-size: $sidePadding * 1.35
      font-size: 1em
      padding: .34em ($sidePadding * 3 + .3em) .34em $sidePadding
      cursor: pointer
      border-radius: .3em
      outline: none
      border: none
      -webkit-appearance: none
      -moz-appearance: none
      transition: all .3s
      width: 15%

      @media screen and (max-width: 720px)
        width: 100%
        margin-bottom: 2em

      &:hover
        opacity: .8

</style>
