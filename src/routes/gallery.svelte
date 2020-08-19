<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import { loggedIn } from "../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { query } from "../api-client.js";
  import Arweave from "arweave";

  if(process.browser && !$loggedIn) goto("/");

  let sortingType: string;
  let tradingPosts = getTradingPosts();

  async function getTradingPosts (): Promise<{ addr: string, reputation: string, balance: string, stake: string }[]> {
    if(!process.browser) return [];

    let posts: { addr: string, reputation: string, balance: string, stake: string }[] = [];

    const client = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    const _posts = (await query(`
      query {
        transactions(
          tags: [
            {name: "App-Name", values: "Verto"}
            {name: "Trading-Post-Genesis", values: "G"}
          ]
        ) {
          edges {
            node {
              owner {
                address
              }
            }
          }
        }
      }
    `)).data.transactions.edges;

    for (const post of _posts) {
      let node = post.node;
      const balance = client.ar.winstonToAr(await client.wallets.getBalance(node.owner.address));
      posts.push({
        addr: node.owner.address,
        "reputation": "",
        balance,
        "stake": "",
      });
    }

    return posts;
  }

</script>

<svelte:head>
  <title>Verto — Gallery</title>
</svelte:head>

<NavBar />
<div class="gallery" in:fade={{ duration: 300 }}>
  <div class="gallery-head">
    <h1 class="title">Trading Posts</h1>
    <div class="sorting">
      <p>Sort by
        <select bind:value={sortingType}>
          <option value="reputation">Reputation</option>
          <option value="balance">Balance</option>
          <option value="stake">Stake</option>
        </select>
      </p>
    </div>
  </div>
  <div class="gallery-content">
    {#await tradingPosts}
      <p>Loading</p>
    {:then loadedPosts}
      {#if loadedPosts.length === 0}
        <p>No posts found</p>
      {/if}
      {#each loadedPosts as post}
        <a class="post" href="/post?addr={post.addr}">
          <h1>{post.addr}</h1>
          <div class="post-info">
            <p>Reputation <span class="reputation">{post.reputation}</span></p>
            <p>Balance <span>{post.balance}AR</span></p>
            <p>Stake <span>{post.stake}AR</span></p>
          </div>
        </a>
      {/each}
    {/await}
    <a class="post" href="/post?addr=test">
      <div class="post-info">
        <h1>FcM-QQpfcD0xTTzr8u4Su9QCgcvRx_JH4JSCQoFi6Ck</h1>
        <div class="other-info">
          <p><span>Balance</span>34.06959<span class="ar">ar</span></p>
          <p><span>Stake</span>80.23102<span class="ar">ar</span></p>
        </div>
      </div>
      <h1 class="reputation">51.73</h1>
    </a>
  </div>
</div>
<Footer />

<style lang="sass">

  @import "../styles/tables.sass"

  .gallery
    padding: 4.4em 15vw 3em

    .gallery-head
      display: flex
      justify-content: space-between
      margin-bottom: .6em

      h1.title
        margin: 0

      .sorting
        display: flex
        align-items: center

        p
          font-size: 1.2em
          color: rgba(#000, .3)
          font-weight: 600
          margin: 0
          text-transform: uppercase

        select
          position: relative
          border: none
          outline: none
          background-color: transparent
          cursor: pointer
          font-size: 1em
          color: rgba(#000, .8)
          margin: 0
          font-weight: 600
          text-transform: uppercase
          
          option
            text-transform: normal
            font-size: .8em
            color: #000

    .gallery-content
      @media screen and (max-width: 720px)
        overflow-x: hidden

      a.post
        display: block
        padding: .65em 1.5em
        background-color: #121212
        text-decoration: none
        color: #fff
        display: flex
        justify-content: space-between
        align-items: center
        border-radius: 5px
        margin-bottom: 2.8em
        transition: all .3s

        &:last-child
          margin-bottom: 0

        &:hover
          opacity: .8

        h1.reputation
          font-size: 2.85em
          color: #fff
          font-weight: 500
          text-transform: uppercase
          display: inline-block
          margin: 0

        .post-info
          h1
            font-size: 1.5em
            margin: 0
              bottom: .3em
            font-weight: 400
            color: #fff

          .other-info
            display: flex
            align-items: center

            p
              margin: 0
              font-size: 1.05em
              color: #fff

              &:first-child
                margin-right: 2.5em

              span
                color: #828282
                text-transform: uppercase
                margin-right: .5em

                &.ar
                  color: #fff
                  margin-right: 0
                  font-size: .75em

</style>