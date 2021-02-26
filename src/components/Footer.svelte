<script lang="typescript">
  import { fade } from "svelte/transition";
  import { backOut } from "svelte/easing";

  export let scrollTransition: boolean = false;

  let element,
    y,
    windowHeight,
    shown = false;

  if (!scrollTransition) shown = true;

  // fade animation
  $: {
    if (element !== undefined && scrollTransition) {
      let componentY = element.offsetTop + element.offsetHeight;
      if (componentY <= y + windowHeight + 60 && !shown) shown = true;
    }
  }
</script>

<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} />
<div bind:this={element}>
  {#if shown}
    <div
      class="Footer"
      in:fade={{ duration: 1100, delay: 411, easing: backOut }}>
      <div class="FooterContent">
        <div><a href="https://discord.gg/RnWbc8Y">chat</a></div>
        <div><a href="https://github.com/useverto/verto">code</a></div>
        <div><a href="https://www.arweave.org/">arweave</a></div>
      </div>
    </div>
  {/if}
</div>



<!-- prettier-ignore -->
<style lang="sass">

  .Footer
    width: 80%
    border-top: 5px solid var(--inverted-elements-color)
    margin: 0 auto

    @media screen and (max-width: 720px)
      display: none
  
    .FooterContent
      padding: 30px 0
  
      div
        width: 32%
        display: inline-block
        text-align: center
  
        a
          text-decoration: none
          width: 100% !important
          transition: color linear 0.1s
          color: var(--primary-text-color)
        
          &:hover
            color: #B075CD

</style>