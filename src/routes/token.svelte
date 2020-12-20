<script lang="typescript">
  import { keyfile } from "../stores/keyfileStore";
  import Arweave from "arweave";
  import Community from "community-js";
  import Verto from "@verto/lib";
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";

  import Line from "svelte-chartjs/src/Line.svelte";
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";
  import Loading from "../components/Loading.svelte";
  import Button from "../components/Button.svelte";

  let client = new Verto();
  const arweaveClient = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });
  let communityID: string = "";
  let community: Community = null;
  let state;

  if (process.browser) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("id") === null) goto("/tokens");
    communityID = params.get("id");
  }

  async function initCommunity() {
    // @ts-expect-error
    community = new Community(arweaveClient);
    await community.setCommunityTx(communityID);
    state = await community.getState();
  }

  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
  });

  const update = () => {
    client = new Verto(JSON.parse($keyfile));
  };

  async function cName(): Promise<string> {
    await initCommunity();
    return state.name;
  }

  const communityName: Promise<string> = cName();

  async function cLogo(): Promise<string> {
    await communityName;
    return state.settings.get("communityLogo");
  }

  const communityLogo: Promise<string> = cLogo();

  async function cTicker(): Promise<string> {
    await communityName;
    return state.ticker;
  }

  const communityTicker: Promise<string> = cTicker();

  async function cGraph() {
    await communityName;
    const returnedPrices = await client.price(communityID);

    let dates = returnedPrices.dates;
    let prices = returnedPrices.prices;

    const start = prices[0];
    const end = prices[prices.length - 1];
    let color;
    const percentage = ((end - start) / start) * 100;
    let percentageDisplay: string;
    if (end >= start) {
      color = "#00D46E";
      percentageDisplay = "+" + percentage.toFixed(2) + "%";
    } else {
      color = "#FF375D";
      percentageDisplay = percentage.toFixed(2) + "%";
    }

    return {
      dates,
      prices,
      latestPrice: end.toFixed(4),
      color,
      percentage: percentageDisplay,
    };
  }

  async function cDescription(): Promise<string> {
    await communityName;
    return (
      state.settings.get("communityDescription") || "No Community Description"
    );
  }

  async function cAppURL(): Promise<string> {
    await communityName;
    return state.settings.get("communityAppUrl") || "";
  }
</script>

<svelte:head>
  <title>Verto — Token</title>
</svelte:head>

<NavBar {update} />

<div class="token">
  <div class="token-head">
    <div class="logo">
      {#await communityLogo}
        <SkeletonLoading />
      {:then loadedLogo}
        <img
          class="logo"
          src={`https://arweave.net/${loadedLogo}`}
          alt="Community Logo" />
      {/await}
    </div>
    <h1 class="title">
      {#await communityName}
        <SkeletonLoading />
      {:then loadedName}
        {loadedName}
      {/await}
      {#await communityTicker}
        <SkeletonLoading />
      {:then loadedTicker}
        <span class="ticker">{loadedTicker}</span>
      {/await}
    </h1>
    <div class="cta">
      {#await cAppURL()}
        <SkeletonLoading />
      {:then loadedURL}
        <Button href={loadedURL}>Visit</Button>
      {/await}
    </div>
  </div>
  <div class="token-body">
    <div class="graph-wrapper">
      {#await cGraph()}
        <div
          style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <Loading
            style="width: 26px; height: 26px; animation-duration: .8s;" />
        </div>
      {:then loaded}
        {#if loaded.prices.every((price) => isNaN(price))}
          <p in:fade={{ duration: 130 }}>no data</p>
        {:else}
          <Line
            data={{ labels: loaded.dates, datasets: [{ label: 'AR', data: loaded.prices, backgroundColor: '#ffe3ff', borderColor: function (context) {
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
            options={{ elements: { point: { radius: 0 }, line: { borderWidth: 5, borderCapStyle: 'round' } }, tooltips: { mode: 'index', intersect: false }, hover: { mode: 'nearest', intersect: true }, maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false }, scaleLabel: { display: false }, ticks: { display: false } }], yAxes: [{ gridLines: { display: false }, scaleLabel: { display: false }, ticks: { display: false } }] } }} />
        {/if}
      {/await}
    </div>
    <div class="description">
      <h2>About</h2>
      {#await cDescription()}
        <SkeletonLoading />
      {:then loadedDesc}
        <p>{loadedDesc}</p>
      {/await}
    </div>
  </div>
</div>

<Footer />

<style lang="sass">
  @import "../styles/general.sass"

  .token 
    @include page

    @media screen and (max-width: 720px)
      padding-top: 2em
  
    .token-head
      display: flex
      margin-bottom: 2em
      margin-top: 2em
      position: relative

      @media screen and (max-width: 720px)
        display: block

      h1.title
        margin: 0

        @media screen and (max-width: 720px)
          font-size: 1.35em
          margin-bottom: .3em
        
        .ticker
          margin-left: 10px
          color: rgba(17, 51, 83, 0.6)
          text-transform: uppercase
          font-size: 0.75em
          font-family: "JetBrainsMono", monospace

      .logo
        width: 2.3em
        height: 2.3em
        border-radius: 100000px
        margin-top: 2px
        margin-right: 2em

        @media screen and (max-width: 720px)
          width: 1.35em
          height: 1.35em

        img
          width: 100%
          height: 100%

      .cta
        position: absolute
        right: 0
        top: 0

    .token-body
      .graph-wrapper
        margin-bottom: 3em

</style>
