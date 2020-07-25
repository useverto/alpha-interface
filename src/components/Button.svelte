<script lang="ts">

  export let href: string = undefined;
  export let reverse: boolean = false;
  export let clear: boolean = false;
  export let target: string = undefined;

  $: rel = target === "_blank" ? "noopener noreferrer" : undefined;

</script>

<a href={href} target={target} rel={rel} class="Button" class:clear class:reverse>
  <slot></slot>
</a>

<style lang="sass">

  .Button
    padding: .3em 1.5em
    background-color: #000
    color: #fff
    border: 2px solid #000
    border-radius: 6px
    cursor: pointer
    font-family: "Inter", sans-serif
    text-decoration: none
    min-width: 110px
    display: inline-block
    font-size: 1.2em
    font-weight: 500
    text-align: center
    transition: all .3s

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