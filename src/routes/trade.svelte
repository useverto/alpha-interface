<script lang="typescript">
  import { onMount } from "svelte";
  import { address, keyfile, loggedIn } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { notification } from "../stores/notificationStore";
  import { NotificationType, TradeMode } from "../utils/types";
  import Verto from "@verto/lib";
  import type { Token, TokenInstance } from "../utils/types";
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Balance from "../components/app/Balance.svelte";
  import Loading from "../components/Loading.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";
  import downArrowIcon from "../assets/down-arrow.svg";
  import { fade, fly } from "svelte/transition";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";
  import Button from "../components/Button.svelte";
  import { cubicOut } from "svelte/easing";
  import Modal from "../components/Modal.svelte";
  import { saveSetting } from "../utils/settings";

  if (process.browser && !$loggedIn) goto("/");

  notification.notify(
    "Warning",
    "Verto is currently in Alpha. Use at your own risk.",
    NotificationType.warning,
    10000
  );

  let client = new Verto();

  onMount(async () => {
    const ip = await (await fetch("https://api.ipify.org?format=json")).json();
    const res = await (await fetch(`https://ipapi.co/${ip.ip}/json`)).json();
    if (res.country === "US") {
      goto("/usa");
    }
    client = new Verto(JSON.parse($keyfile));
    loadMetrics();
  });

  export const update = () => {
    client = new Verto(JSON.parse($keyfile));
    psts = getTradingPostSupportedTokens();
    orderBook = getOrderBook();
    loadMetrics();
  };

  let order;
  let selectedPost;
  let buyAmount: number = 1;
  let sellAmount: number = 1;
  let buyToken: string;
  let sellToken: string;
  let sellRate: number = 1;
  let mode: TradeMode = TradeMode.Buy;
  let activeMenu: string = "open";
  let confirmModalOpened: boolean = false;
  let confirmModalText: string = "";
  let tokenModalOpened: boolean = false;
  let newTokenContract: string = "";

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
    let tokens = await psts;

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

    if (mode === TradeMode.Sell) {
      const token = tokens.find((pst) => pst.ticker === sellToken).id;
      order = await client.createOrder(
        "sell",
        sellAmount,
        token,
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

      await client.saveToken(token);
      confirmModalText = `You're sending ${order.pst} ${sellToken} + ${order.ar} AR`;
      confirmModalOpened = true;
      loading = false;
      return;
    } else if (mode === TradeMode.Buy) {
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

      const token = tokens.find((pst) => pst.ticker === buyToken).id;
      order = await client.createOrder("buy", buyAmount, token, selectedPost);

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

      await client.saveToken(token);
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
        (pst) => pst.ticker === (mode === TradeMode.Sell ? sellToken : buyToken)
      )?.id;
      let table = res.find((orders) => orders.token === token);
      if (table) {
        let orders = table.orders;
        orders.map((order) => {
          if (order.type === "Sell") {
            order.amnt = Math.floor(order.amnt);
          }
        });
        return orders.sort((a, b) => b.rate - a.rate);
      } else {
        return [];
      }
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
  let metricData = null;
  let lodingMetrics = false;
  async function loadMetrics() {
    if (!selectedMetric) {
      selectedMetric = "price";
    }
    lodingMetrics = true;
    let ticker = mode === TradeMode.Buy ? buyToken : sellToken;
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
      metricData = data;
    } else {
      const data = await client.volume(contract);
      data.empty = false;
      if (data.volume.length === 0 && data.dates.length === 0) {
        data.empty = true;
      }
      metricData = data;
    }
    lodingMetrics = false;
  }

  $: {
    if (sellToken === "custom-token" || buyToken === "custom-token") {
      tokenModalOpened = true;
      // don't await if it is already resolved
      psts.then((loadedPsts) => {
        if (sellToken === "custom-token") sellToken = loadedPsts[0].ticker;
        if (buyToken === "custom-token") buyToken = loadedPsts[0].ticker;
      });
    }
  }

  async function addCustomToken() {
    const ticker = await client.saveToken(newTokenContract);
    saveSetting("tokens", JSON.parse(localStorage.getItem("tokens")), $address);
    psts = getTradingPostSupportedTokens();
    if (mode === TradeMode.Sell) {
      sellToken = ticker;
    } else {
      buyToken = ticker;
    }
    newTokenContract = "";
  }
</script>

<svelte:head>
  <title>Verto — Trade</title>
</svelte:head>

