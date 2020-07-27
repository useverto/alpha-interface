<script lang="ts"></script>

<div class="Login">
  <div class="instructions">
    <div class="content">
      <h1>Sign in to <span>coinary</span></h1>
      <p>To sign in, just drag and drop your Arweave Key file on this page. <br><br>If you don’t yet have a key file, you can get one by creating an Arweave Wallet</p>
      <p class="notice">Your Arweave Key file does not leave your system.</p>
    </div>
  </div>
  <div class="arweave-login"></div>
</div>

<style lang="sass">

  .Login
    height: 100vh
    background-color: #000
    display: flex

    .instructions, .arweave-login
      position: relative
      width: 50vw
      height: 50vw

      .content
        position: absolute
        width: 80%

    .instructions
      background-color: #121212

      .content
        top: 10%
        left: 50%
        transform: translateX(-50%)

        h1
          font-family: "Inter", sans-serif
          font-weight: 600
          color: #fff
          text-align: center
          font-size: 2.5em
          margin-bottom: 1.8em

          span
            background: -webkit-linear-gradient(#9300B8, #C54DFD, #E1A1FF)
            -webkit-background-clip: text
            -webkit-text-fill-color: transparent

        p
          font-size: 1.3em
          line-height: 1.7rem
          text-align: justify
          color: #fff

        p.notice
          font-size: .75em
          color: #828282
          margin-top: 4em
          text-align: center

</style>