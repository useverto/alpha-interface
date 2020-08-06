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
</div>
<Footer />

<style lang="sass">

  .gallery
    padding: 4.4em 15vw 3em

    .gallery-head
      display: flex
      justify-content: space-between

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

</style>