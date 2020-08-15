<script lang="typescript">

  import { fade } from "svelte/transition";

  export let style: string = "";

</script>

<div class="skeleton-loading" style={style} in:fade={{ duration: 100 }} out:fade={{ duration: 70 }}></div>

<style lang="sass">

  .skeleton-loading
    width: 300px
    height: 22px
    border-radius: 4px
    display: inline-block
    position: relative
    overflow: hidden
    background-color: #f0f0f0

    &::after
      position: absolute
      top: 0
      right: 0
      bottom: 0
      left: 0
      transform: translateX(-100%)
      background: linear-gradient(to right, #f0f0f0 5%, #e0e0e0 35%, #f0f0f0 50%)
      animation: shine 2.6s infinite
      content: ''

    @keyframes shine
      100%
        transform: translateX(100%)

</style>