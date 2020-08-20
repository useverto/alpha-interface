<script lang="ts">

  import { keyfile } from "../../stores/keyfileStore.js";
  import SkeletonLoading from "../../components/SkeletonLoading.svelte";

  import { query } from "../../api-client";
  import tokensQuery from "../../queries/tokens.gql";
  import Arweave from "arweave";
  import { interactRead } from "smartweave";

  let balances = getTokenBalances();

  async function getSupportedPSTs (): Promise<{ id: string, name: string, ticker: string }[]> {
    if(!process.browser) return [];
    
    let psts: { id: string, name: string, ticker: string }[] = [];
    
    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });
    
    let txIds = [];
    const _txIds = (await query({
      query: tokensQuery
    })).data.transactions.edges;
    _txIds.map(({ node }) => {
      txIds.push(node.id);
    })
    
    for (const id of txIds) {
      try {
        const contractId = (await client.transactions.getData(
          id,
          {decode: true, string: true},
        )).toString();
        const contractData = JSON.parse(
          (await client.transactions.getData(
            contractId,
            {decode: true, string: true},
          )).toString()
        );
        psts.push({
          id: contractId,
          name: contractData["name"],
          ticker: contractData["ticker"],
        });
      } catch (error) {
        console.log(error);
      }
    }
    
    return psts;
  }

  async function getTokenBalances() {
    if(!process.browser) return [];

    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 200000,
    });
    const supportedPSTs = await getSupportedPSTs();
    let tokenBalances = [];

    for (let i = 0; i < supportedPSTs.length; i++) {
      let pstContract = await interactRead(client, JSON.parse($keyfile), supportedPSTs[i].id, {
        function: "unlockedBalance"
      });
      if (pstContract.balance > 0) {
        tokenBalances.push({
          token: supportedPSTs[i].name,
          ticker: supportedPSTs[i].ticker,
          balance: pstContract.balance
        });
      }
    }

    return tokenBalances;
  }

  function roundCurrency (val: number | string): string {
     if(val === "?") return val;
     if(typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

</script>

<div class="section">
  <h1 class="title">Assets</h1>
  <table>
    <tr>
      <th>Token</th>
      <th>Amount</th>
    </tr>
    {#await balances}
      <tr>
        <td><SkeletonLoading style="width: 200px" /></td>
        <td><SkeletonLoading style="width: 200px" /></td>
      </tr>
      <tr>
        <td><SkeletonLoading style="width: 200px" /></td>
        <td><SkeletonLoading style="width: 200px" /></td>
      </tr>
      <tr>
        <td><SkeletonLoading style="width: 200px" /></td>
        <td><SkeletonLoading style="width: 200px" /></td>
      </tr>
      <tr>
        <td><SkeletonLoading style="width: 200px" /></td>
        <td><SkeletonLoading style="width: 200px" /></td>
      </tr>
      <tr>
        <td><SkeletonLoading style="width: 200px" /></td>
        <td><SkeletonLoading style="width: 200px" /></td>
      </tr>
    {:then loadedBalances} 
      {#if loadedBalances.length === 0}
        <p>You don't have any tokens!</p>
      {/if}
      {#each loadedBalances as balance}
        <tr>
          <td>{balance.token}</td>
          <td>{roundCurrency(balance.balance)} <span class="currency">{balance.ticker}</span></td>
        </tr>
      {/each}
    {/await}
  </table>
</div>

<style lang="sass">
  
  @import "../../styles/tables.sass"

  .section
    @include table
    padding-bottom: 2.5em

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
