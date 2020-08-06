<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";

  let sortingType: string;

</script>

<svelte:head>
  <title>Verto — Gallery</title>
</svelte:head>

<NavBar />
<div class="gallery">
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
    <a class="post" href="/">
      <h1>KNfOyFvvVFJkeDU0Ga8huu3bNfLYeios</h1>
      <div class="post-info">
        <p>Reputation <span class="reputation">{51.7329}</span></p>
        <p>Balance <span>{34.06959}AR</span></p>
        <p>Stake <span>{80.23102}AR</span></p>
      </div>
    </a>
    <a class="post" href="/">
      <h1>KNfOyFvvVFJkeDU0Ga8huu3bNfLYeios</h1>
      <div class="post-info">
        <p>Reputation <span class="reputation">{51.7329}</span></p>
        <p>Balance <span>{34.06959}AR</span></p>
        <p>Stake <span>{80.23102}AR</span></p>
      </div>
    </a>
    <a class="post" href="/">
      <h1>KNfOyFvvVFJkeDU0Ga8huu3bNfLYeios</h1>
      <div class="post-info">
        <p>Reputation <span class="reputation">{51.7329}</span></p>
        <p>Balance <span>{34.06959}AR</span></p>
        <p>Stake <span>{80.23102}AR</span></p>
      </div>
    </a>
    <a class="post" href="/">
      <h1>KNfOyFvvVFJkeDU0Ga8huu3bNfLYeios</h1>
      <div class="post-info">
        <p>Reputation <span class="reputation">{51.7329}</span></p>
        <p>Balance <span>{34.06959}AR</span></p>
        <p>Stake <span>{80.23102}AR</span></p>
      </div>
    </a>
    <a class="post" href="/">
      <h1>KNfOyFvvVFJkeDU0Ga8huu3bNfLYeios</h1>
      <div class="post-info">
        <p>Reputation <span class="reputation">{51.7329}</span></p>
        <p>Balance <span>{34.06959}AR</span></p>
        <p>Stake <span>{80.23102}AR</span></p>
      </div>
    </a>
    <a class="post" href="/">
      <h1>KNfOyFvvVFJkeDU0Ga8huu3bNfLYeios</h1>
      <div class="post-info">
        <p>Reputation <span class="reputation">{51.7329}</span></p>
        <p>Balance <span>{34.06959}AR</span></p>
        <p>Stake <span>{80.23102}AR</span></p>
      </div>
    </a>
    <a class="post" href="/">
      <h1>KNfOyFvvVFJkeDU0Ga8huu3bNfLYeios</h1>
      <div class="post-info">
        <p>Reputation <span class="reputation">{51.7329}</span></p>
        <p>Balance <span>{34.06959}AR</span></p>
        <p>Stake <span>{80.23102}AR</span></p>
      </div>
    </a>
    <a class="post" href="/">
      <h1>KNfOyFvvVFJkeDU0Ga8huu3bNfLYeios</h1>
      <div class="post-info">
        <p>Reputation <span class="reputation">{51.7329}</span></p>
        <p>Balance <span>{34.06959}AR</span></p>
        <p>Stake <span>{80.23102}AR</span></p>
      </div>
    </a>
  </div>
</div>
<Footer />

<style lang="sass">

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

          p
            font-size: 1.1em
            font-weight: 600
            color: rgba(#000, .4)
            margin: 0
            text-transform: uppercase

            span
              color: #000

              &.reputation
                text-decoration: underline

</style>