<script lang="typescript">
  import Notification from "../components/Notification.svelte";
  import GoogleAnalytics from "sapper-google-analytics/GoogleAnalytics.svelte";
  import { stores } from "@sapper/app";

  const ga_measurment_id = "UA-177614485-1";

</script>

<GoogleAnalytics {stores} id={ga_measurment_id}/>
<Notification />
<main>
  <slot />
</main>
