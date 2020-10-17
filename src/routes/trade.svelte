<script lang="typescript">
  import { onMount } from "svelte";
  import { address, keyfile, loggedIn } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { notification } from "../stores/notificationStore";
  import { NotificationType } from "../utils/types";
  import Verto from "@verto/lib";
  import type { Token, TokenInstance } from "../utils/types";
  import NavBar from "../components/NavBar.svelte";
  import Balance from "../components/app/Balance.svelte";
  import Loading from "../components/Loading.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";
  import downArrowIcon from "../assets/down-arrow.svg";
  import { fade } from "svelte/transition";

  if (process.browser && !$loggedIn) goto("/");

  onMount(async () => {
    const ip = await (await fetch("https://api.ipify.org?format=json")).json();
    const res = await (await fetch(`https://ipapi.co/${ip.ip}/json`)).json();
    if (res.country === "US") {
      goto("/usa");
    }
  });

  notification.notify(
    "Warning",
    "Verto is currently in Alpha. Use at your own risk.",
    NotificationType.warning,
    10000
  );

  let client = new Verto();
  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
  });
  let order;

  let selectedPost;
  let buyAmount: number = 1;
  let sellAmount: number = 1;
  let buyToken: string;
  let sellToken: string;
  let sellRate: number = 1;
  let mode: string = "buy";
  let activeMenu: string = "open";
  let confirmModalOpened: boolean = false;
  let confirmModalText: string = "";

  if (process.browser) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("post")) selectedPost = params.get("post");
  }

  let posts = client.getTradingPosts();
  let psts = getTradingPostSupportedTokens();

  let loading: boolean = false;

  async function getTradingPostSupportedTokens(): Promise<Token[]> {
    if (selectedPost === undefined || selectedPost === "Loading...")
      selectedPost = (await posts)[0];

    return await client.getTPTokens(selectedPost);
  }

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  // open confirmation modal
  async function exchange() {
    if (selectedPost === undefined || selectedPost === "Loading...")
      selectedPost = (await posts)[0];

    loading = true;
    let orders = await orderBook;

    if ($address === selectedPost) {
      notification.notify(
        "Error",
        "You can not make trades from your own trading post!",
        NotificationType.error,
        5000
      );
      loading = false;
      return;
    }

    if (mode === "sell") {
      order = await client.createOrder(
        "sell",
        sellAmount,
        (await client.getTokens()).find((pst) => pst.ticker === sellToken).id,
        selectedPost,
        sellRate
      );

      if (order === "pst") {
        notification.notify(
          "Error",
          "You don't have the sufficient amount of tokens.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      } else if (order === "ar") {
        notification.notify(
          "Error",
          "You don't have enough AR.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      }

      confirmModalText = `You're sending ${order.pst} ${sellToken} + ${order.ar} AR`;
      confirmModalOpened = true;
      loading = false;
      return;
    } else if (mode === "buy") {
      let sum = 0;
      for (const order of orders) {
        if (order.type === "Sell") {
          sum += order.amnt / order.rate;
        }
      }
      if (buyAmount > sum) {
        notification.notify(
          "Error",
          "You're buying more than the orderbook allows.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      }

      order = await client.createOrder(
        "buy",
        buyAmount,
        (await client.getTokens()).find((pst) => pst.ticker === buyToken).id,
        selectedPost
      );

      if (order === "ar") {
        notification.notify(
          "Error",
          "You don't have enough AR.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      } else if (orders.find((o) => o.type === "Sell") === undefined) {
        notification.notify(
          "Error",
          "There aren't any sell orders open. You cannot buy tokens if no sell orders are open.",
          NotificationType.error,
          10000
        );
        loading = false;
        return;
      }

      confirmModalText = `You're sending ${order.ar} AR`;
      confirmModalOpened = true;
      loading = false;
      return;
    } else {
      notification.notify(
        "Error",
        "You aren't buying nor selling. This may be a bug.",
        NotificationType.error,
        5000
      );
      loading = false;
      return;
    }
  }

  let orderBook = getOrderBook();

  async function getOrderBook(): Promise<TokenInstance[]> {
    if (selectedPost === undefined || selectedPost === "Loading...")
      selectedPost = (await posts)[0];

    const config = await client.getConfig(selectedPost);

    try {
      let url = config["publicURL"].startsWith("https://")
        ? config["publicURL"]
        : "https://" + config["publicURL"];
      let endpoint = url.endsWith("/") ? "orders" : "/orders";

      let res = await (await fetch(url + endpoint)).clone().json();
      let loadedPSTs = await psts;
      const token = loadedPSTs.find(
        (pst) => pst.ticker === (mode === "sell" ? sellToken : buyToken)
      )?.id;
      let orders = res.find((orders) => orders.token === token).orders;
      orders.map((order) => {
        if (order.type === "Sell") {
          order.amnt = Math.floor(order.amnt);
        }
      });
      return orders.sort((a, b) => b.rate - a.rate);
    } catch (err) {
      notification.notify("Error", err, NotificationType.error, 5000);
      return;
    }
  }

  async function confirmTrade() {
    if (selectedPost === undefined || selectedPost === "Loading...")
      selectedPost = (await posts)[0];

    const config = await client.getConfig(selectedPost);

    try {
      let url = config["publicURL"].startsWith("https://")
        ? config["publicURL"]
        : "https://" + config["publicURL"];
      const endpoint = url.endsWith("/") ? "ping" : "/ping";
      await fetch(url + endpoint);
    } catch (err) {
      notification.notify("Error", err, NotificationType.error, 5000);
      return;
    }

    await client.sendOrder(order.txs);

    notification.notify(
      "Sent",
      "We're processing your trade now! This may take a few minutes.",
      NotificationType.success,
      5000
    );
    goto("/app");
  }

  function cancelTrade() {
    console.log("Cancelled trade");
    confirmModalText = "Loading...";
  }

  let tradingPostFeePercent = getTradingPostFeePercent();

  async function getTradingPostFeePercent(): Promise<number> {
    if (selectedPost === undefined || selectedPost === "Loading...")
      selectedPost = (await posts)[0];

    const config = await client.getConfig(selectedPost);

    return parseFloat(config["tradeFee"]) * 100;
  }

  let selectedMetric: string;
  let metricData = getMetrics();
  async function getMetrics() {
    if (!selectedMetric) {
      selectedMetric = "price";
    }

    let ticker = mode === "buy" ? buyToken : sellToken;
    if (!ticker) {
      ticker = (await psts)[0].ticker;
    }

    const contract = (await psts).find((pst) => pst.ticker === ticker).id;

    if (selectedMetric === "price") {
      const data = await client.price(contract);
      data.empty = false;
      if (data.prices.every((price) => isNaN(price))) {
        data.empty = true;
      }
      return data;
    } else {
      const data = await client.volume(contract);
      data.empty = false;
      if (data.volume.length === 0 && data.dates.length === 0) {
        data.empty = true;
      }
      return data;
    }
  }
</script>

<svelte:head>
  <title>Verto — Trade</title>
</svelte:head>

<NavBar />
<div class="trade">
  <Balance />
  <div class="metrics">
    <div class="select-container">
      <select
        bind:value={selectedMetric}
        on:change={() => (metricData = getMetrics())}>
        <option value="price">Price</option>
        <option value="volume">Volume</option>
      </select>
      <object data={downArrowIcon} type="image/svg+xml" title="select-icon" />
    </div>
    {#await metricData}
      <Loading />
    {:then loadedMetrics}
      {#if loadedMetrics.empty}
        {#if selectedMetric === 'price'}
          <p>no price data.</p>
        {:else}
          <p>no trading volume.</p>
        {/if}
      {:else}
        <div class="graph" in:fade={{ duration: 300 }}>
          <Line
            data={{ labels: loadedMetrics.dates, datasets: [{ data: selectedMetric === 'volume' ? loadedMetrics.volume : loadedMetrics.prices, backgroundColor: 'transparent', borderColor: function (context) {
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
            options={{ elements: { point: { radius: 0 } }, maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ gridLines: { display: false } }] } }} />
        </div>
      {/if}
    {/await}
  </div>
</div>

<style lang="sass">

  @import "../styles/tables.sass"
  @import "../styles/general.sass"
  @import "../styles/selects.sass"

  .trade
    @include table
    @include page

    @media screen and (max-width: 720px)
      padding-top: 2em

    .metrics
      position: relative
      padding-top: 3em
      
      .graph
        position: relative
        height: 32vh

      .select-container
        position: absolute
        top: 0
        right: 0
        width: 7em

        select
          text-transform: uppercase

</style>
