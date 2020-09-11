const Arweave = require("arweave");

const arweave = Arweave.init({
  host: "arweave.dev",
  port: 443,
  protocol: "https",
});

const exchangePST = "c25-RdheC6khcACLv23-XXg1W7YuA-VSZ_1_qnNFbhw";
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

supportPST("c25-RdheC6khcACLv23-XXg1W7YuA-VSZ_1_qnNFbhw");
