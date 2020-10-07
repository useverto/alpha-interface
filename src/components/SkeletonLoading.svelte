<script lang="typescript">
  import { fade } from "svelte/transition";
  import { displayTheme } from "../stores/themeStore";
  import { DisplayTheme } from "../utils/types";

  export let style: string = "";
</script>

<div
  class="skeleton-loading"
  style="{style + (style.endsWith(';') ? '' : ';') + '--skeleton-background-color: ' + ($displayTheme === DisplayTheme.Dark ? '#131313' : '#f0f0f0') + ';' + '--skeleton-secondary-color: ' + ($displayTheme === DisplayTheme.Dark ? '#0f0f0f' : '#e0e0e0')}"
  in:fade="{{ duration: 100 }}"
  out:fade="{{ duration: 70 }}"></div>



<!-- prettier-ignore -->
<style lang="sass">

  .skeleton-loading
    width: 300px
    height: 22px
    border-radius: 4px
    display: inline-block
    position: relative
    overflow: hidden
    background-color: var(--skeleton-background-color)

    &::after
      position: absolute
      top: 0
      right: 0
      bottom: 0
      left: 0
      transform: translateX(-100%)
      background: linear-gradient(to right, var(--skeleton-background-color) 5%, var(--skeleton-secondary-color) 35%, var(--skeleton-background-color) 50%)
      animation: shine 2.6s infinite
      content: ''

    @keyframes shine
      100%
        transform: translateX(100%)

</style>