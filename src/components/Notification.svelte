<script>
  import {
    notification,
    NotificationType,
  } from "../stores/notificationStore.ts";
  import { cubicIn } from "svelte/easing";
  import { fly, scale, fade } from "svelte/transition";
  import errorIcon from "../assets/notification/error.svg";
  import warningIcon from "../assets/notification/warning.svg";
  import successIcon from "../assets/notification/success.svg";
  import infoIcon from "../assets/notification/info.svg";
  import closeIcon from "../assets/notification/close.svg";

  let timeout = null,
    hover = false;

  $: notificationClass =
    $notification === null
      ? ""
      : Object.keys(NotificationType).find(
          (key) => NotificationType[key] === $notification.type
        );

  function hide() {
    notification.remove();
    timeout = null;
  }

  $: {
    if ($notification !== null && timeout === null)
      timeout = setTimeout(hide, $notification.timeout);
  }
</script>

<!-- prettier-ignore -->
<style lang="sass">

  .notification
    position: fixed
    bottom: 1.4em
    right: 1em
    padding: .7em 1em
    background-color: rgba(#121212, .975)
    border-radius: 5px
    box-shadow: -2px 6px 17px 8px rgba(0, 0, 0, .18)
    z-index: 100000
    cursor: pointer
    overflow: hidden
    max-width: 35vw
    display: flex
    align-items: center
    transition: all .3s

    @media screen and (max-width: 720px)
      max-width: 95vw

    img.notification-icon
      margin-right: .8em
      height: 1.2em

    &:hover
      box-shadow: -2px 6px 17px 8px rgba(0, 0, 0, .26)

    .notification-content
      h1
        margin: 0
          bottom: .3em
        font-size: 1.05em
        font-weight: 400

        &.error
          color: #FF375D

        &.warning
          color: #FFD336

        &.success
          color: #00D46E

        &.log
          color: #F2F2F2

      p
        color: #fff
        font-size: 1.05em
        margin: 0
        font-weight: 400

</style>

{#if $notification !== null}
  <div
    class="notification {notificationClass}"
    in:fly={{ x: 1000, opacity: 0, easing: cubicIn }}
    out:scale={{ duration: 200 }}
    on:click={hide}
    on:mouseover={() => (hover = true)}
    on:mouseleave={() => (hover = false)}>
    {#if hover}
      <img
        class="notification-icon"
        src={closeIcon}
        alt="close-notification"
        in:fade={{ duration: 300 }} />
    {:else}
      <img
        class="notification-icon"
        src={notificationClass === 'error' ? errorIcon : notificationClass === 'warning' ? warningIcon : notificationClass === 'success' ? successIcon : infoIcon}
        alt={notificationClass}
        in:fade={{ duration: 300 }} />
    {/if}
    <div class="notification-content">
      <h1 class={notificationClass}>[{$notification.title}]</h1>
      <p>{$notification.description}</p>
    </div>
  </div>
{/if}
