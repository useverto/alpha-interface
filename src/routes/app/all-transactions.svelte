<script lang="typescript">

  import NavBar from "../../components/NavBar.svelte";
  import Footer from "../../components/Footer.svelte";
  import moment from "moment";
  import { loggedIn } from "../../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";

  if(process.browser && !$loggedIn) goto("/");

  let currentPage = 1, lastPage = 1;

</script>

<svelte:head>
  <title>Transactions overview</title>
</svelte:head>

<NavBar />
<div class="all-transactions" in:fade={{ duration: 300 }}>
  <h1 class="title">All Transactions</h1>
  <table>
    <tr>
      <th style="text-transform: none">TxID</th>
      <th>Amount</th>
      <th>Pst</th>
    </tr>
    <tr>
      <td style="width: 70%">jYKHLCGQuhQyt9uyZNXA6852CzYTu3qVYRKC6pnxIbkzDThbAgip <span class="status success"></span></td>
      <td style="width: 20%">0.00007337</td>
      <td style="text-transform: uppercase">egg</td>
    </tr>
    <tr>
      <td style="width: 70%">cHZG6U7TzXYykn8m5g6s7vpYpbRvVpthUUpgCI4r9n8AXJKD5Gs1 <span class="status pending"></span></td>
      <td style="width: 20%">0.00003450</td>
      <td style="text-transform: uppercase">wav</td>
    </tr>
    <tr>
      <td style="width: 70%">v5ty9DKrcb9Lnk3yJAdkSA9Eg5Lb6tSwr8rjJNS7Mou5eyGxRbnD <span class="status failure"></span></td>
      <td style="width: 20%">0.00000043</td>
      <td style="text-transform: uppercase">arc</td>
    </tr>
    <tr>
      <td style="width: 70%">DHy8qyXUJYA3Ygb9y7jujuvwP8eVr9MTpK8Kbl45zYIj3g5KdzgK <span class="status failure"></span></td>
      <td style="width: 20%">0.02300443</td>
      <td style="text-transform: uppercase">egg</td>
    </tr>
    <tr>
      <td style="width: 70%">vWwPCJWLbFhJ253u25zb3rvtJCB7TvPQ9cxvmQk0qICHLYKfnPgd <span class="status success"></span></td>
      <td style="width: 20%">0.00000242</td>
      <td style="text-transform: uppercase">lum</td>
    </tr>
    <tr>
      <td style="width: 70%">jYKHLCGQuhQyt9uyZNXA6852CzYTu3qVYRKC6pnxIbkzDThbAgip <span class="status success"></span></td>
      <td style="width: 20%">0.00007337</td>
      <td style="text-transform: uppercase">egg</td>
    </tr>
    <tr>
      <td style="width: 70%">cHZG6U7TzXYykn8m5g6s7vpYpbRvVpthUUpgCI4r9n8AXJKD5Gs1 <span class="status pending"></span></td>
      <td style="width: 20%">0.00003450</td>
      <td style="text-transform: uppercase">wav</td>
    </tr>
    <tr>
      <td style="width: 70%">v5ty9DKrcb9Lnk3yJAdkSA9Eg5Lb6tSwr8rjJNS7Mou5eyGxRbnD <span class="status failure"></span></td>
      <td style="width: 20%">0.00000043</td>
      <td style="text-transform: uppercase">arc</td>
    </tr>
    <tr>
      <td style="width: 70%">DHy8qyXUJYA3Ygb9y7jujuvwP8eVr9MTpK8Kbl45zYIj3g5KdzgK <span class="status failure"></span></td>
      <td style="width: 20%">0.02300443</td>
      <td style="text-transform: uppercase">egg</td>
    </tr>
    <tr>
      <td style="width: 70%">vWwPCJWLbFhJ253u25zb3rvtJCB7TvPQ9cxvmQk0qICHLYKfnPgd <span class="status success"></span></td>
      <td style="width: 20%">0.00000242</td>
      <td style="text-transform: uppercase">lum</td>
    </tr>
  </table>
  <div class="pagination">
    <a href="/app/all-transactions{currentPage <= 1 ? "" : ("?page=" + (currentPage - 1))}" class="prev">{"<-"}</a>
    <span class="current">{currentPage}</span>
    <a href="/app/all-transactions{lastPage >= currentPage ? "" : ("?page=" + (currentPage + 1))}" class="next">{"->"}</a>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../../styles/tables.sass"

  .all-transactions
    padding: 3em 15vw
    @include table 

    .pagination
      margin-top: 1.3em
      @include pagination

</style>