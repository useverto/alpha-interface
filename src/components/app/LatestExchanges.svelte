<script lang="ts">
  import Verto from "@verto/lib";
  import { address, keyfile } from "../../stores/keyfileStore";
  import Arweave from "arweave";
  import { query } from "../../api-client";
  import { notification } from "../../stores/notificationStore";
  import { NotificationType } from "../../utils/types";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import Button from "../Button.svelte";
  import Loading from "../Loading.svelte";
  import Modal from "../../components/Modal.svelte";
  import { fade } from "svelte/transition";

  const client = new Verto();
  let exchanges: Promise<
    {
      id: string;
      timestamp: string;
      type: string;
      sent: string;
      received: string;
      status: string;
      duration: string;
    }[]
  > = client.getExchanges($address);

  let tx;
  let loading: boolean = false;
  let openModal: boolean = false;
  const createCancel = async (order: string) => {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
    });

    const tags = {
      Exchange: "Verto",
      Type: "Cancel",
      Order: order,
    };

    const target = (
      await query({
        query: `
          query($txID: ID!) {
            transaction(id: $txID) {
              recipient
            }
          }
        `,
        variables: {
          txID: order,
        },
      })
    ).data.transaction.recipient;

    tx = await client.createTransaction(
      {
        target,
        data: Math.random().toString().slice(-4),
      },
      JSON.parse($keyfile)
    );

    for (const [key, value] of Object.entries(tags)) {
      tx.addTag(key, value.toString());
    }
  };
  const sendCancel = async () => {
    const client = new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
    });

    await client.transactions.sign(tx, JSON.parse($keyfile));
    await client.transactions.post(tx);

    openModal = false;
    notification.notify(
      "Cancelled",
      "You've successfully cancelled your order. ",
      NotificationType.success,
      5000
    );
  };
</script>

<div class="section">
  <h1 class="title">Trades</h1>
  {#await exchanges}
    <table in:fade="{{ duration: 100 }}">
      <tr>
        <th>Timestamp</th>
        <th>Trade</th>
        <th>Duration</th>
        <th></th>
      </tr>
      {#each Array(5) as _}
        <tr>
          <td style="width: 30%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
          <td style="width: 42%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
          <td style="width: 22%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
          <td style="width: 6%">
            <SkeletonLoading style="{'width: 100%'}" />
          </td>
        </tr>
      {/each}
    </table>
  {:then loadedExchanges}
    {#if loadedExchanges.length === 0}
      <p in:fade="{{ duration: 300 }}">No trades found.</p>
    {:else}
      <table in:fade="{{ duration: 300 }}">
        <tr>
          <th>Timestamp</th>
          <th>Trade</th>
          <th>Duration</th>
          <th></th>
        </tr>
        {#each loadedExchanges as exchange}
          <tr>
            <td style="width: 30%">{exchange.timestamp}</td>
            <td style="width: 42%">
              {exchange.sent}
              {'->'}
              {exchange.received}
              <span class="status {exchange.status}"></span>
            </td>
            <td style="width: 22%; text-transform: uppercase">
              {exchange.duration}
            </td>
            <td style="width: 6%">
              {#if !loading}
                <Button
                  click="{async () => {
                    loading = true;
                    await createCancel(exchange.id);
                    openModal = true;
                    loading = false;
                  }}"
                  disabled="{exchange.status !== 'pending' || exchange.timestamp === 'not mined yet'}"
                  style="
                    font-size: .8em;
                    padding: .1em .4em;
                    width: auto;
                    min-width: unset;
                    border-radius: 4px;
                  ">
                  Cancel
                </Button>
              {:else}
                <Loading />
              {/if}
            </td>
          </tr>
        {/each}
      </table>
    {/if}
  {/await}
  <a href="/app/all-exchanges" class="view-all">View all {'->'}</a>
</div>
<Modal
  bind:opened="{openModal}"
  confirmation="{true}"
  onConfirm="{sendCancel}"
  onCancel="{() => (openModal = false)}">
  <p>Are you sure you want to cancel this order?</p>
</Modal>

<style lang="sass">
  
  @import "../../styles/tables.sass"
  @import "../../styles/general.sass"

  .section
    @include table
    padding-bottom: 2.5em

    @media screen and (max-width: 720px)
      width: 100vw - $mobileSidePadding * 2
      overflow-x: auto

    a.view-all
      display: block
      text-align: center
      color: rgba(#000, .5)
      font-weight: 500
      padding: .8em 0
      transition: all .3s

      &:hover
        opacity: .7

    &:first-child
      padding-top: 3.5em

    a.transaction
      text-decoration: none
      color: black

</style>
