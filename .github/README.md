<p align="center">
  <a href="https://verto.exchange">
    <img src="../static/logo_light.svg" alt="Verto logo (dark version)" width="110">
  </a>

  <h3 align="center">Verto</h3>

  <p align="center">
    A decentralized PST exchange for Arweave
 </p>
</p>

## About
This is the front-end/app for the PST exchange service. It is built in Svelte(Sapper), JS and TS. We use the export feature of Sapper to create an arweave-deployable app.

You can access the code for trading posts [here](https://github.com/t8/coinary-trading-post).

## Guide
To build/use the service on localhost, you will have to download Node, and install the yarn package manager (`npm i -g yarn`). When you have these, clone this repository and run `yarn install` to add the required dependencies. 
Below, you will see the available commands to test/build the project.

### Libraries
We use the arweave-js library with Svelte/Sapper. You can read more about these in their github repos.

### Debug
This will start the app with live reload, according to the rollup config
```sh
yarn run dev
```

### Export
This will export the app to static html/css/js to `__sapper__/export`
```sh
yarn run export
```

### Special Thanks
- [Sam Williams](https://twitter.com/samecwilliams)