<script lang="typescript">
  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import Loading from "../components/Loading.svelte";
  import { loggedIn } from "../stores/keyfileStore";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import type { TradingPost } from "../utils/types";
  import { query } from "../api-client";
  import Arweave from "arweave";
  import galleryQuery from "../queries/gallery.gql";
  import { exchangeWallet } from "../utils/constants";

  import Verto from "@verto/lib";
  const client = new Verto();

  if (process.browser && !$loggedIn) goto("/");

  let sortingType: string;
  let tradingPosts: TradingPost[] = [];
  let lastCursor = "",
    hasNext = true,
    loadedFirstPosts = false,
    loading = false;
  let y: number, windowHeight: number;
  let element;

  onMount(() => loadMoreTradingPosts());

  async function loadMoreTradingPosts() {
    if (!process.browser) return;
    if (!hasNext) return;

    loading = true;
    let posts: TradingPost[] = [];

    const arweave = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
    });

    const _posts = (
      await query({
        query: galleryQuery,
        variables: {
          recipients: [exchangeWallet],
        },
      })
    ).data.transactions;

    hasNext = _posts.pageInfo.hasNextPage;

    for (const post of _posts.edges) {
      let node = post.node;
      lastCursor = post.cursor;

      const stake = await client.getPostStake(node.owner.address);
      if (stake > 0) {
        posts.push({
          addr: node.owner.address,
          reputation: await client.getReputation(node.owner.address),
          balance: arweave.ar.winstonToAr(
            await arweave.wallets.getBalance(node.owner.address)
          ),
          stake,
        });
      }
    }

    tradingPosts = tradingPosts.concat(posts);
    tradingPosts = [...new Map(tradingPosts.map((x) => [x.addr, x])).values()];

    loadedFirstPosts = true;
    setTimeout(() => (loading = false), 400); // wait for animation and latency to complete (needed for the scroll)
  }

  $: {
    if (element !== undefined) {
      let componentY = element.offsetTop + element.offsetHeight;
      if (
        componentY <= y + windowHeight + 120 &&
        loadedFirstPosts &&
        !loading &&
        hasNext
      )
        loadMoreTradingPosts();
    }
  }
</script>

<svelte:head>
  <title>Verto — Gallery</title>
</svelte:head>

<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} />
<NavBar />
<div class="gallery" in:fade={{ duration: 300 }}>
  <div class="gallery-head">
    <h1 class="title">Trading Posts</h1>
    <!-- TODO: MPV2 -->
    <!--<div class="sorting">
      <p>Sort by
        <select bind:value={sortingType}>
          <option value="reputation">Reputation</option>
          <option value="balance">Balance</option>
          <option value="stake">Stake</option>
        </select>
      </p>
    </div>-->
  </div>
  <div class="gallery-content">
    {#if !loadedFirstPosts}
      <Loading />
    {:else if tradingPosts.length === 0}
      <p in:fade={{ duration: 150 }}>No posts found</p>
    {:else}
      <div class="reputation-title">
        <p>Reputation</p>
      </div>
      {#each tradingPosts as post}
        <a class="post" href="/post?addr={post.addr}">
          <div class="post-info">
            <h1>{post.addr}</h1>
            <div class="other-info">
              <p>
                <span>Balance</span>{post.balance}<span class="ar">ar</span>
              </p>
              <p><span>Stake</span>{post.stake}<span class="ar">VRT</span></p>
              <!-- reputation for mobile devices -->
              <p class="mobile-reputation">
                <span>Reputation</span>{post.reputation}
              </p>
            </div>
          </div>
          <h1 class="reputation">{post.reputation}</h1>
        </a>
      {/each}
      {#if loading}
        <!-- if the site is loading, but there are posts already loaded  -->
        <Loading />
      {/if}
    {/if}
  </div>
</div>
<Footer />
<span style="width: 100%; height: 1px" bind:this={element} />

<style lang="sass">

  @import "../styles/general.sass"

  .gallery
    @include page

    @media screen and (max-width: 720px)
      padding-top: 2em

    .gallery-head
      display: flex
      justify-content: space-between
      margin-bottom: 2em

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

      .reputation-title
        display: block
        width: 100%
        text-align: right
        margin-bottom: 15px

        p
          font-size: 1.2em
          color: var(--secondary-text-color)
          font-weight: 600
          margin: 0
          text-transform: uppercase

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

          @media screen and (max-width: 1500px)
            font-size: 2.05em

          @media screen and (max-width: 720px)
            display: none

        .post-info
          h1
            font-size: 1.5em
            margin: 0
              bottom: .3em
            font-weight: 400
            color: #fff

            @media screen and (max-width: 1500px)
              font-size: 1.4em
              overflow-wrap: anywhere

              &:last-child
                display: none

          .other-info
            display: flex
            align-items: center

            @media screen and (max-width: 720px)
              display: block

            p
              margin: 0
              font-size: 1.05em
              color: #fff

              &.mobile-reputation
                display: none

              @media screen and (max-width: 1500px)
                font-size: .95em

              @media screen and (max-width: 720px)
                &.mobile-reputation
                  display: block

                &:not(:last-child)
                  margin-bottom: .2em

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
