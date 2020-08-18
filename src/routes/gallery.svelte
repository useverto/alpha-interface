<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import { loggedIn } from "../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { query } from "../api-client.js";
  import Arweave from "arweave";
  import galleryQuery from "../queries/gallery.graphql";

  if(process.browser && !$loggedIn) goto("/");

  let sortingType: string;
  let currentPage = 1, lastPage = 1;

  // set current page
  // redirect to first page if the current page is greater than the last page
  if(process.browser) {
    const params = new URLSearchParams(window.location.search);
    if(params.get("page") !== null) currentPage = parseInt(params.get("page"));
    if(currentPage > lastPage) goto("/gallery");
  }

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

    const _posts = (await query(galleryQuery)).data.transactions.edges;

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
    <div class="pagination">
      <a href="/gallery{currentPage <= 1 ? "" : ("?page=" + (currentPage - 1))}" class="prev">{"<-"}</a>
      <span class="current">{currentPage}</span>
      <a href="/gallery{lastPage >= currentPage ? "" : ("?page=" + (currentPage + 1))}" class="next">{"->"}</a>
    </div>
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
        margin: 2em 0
        text-decoration: none
        transition: all .3s

        &:hover
          opacity: .63

        h1
          font-size: 1.7em
          color: #000
          font-weight: 400
          margin: 0 0 .65em 0

        .post-info
          display: flex
          justify-content: space-between

          @media screen and (max-width: 720px)
            display: block
            margin: 1.5em 0 2.3em

          p
            font-size: 1.1em
            font-weight: 600
            color: rgba(#000, .4)
            margin: 0
            text-transform: uppercase

            @media screen and (max-width: 720px)
              margin-bottom: 1em

            span
              color: #000

              &.reputation
                text-decoration: underline

    .pagination
      margin-top: 1em
      @include pagination

</style>