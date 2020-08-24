const Arweave = require('arweave');

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

const key = "KEY HERE";

async function pstTransfer(pstContractID) {
  let pstTransaction = await arweave.createTransaction({
    data: "test"
  }, key);

  pstTransaction.addTag("Content-Type", "text/html");
  pstTransaction.addTag("Exchange", "Verto");
  pstTransaction.addTag("Input", `{"function":"transfer","target":"l-x7026roC1dkAmJ5iWhz4vGOxVnKmotGbceFAA-NwE","qty":10000}`);
  pstTransaction.addTag("Contract", pstContractID);

  try {
    await arweave.transactions.sign(pstTransaction, key);
  } catch (err) {
    console.log(err);
  }

  try {
    const response = await arweave.transactions.post(pstTransaction);
    console.log(response.status);
  } catch (err) {
    console.log(err);
  }
}

pstTransfer("c25-RdheC6khcACLv23-XXg1W7YuA-VSZ_1_qnNFbhw");