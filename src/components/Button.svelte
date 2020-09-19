<script lang="typescript">
  export let href: string = undefined;
  export let reverse: boolean = false;
  export let clear: boolean = false;
  export let target: string = undefined;
  export let click: Function = () => {}; // click event
  export let style: string = undefined;

  // don't let malicious links override the content of the site
  // https://web.dev/external-anchors-use-rel-noopener/
  $: rel = target === "_blank" ? "noopener noreferrer" : undefined;
</script>

<a
  href="{href}"
  target="{target}"
  rel="{rel}"
  class="Button"
  on:click="{click}"
  style="{style}"
  class:clear
  class:reverse>
  <slot />
</a>



<!-- prettier-ignore -->
<style lang="sass">

  .Button
    padding: .3em 1.5em
    position: relative
    background-color: #000
    color: #fff
    border: 2px solid #000
    border-radius: 6px
    cursor: pointer
    font-family: "Inter", sans-serif
    text-decoration: none
    min-width: 110px
    overflow: hidden
    -webkit-tap-highlight-color: transparent
    display: inline-block
    font-size: 1.2em
    font-weight: 500
    text-align: center
    transition: all .3s

    @media screen and (max-width: 720px)
      min-width: 140px

    &:hover
      background-color: transparent
      color: #000

    &.clear
      background-color: transparent
      color: #000

      &:hover
        background-color: #000
        color: #fff

    &.reverse
      border-color: #fff
      background-color: #fff
      color: #000

      &:hover
        background-color: transparent
        color: #fff

    &.clear
      background-color: transparent
      color: #000

      &:hover
        background-color: #000
        color: #fff     

      &.reverse
        color: #fff

        &:hover
          background-color: #fff
          color: #000   

</style>