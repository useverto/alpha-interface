<script lang="ts">


</script>

<div class="LatestTrades">
  <h1 class="title">Latest Trades</h1>
  <table>
    <tr>
      <th>TxID</th>
      <th>AMOUNT</th>
      <th>PST</th>
    </tr>
    <tr>
      <td>jYKHLCGQuhQyt9uyZNXA6852CzYTu3qVYRKC6pnxIbkzDThbAgip</td>
      <td>0.00007337</td>
      <td class="pst">egg</td>
    </tr>
    <tr>
      <td>cHZG6U7TzXYykn8m5g6s7vpYpbRvVpthUUpgCI4r9n8AXJKD5Gs1</td>
      <td>0.00003450</td>
      <td class="pst">wav</td>
    </tr>
    <tr>
      <td>v5ty9DKrcb9Lnk3yJAdkSA9Eg5Lb6tSwr8rjJNS7Mou5eyGxRbnD</td>
      <td>0.00000043</td>
      <td class="pst">arc</td>
    </tr>
    <tr>
      <td>DHy8qyXUJYA3Ygb9y7jujuvwP8eVr9MTpK8Kbl45zYIj3g5KdzgK</td>
      <td>0.02300443</td>
      <td class="pst">egg</td>
    </tr>
    <tr>
      <td>vWwPCJWLbFhJ253u25zb3rvtJCB7TvPQ9cxvmQk0qICHLYKfnPgd</td>
      <td>0.00000242</td>
      <td class="pst">lum</td>
    </tr>
  </table>
</div>

<style lang="sass">

  .LatestTrades
    padding: 1em 15vw 3em

    h1.title
      font-size: 2.3em
      font-weight: 600

    table
      width: 100%

      tr
        th, td
          text-align: left

        th
          font-weight: 600
          padding-bottom: 1.15em
          text-decoration: underline

        td
          width: 20%
          padding-bottom: .7em

          &:first-child
            width: 70%

          &:last-child
            width: 10%

          &.pst
            text-transform: uppercase

</style>