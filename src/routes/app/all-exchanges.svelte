<script lang="typescript">

  import NavBar from "../../components/NavBar.svelte";
  import Footer from "../../components/Footer.svelte";
  import moment from "moment";
  import { loggedIn } from "../../stores/keyfileStore.js";
  import { goto } from "@sapper/app";

  if(process.browser && !$loggedIn) goto("/");

  let currentPage = 1, lastPage = 1;

</script>

<svelte:head>
  <title>Exchanges overview</title>
</svelte:head>

<NavBar />
<div class="all-exchanges">
  <h1 class="title">All Exchanges</h1>
  <table>
    <tr>
      <th>Timestamp</th>
      <th>Exchange</th>
      <th>Durration</th>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status success"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status failure"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status success"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status failure"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status success"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status failure"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
    <tr>
      <td style="width: 30%">{moment().format("YYYY-MM-DD hh:mm:ss")}</td>
      <td style="width: 45%">0.00075664 <span class="currency">egg</span> {"->"} 0.00063480 <span class="currency">lum</span> <span class="status pending"></span></td>
      <td style="text-transform: uppercase">4hrs 20min</td>
    </tr>
  </table>
  <div class="pagination">
    <a href="/app/all-exchanges{currentPage <= 1 ? "" : ("?page=" + (currentPage - 1))}" class="prev">{"<-"}</a>
    <span class="current">{currentPage}</span>
    <a href="/app/all-exchanges{lastPage >= currentPage ? "" : ("?page=" + (currentPage + 1))}" class="next">{"->"}</a>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../../styles/tables.sass"

  .all-exchanges
    padding: 3em 15vw
    @include table 

    .pagination
      margin-top: 1.3em
      @include pagination

</style>