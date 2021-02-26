<script lang="typescript">
  import { fade } from "svelte/transition";
  import { displayTheme } from "../stores/themeStore";
  import { DisplayTheme } from "../utils/types";

  export let style: string = "";
</script>

<div
  class="skeleton-loading"
  style={style + (style.endsWith(';') ? '' : ';') + '--skeleton-background-color: ' + ($displayTheme === DisplayTheme.Dark ? '#131313' : '#f0f0f0') + ';' + '--skeleton-secondary-color: ' + ($displayTheme === DisplayTheme.Dark ? '#0f0f0f' : '#e0e0e0')}
  in:fade={{ duration: 100 }}
  out:fade={{ duration: 70 }} />

<style lang="sass">

  .skeleton-loading
    width: 300px
    height: 22px
    border-radius: 4px
    display: inline-block
    position: relative
    overflow: hidden
    background-size: 400% 100%
    background-image: linear-gradient(to right, var(--skeleton-background-color) 5%, var(--skeleton-secondary-color) 35%, var(--skeleton-background-color) 45%)
    animation: skeletonLoading 6.6s ease-in-out infinite

  @keyframes skeletonLoading
    0%
      background-position: 200% 0

    to
      background-position: -200% 0

</style>
