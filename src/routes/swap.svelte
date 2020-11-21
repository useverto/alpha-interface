<script lang="typescript">
  import { loggedIn, keyfile } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { notification } from "../stores/notificationStore";
  import { NotificationType, SwapMode } from "../utils/types";
  import type { OrderBookItem } from "../utils/types";
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

  // @ts-ignore
  if (process.browser && !$loggedIn) goto("/");

  function switchSwap() {}
</script>

<svelte:head>
  <title>Verto — Swap</title>
</svelte:head>

<NavBar />
<div class="swap">
  <Balance />
  <div class="swap-content">
    <div class="swap-graph">
      <Line
        data={{ labels: ['sep 09', 'sep 10', 'sep 11', 'sep12', 'sep13', 'sep14', 'sep15', 'sep16'], datasets: [{ data: [0, 2, 3, 5, 6, 5, 4, 3], backgroundColor: 'transparent', borderColor: function (context) {
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
        options={{ elements: { point: { radius: 0 }, line: { borderWidth: 5, borderCapStyle: 'round' } }, tooltips: { mode: 'index', intersect: false }, hover: { mode: 'nearest', intersect: true }, maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ gridLines: { display: false }, scaleLabel: { display: true, labelString: 'Date' } }], yAxes: [{ gridLines: { display: false }, scaleLabel: { display: true, labelString: `${'ETH'} / AR` } }] } }} />
    </div>
    <div class="swap-form">
      <div class="input" in:fade={{ duration: 260 }}>
        <p class="label">You send</p>
        <div class="input-wrapper">
          <input type="number" step={1} pattern="\d+" min={0.000001} />
          <select class="fake-select" style="opacity: 1 !important" disabled>
            <option>AR</option>
          </select>
        </div>
      </div>
      <div class="switch-icon" on:click={switchSwap} title="Switch">
        <img src={switchIcon} alt="switch-icon" />
      </div>
      <div class="input" in:fade={{ duration: 260 }}>
        <p class="label">Rate</p>
        <div class="input-wrapper">
          <input type="number" step={1} pattern="\d+" min={0.000001} />
          <div class="select-container">
            <select>
              <option value="ETH">ETH/AR</option>
            </select>
            <object
              data={downArrowIcon}
              type="image/svg+xml"
              title="select-icon" />
          </div>
        </div>
      </div>
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

      .swap-graph
        width: 66%
        margin-right: 2%

      .swap-form
        width: 30%
        margin-left: 2%

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
      .content
        p
          color: var(--primary-text-color)

</style>
