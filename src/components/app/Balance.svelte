<script lang="ts">
  import { fade } from "svelte/transition";
  import { address, balance, keyfile } from "../../stores/keyfileStore";
  import { theme } from "../../stores/themeStore";
  import { Theme } from "../../utils/types";
  import SkeletonLoading from "../SkeletonLoading.svelte";
  import { notification } from "../../stores/notificationStore";
  import { NotificationType } from "../../utils/types";
  import downArrowIcon from "../../assets/down-arrow.svg";
  import copyIcon from "../../assets/copy.svg";
  import { isVerified, verify } from "arverify";
  import Modal from "../Modal.svelte";

  export let showThemeSwitcher: boolean = false;
  const verified = isVerified($address);
  let hoveredVerify = false,
    verifyModalOpened = false;

  function roundCurrency(val: number | string): string {
    if (val === "?") return val;
    if (typeof val === "string") val = parseFloat(val);
    return val.toFixed(7);
  }

  function copyAddress() {
    const copyElement = document.createElement("textarea");
    copyElement.style.opacity = "0";
    copyElement.value = $address;

    document.body.appendChild(copyElement);
    copyElement.select();
    document.execCommand("copy");
    document.body.removeChild(copyElement);
    notification.notify(
      "Copied",
      "Copied address to clipboard",
      NotificationType.log,
      1000
    );
  }
</script>

<div class="balance">
  {#if $balance === null}
    {#if showThemeSwitcher}
      <div>
        <SkeletonLoading style="height: 1em; width: 120px" />
        <div class="select-container">
          <select class="theme-picker" bind:value={$theme}>
            {#each Object.values(Theme) as themeOption}
              <option value={themeOption}>{themeOption}</option>
            {/each}
          </select>
          <object
            data={downArrowIcon}
            type="image/svg+xml"
            title="select-icon" />
        </div>
      </div>
    {/if}
    <h1 class="total-balance">
      <SkeletonLoading style="height: 1em; width: 300px" />
    </h1>
    <p class="wallet">
      <SkeletonLoading style="height: 1em; width: 400px" />
    </p>
  {:else}
    <div in:fade={{ duration: 150 }}>
      Total balance {#if showThemeSwitcher}
        <div class="select-container">
          <select class="theme-picker" bind:value={$theme}>
            {#each Object.values(Theme) as themeOption}
              <option value={themeOption}>{themeOption}</option>
            {/each}
          </select>
          <object
            data={downArrowIcon}
            type="image/svg+xml"
            title="select-icon" />
        </div>
      {/if}
    </div>
    <h1 class="total-balance" in:fade={{ duration: 150 }}>
      {roundCurrency($balance)}<span style="text-transform: uppercase; font-size: .5em; display: inline-block">Ar</span>
    </h1>
    <p class="wallet" in:fade={{ duration: 150 }}>
      Wallet:
      {#await verified}
        ⏳
      {:then ver}
        <span
          class="verified-emoji"
          on:click={() => {
            if (!ver.verified) verifyModalOpened = true;
          }}
          style={ver.verified ? '' : 'cursor: pointer;'}
          on:mouseover={() => (hoveredVerify = true)}
          on:mouseleave={() => (hoveredVerify = false)}>
          {#if ver.verified}✅{:else}🙅{/if}
          {#if hoveredVerify}
            <div class="verified-tooltip" transition:fade={{ duration: 160 }}>
              {#if ver.verified}
                Verified on ArVerify
              {:else}Not verified on ArVerify. Click to verify!{/if}
            </div>
          {/if}
        </span>
      {/await}
      {$address}<img src={copyIcon} alt="copy-address" on:click={copyAddress} />
    </p>
  {/if}
</div>
<Modal bind:opened={verifyModalOpened} confirmation={true} onConfirm={() => {}}>
  <h1 style="text-align: center;">🤖?</h1>
  <p style="text-align: justify;">
    ArVerify checks to ensure an Arweave wallet address is owned by an actual
    person, not a robot. Verifying promotes trust for person-to-person
    interactions across the network.
  </p>
  <p>Click the URL below to verify your wallet:</p>
  {#await verify(JSON.parse($keyfile)) then verifyURL}
    <a href={verifyURL} target="_blank" rel="noopener noreferer">{verifyURL}</a>
  {/await}
</Modal>

<style lang="sass">

  @import "../../styles/selects.sass"

  .balance
    padding-bottom: 2.5em

    p, div
      display: flex
      align-items: center
      justify-content: space-between
      color: var(--secondary-text-color)
      text-transform: uppercase
      font-size: .9em
      margin: 0
      font-weight: 600

      .select-container
        display: inline-block

      &.wallet
        text-transform: none
        justify-content: normal

        span.verified-emoji
          margin: 0 .32em
          cursor: default
          position: relative

          .verified-tooltip
            position: absolute
            top: 137%
            left: 50%
            background-color: var(--inverted-elements-color)
            padding: .27em .36em
            border-radius: 5px
            color: var(--background-color)
            font-size: .83em
            font-weight: 400
            text-align: center
            text-transform: none
            width: max-content
            max-width: 193px
            display: inline-block
            transform: translateX(-50%)

            &::after
              content: ''
              position: absolute
              bottom: 100%
              left: 50%
              background-color: var(--inverted-elements-color)
              width: .6em
              height: .6em
              z-index: -1
              transform: translate(-50%, 60%) rotate(45deg)

        img
          height: .97em
          filter: var(--svg-color)
          margin-left: .56em
          cursor: pointer
          transition: all .3s

          &:hover
            opacity: .7
        
        @media screen and (max-width: 720px)
          overflow-wrap: anywhere
          max-width: 90vw

    h1.total-balance
      font-size: 2.3em
      color: var(--primary-text-color)
      font-weight: 400
      margin: .14em 0

    @media screen and (max-width: 720px)
      padding-top: .65em !important

</style>
