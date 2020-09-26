<script lang="typescript">
  import { goto } from "@sapper/app";
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import {
    balance,
    address,
    keyfile,
    loggedIn,
  } from "../stores/keyfileStore.ts";
  import Button from "../components/Button.svelte";
  import Modal from "../components/Modal.svelte";
  import { fade } from "svelte/transition";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";
  import Loading from "../components/Loading.svelte";
  import { NotificationType } from "../utils/types";
  import type { Token, TokenInstance, LatestExchange } from "../utils/types";
  import { query } from "../api-client";
  import galleryQuery from "../queries/gallery.gql";
  import tokensQuery from "../queries/tokens.gql";
  import postTokensQuery from "../queries/postTokens.gql";
  import exchangesQuery from "../queries/exchanges.gql";
  import Arweave from "arweave";
  import { interactRead } from "smartweave";
  import Community from "community-js";
  import Transaction from "arweave/node/lib/transaction";
  import { notification } from "../stores/notificationStore.ts";
  import { exchangeWallet, pstContract, exchangeFee } from "../utils/constants";

  import { onMount } from "svelte";

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

  if (process.browser && !$loggedIn) goto("/");

  if (process.browser) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("post")) selectedPost = params.get("post");
  }

  let posts = getTradingPosts();
  let psts = getExchangeSupportedTokens();
  let supportedPSTs = getTradingPostSupportedTokens();
  let balances = getTokenBalances();

  let exchangeTX;
  let loading: boolean = false;

  async function getTradingPosts(): Promise<string[]> {
    if (!process.browser) return [];

    let posts: string[] = [];

    const _posts = (
      await query({
        query: galleryQuery,
        variables: {
          recipients: [exchangeWallet],
        },
      })
    ).data.transactions.edges;

    _posts.map(({ node }) => {
      posts.push(node.owner.address);
    });

    posts = [...new Set(posts)]; // remove duplicates
    if (selectedPost === undefined || selectedPost === "Loading...")
      selectedPost = posts[0]; // set initial post if it is not selected in the URL already

    return posts;
  }

  async function getExchangeSupportedTokens(): Promise<Token[]> {
    if (!process.browser) return [];

    let psts: Token[] = [];

    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    let txIds = [];
    const _txIds = (
      await query({
        query: tokensQuery,
        variables: {
          owners: [exchangeWallet],
          contractSrc: pstContract,
        },
      })
    ).data.transactions.edges;
    _txIds.map(({ node }) => {
      txIds.push(node.id);
    });

    for (const id of txIds) {
      try {
        const contractId = (
          await client.transactions.getData(id, { decode: true, string: true })
        ).toString();
        const contractData = JSON.parse(
          (
            await client.transactions.getData(contractId, {
              decode: true,
              string: true,
            })
          ).toString()
        );
        psts.push({
          id: contractId,
          name: contractData["name"],
          ticker: contractData["ticker"],
        });
      } catch (error) {
        notification.notify("Error", error, NotificationType.error, 5000);
      }
    }

    return psts;
  }

  async function getTradingPostSupportedTokens(): Promise<Token[]> {
    if (!process.browser) return [];

    let tokenList: Token[] = [];
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    await posts;

    const supported = (
      await query({
        query: postTokensQuery,
        variables: {
          owners: [selectedPost],
          recipients: [exchangeWallet],
        },
      })
    ).data.transactions.edges;

    // @ts-ignore
    const txData = JSON.parse(
      await client.transactions.getData(supported[0].node.id, {
        decode: true,
        string: true,
      })
    );
    for (let x = 0; x < txData.acceptedTokens.length; x++) {
      // @ts-ignore
      let pstInfo = JSON.parse(
        await client.transactions.getData(txData.acceptedTokens[x], {
          decode: true,
          string: true,
        })
      );
      tokenList.push({
        id: txData.acceptedTokens[x],
        name: pstInfo.name,
        ticker: pstInfo.ticker,
      });
    }

    return tokenList;
  }

  async function getTokenBalances() {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });
    const supportedPSTs = await psts;
    let tokenBalances = [];

    for (let i = 0; i < supportedPSTs.length; i++) {
      let pstContract = await interactRead(
        client,
        JSON.parse($keyfile),
        supportedPSTs[i].id,
        {
          function: "unlockedBalance",
        }
      );
      if (pstContract.balance > 0) {
        tokenBalances.push({
          token: supportedPSTs[i].name,
          ticker: supportedPSTs[i].ticker,
          balance: pstContract.balance,
        });
      }
    }

    return tokenBalances;
  }

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  // open confirmation modal
  async function exchange() {
    loading = true;
    let a = await latestOpenExchanges;
    let b = await latestClosedExchanges;
    let c = await orderBook;
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
      let arCost =
        (await getFee(await initiateSell())) +
        (await getFee(await initiateTradingPostFee())) +
        (await getFee(await initiateVRTHolderFee()));
      let pstCost =
        Math.ceil(sellAmount) + (await getTradingPostFee()) + getVRTHolderFee();
      const token = (await supportedPSTs).find(
        (pst) => pst.ticker === sellToken
      );
      const amount = (await balances).find(
        (amount) =>
          amount.token === token.name && amount.ticker === token.ticker
      );
      if (!amount) {
        notification.notify(
          "Error",
          "You don't have that token.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      } else if (pstCost > amount.balance) {
        notification.notify(
          "Error",
          "You don't have that many tokens.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      } else if (arCost > $balance) {
        notification.notify(
          "Error",
          "You don't have enough AR.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      }
      confirmModalText = `You're sending ${pstCost} ${sellToken} + ${arCost} AR`;
      confirmModalOpened = true;
      loading = false;
      return;
    } else if (mode === "buy") {
      let sum = 0;
      for (const order of c) {
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

      let txFees =
        (await getFee(await initiateBuy())) +
        (await getFee(await initiateExchangeFee()));
      let arCost = txFees + buyAmount + getExchangeFee();
      if (arCost > $balance) {
        notification.notify(
          "Error",
          "You don't have enough AR.",
          NotificationType.error,
          5000
        );
        loading = false;
        return;
      } else if (c.find((o) => o.type === "Sell") === undefined) {
        notification.notify(
          "Error",
          "There aren't any sell orders open. You cannot buy tokens if no sell orders are open.",
          NotificationType.error,
          10000
        );
        loading = false;
        return;
      }
      confirmModalText = `You're sending ${arCost} AR`;
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
    if (!process.browser) return [];

    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    await posts;

    const txId = (
      await query({
        query: galleryQuery,
        variables: {
          owners: [selectedPost],
          recipients: [exchangeWallet],
        },
      })
    ).data.transactions.edges[0]?.node.id;

    const config = JSON.parse(
      (
        await client.transactions.getData(txId, { decode: true, string: true })
      ).toString()
    );

    try {
      let url = config["publicURL"].startsWith("https://")
        ? config["publicURL"]
        : "https://" + config["publicURL"];
      let endpoint = url.endsWith("/") ? "orders" : "/orders";

      let res = await (await fetch(url + endpoint)).clone().json();
      let loadedPSTs = await supportedPSTs;
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
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    await posts;

    const txId = (
      await query({
        query: galleryQuery,
        variables: {
          owners: [selectedPost],
          recipients: [exchangeWallet],
        },
      })
    ).data.transactions.edges[0]?.node.id;

    const config = JSON.parse(
      (
        await client.transactions.getData(txId, { decode: true, string: true })
      ).toString()
    );

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

    let tx = mode === "buy" ? await initiateBuy() : await initiateSell();

    if (mode === "buy") {
      let tipExchange = await initiateExchangeFee();

      try {
        await client.transactions.sign(tipExchange, JSON.parse($keyfile));
        await client.transactions.post(tipExchange);
      } catch (err) {
        notification.notify("Error", err, NotificationType.error, 5000);
        return;
      }
    } else {
      let tipTradingPost = await initiateTradingPostFee();
      let tipVRTHolder = await initiateVRTHolderFee();

      try {
        await client.transactions.sign(tipVRTHolder, JSON.parse($keyfile));
        await client.transactions.post(tipVRTHolder);
      } catch (err) {
        notification.notify("Error", err, NotificationType.error, 5000);
        return;
      }

      try {
        await client.transactions.sign(tipTradingPost, JSON.parse($keyfile));
        await client.transactions.post(tipTradingPost);
      } catch (err) {
        notification.notify("Error", err, NotificationType.error, 5000);
        return;
      }
    }

    try {
      await client.transactions.sign(tx, JSON.parse($keyfile));
      await client.transactions.post(tx);
    } catch (err) {
      notification.notify("Error", err, NotificationType.error, 5000);
      return;
    }

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

  async function getFee(tx: Transaction): Promise<number> {
    await selectedPost;
    await posts;

    let fee, txSize, recipient;
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    txSize = parseFloat(tx.data_size);
    recipient = tx.target;
    fee = await client.transactions.getPrice(txSize, recipient);

    return parseFloat(client.ar.winstonToAr(fee));
  }

  let latestExchanges = getLatestExchanges();

  async function getLatestExchanges(): Promise<LatestExchange[]> {
    if (!process.browser) return [];
    let loadedPsts = await psts;
    let exchanges: LatestExchange[] = [];

    const txs = (
      await query({
        query: exchangesQuery,
        variables: {
          recipients: [selectedPost],
        },
      })
    ).data.transactions.edges;
    txs.map(({ node }) => {
      const tradeType = node.tags.find((tag) => tag.name === "Type")?.value;
      if (tradeType) {
        const tokenTag = tradeType === "Buy" ? "Token" : "Contract";
        const token = node.tags.find((tag: any) => tag.name === tokenTag)
          ?.value!;
        const ticker = loadedPsts.find((pst) => pst.id === token)?.ticker;

        const sent =
          tradeType === "Buy"
            ? node.quantity.ar + " AR"
            : JSON.parse(
                node.tags.find((tag: any) => tag.name === "Input")?.value!
              )["qty"] +
              " " +
              ticker;
        const received = "??? " + (tradeType === "Buy" ? ticker : "AR");

        const rate = node.tags.find((tag: any) => tag.name === "Rate")?.value!;

        exchanges.push({
          id: node.id,
          type: tradeType,
          sent,
          received,
          rate,
          ticker,
          matched: false,
        });
      }
    });

    for (let i = 0; i < exchanges.length; i++) {
      const inverseTradeType = exchanges[i].type === "Buy" ? "Sell" : "Buy";

      const match = (
        await query({
          query: `
          query {
            transactions(
              tags: [
                { name: "Exchange", values: "Verto" }
                { name: "Type", values: "Confirmation" }
                { name: "Match", values: "${exchanges[i].id}" }
              ]
            ) {
              edges {
                node {
                  block {
                    timestamp
                  }
                  tags {
                    name
                    value
                  }
                }
              }
            }
          }
        `,
        })
      ).data.transactions.edges;

      if (match[0]) {
        exchanges[i].matched = true;

        const receivedTag = match[0].node.tags.find(
          (tag: any) => tag.name === "Received"
        );
        if (receivedTag) {
          exchanges[i].received = receivedTag.value;
        }
      }
    }
    return exchanges;
  }

  let openTrades = latestOpenExchanges();

  async function latestOpenExchanges(): Promise<LatestExchange[]> {
    let txs = await latestExchanges;

    let openExchanges = [];
    for (let i = 0; i < txs.length; i++) {
      if (txs[i].matched === false) {
        openExchanges.push(txs[i]);
      }
    }
    return openExchanges;
  }

  let closedTrades = latestClosedExchanges();

  async function latestClosedExchanges(): Promise<LatestExchange[]> {
    let txs = await latestExchanges;

    let closedExchanges = [];
    for (let i = 0; i < txs.length; i++) {
      if (txs[i].matched === true) closedExchanges.push(txs[i]);
    }

    return closedExchanges;
  }

  async function initiateBuy(): Promise<Transaction> {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    const ticker = buyToken;
    const supportedPSTs = await psts;
    const pstTxId = supportedPSTs.find((pst) => pst.ticker === ticker).id;

    const tags = {
      Exchange: "Verto",
      Type: "Buy",
      Token: pstTxId,
    };

    const tx = await client.createTransaction(
      {
        target: selectedPost,
        quantity: client.ar.arToWinston(buyAmount.toString()),
      },
      JSON.parse($keyfile)
    );

    for (const [key, value] of Object.entries(tags)) {
      tx.addTag(key, value);
    }
    return tx;
  }

  async function initiateSell(): Promise<Transaction> {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    const ticker = sellToken;
    const supportedPSTs = await psts;
    const pstTxId = supportedPSTs.find((pst) => pst.ticker === ticker).id;

    const tags = {
      Exchange: "Verto",
      Type: "Sell",
      "App-Name": "SmartWeaveAction",
      "App-Version": "0.3.0",
      Contract: pstTxId,
      Rate: 1 / sellRate,
      Input: `{"function":"transfer","target":"${selectedPost}","qty":${Math.ceil(
        sellAmount
      )}}`,
    };

    const tx = await client.createTransaction(
      {
        target: selectedPost,
        data: Math.random().toString().slice(-4),
      },
      JSON.parse($keyfile)
    );

    for (const [key, value] of Object.entries(tags)) {
      // @ts-ignore
      tx.addTag(key, value);
    }
    return tx;
  }

  async function initiateExchangeFee(): Promise<Transaction> {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    const tags = {
      Exchange: "Verto",
      Type: "Fee-Exchange",
    };

    const fee = getExchangeFee();

    const tx = await client.createTransaction(
      {
        target: exchangeWallet,
        quantity: client.ar.arToWinston(fee.toString()),
      },
      JSON.parse($keyfile)
    );

    for (const [key, value] of Object.entries(tags)) {
      tx.addTag(key, value);
    }
    return tx;
  }

  async function initiateTradingPostFee(): Promise<Transaction> {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    const ticker = sellToken;
    const supportedPSTs = await psts;
    const pstTxId = supportedPSTs.find((pst) => pst.ticker === ticker).id;

    const tradingPostFee = await getTradingPostFee();

    const tags = {
      Exchange: "Verto",
      Type: "Fee-Trading-Post",
      "App-Name": "SmartWeaveAction",
      "App-Version": "0.3.0",
      Contract: pstTxId,
      Input: `{"function":"transfer","target":"${selectedPost}","qty":${tradingPostFee}}`,
    };

    const tx = await client.createTransaction(
      {
        target: selectedPost,
        data: Math.random().toString().slice(-4),
      },
      JSON.parse($keyfile)
    );

    for (const [key, value] of Object.entries(tags)) {
      // @ts-ignore
      tx.addTag(key, value);
    }
    return tx;
  }

  async function initiateVRTHolderFee(): Promise<Transaction> {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });
    let community = new Community(client);
    await community.setCommunityTx(pstContract);

    const ticker = sellToken;
    const supportedPSTs = await psts;
    const pstTxId = supportedPSTs.find((pst) => pst.ticker === ticker).id;

    const tipReceiver = await community.selectWeightedHolder();
    const fee = getVRTHolderFee();

    const tags = {
      Exchange: "Verto",
      Type: "Fee-VRT-Holder",
      "App-Name": "SmartWeaveAction",
      "App-Version": "0.3.0",
      Contract: pstTxId,
      Input: `{"function":"transfer","target":"${tipReceiver}","qty":${fee}}`,
    };

    const tx = await client.createTransaction(
      {
        target: tipReceiver,
        data: Math.random().toString().slice(-4),
      },
      JSON.parse($keyfile)
    );

    for (const [key, value] of Object.entries(tags)) {
      // @ts-ignore
      tx.addTag(key, value);
    }
    return tx;
  }

  function getExchangeFee(): number {
    return buyAmount * exchangeFee;
  }

  async function getTradingPostFee(): Promise<number> {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    const txId = (
      await query({
        query: galleryQuery,
        variables: {
          owners: [selectedPost],
          recipients: [exchangeWallet],
        },
      })
    ).data.transactions.edges[0]?.node.id;

    const config = JSON.parse(
      (
        await client.transactions.getData(txId, { decode: true, string: true })
      ).toString()
    );

    return Math.ceil(Math.ceil(sellAmount) * config["tradeFee"]);
  }

  let tradingPostFeePercent = getTradingPostFeePercent();

  async function getTradingPostFeePercent(): Promise<number> {
    if (!process.browser) return;
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });

    await posts;

    const txId = (
      await query({
        query: galleryQuery,
        variables: {
          owners: [selectedPost],
          recipients: [exchangeWallet],
        },
      })
    ).data.transactions.edges[0]?.node.id;
    const config = JSON.parse(
      (
        await client.transactions.getData(txId, { decode: true, string: true })
      ).toString()
    );
    return parseFloat(config["tradeFee"]) * 100;
  }

  function getVRTHolderFee(): number {
    return Math.ceil(Math.ceil(sellAmount) * exchangeFee);
  }
</script>

<svelte:head>
  <title>Verto — Trade</title>
</svelte:head>

<NavBar />
<div class="trade" in:fade="{{ duration: 300 }}">
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
      <p in:fade="{{ duration: 150 }}">Your balance</p>
      <h1 class="total-balance" in:fade="{{ duration: 150 }}">
        {roundCurrency($balance)}<span style="text-transform: uppercase; font-size: .5em; display: inline-block">Ar</span>
      </h1>
      <p class="wallet" in:fade="{{ duration: 150 }}">Wallet: {$address}</p>
    {/if}
  </div>
  <div class="assets">
    <h1 class="title">Assets</h1>
    <table>
      {#await balances}
        {#each Array(5) as _}
          <tr>
            <td style="width: 40%">
              <SkeletonLoading style="width: 100%" />
            </td>
            <td style="width: 60%">
              <SkeletonLoading style="width: 100%" />
            </td>
          </tr>
        {/each}
      {:then loadedBalances}
        <tr>
          <th style="width: 40%">Token</th>
          <th style="width: 60%">Amount</th>
        </tr>
        {#if loadedBalances.length === 0}
          <p>You don't have any tokens!</p>
        {/if}
        {#each loadedBalances as balance}
          <tr>
            <td style="width: 40%">{balance.token}</td>
            <td style="width: 60%">
              {roundCurrency(balance.balance)}
              <span class="currency">{balance.ticker}</span>
            </td>
          </tr>
        {/each}
      {/await}
    </table>
  </div>
  <div class="menu">
    <button
      class:active="{mode === 'buy'}"
      on:click="{() => {
        mode = 'buy';
        orderBook = getOrderBook();
      }}">Buy</button>
    <button
      class:active="{mode === 'sell'}"
      on:click="{() => {
        mode = 'sell';
        orderBook = getOrderBook();
      }}">Sell</button>
  </div>
  <div class="trade-container">
    {#if mode === 'sell'}
      <div>
        <div class="trade-section" in:fade="{{ duration: 300 }}">
          <div class="long-content">
            <div style="width: 100%">
              <p>Trading post</p>
              <select
                bind:value="{selectedPost}"
                style="width: 100%"
                on:change="{() => {
                  supportedPSTs = getTradingPostSupportedTokens();
                  latestExchanges = getLatestExchanges();
                  openTrades = latestOpenExchanges();
                  closedTrades = latestClosedExchanges();
                  tradingPostFeePercent = getTradingPostFeePercent();
                }}">
                {#await posts}
                  <option disabled>Loading...</option>
                {:then loadedPosts}
                  {#if loadedPosts.length === 0}
                    <option disabled>No posts found</option>
                  {/if}
                  {#each loadedPosts as post}
                    <option value="{post}" selected="{post === selectedPost}">
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
        <div class="trade-section" in:fade="{{ duration: 300 }}">
          <div class="long-content">
            <div style="width: 47%; margin-right: 3%">
              <p>Amount</p>
              <div class="input">
                <input
                  type="number"
                  step="1"
                  pattern="\d+"
                  bind:value="{sellAmount}"
                  min="{1}" />
                {#await supportedPSTs}
                  <SkeletonLoading style="width: 35px; height: 38px" />
                {:then loadedPSTs}
                  <select
                    bind:value="{sellToken}"
                    on:change="{() => {
                      orderBook = getOrderBook();
                    }}">
                    {#each loadedPSTs as pst}
                      <option value="{pst.ticker}">{pst.ticker}</option>
                    {/each}
                  </select>
                {/await}
              </div>
            </div>
            <div style="width: 47%; margin-left: 3%">
              <p>Rate</p>
              <div class="input">
                <input
                  type="number"
                  bind:value="{sellRate}"
                  min="{0.0000001}" />
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
            <p></p>
            <div class="input" style="border: none">
              {#if !loading}
                <Button
                  click="{exchange}"
                  style="{`
                    font-family: 'JetBrainsMono', monospace; 
                    text-transform: uppercase; 
                    width: 100%;
                    display: block;
                    padding-left: 0;
                    padding-right: 0;
                    height: 100%;
                  `}">
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
      <div>
        <div class="trade-section" in:fade="{{ duration: 300 }}">
          <div class="long-content">
            <div style="width: 100%">
              <p>Trading post</p>
              <select
                bind:value="{selectedPost}"
                style="width: 100%"
                on:change="{() => {
                  supportedPSTs = getTradingPostSupportedTokens();
                  latestExchanges = getLatestExchanges();
                  openTrades = latestOpenExchanges();
                  closedTrades = latestClosedExchanges();
                  tradingPostFeePercent = getTradingPostFeePercent();
                }}">
                {#await posts}
                  <option disabled>Loading...</option>
                {:then loadedPosts}
                  {#if loadedPosts.length === 0}
                    <option disabled>No posts found</option>
                  {/if}
                  {#each loadedPosts as post}
                    <option value="{post}" selected="{post === selectedPost}">
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
        <div class="trade-section" in:fade="{{ duration: 300 }}">
          <div class="long-content">
            <div style="width: 47%; margin-right: 3%">
              <p>Send</p>
              <div class="input">
                <input
                  type="number"
                  pattern="\d+"
                  bind:value="{buyAmount}"
                  min="{0.000001}" />
                <select class="fake-select" disabled>
                  <option>AR</option>
                </select>
              </div>
            </div>
            <div style="width: 47%; margin-left: 3%">
              <p>Receive</p>
              <div class="input">
                {#await supportedPSTs}
                  <SkeletonLoading
                    style="width: 100% !important; height: 100% !important" />
                {:then loadedPSTs}
                  <select
                    bind:value="{buyToken}"
                    style="width: 100% !important;"
                    on:change="{() => {
                      orderBook = getOrderBook();
                    }}">
                    {#each loadedPSTs as pst}
                      <option value="{pst.ticker}">{pst.ticker}</option>
                    {/each}
                  </select>
                {/await}
              </div>
            </div>
          </div>
          <div class="short-content">
            <p><br /></p>
            <p></p>
            <div class="input" style="border: none">
              {#if !loading}
                <Button
                  click="{exchange}"
                  style="{`
                    font-family: 'JetBrainsMono', monospace; 
                    text-transform: uppercase; 
                    width: 100%;
                    display: block;
                    padding-left: 0;
                    padding-right: 0;
                    height: 100%;
                  `}">
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
        class:active="{activeMenu === 'open'}"
        on:click="{() => (activeMenu = 'open')}">Open Orders</button>
      <!-- <button
        class:active={activeMenu === 'closed'}
        on:click={() => (activeMenu = 'closed')}>Closed Orders</button> -->
    </div>
  </div>
  <div class="content">
    {#if activeMenu === 'open'}
      <table in:fade="{{ duration: 400 }}">
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
  bind:opened="{confirmModalOpened}"
  confirmation="{true}"
  onConfirm="{confirmTrade}"
  onCancel="{cancelTrade}">
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
        color: rgba(#000, .3)
        text-transform: uppercase
        font-size: .9em
        margin: 0
        font-weight: 600

        &.wallet
          text-transform: none

      h1.total-balance
        font-size: 2.3em
        color: #000
        font-weight: 400
        margin: .14em 0

      @media screen and (max-width: 720px)
        padding-top: .65em !important

    .assets
      margin: 2.45em 0

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
            color: rgba(#000, .3)
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

          .input
            border: 2px solid #000
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
      color: #fff
      background-color: #000
      font-size: 1em
      padding: .34em ($sidePadding * 3 + .3em) .34em $sidePadding
      cursor: pointer
      border-radius: .3em
      outline: none
      border: none
      -webkit-appearance: none
      -moz-appearance: none
      transition: all .3s
    
    select
      $sidePadding: .65em
      background-image: url(/down-arrow.svg)
      background-position: calc(100% - #{$sidePadding}) center
      background-repeat: no-repeat
      background-size: $sidePadding * 1.35

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
      color: #000
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
        background-color: #000
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