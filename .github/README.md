<p align="center">
  <a href="https://verto.exchange">
    <img src="../static/logo_light.svg" alt="Verto logo (dark version)" width="110">
  </a>

  <h3 align="center">Verto</h3>

  <p align="center">
    A decentralized PST exchange for Arweave
  </p>

  <p align="center">
    <a href="https://gitopia.org/#/pvPWBZ8A5HLpGSEfhEmK1A3PfMgB_an8vVS6L14Hsls/Verto-test">
      <img src="https://img.shields.io/endpoint?style=&url=https://gitopia.org/mirror-badge.json" alt="Gitopia Badge">
    </a>
  </p>
</p>

## About

This is the front-end/app for the PST exchange service. It is built in Svelte(Sapper) and TypeScript. We use the export feature of Sapper to create an arweave-deployable app.

You can access the code for trading posts [here](https://github.com/useverto/trading-post).

> Important Notice: Verto is in its Alpha stage. If you have a suggestion, idea, or find a bug, please report it! The Verto team will not be held accountable for any funds lost.

## Guide

To build/use the service on localhost, you will have to download Node, and install the yarn package manager (`npm i -g yarn`). When you have these, clone this repository and run `yarn` to add the required dependencies.
Below, you will see the available commands to test/build the project.

### Libraries

We use the [arweave-js](https://github.com/ArweaveTeam/arweave-js) library with [Svelte/Sapper](https://github.com/sveltejs/sapper). You can read more about these in their github repos.

### Debug

This will start the app with live reload, according to the rollup config

```sh
yarn dev
```

### Export

This will export the app to static html/css/js to `__sapper__/export`

```sh
yarn export
```

## Special Thanks

- [Sam Williams](https://twitter.com/samecwilliams)
- [Cedrik Boudreau](https://github.com/cedriking)
- [Aidan O'Kelly](https://github.com/aidanok)

## How to deploy

To deploy the app on Arweave, the [@verto/deploy](https://github.com/useverto/deploy) is needed. See the docs there.

## License

The code contained within this repository is licensed under the MIT license.
See [`./LICENSE`](../LICENSE) for more information.
