<script lang="ts">

  export let blur: boolean = false; // blur when not scrolled ? (used only in the her, as there is a black background)
  let y;

</script>

<svelte:window bind:scrollY={y} />
<div class="NavBar" class:scrolled={y > 20 && blur} class:hero={blur}>
  <a href="/" class="title">coinary</a>
  <div class="menu">
    <a href="/">Home</a>
    <a href="/docs">Docs</a>
    <a href="/login">Sign In</a>
  </div>
</div>

<style lang="sass">

  .NavBar
    position: fixed
    display: flex
    align-items: center
    justify-content: space-between
    top: 0
    left: 0
    right: 0
    z-index: 1000
    background-color: transparent
    backdrop-filter: blur(0)
    -webkit-backdrop-filter: blur(0)
    border-bottom: 1px solid transparent
    padding: .5em 2em
    transition: all .3s

    a.title
      color: #000
      text-decoration: none
      font-size: 1.5em
      font-weight: 600
      margin: 0
      opacity: 0
      -webkit-tap-highlight-color: transparent

    .menu
      display: flex
      align-items: center

      a
        color: #000
        position: relative
        text-decoration: none
        font-family: "Inter", sans-serif
        font-size: 16px
        margin: 0 10px
        padding: 4px 0
        -webkit-tap-highlight-color: transparent
        cursor: pointer
        font-weight: 500
        transition: all .3s

        &::after
          content: ""
          position: absolute
          bottom: 0
          left: 0
          width: 0
          height: 2px
          background-color: #000
          opacity: 0
          transition: all .3s

          @media screen and (max-width: 720px)
            display: none

        &:hover
          &::after
            opacity: 1
            width: 100%

        &:last-child
          background-color: #000
          color: #fff
          padding: 4px 7px
          border: 1px solid #000
          border-radius: 5px

          &::after
            display: none

          &:hover
            background-color: transparent
            color: #000

    &.hero:not(.scrolled)
      padding:
        top: 1.2em
        bottom: 1.2em

      @media screen and (max-width: 720px)
        .menu 
          a
            color: #fff

            &::after
              background-color: #fff

            &:last-child
              background-color: #fff
              border-color: #fff
              color: #000

              &:hover
                color: #fff
                background-color: transparent

    &.scrolled
      background-color: rgba(#fff, .7)
      backdrop-filter: blur(5px)
      -webkit-backdrop-filter: blur(5px)
      border-color: rgba(#000, .075)

      a.title
        opacity: 1

</style>