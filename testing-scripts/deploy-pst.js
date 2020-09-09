const Arweave = require("arweave");

const arweave = Arweave.init({
  host: "arweave.dev",
  port: 443,
  protocol: "https",
});

const exchangePST = "fE2OcfjlS-sHqG5K8QvxE8wHtcqKxS-YV0bDEgxo-eI";
const key = "MY JSON KEY OBJECT";

async function supportPST(pstContractID) {
  let pstTransaction = await arweave.createTransaction(
    {
      data: pstContractID,
    },
    key
  );

  pstTransaction.addTag("Content-Type", "text/html");
  pstTransaction.addTag("Exchange", "Verto");
  pstTransaction.addTag("Type", "PST");
  pstTransaction.addTag("Contract", exchangePST);

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
