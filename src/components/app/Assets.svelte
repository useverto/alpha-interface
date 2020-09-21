<script lang="ts">
  import Verto from "@verto/lib";
  import { address } from "../../stores/keyfileStore";
  import Loading from "../../components/Loading.svelte";
  import SkeletonLoading from "../../components/SkeletonLoading.svelte";
  import Pie from "svelte-chartjs/src/Pie.svelte";

  const client = new Verto();
  let balances: Promise<
    { id: string; ticker: string; balance: number }[]
  > = client.getAssets($address);
  let options = {
    responsive: true,
  };
  let noelements = false;
  let balanceChart = populateChart();

  async function populateChart() {
    let data = await balances;
    let chart = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [
            "#8548a3",
            "#161616",
            "#00D46E",
            "#FFD336",
            "#ff0000",
            "#00d4b8",
          ],
          hoverBackgroundColor: [
            "rgba(133,72,163,0.75)",
            "rgba(22,22,22,0.75)",
            "rgba(0,212,110,0.75)",
            "rgba(255,211,54,0.75)",
            "rgba(255,0,0,0.75)",
            "rgba(0,212,184,0.75)",
          ],
        },
      ],
    };
    for (let i = 0; i < data.length; i++) {
      chart.labels.push(data[i].ticker);
      chart.datasets[0].data.push(data[i].balance);
    }

    return chart;
  }

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }
</script>

<div class="section">
  <div class="assets-table" class:noelements>
    <h1 class="title">Assets</h1>
    <table style="{noelements ? 'position: relative' : ''}">
      <tr style="width: 100%">
        <th>Token</th>
        <th>Amount</th>
      </tr>
      {#await balances}
        {#each Array(4) as _}
          <tr>
            <td style="width: 80%">
              <SkeletonLoading style="width: 100%;" />
            </td>
            <td style="width: 20%">
              <SkeletonLoading style="width: 100%;" />
            </td>
          </tr>
        {/each}
      {:then loadedBalances}
        {#if loadedBalances.length === 0}
          <p
            style="position: absolute; top: 1.8em; left: 0; right: 0; text-align: center;">
            You don't have any tokens!
          </p>
        {/if}
        {#each loadedBalances as balance}
          <tr>
            <td>{balance.id}</td>
            <td>
              {roundCurrency(balance.balance)}
              <span class="currency">{balance.ticker}</span>
            </td>
          </tr>
        {/each}
      {/await}
    </table>
  </div>
  <div class="assets-chart" class:noelements>
    {#await balanceChart}
      <Loading style="margin: 100px auto;" />
    {:then data}
      <Pie data="{data}" options="{options}" />
    {/await}
  </div>
</div>



<!-- prettier-ignore -->
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
      width: 50%
      transition: all .3s

      &.noelements
        width: 100%

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

    .assets-chart
      width: 50%
      transition: all .3s

      &.noelements
        width: 0%

</style>