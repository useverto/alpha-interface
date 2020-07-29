<script lang="ts">

  import NavBar from "../components/NavBar.svelte";
  import Hero from "../components/home/Hero.svelte";
  import LatestTrades from "../components/home/LatestTrades.svelte";
  import About from "../components/home/About.svelte";
  import Footer from "../components/Footer.svelte";

</script>

<NavBar blur={true} />
<Hero />
<LatestTrades />
<About>
  <h1 class="title">What are PSTs?</h1>
  <p class="about-description">Profit Sharing Tokens, or PSTs, are a new incentivization mechanism for the open web that allow developers to earn a stream of micro-dividends for the duration their application is used. (<a href="https://medium.com/@arweave/profit-sharing-tokens-a-new-incentivization-mechanism-for-an-open-web-1f2532411d6e">Source</a>)<br><br>In order for PSTs to have value, however, they need to be able to be exchanged for other PSTs or AR. This is where coinary comes in...</p>
</About>
<About>
  <h1 class="title">Why Coinary?</h1>
  <p class="about-description">Coinary is a completely decentralized network of trading posts built on top of the blockweave. Anyone can host their own trading post and power the exchange, while also being incentivized to do so. With coinary, you can pick the trading post you'd like to use and exchange your PSTs freely!<br><br>Decisions for coinary are made by our very own PST DAO, which means that anyone can have a say in the direction of our platform.</p>
</About>
<Footer />