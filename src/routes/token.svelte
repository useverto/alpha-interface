<script lang="typescript">
  import { keyfile } from "../stores/keyfileStore";
  import Arweave from "arweave";
  import Community from "community-js";
  import Verto from "@verto/lib";
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { run } from "ar-gql";

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
    if (process.browser) {
      // @ts-expect-error
      community = new Community(arweaveClient);
      await community.setCommunityTx(communityID);
      state = await community.getState();
    }
  }

  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
  });

  const update = async () => {
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

  async function cTicker(): Promise<string> {
    await communityName;
    return state.ticker;
  }

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

  async function cSocialLinks(): Promise<string[]> {
    await communityName;
    const url = await cAppURL();
    const urls = state.settings.get("communityDiscussionLinks");
    urls.unshift(url);
    return urls;
  }

  async function cAppURL(): Promise<string> {
    await communityName;
    return state.settings.get("communityAppUrl") || "";
  }

  async function arPrice() {
    const networkInfo = await arweaveClient.network.getInfo();
    const blockMin = networkInfo.height - 50;
    const res = (
      await run(
        `
      {
        transactions(
          tags: [
            { name: "app", values: "Limestone" }
            { name: "type", values: "data-latest" }
            { name: "token", values: "AR" }
            { name: "version", values: "0.005" }
          ]
          block: { min: ${blockMin} }
          first: 1
        ) {
          edges {
            node {
              tags {
                name
                value
              }
            }
          }
        }
      }
      `
      )
    ).data.transactions.edges;

    if (res[0]) {
      let tags = res[0].node.tags;
      let price;
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].name === "value") {
          price = parseFloat(tags[i].value);
          return price;
        }
      }
    }
  }

  async function cPriceUSD(): Promise<number> {
    await communityName;
    const priceAR: number = await client.latestPrice(communityID);
    const priceUSD: number = await arPrice();
    return priceAR * priceUSD;
  }

  async function cCirculatingSupply(): Promise<number> {
    await communityName;
    let circulatingSupply = 0;
    for (const key of Object.keys(state.balances)) {
      circulatingSupply += state.balances[key];
    }
    return circulatingSupply;
  }

  async function cTotalSupply(): Promise<number> {
    await communityName;
    const vaultUsers = Object.keys(state.vault);
    let vaultBalance = 0;
    for (let i = 0, j = vaultUsers.length; i < j; i++) {
      vaultBalance += state.vault[vaultUsers[i]]
        .map((a) => a.balance)
        .reduce((a, b) => a + b, 0);
    }
    return vaultBalance + (await cCirculatingSupply());
  }

  async function cMarketCap(): Promise<number> {
    await communityName;
    return (await cPriceUSD()) * (await cTotalSupply());
  }
</script>

<svelte:head>
  <title>Verto — Token</title>
</svelte:head>

<NavBar {update} />

<div class="token">
  <div class="token-head">
    <div class="logo">
      {#await cLogo()}
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
        <SkeletonLoading style="width: 10%;" />
      {:then loadedName}
        {loadedName}
      {/await}
      {#await cTicker()}
        <SkeletonLoading style="width: 10%;" />
      {:then loadedTicker}
        <span class="ticker">{loadedTicker}</span>
      {/await}
    </h1>
    <div class="cta">
      <Button href="/swap" style="min-width: unset !important">Swap</Button>
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
            data={{ labels: loaded.dates, datasets: [{ label: 'AR', data: loaded.prices, backgroundColor: 'rgba(230, 152, 232, 0.2)', borderColor: function (context) {
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
    <div class="content">
      <div class="description">
        <h2>About</h2>
        {#await cDescription()}
          <SkeletonLoading />
        {:then loadedDesc}
          <p>{loadedDesc}</p>
        {/await}
        <h2 style="margin-top: 2em;">Links</h2>
        {#await cSocialLinks()}
          <SkeletonLoading />
        {:then loadedSocialLinks}
          <ul>
            {#each loadedSocialLinks as link}
              <li><a href={link}>{link}</a></li>
            {/each}
            <li>
              <a
                href="https://community.xyz/#{communityID}">community.xyz/#{communityID.substring(0, 3)}...</a>
            </li>
          </ul>
        {/await}
      </div>
      <div class="stats">
        <h2>Metrics</h2>
        {#await cMarketCap()}
          <SkeletonLoading />
        {:then loadedMarketCap}
          <p>Market Cap: ~${Math.round(loadedMarketCap)} USD</p>
        {/await}
        {#await cCirculatingSupply()}
          <SkeletonLoading />
        {:then loadedCirculatingSupply}
          <p>Circulating Supply: {loadedCirculatingSupply}</p>
        {/await}
        {#await cTotalSupply()}
          <SkeletonLoading />
        {:then loadedTotalSupply}
          <p>Total Supply: {loadedTotalSupply}</p>
          <hr class="divider" />
          <p>
            Powered by <a href="https://limestone.finance/#/">Limestone</a> and <a href="https://community.xyz/">CommunityXYZ</a>
          </p>
        {/await}
      </div>
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

      h1.title
        margin: 0

        @media screen and (max-width: 720px)
          font-size: 1.35em
          margin-bottom: .3em
        
        .ticker
          margin-left: 10px
          color: var(--secondary-text-color)
          text-transform: uppercase
          font-size: 0.75em
          font-family: "JetBrainsMono", monospace

      .logo
        width: 2.3em
        height: 2.3em
        border-radius: 100%
        margin:
          top: 2px
          right: 2em

        @media screen and (max-width: 720px)
          width: 1.35em
          height: 1.35em
          margin-right: 1em

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

      .content
        display: flex
        justify-content: space-between
        align-items: stretch

        @media screen and (max-width: 720px)
          display: block

        .stats
          min-width: 40%

        h2, p
          color: var(--primary-text-color)

      .divider
        height: 5px
        width: 5%
        margin-left: 0
        background-color: var(--secondary-text-color)
        border: 0 transparent !important

</style>
