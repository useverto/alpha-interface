<script lang="typescript">
  import { loggedIn, keyfile, address } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { notification } from "../stores/notificationStore";
  import { NotificationType, ActiveMenu } from "../utils/types";
  import type { OrderBookItem, SwapMode } from "../utils/types";
  import Verto from "@verto/lib";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Balance from "../components/app/Balance.svelte";
  import switchIcon from "../assets/switch.svg";
  import downArrowIcon from "../assets/down-arrow.svg";
  import Button from "../components/Button.svelte";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";
  import Modal from "../components/Modal.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";
  import Loading from "../components/Loading.svelte";
  import { saveSetting } from "../utils/settings";

  let sendAmount: number, receiveAmount: number;
  let sendSelected: string, receiveSelected: string;

  // @ts-ignore
  if (process.browser && !$loggedIn) goto("/");

  let client = new Verto();
  let post: string;
  let options: Promise<{ ticker: string; id: string; type: string }[]>;
  let orderBook: Promise<OrderBookItem[]>;

  let hasMetaMask: boolean = true;
  let connected: boolean = true;

  let metricSelected: string;
  let metricData = null;
  let loadingMetrics = false;

  onMount(async () => {
    let res: string;
    try {
      res = await (await fetch("/loc")).json();
    } catch {
      res = await (await fetch("https://get.geojs.io/v1/ip/country")).json();
    }

    console.log(res);

    if (res === "US") {
      console.log("hmmm");
      goto("/usa");
    }

    client = new Verto(JSON.parse($keyfile));

    const params = new URLSearchParams(window.location.search);
    post = params.get("post") || (await client.recommendPost());

    console.log(post);

    options = getOptions();
    orderBook = getOrderBook();
    loadMetrics();

    // @ts-ignore
    hasMetaMask = typeof window.ethereum !== "undefined";
    if (hasMetaMask) {
      // @ts-ignore
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length == 0) connected = false;
    }
  });

  let disabled: boolean = true;
  $: {
    if (sendSelected === "ETH") {
      // sending ETH -> disabled
      disabled = true;
    } else if (sendSelected === "AR") {
      // sending AR
      if (receiveSelected === "ETH") {
        // receiving ETH -> enabled
        disabled = false;
      } else {
        // receiving tokens -> disabled
        disabled = true;
      }
    } else {
      // sending tokens -> enabled
      disabled = false;
    }
  }
  let receivePromise = receive();
  async function receive(
    amount?: number,
    id?: string,
    orderType?: "Buy" | "Sell"
  ): Promise<string> {
    if (!(amount || sendAmount)) {
      return "...";
    }

    let orders = id ? await getOrderBook(id) : await orderBook;
    if (!orders) {
      return "...";
    }

    const loadedOptions = await options;
    if (!restrict(loadedOptions).find((entry) => entry.id === receiveSelected))
      receiveSelected = restrict(loadedOptions)[0].id;
    const value = loadedOptions.find(
      (entry) =>
        entry.id ===
        (id || (sendSelected === "AR" ? receiveSelected : sendSelected))
    );
    const type = orderType || sendSelected === "AR" ? "Sell" : "Buy";
    orders = orders.filter((order) => {
      return order.type === type;
    });

    if (!orders) {
      return "...";
    }

    const token =
      type === "Buy" && receiveSelected !== "AR" ? receiveSelected : null;

    let send = amount || sendAmount;
    let amnt = 0;
    for (const order of orders) {
      if (order.amnt >= send / order.rate) {
        if (token) {
          return await receive(
            value.type === "PST"
              ? Math.floor(amnt + send / order.rate)
              : amnt + send / order.rate,
            token,
            type === "Buy" ? "Sell" : "Buy"
          );
        } else {
          return (
            "~" +
            (value.type === "PST"
              ? Math.floor(amnt + send / order.rate)
              : amnt + send / order.rate)
          );
        }
      } else {
        send -= order.amnt * order.rate;
        amnt += order.amnt;
      }
    }
    if (value.type === "PST") amnt = Math.floor(amnt);

    return token
      ? await receive(amnt, token, type === "Buy" ? "Sell" : "Buy")
      : ">" + amnt;
  }

  function update() {
    client = new Verto(JSON.parse($keyfile));
  }

  async function getOptions(): Promise<
    { ticker: string; id: string; type: string }[]
  > {
    const options: { ticker: string; id: string; type: string }[] = [];

    options.push({ ticker: "ETH", id: "ETH", type: "CHAIN" });
    options.push({ ticker: "AR", id: "AR", type: "CHAIN" });

    const tokens = await client.getTPTokens(post);
    tokens.map((token) =>
      options.push({ ticker: token.ticker, id: token.id, type: "PST" })
    );

    options.push({ ticker: "Custom ...", id: "custom", type: "PST" });

    return options;
  }

  let tokenModalOpened: boolean = false;
  let newToken: string;
  $: {
    if (sendSelected === "custom" || receiveSelected === "custom") {
      tokenModalOpened = true;
      // don't await if it is already resolved
      options.then((loadedOptions) => {
        if (sendSelected === "custom") sendSelected = loadedOptions[0].id;
        if (receiveSelected === "custom")
          receiveSelected = restrict(loadedOptions)[0].id;
      });
    }
  }

  async function addToken() {
    await client.saveToken(newToken);
    saveSetting("tokens", JSON.parse(localStorage.getItem("tokens")), $address);
    options = getOptions();
    newToken = "";
  }

  function restrict(
    options: { ticker: string; id: string; type: string }[]
  ): { ticker: string; id: string; type: string }[] {
    const selected = options.find((entry) => entry.id === sendSelected);
    options = options.filter((entry) => entry.id !== sendSelected);

    if (selected.type === "PST") {
      options = options.filter((entry) => entry.type !== "PST");
      options = options.filter((entry) => entry.id !== "ETH");
    }

    return options;
  }

  async function getOrderBook(
    id?: string,
    recursive: boolean = false
  ): Promise<OrderBookItem[]> {
    const config = await client.getConfig(post);

    const loadedOptions = await options;
    const value = loadedOptions.find(
      (entry) =>
        entry.id ===
        (id || (sendSelected === "AR" ? receiveSelected : sendSelected))
    );

    if (sendSelected === "AR") {
      if (receiveSelected === "ETH") recursive = true;
    } else {
      if (sendSelected !== "ETH") recursive = true;
    }

    try {
      let url = config["publicURL"].startsWith("https://")
        ? config["publicURL"]
        : "https://" + config["publicURL"];
      let endpoint = url.endsWith("/") ? "orders" : "/orders";

      let res = await (await fetch(url + endpoint)).clone().json();
      let table = res.find((orders) => orders.token === value.id);
      if (table) {
        let orders = table.orders;
        for (let i = 0; i < orders.length; i++) {
          orders[i].ticker = value.ticker;
          if (value.type === "PST") {
            orders[i].units = `AR/${value.ticker}`;
            if (orders[i].rate) orders[i].rate = 1 / orders[i].rate;
          } else {
            orders[i].units = `${value.ticker}/AR`;
          }
        }

        if (orders.sort((a, b) => a.rate - b.rate).length === 0 && !recursive) {
          let _post = await client.recommendPost();
          while (_post === post) {
            _post = await client.recommendPost();
          }

          console.log(post, _post);
          post = _post;
          return await getOrderBook(id, true);
        } else {
          return orders.sort((a, b) => a.rate - b.rate);
        }
      } else {
        if (!recursive) {
          let _post = await client.recommendPost();
          while (_post === post) {
            _post = await client.recommendPost();
          }

          console.log(post, _post);
          post = _post;
          return await getOrderBook(id, true);
        } else {
          return [];
        }
      }
    } catch (err) {
      notification.notify("Error", err, NotificationType.error, 5000);
      return;
    }
  }

  async function loadMetrics() {
    const loadedOptions = await options;
    if (!sendSelected) sendSelected = loadedOptions[0].id;
    if (!receiveSelected) receiveSelected = restrict(loadedOptions)[0].id;
    if (!restrict(loadedOptions).find((entry) => entry.id === receiveSelected))
      receiveSelected = restrict(loadedOptions)[0].id;

    const value = loadedOptions.find(
      (entry) =>
        entry.id === (sendSelected === "AR" ? receiveSelected : sendSelected)
    );

    if (!metricSelected) metricSelected = "price";

    if (value.type === "PST") {
      if (metricSelected === "price") {
        const data = await client.price(value.id);
        data.empty = false;
        if (data.prices.every((price) => isNaN(price))) {
          data.empty = true;
        }
        metricData = data;
      } else {
        const data = await client.volume(value.id);
        data.empty = false;
        if (data.volume.length === 0 && data.dates.length === 0) {
          data.empty = true;
        }
        metricData = data;
      }
    } else {
      metricData = await client.chainRate(value.id);
    }
    metricData.ticker = value.ticker;
  }

  let loading: boolean;
  let confirmModalOpened: boolean = false;
  let modalText: string = "";
  let modalDetails: string = "";
  let order;

  async function exchange() {
    loading = true;

    const loadedOptions = await options;
    if (!restrict(loadedOptions).find((entry) => entry.id === receiveSelected))
      receiveSelected = restrict(loadedOptions)[0].id;
    const value = loadedOptions.find(
      (entry) =>
        entry.id === (sendSelected === "AR" ? receiveSelected : sendSelected)
    );
    const type = sendSelected === "AR" ? "buy" : "sell";

    if (
      (type === "sell" && value.type !== "PST") ||
      (type === "buy" && value.type === "PST")
    ) {
      const orders = await getOrderBook();
      if (!orders || orders.length === 0) {
        notification.notify(
          "Error",
          "You can't place this order due to a lack of liquidity.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      } else {
        let filled = true;
        let send = sendAmount;
        for (const order of orders.filter(
          (order) => order.type === (type === "buy" ? "Sell" : "Buy")
        )) {
          if (order.amnt >= send / order.rate) {
            filled = false;
          } else {
            send -= order.amnt * order.rate;
          }
        }

        if (filled) {
          notification.notify(
            "Error",
            "You can't place this order due to a lack of liquidity.",
            NotificationType.error,
            5000
          );
          loading = false;
          return;
        }
      }
    }

    if (value.type === "PST") {
      order = await client.createOrder(
        type,
        sendAmount,
        value.id,
        post,
        type === "sell" && receiveAmount / sendAmount
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
      }
      if (order === "ar") {
        notification.notify(
          "Error",
          "You don't have enough AR.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      }

      if (order.pst > 0 && receiveSelected !== "ETH") {
        modalText = `Selling ${sendAmount} ${value.ticker} at a rate of ${
          receiveAmount / sendAmount
        } AR/${value.ticker}`;
        modalDetails = `You're sending ${order.pst} ${value.ticker} + ${order.ar} AR`;
      } else if (order.pst > 0 && receiveSelected === "ETH") {
        modalText = `Selling ${sendAmount} ${value.ticker} at a rate of ${
          sendAmount / receiveAmount
        } ${value.ticker}/AR`;
        modalDetails = `You're sending ${order.pst} ${value.ticker} + ${order.ar} AR`;
      } else {
        modalText = `Buying ${sendAmount} AR's worth of ${value.ticker}`;
        modalDetails = `You're sending ${order.ar} AR`;
      }
      await client.saveToken(value.id);
      saveSetting(
        "tokens",
        JSON.parse(localStorage.getItem("tokens")),
        $address
      );
      confirmModalOpened = true;
      loading = false;
      return;
    } else {
      const token =
        type === "sell" && receiveSelected !== "AR" ? receiveSelected : null;
      order = await client.createSwap(
        value.id,
        post,
        type === "buy" && sendAmount,
        type === "sell" && sendAmount,
        type === "buy" && receiveAmount / sendAmount,
        token
      );

      if (order === "arLink") {
        notification.notify(
          "Error",
          "Setup ArLink.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      }
      if (order === "chain") {
        notification.notify(
          "Error",
          `You don't have enough ${value.id}.`,
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      }
      if (order === "ar") {
        notification.notify(
          "Error",
          "You don't have enough AR.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      }

      if (order.chain > 0) {
        modalText = `Swapping ${sendAmount} ${
          value.ticker
        } for ${await receivePromise} ${
          token
            ? loadedOptions.find((option) => option.id === token).ticker
            : "AR"
        }`;
        modalDetails = `You're sending ${order.chain} ${value.ticker}`;
      } else {
        modalText = `Swapping ${sendAmount} AR at a rate of ${
          receiveAmount / sendAmount
        } AR/${value.ticker}`;
        modalDetails = `You're sending ${order.ar} AR`;
      }
      confirmModalOpened = true;
      loading = false;
      return;
    }
  }

  async function send() {
    await client.sendSwap(order.txs, post);
    notification.notify(
      "Sent",
      "We're processing your swap now! This may take a few minutes.",
      NotificationType.success,
      5000
    );
    goto("/app");
  }
</script>

<svelte:head>
  <title>Verto — Swap</title>
</svelte:head>

<NavBar {update} />
<div class="swap" in:fade={{ duration: 400 }}>
  <Balance />
  <div class="swap-content">
    {#if metricData === null}
      <div class="swap-graph">
        <div class="placemiddle">
          <Loading speed={850} />
        </div>
        <div class="select-container">
          <SkeletonLoading
            style="display: flex; width: 6.3em; height: 2.1em; margin-bottom: .4em" />
        </div>
      </div>
    {:else}
      <div class="swap-graph">
        <!-- ignore this, do not remove -->
        <!-- prettier-ignore -->
        <Line
          data={{ 
            labels: metricData.dates, 
            datasets: [{
              data: metricData.prices || metricData.volume || metricData.rates, 
              backgroundColor: 'transparent', 
              borderColor: function (context) {
                let gradient = context.chart.ctx.createLinearGradient(0, 0, context.chart.width, context.chart.height);
                gradient.addColorStop(0, '#E698E8');
                gradient.addColorStop(1, '#8D5FBC');
                return gradient;
              }, 
              pointBackgroundColor: function (context) {
                let gradient = context.chart.ctx.createLinearGradient(0, 0, context.chart.width, context.chart.height);
                gradient.addColorStop(0, '#E698E8');
                gradient.addColorStop(1, '#8D5FBC');
                return gradient;
              }
            }] 
          }}
          options={{ 
            elements: {
              point: { radius: 0 },
              line: {
                borderWidth: 5,
                borderCapStyle: 'round'
              }
            }, tooltips: {
              mode: 'index',
              intersect: false
            }, hover: {
              mode: 'nearest',
              intersect: true
            }, 
            maintainAspectRatio: false, 
            legend: { display: false }, 
            scales: { 
              xAxes: [{ 
                gridLines: { display: false }, 
                scaleLabel: { display: false }
              }], 
              yAxes: [{ 
                gridLines: { display: false }, 
                scaleLabel: { 
                  display: true,
                  labelString: metricSelected === "price" || !metricSelected ? `AR / ${metricData.ticker}` : metricData.ticker
                } 
              }] 
            } 
          }} />
        <div class="select-container">
          <select
            bind:value={metricSelected}
            on:change={() => {
              loadMetrics();
            }}>
            <option value="price">Price</option>
            <option value="volume">Volume</option>
          </select>
          <object
            data={downArrowIcon}
            type="image/svg+xml"
            title="select-icon" />
        </div>
      </div>
    {/if}
    <div class="swap-form" in:fade={{ duration: 250 }}>
      {#await options}
        <SkeletonLoading
          style="display: flex; width: 5em; height: 1.2em; margin-bottom: .4em" />
        <SkeletonLoading style="display: flex; width: 100%; height: 2.35em" />
        <div class="switch-icon" title="Switch">
          <SkeletonLoading
            style="width: 1.47em; height: 1.47em; margin-left: calc(100% - 1.47em); border-radius: 100%;" />
        </div>
        <SkeletonLoading
          style="display: flex; width: 5em; height: 1.2em; margin-bottom: .4em" />
        <SkeletonLoading style="display: flex; width: 100%; height: 2.35em" />
        <SkeletonLoading style="width: 100%; height: 2.5em; margin-top: 2em" />
      {:then loadedOptions}
        {#if !loadedOptions || loadedOptions.length === 0}
          <SkeletonLoading
            style="display: flex; width: 5em; height: 1.2em; margin-bottom: .4em" />
          <SkeletonLoading style="display: flex; width: 100%; height: 2.35em" />
          <div class="switch-icon" title="Switch">
            <SkeletonLoading
              style="width: 1.47em; height: 1.47em; margin-left: calc(100% - 1.47em); border-radius: 100%;" />
          </div>
          <SkeletonLoading
            style="display: flex; width: 5em; height: 1.2em; margin-bottom: .4em" />
          <SkeletonLoading style="display: flex; width: 100%; height: 2.35em" />
          <SkeletonLoading
            style="width: 100%; height: 2.5em; margin-top: 2em" />
        {:else}
          <div class="input" in:fade={{ duration: 260 }}>
            <p class="label">You send</p>
            <div class="input-wrapper wider">
              <input
                type="number"
                step={1}
                pattern="\d+"
                min={0.000001}
                bind:value={sendAmount}
                on:input={() => (receivePromise = receive())} />
              <div class="select-container">
                <select
                  bind:value={sendSelected}
                  on:change={() => {
                    loadMetrics();
                    orderBook = getOrderBook();
                  }}>
                  {#each loadedOptions as option}
                    <option value={option.id}>{option.ticker}</option>
                  {/each}
                </select>
                <object
                  data={downArrowIcon}
                  type="image/svg+xml"
                  title="select-icon" />
              </div>
            </div>
          </div>
          <div class="switch-icon" title="Switch">
            <img src={switchIcon} alt="switch-icon" />
          </div>
          <div class="input" in:fade={{ duration: 260 }}>
            <p class="label">You receive</p>
            <div class="input-wrapper wider">
              {#if disabled}
                {#await receivePromise}
                  <input value="..." disabled />
                {:then loadedReceive}
                  <input value={loadedReceive} disabled />
                {/await}
              {:else}
                <input
                  type="number"
                  step={1}
                  pattern="\d+"
                  min={0.000001}
                  bind:value={receiveAmount} />
              {/if}
              <div class="select-container">
                <select
                  bind:value={receiveSelected}
                  on:change={() => {
                    loadMetrics();
                    orderBook = getOrderBook();
                  }}>
                  {#each restrict(loadedOptions) as option}
                    <option value={option.id}>{option.ticker}</option>
                  {/each}
                </select>
                <object
                  data={downArrowIcon}
                  type="image/svg+xml"
                  title="select-icon" />
              </div>
            </div>
          </div>
          {#if sendSelected === 'ETH'}
            {#if hasMetaMask}
              {#if connected}
                {#if loading}
                  <SkeletonLoading
                    style="width: 100%; height: 2.5em; margin-top: 2em;" />
                {:else}
                  {#await receivePromise}
                    <SkeletonLoading
                      style="width: 100%; height: 2.5em; margin-top: 2em;" />
                  {:then loadedReceive}
                    <Button
                      click={exchange}
                      disabled={loadedReceive === '~0'}
                      style="
                        font-family: 'JetBrainsMono', monospace; 
                        text-transform: uppercase; 
                        display: block;
                        margin-top: 2em;
                      ">
                      Swap
                    </Button>
                  {/await}
                {/if}
              {:else}
                <Button
                  click={async () => {
                    const accounts = await window.ethereum.request({
                      method: 'eth_requestAccounts',
                    });
                    if (accounts.length > 0) connected = true;
                  }}
                  style="
                    font-family: 'JetBrainsMono', monospace; 
                    text-transform: uppercase; 
                    display: block;
                    margin-top: 2em;
                  ">
                  Connect
                </Button>
              {/if}
            {:else}
              <Button
                disabled
                title="You will need to install the MetaMask extension for this action"
                style="
                  font-family: 'JetBrainsMono', monospace; 
                  text-transform: uppercase; 
                  display: block;
                  margin-top: 2em;
                ">
                Install MetaMask
              </Button>
            {/if}
          {:else if loading}
            <SkeletonLoading
              style="width: 100%; height: 2.5em; margin-top: 2em;" />
          {:else}
            {#await receivePromise}
              <SkeletonLoading
                style="width: 100%; height: 2.5em; margin-top: 2em;" />
            {:then loadedReceive}
              <Button
                click={exchange}
                disabled={loadedReceive === '~0'}
                style="
              font-family: 'JetBrainsMono', monospace; 
              text-transform: uppercase; 
              display: block;
              margin-top: 2em;
            ">
                Swap
              </Button>
            {/await}
          {/if}
          {#if sendSelected === 'ETH'}
            <p>
              It is <b>highly</b> recommended that you swap with amounts > $50.
            </p>
            <p>
              If you don't, your order is less likely to be matched due to gas
              fees.
            </p>
          {/if}
        {/if}
      {/await}
    </div>
  </div>
  <div class="orders">
    <h1 class="title">Orders</h1>
    <div class="content" in:fade={{ duration: 260 }}>
      <table>
        <tr>
          <th>OP</th>
          <th>Quantity</th>
          <th>Rate</th>
          <th>Filled</th>
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
          {#if !loadedOrders}
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
          {:else if loadedOrders.length === 0}
            <p>No orders for now. Want to make the first one?</p>
          {:else}
            {#each loadedOrders as order}
              <tr>
                <td><span class="direction">{order.type}</span></td>
                <td>
                  {order.amnt}
                  {order.type === 'Buy' ? 'AR' : order.ticker}
                </td>
                <td>{order.rate || '---'} {order.units}</td>
                <td>
                  {order.received}
                  {order.type === 'Buy' ? order.ticker : 'AR'}
                </td>
              </tr>
            {/each}
          {/if}
        {/await}
      </table>
    </div>
  </div>
</div>
<Footer />
<Modal bind:opened={tokenModalOpened} confirmation={true} onConfirm={addToken}>
  <h3 style="text-align: center;">Add Token</h3>
  <input
    type="text"
    bind:value={newToken}
    class="light contract-id"
    placeholder="Token Contract ID" />
</Modal>
<Modal bind:opened={confirmModalOpened} confirmation={true} onConfirm={send}>
  <p style="text-align: center">{modalText}</p>
  <p style="text-align: center">{modalDetails}</p>
</Modal>

<style lang="sass">

  @import "../styles/tables.sass"
  @import "../styles/general.sass"
  @import "../styles/selects.sass"
  
  .swap
    +table
    +page

    .swap-content
      display: flex
      align-items: stretch
      margin-top: 2em

      @media screen and (max-width: 720px)
        display: block

      .swap-graph
        position: relative
        width: 60%
        margin-right: 2%

        @media screen and (max-width: 720px)
          width: 100%
          margin:
            right: 0
            bottom: 1.2em

        .placemiddle
          position: absolute
          top: 50%
          left: 50%
          transform: translate(-50%, -50%)

        .select-container
          position: absolute
          top: 0
          right: 0

      .swap-form
        width: 36%
        margin-left: 2%

        @media screen and (max-width: 720px)
          width: 100%
          margin-left: 0

        .switch-icon
          $iconPadding: .2em
          $iconWidth: 1.4em
          $borderWidth: 2px
          margin:
            top: .6em
            bottom: -1em
          transition: all .3s

          img
            margin-left: calc(100% - #{$iconWidth + $iconPadding * 2} - #{$borderWidth * 2})
            width: $iconWidth
            height: $iconWidth
            border-radius: 100%
            padding: $iconPadding
            border: $borderWidth solid transparent
            filter: var(--svg-color)
            transition: all .3s

        .input
          +input

          p.label
            margin-top: 0

    .orders
      margin-top: 5em

      @media screen and (max-width: 720px)
        margin-top: 2em

      h1.title
        margin-top: 0
        margin-bottom: 1.05em

      .menu
        +menu-style

        @media screen and (max-width: 720px)
          padding-top: 0

      .content
        p
          color: var(--primary-text-color)

</style>
