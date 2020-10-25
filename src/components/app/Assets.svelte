<script lang="ts">
  import Verto from "@verto/lib";
  import { onMount } from "svelte";
  import { keyfile, address } from "../../stores/keyfileStore";
  import Arweave from "arweave";
  import { notification } from "../../stores/notificationStore";
  import { NotificationType } from "../../utils/types";
  import Button from "../../components/Button.svelte";
  import Loading from "../Loading.svelte";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import Modal from "../../components/Modal.svelte";
  import { fade } from "svelte/transition";
  import addIcon from "../../assets/add.svg";

  let client = new Verto();
  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
  });

  let balances: Promise<
    { id: string; name: string; ticker: string; balance: number }[]
  > = client.getAssets($address);

  let loading: boolean = false;
  let transferPSTOpened: boolean = false;

  let pst: string;
  let amnt: number;
  let max: number;
  let target: string;

  let addTokenModalOpened: boolean = false;
  let newToken: string;

  const transfer = async () => {
    const re = /[a-z0-9_-]{43}/i;
    if (!re.test(target)) {
      notification.notify(
        "Invalid",
        "You've entered an invalid Arweave address.",
        NotificationType.error,
        5000
      );
      return;
    }

    const arweave = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
    });

    const tokens: {
      id: string;
      name: string;
      ticker: string;
    }[] = await client.getTokens();

    const tags = {
      "App-Name": "SmartWeaveAction",
      "App-Version": "0.3.0",
      Contract: tokens.find((token) => token.ticker === pst).id,
      Input: JSON.stringify({
        function: "transfer",
        target,
        qty: amnt,
      }),
    };

    const tx = await arweave.createTransaction(
      {
        target,
        data: Math.random().toString().slice(-4),
      },
      JSON.parse($keyfile)
    );

    for (const [key, value] of Object.entries(tags)) {
      tx.addTag(key, value);
    }

    await arweave.transactions.sign(tx, JSON.parse($keyfile));
    await arweave.transactions.post(tx);

    notification.notify(
      "Sent",
      "You've sent tokens! This may take a few minutes.",
      NotificationType.success,
      5000
    );
  };
  const cancel = () => {
    transferPSTOpened = false;
  };
  $: {
    if (amnt > max) amnt = max;
    if (amnt < 1) amnt = 1;
    if (amnt % 1 !== 0) amnt = Math.round(amnt);
  }

  async function addToken() {
    await client.saveToken(newToken);
    balances = client.getAssets($address);
    newToken = "";
  }
</script>

<div class="section">
  <div class="assets-table">
    <div class="menu">
      <h1 class="title">Assets</h1>
      <div class="assets-options" in:fade={{ duration: 100 }}>
        {#if !loading}
          <img
            src={addIcon}
            alt="add"
            on:click={() => (addTokenModalOpened = true)}
            class="add-token" />
          <Button
            style="min-width: 0; padding-left: .7em; padding-right: .7em;"
            click={async () => {
              loading = true;
              const loadedBalances = await balances;
              if (loadedBalances.length === 0) {
                notification.notify('Sorry', "You don't have any tokens to transfer.", NotificationType.error, 5000);
                loading = false;
                return;
              } else {
                pst = loadedBalances[0].ticker;
                max = loadedBalances[0].balance;
                loading = false;
                transferPSTOpened = true;
              }
            }}>
            Transfer
          </Button>
        {:else}
          <Loading />
        {/if}
      </div>
    </div>
    {#await balances}
      <table in:fade={{ duration: 100 }}>
        <tr style="width: 100%">
          <th>Name</th>
          <th>ID</th>
          <th>Amount</th>
        </tr>
        {#each Array(4) as _}
          <tr>
            <td style="width: 20%">
              <SkeletonLoading style="width: 100%;" />
            </td>
            <td style="width: 60%">
              <SkeletonLoading style="width: 100%;" />
            </td>
            <td style="width: 20%">
              <SkeletonLoading style="width: 100%;" />
            </td>
          </tr>
        {/each}
      </table>
    {:then loadedBalances}
      {#if loadedBalances.length === 0}
        <p in:fade={{ duration: 300 }}>
          You don't have any tokens! Do you want to <a
            class="want-to-add"
            on:click={() => (addTokenModalOpened = true)}>add a custom one</a>?
        </p>
      {:else}
        <table in:fade={{ duration: 300 }}>
          <tr style="width: 100%">
            <th>Name</th>
            <th>ID</th>
            <th>Amount</th>
          </tr>
          {#each loadedBalances as balance}
            <tr>
              <td style="width: 20%">{balance.name}</td>
              <td style="width: 60%">{balance.id}</td>
              <td style="width: 20%">
                {balance.balance}
                <span class="currency">{balance.ticker}</span>
              </td>
            </tr>
          {/each}
        </table>
      {/if}
    {/await}
  </div>
</div>
<Modal
  bind:opened={transferPSTOpened}
  confirmation={true}
  onConfirm={transfer}
  onCancel={cancel}>
  {#await balances then loadedBalances}
    <p style="margin-bottom: .3em;">PST Amount</p>
    <div
      style="display: flex; align-items: center; border-radius: 4px; overflow: hidden; border: 1px solid #fff; margin-bottom: 1em;">
      <input
        type="number"
        bind:value={amnt}
        step={1}
        min={1}
        {max}
        class="light"
        style="border: none; width: 67%;" />
      <select
        style="height: 100%; display: block; outline: none; border: none; background-color: #fff; color: #000; width: 33%; font-size: 1.4em; padding: 0.18em 0.6em;"
        bind:value={pst}
        on:change={() => {
          max = loadedBalances.find((balance) => balance.ticker === pst).balance;
        }}>
        {#each loadedBalances.map((balance) => balance.ticker) as ticker}
          <option value={ticker}>{ticker}</option>
        {/each}
      </select>
    </div>
    <p style="margin-bottom: .3em;">PST Target</p>
    <input type="string" bind:value={target} class="light" />
  {/await}
</Modal>
<Modal
  bind:opened={addTokenModalOpened}
  confirmation={true}
  onConfirm={addToken}>
  <h3 style="text-align: center;">Custom Token Contract ID</h3>
  <input
    type="text"
    bind:value={newToken}
    class="light contract-id"
    placeholder="Token Contract ID" />
</Modal>

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

    p
      color: var(--primary-text-color)

    .assets-table
      width: 100%
      transition: all .3s

      .menu
        position: relative
        display: flex
        justify-content: space-between

        @media screen and (max-width: 720px)
          align-items: middle
          margin-bottom: 1em

        h1.title
          @media screen and (max-width: 720px)
            margin: 0

        .assets-options
          padding-top: 1.8em
          display: flex
          align-items: center

          .add-token
            cursor: pointer
            filter: var(--svg-color)
            height: 1.3em
            margin-right: 1em

          @media screen and (max-width: 720px)
            padding-top: 0

      a.want-to-add
        cursor: pointer

      a.view-all
        display: block
        text-align: center
        color: var(--darker-secondary-text-color)
        font-weight: 500
        padding: .8em 0
        transition: all .3s

        &:hover
          opacity: .7

      a.transaction
        text-decoration: none
        color: black

</style>
