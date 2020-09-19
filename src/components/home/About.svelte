<script lang="typescript">
  import { fade } from "svelte/transition";
  import { backOut } from "svelte/easing";

  export let id: string = undefined;

  let element,
    y,
    windowHeight,
    shown = false;

  // fade animation
  $: {
    if (element !== undefined) {
      let componentY = element.offsetTop + element.offsetHeight;
      if (componentY <= y + windowHeight + 120 && !shown) shown = true;
    }
  }
</script>


<svelte:window bind:scrollY="{y}" bind:innerHeight="{windowHeight}" />
<div class="About" bind:this="{element}" id="{id}">
  {#if shown}
    <div
      class="about-content"
      in:fade="{{ duration: 1100, delay: 411, easing: backOut }}">
      <slot />
    </div>
  {/if}
</div>

<!-- prettier-ignore -->
<style lang="sass">

  .About
    padding: 1em 15vw 3em

  \:global(p.about-description)
    font-size: 1em
    line-height: 1.7rem
    text-align: justify

</style>