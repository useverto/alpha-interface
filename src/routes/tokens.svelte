<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import { loggedIn } from "../stores/keyfileStore.js";
  import { goto } from "@sapper/app";
  import { fade } from "svelte/transition";

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

</script>

<svelte:head>
  <title>Verto — Tokens</title>
</svelte:head>

<NavBar />
<div class="gallery" in:fade={{ duration: 300 }}>
  <div class="gallery-head">
    <h1 class="title">Supported Tokens</h1>
  </div>
  <div class="gallery-content">
    <a class="token" href="#">
      <h1>Nest.land Token</h1>
      <div class="post-info">
        <p>Ticker <span>DNO</span></p>
        <p>Type <span>PST</span></p>
      </div>
    </a>
    <a class="token" href="#">
      <h1>Lightbulb Token</h1>
      <div class="post-info">
        <p>Ticker <span>LGT</span></p>
        <p>Type <span>PSDAO</span></p>
      </div>
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

      a.token
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