<NavBar {update} />
<div class="trade">
  <Balance />
  <div class="metrics">
    <div class="metrics-menu">
      {#if lodingMetrics && metricData !== null}
        <div>
          <Loading
            style="height: 1.1em; width: 1.1em; margin-right: 1em;"
            speed={850} />
        </div>
      {/if}
      <div class="select-container">
        <select bind:value={selectedMetric} on:change={loadMetrics}>
          <option value="price">Price</option>
          <option value="volume">Volume</option>
        </select>
        <object data={downArrowIcon} type="image/svg+xml" title="select-icon" />
      </div>
    </div>
    {#if metricData === null}
      <Loading />
    {:else if metricData.empty}
      {#if selectedMetric === 'price'}
        <p in:fade={{ duration: 300 }}>no price data.</p>
      {:else}
        <p in:fade={{ duration: 300 }}>no trading volume.</p>
      {/if}
    {:else}
      <div class="graph" in:fade={{ duration: 300 }}>
        <Line
          data={{ labels: metricData.dates, datasets: [{ data: selectedMetric === 'volume' ? metricData.volume : metricData.prices, backgroundColor: 'transparent', borderColor: function (context) {
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
          options={{ elements: { point: { radius: 0 }, line: { borderWidth: 5, borderCapStyle: 'round' } }, maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ gridLines: { display: false } }] } }} />
      </div>
    {/if}
  </div>
  <div class="trade-form">
    <div class="menu">
      <button
        class:active={mode === TradeMode.Buy}
        on:click={() => {
          mode = TradeMode.Buy;
          orderBook = getOrderBook();
          loadMetrics();
        }}>Buy</button>
      <button
        class:active={mode === TradeMode.Sell}
        on:click={() => {
          mode = TradeMode.Sell;
          orderBook = getOrderBook();
          loadMetrics();
        }}>Sell</button>
    </div>
    {#if mode === TradeMode.Sell}
      <div
        class="content"
        in:fly={{ duration: 150, x: -1000, delay: 65, easing: cubicOut }}
        out:fly={{ duration: 150, x: -1000, easing: cubicOut }}>
        <div class="content-section">
          <div class="input">
            <p class="label">Amount</p>
            {#await psts}
              <SkeletonLoading
                style="display: flex; width: 100%; height: 2.35em" />
            {:then _}
              <input
                type="number"
                step={1}
                pattern="\d+"
                bind:value={sellAmount}
                min={1} />
            {/await}
          </div>
          <div class="input select-container">
            <p class="label">Token</p>
            {#await psts}
              <SkeletonLoading
                style="display: flex; width: 100%; height: 2.35em" />
            {:then loadedPSTs}
              <div class="select-container">
                <select
                  bind:value={sellToken}
                  on:change={() => {
                    orderBook = getOrderBook();
                    loadMetrics();
                  }}>
                  {#each loadedPSTs as pst}
                    <option value={pst.ticker}>{pst.ticker}</option>
                  {/each}
                  <option value="custom-token">Custom token...</option>
                </select>
                <object
                  data={downArrowIcon}
                  type="image/svg+xml"
                  title="select-icon" />
              </div>
            {/await}
          </div>
        </div>
        <div class="content-section">
          <div class="input">
            <p class="label">Rate</p>
            {#if sellToken === undefined}
              <SkeletonLoading
                style="display: flex; width: 100%; height: 2.35em" />
            {:else}
              <input type="number" bind:value={sellRate} min={0.0000001} />
            {/if}
          </div>
          <div class="input">
            <p class="label" />
            {#await psts}
              <SkeletonLoading
                style="display: flex; width: 100%; height: 2.35em" />
            {:then _}
              <select class="fake-select" disabled>
                <option>{'AR/' + sellToken}</option>
              </select>
            {/await}
          </div>
        </div>
        <div class="content-section interact-area">
          <div class="input select-container">
            <p class="label">Trading post</p>
            {#await posts}
              <SkeletonLoading style="width: 100%; height: 2.35em" />
            {:then loadedPosts}
              <div class="select-container">
                <select
                  bind:value={selectedPost}
                  on:change={() => {
                    psts = getTradingPostSupportedTokens();
                    orderBook = getOrderBook();
                    tradingPostFeePercent = getTradingPostFeePercent();
                    loadMetrics();
                  }}>
                  {#if loadedPosts.length === 0}
                    <option disabled>No posts found</option>
                  {/if}
                  {#each loadedPosts as post}
                    <option value={post} selected={post === selectedPost}>
                      {post}
                    </option>
                  {/each}
                </select>
                <object
                  data={downArrowIcon}
                  type="image/svg+xml"
                  title="select-icon" />
              </div>
            {/await}
          </div>
          <div class="button-container">
            <p>Fee</p>
            <div class="button-container-inner">
              {#await tradingPostFeePercent}
                <SkeletonLoading style="width: 46%; height: 2.35em" />
                <SkeletonLoading style="width: 46%; height: 2.35em" />
              {:then feePercent}
                <select
                  class="fake-select"
                  in:fade={{ duration: 150 }}
                  disabled>
                  <option>{feePercent}%</option>
                </select>
                {#if !loading}
                  <Button
                    click={exchange}
                    style={`
                      font-family: 'JetBrainsMono', monospace; 
                      text-transform: uppercase; 
                      width: 46%;
                      display: block;
                      padding-left: 0;
                      padding-right: 0;
                      height: 100%;
                    `}>
                    {mode}
                  </Button>
                {:else}
                  <Loading />
                {/if}
              {/await}
            </div>
          </div>
        </div>
      </div>
    {:else if mode === TradeMode.Buy}
      <div
        class="content"
        in:fly={{ duration: 150, x: 1000, delay: 65, easing: cubicOut }}
        out:fly={{ duration: 150, x: 1000, easing: cubicOut }}>
        <div class="content-section">
          <div class="input">
            <p class="label">Send</p>
            {#await psts}
              <SkeletonLoading
                style="display: flex; width: 100%; height: 2.35em" />
            {:then _}
              <div class="input-wrapper">
                <input
                  type="number"
                  step={1}
                  pattern="\d+"
                  bind:value={buyAmount}
                  min={0.000001} />
                <select
                  class="fake-select"
                  style="opacity: 1 !important"
                  disabled>
                  <option>AR</option>
                </select>
              </div>
            {/await}
          </div>
          <div class="input select-container" style="opacity: 1 !important">
            <p class="label">Receive</p>
            {#await psts}
              <SkeletonLoading
                style="display: flex; width: 100%; height: 2.35em" />
            {:then loadedPSTs}
              <div class="select-container">
                <select
                  bind:value={buyToken}
                  on:change={() => {
                    orderBook = getOrderBook();
                    loadMetrics();
                  }}>
                  {#each loadedPSTs as pst}
                    <option value={pst.ticker}>{pst.ticker}</option>
                  {/each}
                  <option value="custom-token">Custom token...</option>
                </select>
                <object
                  data={downArrowIcon}
                  type="image/svg+xml"
                  title="select-icon" />
              </div>
            {/await}
          </div>
        </div>
        <div class="content-section interact-area">
          <div class="input select-container">
            <p class="label">Trading post</p>
            {#await posts}
              <SkeletonLoading style="width: 100%; height: 2.35em" />
            {:then loadedPosts}
              <div class="select-container">
                <select
                  bind:value={selectedPost}
                  on:change={() => {
                    psts = getTradingPostSupportedTokens();
                    orderBook = getOrderBook();
                    tradingPostFeePercent = getTradingPostFeePercent();
                    loadMetrics();
                  }}>
                  {#if loadedPosts.length === 0}
                    <option disabled>No posts found</option>
                  {/if}
                  {#each loadedPosts as post}
                    <option value={post} selected={post === selectedPost}>
                      {post}
                    </option>
                  {/each}
                </select>
                <object
                  data={downArrowIcon}
                  type="image/svg+xml"
                  title="select-icon" />
              </div>
            {/await}
          </div>
          <div class="button-container">
            <p>Fee</p>
            <div class="button-container-inner">
              {#await tradingPostFeePercent}
                <SkeletonLoading style="width: 46%; height: 2.35em" />
                <SkeletonLoading style="width: 46%; height: 2.35em" />
              {:then feePercent}
                <select
                  class="fake-select"
                  in:fade={{ duration: 150 }}
                  disabled>
                  <option>{feePercent}%</option>
                </select>
                {#if !loading}
                  <Button
                    click={exchange}
                    style={`
                      font-family: 'JetBrainsMono', monospace; 
                      text-transform: uppercase; 
                      width: 46%;
                      display: block;
                      padding-left: 0;
                      padding-right: 0;
                      height: 100%;
                    `}>
                    {mode}
                  </Button>
                {:else}
                  <Loading />
                {/if}
              {/await}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
  <div class="orders">
    <div class="menu">
      <button
        class:active={activeMenu === 'open'}
        on:click={() => (activeMenu = 'open')}>Open Orders</button>
      <!-- <button
        class:active={activeMenu === 'closed'}
        on:click={() => (activeMenu = 'closed')}>Closed Orders</button> -->
    </div>
    {#if activeMenu === 'open'}
      <div
        class="content"
        in:fly={{ duration: 150, x: -1000, delay: 65, easing: cubicOut }}
        out:fly={{ duration: 150, x: -1000, easing: cubicOut }}>
        <table>
          <tr>
            <th>OP</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
          {#await orderBook}
            {#each Array(5) as _}
              <tr>
                <td style="width: 10%">
                  <SkeletonLoading style="width: 100%;" />
                </td>
                <td style="width: 30%">
                  <SkeletonLoading style="width: 100%;" />
                </td>
                <td style="width: 30%">
                  <SkeletonLoading style="width: 100%;" />
                </td>
                <td style="width: 30%">
                  <SkeletonLoading style="width: 100%;" />
                </td>
              </tr>
            {/each}
          {:then loadedOrders}
            {#if loadedOrders.length === 0}
              <p>This trading post doesn't have any open orders!</p>
            {/if}
            {#each loadedOrders as trade}
              <tr>
                <td><span class="direction">{trade.type}</span></td>
                <td>
                  {trade.amnt}
                  {trade.type === 'Sell' ? (mode === TradeMode.Sell ? sellToken : buyToken) : 'AR'}
                </td>
                <td>
                  {#if trade.type === 'Sell'}
                    {1 / trade.rate} AR/{mode === TradeMode.Sell ? sellToken : buyToken}
                  {:else}---{/if}
                </td>
                <td>
                  {trade.received}
                  {trade.type === 'Sell' ? 'AR' : mode === TradeMode.Sell ? sellToken : buyToken}
                </td>
              </tr>
            {/each}
          {/await}
        </table>
      </div>
    {/if}
    <!-- TODO: closed orders -->
  </div>
</div>
<Footer />
<Modal
  bind:opened={tokenModalOpened}
  confirmation={true}
  onConfirm={addCustomToken}>
  <h3 style="text-align: center;">Add Token</h3>
  <input
    type="text"
    bind:value={newTokenContract}
    class="light contract-id"
    placeholder="Token Contract ID" />
</Modal>
<Modal
  bind:opened={confirmModalOpened}
  confirmation={true}
  onConfirm={confirmTrade}
  onCancel={cancelTrade}>
  <p style="text-align: center;">
    {#if mode === TradeMode.Buy}
      Buying {buyAmount} AR's worth of {buyToken}
    {:else if mode === TradeMode.Sell}
      Selling {Math.ceil(sellAmount)}
      {sellToken} at a rate of {sellRate} AR/{sellToken}
    {/if}
  </p>
  <p style="text-align: center">
    {#await confirmModalText}
      Loading fees...
    {:then loadedText}
      {loadedText}
    {/await}
  </p>
</Modal>

<style lang="sass">

  @import "../styles/tables.sass"
  @import "../styles/general.sass"
  @import "../styles/selects.sass"

  .trade
    +table
    +page

    @media screen and (max-width: 720px)
      padding-top: 2em

    .metrics
      position: relative
      padding-top: 3em
      margin-bottom: 3em

      p
        color: var(--secondary-text-color)
        font-weight: 600
        font-size: .95em
        margin: 0
        text-transform: uppercase
      
      .graph
        position: relative
        height: 32vh

      .metrics-menu
        position: absolute
        top: 0
        right: 0
        display: flex
        align-items: center

        .select-container
          width: 7em

          select
            text-transform: uppercase

    .trade-form
      margin-bottom: 3em

      .menu
        +menu-style

        @media screen and (max-width: 720px)
          padding-top: 0

      .input
        +input

      .content
        .content-section
          display: flex
          align-items: flex-end
          justify-content: space-between

          .select-container
            object
              transform: translateY()

          &.interact-area
            @media screen and (max-width: 720px)
              display: block
              align-items: none
              justify-content: none

            .input.select-container
              width: 66%

              @media screen and (max-width: 720px)
                width: auto

              select
                padding-right: 1.2em

            .button-container
              width: 32%

              @media screen and (max-width: 720px)
                width: auto

              p
                font-size: 0.95em
                margin-bottom: 0.6em
                font-weight: 600
                text-transform: uppercase
                color: var(--secondary-text-color)

              .button-container-inner
                display: flex
                justify-content: space-between

                select
                  opacity: 1
                  width: 46%

                .fake-select
                  border: 1px solid var(--inverted-elements-color)
                    top: 2px solid var(--inverted-elements-color)
                  font-size: 1.2em

        .input
          width: 47%

          @media screen and (max-width: 720px)
            width: 48.5%

    .orders
      .menu
        +menu-style

        @media screen and (max-width: 720px)
          padding-top: 0

      .content
        p
          color: var(--primary-text-color)

</style>
