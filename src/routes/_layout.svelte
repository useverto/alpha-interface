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
    --primary-text-color: {$displayTheme === DisplayTheme.Dark ? 'rgba(255, 255, 255, .837)' : '#000'};
    --secondary-text-color: {$displayTheme === DisplayTheme.Dark ? 'rgba(255, 255, 255, .3)' : 'rgba(0, 0, 0, .3)'};
    --darker-secondary-text-color: {$displayTheme === DisplayTheme.Dark ? 'rgba(255, 255, 255, .5)' : 'rgba(0, 0, 0, .5)'};
    --inverted-elements-color: {$displayTheme === DisplayTheme.Dark ? 'rgba(255, 255, 255, .94)' : '#000'};
    --nav-scrolled: {$displayTheme === DisplayTheme.Dark ? 'rgba(0, 0, 0, .73)' : 'rgba(255, 255, 255, .7)'};
    --nav-border: {$displayTheme === DisplayTheme.Dark ? 'rgba(255, 255, 255, .2)' : 'rgba(0, 0, 0, .075)'};
    --svg-color: {$displayTheme === DisplayTheme.Dark ? 'invert(90%)' : 'unset'};
    --background-color: {$displayTheme === DisplayTheme.Dark ? '#000' : '#fff'};
  ">
  <slot />
</main>

<style global lang="sass">

  main
    background-color: var(--background-color)

  \:global(h1.title)
    color: var(--primary-text-color)

</style>
