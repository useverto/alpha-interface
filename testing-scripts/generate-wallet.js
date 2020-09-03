const Arweave = require("arweave");

const arweave = Arweave.init({
  host: "arweave.dev",
  port: 443,
  protocol: "https",
});

arweave.wallets.generate().then(key => {
  console.log(key);
});