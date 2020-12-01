<script lang="typescript">
  export let href: string = undefined;
  export let reverse: boolean = false;
  export let clear: boolean = false;
  export let target: string = undefined;
  export let click: Function = () => {}; // click event
  export let style: string = undefined;
  export let disabled: boolean = false;
  export let title: string = undefined;

  // don't let malicious links override the content of the site
  // https://web.dev/external-anchors-use-rel-noopener/
  $: rel = target === "_blank" ? "noopener noreferrer" : undefined;

  function handleClick(e) {
    if (disabled) e.preventDefault();
    else click();
  }
</script>

<a
  {href}
  {target}
  {rel}
  class="Button"
  on:click={handleClick}
  {style}
  {title}
  class:clear
  class:reverse
  class:disabled>
  <slot />
</a>



<!-- prettier-ignore -->
<style lang="sass">

  .Button
    padding: .3em 1.5em
    position: relative
    background-color: var(--inverted-elements-color)
    color: var(--background-color)
    border: 2px solid var(--inverted-elements-color)
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

    &.disabled
      cursor: not-allowed
      opacity: .6

    &:hover:not(.disabled)
      background-color: transparent
      color: var(--primary-text-color)

    &.clear:not(.disabled)
      background-color: transparent
      color: var(--primary-text-color)

      &:hover
        background-color: var(--primary-text-color)
        color: var(--inverted-elements-color)

    &.reverse
      border-color: #fff
      background-color: #fff
      color: #000

      &:hover:not(.disabled)
        background-color: transparent
        color: #fff

    &.clear
      background-color: transparent
      color: var(--primary-text-color)

      &:hover:not(.disabled)
        background-color: var(--primary-text-color)
        color: var(--inverted-elements-color)

      &.reverse
        color: #fff

        &:hover:not(.disabled)
          background-color: #fff
          color: #000   

</style>