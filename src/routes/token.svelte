<script lang="typescript">
  import { keyfile } from "../stores/keyfileStore";
  import Arweave from "arweave";
  import Community from "community-js";
  import Verto from "@verto/lib";
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import SkeletonLoading from "../components/SkeletonLoading.svelte";

  let client = new Verto();
  const arweaveClient = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });
  let communityID: string = "";
  let community: Community = null;
  let state;

  if (process.browser) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("id") === null) goto("/tokens");
    communityID = params.get("id");
  }

  async function initCommunity() {
    // @ts-expect-error
    community = new Community(arweaveClient);
    await community.setCommunityTx(communityID);
    state = await community.getState();
  }

  onMount(async () => {
    client = new Verto(JSON.parse($keyfile));
  });

  const update = () => {
    client = new Verto(JSON.parse($keyfile));
  };

  async function cName(): Promise<string> {
    await initCommunity();
    return state.name;
  }

  const communityName: Promise<string> = cName();

  async function cLogo(): Promise<string> {
    await communityName;
    return state.settings.get("communityLogo");
  }

  const communityLogo: Promise<string> = cLogo();
</script>

<svelte:head>
  <title>Verto — Token</title>
</svelte:head>

<NavBar {update} />

<div class="token">
  <div class="token-head">
    <div class="logo">
      {#await communityLogo}
        <SkeletonLoading />
      {:then loadedLogo}
        <img
          class="logo"
          src={`https://arweave.net/${loadedLogo}`}
          alt="Community Logo" />
      {/await}
    </div>
    <h1 class="title">
      {#await communityName}
        <SkeletonLoading />
      {:then loadedName}
        {loadedName}
      {/await}
    </h1>
  </div>
</div>

<Footer />

<style lang="sass">
  @import "../styles/general.sass"

  .token 
    @include page

    @media screen and (max-width: 720px)
      padding-top: 2em
  
    .token-head
      display: flex
      margin-bottom: 2em

      @media screen and (max-width: 720px)
        display: block

      h1.title
        margin: 0

        @media screen and (max-width: 720px)
          font-size: 1.35em
          margin-bottom: .3em

      .logo
        width: 2.3em
        height: 2.3em
        border-radius: 100000px
        margin-top: 2px
        margin-right: 15px

        @media screen and (max-width: 720px)
          width: 1.35em
          height: 1.35em

        img
          width: 100%
          height: 100%

</style>
