<script lang="ts">

  export let href: string = undefined;
  export let reverse: boolean = false;
  export let clear: boolean = false;
  export let target: string = undefined;
  export let click: Function = undefined;

  $: rel = target === "_blank" ? "noopener noreferrer" : undefined;
  let component, ripple, rippleData = { x: 0, y: 0, width: 0.5 };

  function onclick (e: MouseEvent) {
    rippleData = { x: e.offsetX, y: e.offsetY, width: component.offsetWidth };
    ripple = true;
    setTimeout(() => {
      ripple = false;
      rippleData = { x: 0, y: 0, width: 0.5 };
    }, 800)
    if(click !== undefined) click();
  }

</script>

<a href={href} target={target} rel={rel} class="Button" bind:this={component} on:click={onclick} class:clear class:reverse class:ripple>
  <div class="ripple-element" style="transform: scale({rippleData.width * 2}); top: {rippleData.y}px; left: {rippleData.x}px;"></div>
  <slot></slot>
</a>

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

    .ripple-element
      position: absolute
      opacity: 0
      width: 1px
      height: 1px
      border-radius: 100%
      background-color: rgba(#fff, .45)
      transition: transform .8s

    &.ripple
      .ripple-element
        opacity: 1

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