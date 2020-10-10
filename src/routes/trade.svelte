<script lang="typescript">
  import { onMount } from "svelte";
  import { balance, address, keyfile, loggedIn } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { notification } from "../stores/notificationStore";
  import { NotificationType } from "../utils/types";
  import Verto from "@verto/lib";
  import type { Token, TokenInstance } from "../utils/types";
  import NavBar from "../components/NavBar.svelte";
  import { fade, fly } from "svelte/transition";
  import Assets from "../components/app/Assets.svelte";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";
  import Button from "../components/Button.svelte";
  import Loading from "../components/Loading.svelte";
  import Modal from "../components/Modal.svelte";
  import Footer from "../components/Footer.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";
  import { cubicIn } from "svelte/easing";

  if (process.browser && !$loggedIn) goto("/");

  onMount(async () => {
    const res = await (await fetch("http://ip-api.com/json")).json();

    if (res.countryCode === "US") {
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

  let selectedMetric;
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
<div class="trade" in:fade={{ duration: 300 }}>
  <div class="balance">
    {#if $balance === 0}
      <p>
        <SkeletonLoading style="height: 1em; width: 120px" />
      </p>
      <h1 class="total-balance">
        <SkeletonLoading style="height: 1em; width: 300px" />
      </h1>
      <p class="wallet">
        <SkeletonLoading style="height: 1em; width: 400px" />
      </p>
    {:else}
      <p in:fade={{ duration: 150 }}>Your balance</p>
      <h1 class="total-balance" in:fade={{ duration: 150 }}>
        {roundCurrency($balance)}<span style="text-transform: uppercase; font-size: .5em; display: inline-block">Ar</span>
      </h1>
      <p class="wallet" in:fade={{ duration: 150 }}>Wallet: {$address}</p>
    {/if}
  </div>
  <div class="assets" style="margin-bottom: -1.2em">
    <Assets />
  </div>
  <div class="metrics">
    <div class="title-section">
      <h1 class="title">Metrics</h1>
      <select
        bind:value={selectedMetric}
        on:change={() => (metricData = getMetrics())}>
        <option value="price">Price</option>
        <option value="volume">Volume</option>
      </select>
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
        <div style="height: 39vh; position: relative; width: 100%;">
          <Line
            data={{ labels: loadedMetrics.dates, datasets: [{ data: selectedMetric === 'volume' ? loadedMetrics.volume : loadedMetrics.prices, backgroundColor: function (context) {
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
            options={{ maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ gridLines: { display: false } }] } }} />
        </div>
      {/if}
    {/await}
  </div>
  <div class="menu">
    <button
      class:active={mode === 'buy'}
      on:click={() => {
        mode = 'buy';
        orderBook = getOrderBook();
        metricData = getMetrics();
      }}>Buy</button>
    <button
      class:active={mode === 'sell'}
      on:click={() => {
        mode = 'sell';
        orderBook = getOrderBook();
        metricData = getMetrics();
      }}>Sell</button>
  </div>
  <div class="trade-container">
    {#if mode === 'sell'}
      <div in:fly={{ y: 20, duration: 350, easing: cubicIn }}>
        <div class="trade-section" in:fade={{ duration: 300 }}>
          <div class="long-content">
            <div style="width: 100%">
              <p>Trading post</p>
              <select
                bind:value={selectedPost}
                style="width: 100%"
                on:change={() => {
                  psts = getTradingPostSupportedTokens();
                  orderBook = getOrderBook();
                  tradingPostFeePercent = getTradingPostFeePercent();
                  metricData = getMetrics();
                }}>
                {#await posts}
                  <option disabled>Loading...</option>
                {:then loadedPosts}
                  {#if loadedPosts.length === 0}
                    <option disabled>No posts found</option>
                  {/if}
                  {#each loadedPosts as post}
                    <option value={post} selected={post === selectedPost}>
                      {post}
                    </option>
                  {/each}
                {/await}
              </select>
            </div>
          </div>
          <div class="short-content">
            <div style="width: 100%">
              <p>Fee</p>
              {#await tradingPostFeePercent}
                <SkeletonLoading
                  style="width: 100% !important; height: 100% !important" />
              {:then feePercent}
                <select class="fake-select" disabled>
                  <option>{feePercent}%</option>
                </select>
              {/await}
            </div>
          </div>
        </div>
        <div class="trade-section" in:fade={{ duration: 300 }}>
          <div class="long-content">
            <div style="width: 47%; margin-right: 3%">
              <p>Amount</p>
              <div class="input">
                <input
                  type="number"
                  step="1"
                  pattern="\d+"
                  bind:value={sellAmount}
                  min={1} />
                {#await psts}
                  <SkeletonLoading style="width: 35px; height: 38px" />
                {:then loadedPSTs}
                  <select
                    bind:value={sellToken}
                    on:change={() => {
                      orderBook = getOrderBook();
                      metricData = getMetrics();
                    }}>
                    {#each loadedPSTs as pst}
                      <option value={pst.ticker}>{pst.ticker}</option>
                    {/each}
                  </select>
                {/await}
              </div>
            </div>
            <div style="width: 47%; margin-left: 3%">
              <p>Rate</p>
              <div class="input">
                <input type="number" bind:value={sellRate} min={0.0000001} />
                <select class="fake-select" disabled>
                  {#if sellToken === undefined}
                    <option>...</option>
                  {:else}
                    <option>{'AR/' + sellToken}</option>
                  {/if}
                </select>
              </div>
            </div>
          </div>
          <div class="short-content">
            <p><br /></p>
            <p />
            <div class="input" style="border: none">
              {#if !loading}
                <Button
                  click={exchange}
                  style={`
                    font-family: 'JetBrainsMono', monospace; 
                    text-transform: uppercase; 
                    width: 100%;
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
            </div>
          </div>
        </div>
      </div>
    {:else if mode === 'buy'}
      <div in:fly={{ y: 20, duration: 350, easing: cubicIn }}>
        <div class="trade-section" in:fade={{ duration: 300 }}>
          <div class="long-content">
            <div style="width: 100%">
              <p>Trading post</p>
              <select
                bind:value={selectedPost}
                style="width: 100%"
                on:change={() => {
                  psts = getTradingPostSupportedTokens();
                  orderBook = getOrderBook();
                  tradingPostFeePercent = getTradingPostFeePercent();
                  metricData = getMetrics();
                }}>
                {#await posts}
                  <option disabled>Loading...</option>
                {:then loadedPosts}
                  {#if loadedPosts.length === 0}
                    <option disabled>No posts found</option>
                  {/if}
                  {#each loadedPosts as post}
                    <option value={post} selected={post === selectedPost}>
                      {post}
                    </option>
                  {/each}
                {/await}
              </select>
            </div>
          </div>
          <div class="short-content">
            <div style="width: 100%">
              <p>Fee</p>
              {#await tradingPostFeePercent}
                <SkeletonLoading
                  style="width: 100% !important; height: 100% !important" />
              {:then percent}
                <select class="fake-select" disabled>
                  <option>{percent}%</option>
                </select>
              {/await}
            </div>
          </div>
        </div>
        <div class="trade-section" in:fade={{ duration: 300 }}>
          <div class="long-content">
            <div style="width: 47%; margin-right: 3%">
              <p>Send</p>
              <div class="input">
                <input
                  type="number"
                  pattern="\d+"
                  bind:value={buyAmount}
                  min={0.000001} />
                <select class="fake-select" disabled>
                  <option>AR</option>
                </select>
              </div>
            </div>
            <div style="width: 47%; margin-left: 3%">
              <p>Receive</p>
              <div class="input">
                {#await psts}
                  <SkeletonLoading
                    style="width: 100% !important; height: 100% !important" />
                {:then loadedPSTs}
                  <select
                    bind:value={buyToken}
                    style="width: 100% !important;"
                    on:change={() => {
                      orderBook = getOrderBook();
                      metricData = getMetrics();
                    }}>
                    {#each loadedPSTs as pst}
                      <option value={pst.ticker}>{pst.ticker}</option>
                    {/each}
                  </select>
                {/await}
              </div>
            </div>
          </div>
          <div class="short-content">
            <p><br /></p>
            <p />
            <div class="input" style="border: none">
              {#if !loading}
                <Button
                  click={exchange}
                  style={`
                    font-family: 'JetBrainsMono', monospace; 
                    text-transform: uppercase; 
                    width: 100%;
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
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
<div class="exchanges-section">
  <div class="information">
    <div class="menu">
      <button
        class:active={activeMenu === 'open'}
        on:click={() => (activeMenu = 'open')}>Open Orders</button>
      <!-- <button
        class:active={activeMenu === 'closed'}
        on:click={() => (activeMenu = 'closed')}>Closed Orders</button> -->
    </div>
  </div>
  <div class="content">
    {#if activeMenu === 'open'}
      <table in:fade={{ duration: 400 }}>
        {#await orderBook}
          {#each Array(5) as _}
            <tr>
              <th style="width: 80%">
                <SkeletonLoading style="width: 100%;" />
              </th>
              <th style="width: 20%">
                <SkeletonLoading style="width: 100%;" />
              </th>
            </tr>
          {/each}
        {:then loadedOrders}
          {#if loadedOrders.length === 0}
            <p>This trading post doesn't have any open orders!</p>
          {/if}
          {#each loadedOrders as trade}
            <tr>
              <td style="text-align: left">
                <span class="direction">{trade.type}</span>
                {trade.amnt}
                {#if trade.type === 'Sell'}
                  {mode === 'sell' ? sellToken : buyToken} at {1 / trade.rate} AR/{mode === 'sell' ? sellToken : buyToken}
                {:else}AR {'->'} {mode === 'sell' ? sellToken : buyToken}{/if}
              </td>
            </tr>
          {/each}
        {/await}
      </table>
      <!-- {:else if activeMenu === 'closed'}
      <table in:fade={{ duration: 400 }}>
        {#await closedTrades}
          {#each Array(5) as _}
            <tr>
              <td style="width: 100%">
                <SkeletonLoading style="width: 100%;" />
              </td>
            </tr>
          {/each}
        {:then loadedClosedTrades}
          {#if loadedClosedTrades.length === 0}
            <p>This trading post doesn't have any completed trades!</p>
          {/if}
          {#each loadedClosedTrades as trade}
            <tr>
              <td style="text-align: left">
                {trade.sent}
                {'->'}
                {trade.received}
              </td>
            </tr>
          {/each}
        {/await}
      </table> -->
    {/if}
  </div>
</div>
<Modal
  bind:opened={confirmModalOpened}
  confirmation={true}
  onConfirm={confirmTrade}
  onCancel={cancelTrade}>
  <p style="text-align: center;">
    {#if mode === 'buy'}
      Buying {buyAmount} AR's worth of {buyToken}
    {:else if mode === 'sell'}
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
<Footer />



<!-- prettier-ignore -->
<style lang="sass">

  @import "../styles/tables.sass"
  @import "../styles/general.sass"

  .trade
    @include table
    @include page

    @media screen and (max-width: 720px)
      padding-top: 2em

    table
      td:last-child, th:last-child
        text-align: left !important

    .balance
      p
        color: var(--secondary-text-color)
        text-transform: uppercase
        font-size: .9em
        margin: 0
        font-weight: 600

        &.wallet
          text-transform: none

      h1.total-balance
        font-size: 2.3em
        color: var(--primary-text-color)
        font-weight: 400
        margin: .14em 0

      @media screen and (max-width: 720px)
        padding-top: .65em !important

    .assets
      margin: 2.45em 0

    .metrics
      margin: 0 0 2em

      p
        color: var(--secondary-text-color)

      h1
        margin-top: 0

      .title-section
        display: flex
        align-items: center
        justify-content: space-between

    .recommended-post
      display: flex
      align-items: flex-end

      select, .select-fake
        width: 100%
        font-size: 1.2em
        padding:
          top: calc(.3em + 2px) // border + padding of the button
          bottom: calc(.3em + 2px) // border + padding of the button

      p
        color: rgba(#000, .3)
        font-weight: 600
        font-size: .95em
        margin: 0
          bottom: .7em
        text-transform: uppercase

    .trade-container
      .trade-section
        display: flex
        justify-content: space-between
        align-items: center
        margin: 2em 0

        .short-content
          width: 14%
          margin-left: 3%
          height: 100%

        .long-content
          width: 80%
          margin-right: 3%
          display: flex
          justify-content: space-between

        .short-content, .long-content
          p
            color: var(--secondary-text-color)
            font-weight: 600
            font-size: .95em
            margin: 0
              bottom: .7em
            text-transform: uppercase

          select, .fake-select
            width: 100% !important
            height: 2.35em !important  

          .fake-select
            opacity: 1 !important
            background-image: none !important
            padding-right: 0 !important

          input
            color: var(--primary-text-color)

          .input
            border: 2px solid var(--inverted-elements-color)
            display: flex
            border-radius: .3em
            overflow: hidden

            input
              border: none
              width: 70% !important

            select
              width: 30% !important
              border-radius: 0

    select
      $sidePadding: .65em
      position: relative
      color: var(--background-color)
      background-color: var(--inverted-elements-color)
      font-size: 1em
      padding: .34em ($sidePadding * 3 + .3em) .34em $sidePadding
      cursor: pointer
      border-radius: .3em
      outline: none
      border: none
      -webkit-appearance: none
      -moz-appearance: none
      background-image: url(/down-arrow.svg)
      background-position: calc(100% - #{$sidePadding}) center
      background-repeat: no-repeat
      background-size: $sidePadding * 1.35
      transition: all .3s

      &:hover
        opacity: .8

    .select-fake
      span
        position: absolute
        left: 0
        right: 0
        top: 0
        bottom: 0

  .exchanges-section
    @include table
    @include page

  .menu
    position: relative
    display: flex
    margin-bottom: 1.5em

    @media screen and (max-width: 720px)
      justify-content: space-between
      padding-top: 4em

    button
      position: relative
      padding: .4em 1.8em
      font-family: "JetBrainsMono", monospace
      text-transform: uppercase
      font-weight: 600
      color: var(--primary-text-color)
      background-color: transparent
      border: none
      font-size: 1.15em
      outline: none
      text-align: center
      cursor: pointer

      @media screen and (max-width: 720px)
        padding: .18em .14em
        font-size: .75em

      &::after
        content: ""
        position: absolute
        bottom: 0
        left: 0
        width: 100%
        height: 0
        opacity: 0
        background-color: var(--inverted-elements-color)
        transition: all .2s

      &.active::after
        opacity: 1
        height: 3px

    .trade
      position: absolute
      right: 0
      top: 0

      @media screen and (max-width: 720px)
        right: unset
        left: 0

</style>