<script>

  import { notification, NotificationType } from "../stores/notificationStore.js";
  import { cubicIn } from "svelte/easing";
  import { fly, scale } from "svelte/transition";

  let timeout = null;

  $: notificationClass = $notification === null ? "" : Object.keys(NotificationType).find(key => NotificationType[key] === $notification.type);

  function hide () {
    notification.remove();
    timeout = null;
  }

  $: {
    if($notification !== null && timeout === null) timeout = setTimeout(hide, $notification.timeout);
  }

</script>

{#if $notification !== null}
  <div class="notification {notificationClass}" in:fly={{ x: 1000, opacity: 0, easing: cubicIn }} out:scale={{ duration: 200 }} on:click={hide}>
    <h1>{$notification.title}</h1>
    <p>{$notification.description}</p>
  </div>
{/if}

<style lang="sass">

  .notification
    position: fixed
    bottom: 1.4em
    right: 1em
    padding: .7em 1.5em
    background-color: rgba(#121212, .975)
    border-radius: 5px
    box-shadow: -2px 6px 17px 8px rgba(0, 0, 0, .18)
    z-index: 100000
    cursor: pointer
    overflow: hidden
    border-left: 3px solid #fff
    max-width: 35vw
    transition: all .3s

    @media screen and (max-width: 720px)
      max-width: 95vw

    &:hover
      box-shadow: -2px 6px 17px 8px rgba(0, 0, 0, .26)

    h1
      color: #fff
      font-weight: 500
      font-size: 2em
      font-family: "Inter", sans-serif
      margin: 0
        bottom: .2em

    &.error
      border-color: #FF375D

    &.warning
      border-color: #FFD336

    &.success
      border-color: #00D46E

    &.log
      border-color: #B075CD

    p
      color: #fff
      font-size: 1.15em
      margin: 0

</style>