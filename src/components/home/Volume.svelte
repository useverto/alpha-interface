<script lang="typescript">
  import Verto from "@verto/lib";
  import Loading from "../Loading.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";
  import downArrowIcon from "../../assets/down-arrow.svg";

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
    <div class="select-container">
      <select bind:value={selected} on:change={() => (volume = getVolume())}>
        {#await tokens then loadedTokens}
          {#each loadedTokens as token}
            <option value={token.ticker}>{token.ticker}</option>
          {/each}
        {/await}
      </select>
      <object data={downArrowIcon} type="image/svg+xml" title="select-icon" />
    </div>
  </div>
  {#await volume}
    <Loading />
  {:then loadedVolume}
    {#if loadedVolume.volume.length === 0 && loadedVolume.dates.length === 0}
      <p>No trading volume.</p>
    {:else}
      <Line
        data={{ labels: loadedVolume.dates, datasets: [{ data: loadedVolume.volume, backgroundColor: function (context) {
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
              } }] }}
        options={{ legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ scaleLabel: { display: false, fontFamily: '"JetBrainsMono", monospace', fontSize: 18, labelString: selected }, gridLines: { display: false } }] } }} />
    {/if}
  {/await}
</div>

<style lang="sass">

  @import "../../styles/selects.sass"

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

</style>
