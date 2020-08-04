<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import { userinfo } from "../stores/userStore.js";
  import moment from "moment";

</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<NavBar />
<div class="dashboard">
  <div class="section">
    <h1 class="title">Assets</h1>
    <table>
      <tr>
        <th>Token</th>
        <th>Dist.</th>
        <th>Amount</th>
        <th>Value (AR)</th>
      </tr>
      <tr>
        <td style="width: 45%;">nest.land token</td>
        <td>49.43%</td>
        <td>0.00696969 <span class="currency">egg</span></td>
        <td>1.52317899</td>
      </tr>
      <tr>
        <td style="width: 45%;">Light Bulb Coin</td>
        <td>26.86%</td>
        <td>0.00413056 <span class="currency">lum</span></td>
        <td>0.82853913</td>
      </tr>
      <tr>
        <td style="width: 45%;">SoundWave Inc.</td>
        <td>16.58%</td>
        <td>0.00505455 <span class="currency">wav</span></td>
        <td>0.51124595</td>
      </tr>
      <tr>
        <td style="width: 45%;">Reddit Coin</td>
        <td>07.12%</td>
        <td>0.00240055 <span class="currency">red</span></td>
        <td>0.21954591</td>
      </tr>
    </table>
  </div>
  <div class="section">
    <h1 class="title">Exchanges</h1>
    <table>
      <tr>
        <th>Timestamp</th>
        <th>Exchange</th>
        <th>Durration</th>
      </tr>
      <tr>
        <td style="width: 30%">{moment().format("YYYY-mm-dd hh:mm:ss")}</td>
        <td style="width: 45%">0.00075664 <span class="currency">egg</span> -> 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
        <td>4HRS 20MIN</td>
      </tr>
      <tr>
        <td style="width: 30%">{moment().format("YYYY-mm-dd hh:mm:ss")}</td>
        <td style="width: 45%">0.00075664 <span class="currency">egg</span> -> 0.00063480 <span class="currency">lum</span> <span class="status success"></span></td>
        <td>4HRS 20MIN</td>
      </tr>
      <tr>
        <td style="width: 30%">{moment().format("YYYY-mm-dd hh:mm:ss")}</td>
        <td style="width: 45%">0.00075664 <span class="currency">egg</span> -> 0.00063480 <span class="currency">lum</span> <span class="status failure"></span></td>
        <td>4HRS 20MIN</td>
      </tr>
      <tr>
        <td style="width: 30%">{moment().format("YYYY-mm-dd hh:mm:ss")}</td>
        <td style="width: 45%">0.00075664 <span class="currency">egg</span> -> 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
        <td>4HRS 20MIN</td>
      </tr>
    </table>
    <a href="#" class="view-all">View all -></a>
  </div>
</div>
<Footer />

<style lang="sass">

  .dashboard
    padding: 1em 15vw 3em

    .section
      padding-bottom: 2.5em

      a.view-all
        display: block
        text-align: center
        color: rgba(#000, .5)
        font-weight: 500
        padding: .8em 0

      &:first-child
        padding-top: 2.5em

    h1.title
      font-size: 2.3em
      font-weight: 600

      @media screen and (max-width: 720px)
        width: 100%
        font-size: 2.01em      

  table
    width: 100%

    tr
      th, td
        text-align: left

      th
        font-weight: 600
        padding-bottom: 1.15em
        text-transform: uppercase
        text-decoration: underline

        &:last-child
          text-align: right

      td
        width: 20%
        padding-bottom: .7em

        &:last-child
          text-align: right

        .currency
          text-transform: uppercase

        .status
          display: inline-block
          width: 8px
          height: 8px
          vertical-align: middle
          background-color: #000
          border-radius: 100%
          position: relative

          &::after
            content: ""
            position: absolute
            top: 50%
            left: 120%
            z-index: -10000000
            opacity: 0
            padding: 2px 5px
            background-color: #000
            box-shadow: 0 8px 16px rgba(#000 , .24)
            color: #fff
            font-family: "Inter", sans-serif
            font-size: 11px
            font-weight: 300
            border-radius: 4px
            transform: translateY(-50%)
            transition: opacity .3s

          &:hover
            &::after
              z-index: 10
              opacity: 1

          &.success
            background-color: #00D46E

            &::after
              content: "Success"

          &.failure
            background-color: #ff0000
            
            &::after
              content: "Failure"

          &.pending
            background-color: #FFD336
            
            &::after
              content: "Pending"

</style>