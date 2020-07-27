<script lang="ts">

  import { fade } from "svelte/transition";
  import { backOut } from "svelte/easing";

  let element, y, windowHeight, shown = false;

  $: {
    if(element !== undefined) {
      let componentY = element.offsetTop + element.offsetHeight;
      if(componentY <= (y + windowHeight + 120) && !shown) shown = true;
    }
  }

</script>

<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} />
<div class="About" bind:this={element}>
  {#if shown}
    <div class="about-content" in:fade={{ duration: 1100, delay: 411, easing: backOut }}>
      <slot></slot>
    </div>
  {/if}
</div>

<style lang="sass">

  .About
    padding: 1em 15vw 3em

  :global(h1.about-title)
    h1.title
      font-size: 2.3em
      font-weight: 600

      @media screen and (max-width: 720px)
        width: 100%
        font-size: 2.01em

  :global(p.about-description)
    font-size: 1em
    line-height: 1.7rem
    text-align: justify

</style>