const Arweave = require('arweave');

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

const key = "MY JSON KEY OBJECT";

async function supportPST(pstContractID) {
  let pstTransaction = await arweave.createTransaction({
    data: pstContractID
  }, key);

  pstTransaction.addTag("Content-Type", "text/html");
  pstTransaction.addTag("Exchange", "Verto");
  pstTransaction.addTag("Support", "PST");

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

supportPST("FcM-QQpfcD0xTTzr8u4Su9QCgcvRx_JH4JSCQoFi6Ck");