# coinary-frontend
Token Exchange Frontend for Arweave Profit Sharing Tokens

## About
This is the front-end/app for the PST exchange service. It is built in Svelte(Sapper), JS and TS. We use the export feature of Sapper to create an arweave-deployable app.

## Guide
To build/use the service on localhost, you will have to download Node, and install the yarn package manager (`npm i -g yarn`). When you have these, clone this repository and run `yarn install` to add the required dependencies. 
Below, you will see the available commands to test/build the project.

### Libraries
We use the arweave-js library with Svelte/Sapper. You can read more about these in their github repos.

### Debug
```sh
yarn run dev
```

### Export to static site
```sh
yarn run export
```