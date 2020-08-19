<script lang="typescript">

  import { fade } from "svelte/transition";

  export let confirmation: boolean = false; // show confirmation button
  export let onConfirm: Function = () => {}; // on confirmation click
  export let onCancel: Function = () => {}; // on cancel button click
  export let onClose: Function = () => {}; // on OK button click (this will not work with confirmation = true)
  export let opened: boolean = false; // exported so it can be controlled outside of this component

  let canceledClose = false; // if closing the modal was cancelled. This adds the "cancelled" class to the modal

  async function close (execute: Function) {
    canceledClose = false;
    let cancelClose = () => canceledClose = true;
    await execute(cancelClose);
    if(!canceledClose) opened = false;
  }

</script>

{#if opened}
  <div class="modal-overlay" in:fade={{ duration: 150 }} out:fade={{ duration: 100 }} on:click={() => { if(!confirmation) close(onClose); }}></div>
  <div class="Modal" in:fade={{ duration: 240 }} out:fade={{ duration: 180 }} class:cancelled={canceledClose}>
    <div class="content">
      <slot></slot>
    </div>
    <div class="confirmation">
      {#if confirmation}
        <button class="confirm" on:click={() => { close(onConfirm); }}>[Confirm]</button>
        <button class="cancel" on:click={() => { close(onCancel); }}>[Cancel]</button>
      {:else}
        <button on:click={() => { close(onClose); }}>[Ok]</button>
      {/if}
    </div>
  </div>
{/if}

<style lang="sass">

  .modal-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    z-index: 1000000
    background-color: rgba(#000, .4)
    backdrop-filter: blur(7px)
    -webkit-backdrop-filter: blur(7px)

  .Modal
    $padding: 50px
    position: fixed
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    z-index: 2000000
    background-color: rgba(#121212, .975)
    border-radius: 13px
    padding: $padding
    color: #fff

    @media screen and (max-width: 720px)
      width: 90vw
      padding:
        left: 0
        right: 0

    .content
      color: #fff
      font-size: 1em
      margin-bottom: $padding

      @media screen and (max-width: 720px)
        padding:
          left: $padding
          right: $padding
    
    .confirmation
      text-align: center

      button
        border: none
        outline: none
        text-transform: uppercase
        font-size: 1em
        background-color: transparent
        color: #fff
        margin: 0 25px
        text-align: center
        cursor: pointer

        &:hover
          text-decoration: underline

      .confirm
        color: #00D46E

      .cancel
        color: #FF375D

</style>