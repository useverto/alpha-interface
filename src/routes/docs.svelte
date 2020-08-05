<script lang="typescript">

  import NavBar from "../components/NavBar.svelte";
  import Footer from "../components/Footer.svelte";
  import { fade } from "svelte/transition";

</script>

<NavBar />
<div class="docs" in:fade={{ duration: 400 }}>
  <h1>Documentation</h1>
  <div class="docs-paragraph">
    <h1 class="title">How to use?</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis eaque repudiandae minus dicta dignissimos assumenda, non amet. Facere neque sunt velit quibusdam expedita modi temporibus obcaecati aspernatur. Consequuntur, quos nostrum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, modi deleniti. Placeat odio ea id natus cum possimus repudiandae! Ducimus ex laborum provident quam velit quia, officia ipsam delectus vero.</p>
  </div>
  <div class="docs-paragraph">
    <h1 class="title">Question?</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis eaque repudiandae minus dicta dignissimos assumenda, non amet. Facere neque sunt velit quibusdam expedita modi temporibus obcaecati aspernatur. Consequuntur, quos nostrum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, modi deleniti. Placeat odio ea id natus cum possimus repudiandae! Ducimus ex laborum provident quam velit quia, officia ipsam delectus vero.</p>
  </div>
  <div class="docs-paragraph">
    <h1 class="title">Anything else?</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis eaque repudiandae minus dicta dignissimos assumenda, non amet. Facere neque sunt velit quibusdam expedita modi temporibus obcaecati aspernatur. Consequuntur, quos nostrum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, modi deleniti. Placeat odio ea id natus cum possimus repudiandae! Ducimus ex laborum provident quam velit quia, officia ipsam delectus vero.</p>
  </div>
  <div class="docs-paragraph">
    <h1 class="title">Another question?</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis eaque repudiandae minus dicta dignissimos assumenda, non amet. Facere neque sunt velit quibusdam expedita modi temporibus obcaecati aspernatur. Consequuntur, quos nostrum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, modi deleniti. Placeat odio ea id natus cum possimus repudiandae! Ducimus ex laborum provident quam velit quia, officia ipsam delectus vero.</p>
  </div>
  <div class="docs-paragraph">
    <h1 class="title">Last one</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis eaque repudiandae minus dicta dignissimos assumenda, non amet. Facere neque sunt velit quibusdam expedita modi temporibus obcaecati aspernatur. Consequuntur, quos nostrum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, modi deleniti. Placeat odio ea id natus cum possimus repudiandae! Ducimus ex laborum provident quam velit quia, officia ipsam delectus vero.</p>
  </div>
</div>
<Footer />

<style lang="sass">

  .docs
    padding: 2.5em 15vw 3em

    h1
      font-size: 2.35em
      font-weight: 400
      margin: 1.65em 0 1.2em

    .docs-paragraph
      margin: 1.8em 0

      h1.title
        font-size: 2em
        font-weight: 600
        margin: 0 0 .7em 0

      p
        font-size: 1em
        line-height: 1.5em
        margin: 0
        text-align: justify

</style>