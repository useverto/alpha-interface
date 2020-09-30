<script lang="typescript">
  import Notification from "../components/Notification.svelte";
  import GoogleAnalytics from "sapper-google-analytics/GoogleAnalytics.svelte";
  import { stores } from "@sapper/app";
  import { displayTheme } from "../stores/themeStore";
  import { DisplayTheme } from "../utils/types";

  const ga_measurment_id = "UA-177614485-1";
</script>

<GoogleAnalytics stores="{stores}" id="{ga_measurment_id}" />
<Notification />
<main
  style="
    --text-color: {$displayTheme === DisplayTheme.Dark ? '#fff' : '#000'};
    --background-color: {$displayTheme === DisplayTheme.Dark ? '#000' : '#fff'};
  ">
  <slot />
</main>

<style global lang="sass">

  main
    background-color: var(--background-color)

</style>