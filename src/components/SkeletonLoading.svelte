<script lang="typescript">

  import { fade } from "svelte/transition";

  export let style: string = "";

</script>

<div class="skeleton-loading" style={style} in:fade={{ duration: 100 }}></div>

<style lang="sass">

  .skeleton-loading
    width: 300px
    height: 22px
    border-radius: 4px
    animation: shine 7s infinite linear
    background: linear-gradient(to right, #f0f0f0 5%, #D6D6D6 35%, #f0f0f0 50%)
    background-size: 3500px 100%

    @keyframes shine
      0%
        background-position: -1000px 0

      100%
        background-position: 4000px 0

</style>