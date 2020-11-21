<script lang="typescript">
  import { loggedIn, keyfile } from "../stores/keyfileStore";
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

  // with trade, the user can define how much they want to receive
  // with swap, the received amount is predefined
  let swapMode: SwapMode = "Trade";
  let sendSelected: string, receiveSelected: string;

  // @ts-ignore
  if (process.browser && !$loggedIn) goto("/");

  let client = new Verto();

  onMount(async () => {
    const ip = await (await fetch("https://api.ipify.org?format=json")).json();
    const res = await (await fetch(`https://ipapi.co/${ip.ip}/json`)).json();
    if (res.country === "US") {
      goto("/usa");
    }
    client = new Verto(JSON.parse($keyfile));
  });

  export const update = () => {
    client = new Verto(JSON.parse($keyfile));
  };

  function switchSwap() {
    let prev = { sendSelected, receiveSelected };
    sendSelected = prev.receiveSelected;
    receiveSelected = prev.sendSelected;
  }
</script>

<svelte:head>
  <title>Verto — Swap</title>
</svelte:head>

<NavBar />
<div class="swap">
  <Balance />
  <div class="swap-content">
    <div class="swap-graph">
      <!-- ignore this, do not remove -->
      <!-- prettier-ignore -->
      <Line
        data={{ 
          // TODO
          labels: ['sep 09', 'sep 10', 'sep 11', 'sep12', 'sep13', 'sep14', 'sep15', 'sep16'], 
          datasets: [{
            // TODO
            data: [0, 2, 3, 5, 6, 5, 4, 3], 
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
                // TODO
                labelString: `${'ETH'} / AR`
              } 
            }] 
          } 
        }} />
      <div class="select-container">
        <select>
          <option value="price">Price</option>
          <option value="volume">Volume</option>
        </select>
        <object data={downArrowIcon} type="image/svg+xml" title="select-icon" />
      </div>
    </div>
    <div class="swap-form" in:fade={{ duration: 250 }}>
      <div class="input" in:fade={{ duration: 260 }}>
        <p class="label">You send</p>
        <div class="input-wrapper wider">
          <input type="number" step={1} pattern="\d+" min={0.000001} />
          <div class="select-container">
            <select bind:value={sendSelected}>
              <option value="ETH">ETH</option>
              <option value="VRT">VRT</option>
            </select>
            <object
              data={downArrowIcon}
              type="image/svg+xml"
              title="select-icon" />
          </div>
        </div>
      </div>
      <div class="switch-icon" on:click={switchSwap} title="Switch">
        <img src={switchIcon} alt="switch-icon" />
      </div>
      <div class="input" in:fade={{ duration: 260 }}>
        <p class="label">You receive</p>
        <div class="input-wrapper wider">
          <input
            type="number"
            step={1}
            pattern="\d+"
            min={0.000001}
            disabled={swapMode === 'Swap'} />
          <div class="select-container">
            <select bind:value={receiveSelected}>
              <option value="VRT">VRT</option>
              <option value="ETH">ETH</option>
            </select>
            <object
              data={downArrowIcon}
              type="image/svg+xml"
              title="select-icon" />
          </div>
        </div>
      </div>
      <Button
        style="
          font-family: 'JetBrainsMono', monospace; 
          text-transform: uppercase; 
          display: block;
          margin-top: 2em;
        ">
        Swap
      </Button>
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
        <tr>
          <td><span class="direction">SELL</span></td>
          <td>1450 VRT</td>
          <td>0.1 AR/VRT</td>
          <td>2 AR</td>
        </tr>
      </table>
    </div>
  </div>
</div>
<Footer />

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
          cursor: pointer
          margin:
            top: .6em
            bottom: -1em
          transition: all .3s

          img
            $iconPadding: .2em
            $iconWidth: 1.4em
            $borderWidth: 2px
            margin-left: calc(100% - #{$iconWidth + $iconPadding * 2} - #{$borderWidth * 2})
            width: $iconWidth
            height: $iconWidth
            border-radius: 100%
            padding: $iconPadding
            border: $borderWidth solid transparent
            filter: var(--svg-color)
            transition: all .3s
          
          &:hover
            opacity: .63

            img
              border-color: 2px solid var(--inverted-elements-color)

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
