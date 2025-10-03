// cli.js
// ------------------------------------------------------------
// Script CLI pour interagir avec le smart contract ZeroAPRLoan
// ------------------------------------------------------------
// Commandes supportées :
//   node cli.js approve <amount> <privateKey> <rpcUrl>
//   node cli.js requestLoan <amountStable> <collateralEth> <privateKey> <rpcUrl>
//   node cli.js repayLoan <privateKey> <rpcUrl>
//
// Exemple :
//   node cli.js approve 1000 0xPRIVATEKEY https://rpc-url
//   node cli.js requestLoan 1000 2 0xPRIVATEKEY https://rpc-url
//   node cli.js repayLoan 0xPRIVATEKEY https://rpc-url
// ------------------------------------------------------------

import { ethers } from "ethers";
import { contractAddress, contractABI, stableTokenAddress, stableABI } from "./contractABI.js";

// ------------------------------------------------------------
// Fonction utilitaire : initialise provider, wallet et contrat
// ------------------------------------------------------------
function init(privateKey, rpcUrl) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  const stableToken = new ethers.Contract(stableTokenAddress, stableABI, wallet);
  return { provider, wallet, contract, stableToken };
}

// ------------------------------------------------------------
// 1. Approve (permettre au contrat de dépenser mes tokens DAI/USDC)
// ------------------------------------------------------------
async function approve(amountStable, privateKey, rpcUrl) {
  const { stableToken } = init(privateKey, rpcUrl);
  const amountWei = ethers.utils.parseUnits(amountStable, 18); // 18 décimales pour DAI/USDC
  const tx = await stableToken.approve(contractAddress, amountWei);
  console.log("Transaction approve envoyée:", tx.hash);
  await tx.wait();
  console.log(`✅ Autorisation réussie pour ${amountStable} stablecoins`);
}

// ------------------------------------------------------------
// 2. RequestLoan (déposer collatéral ETH + demander prêt en stablecoin)
// ------------------------------------------------------------
async function requestLoan(amountStable, collateralEth, privateKey, rpcUrl) {
  const { contract } = init(privateKey, rpcUrl);

  const amountWei = ethers.utils.parseUnits(amountStable, 18); // Montant demandé en stablecoin
  const collateralWei = ethers.utils.parseEther(collateralEth); // Collatéral en ETH

  const tx = await contract.requestLoan(amountWei, { value: collateralWei });
  console.log("Transaction requestLoan envoyée:", tx.hash);
  await tx.wait();
  console.log(`✅ Prêt demandé : ${amountStable} stablecoins avec ${collateralEth} ETH en collatéral`);
}

// ------------------------------------------------------------
// 3. RepayLoan (rembourser le prêt en stablecoin)
// ------------------------------------------------------------
async function repayLoan(privateKey, rpcUrl) {
  const { contract } = init(privateKey, rpcUrl);

  const tx = await contract.repayLoan();
  console.log("Transaction repayLoan envoyée:", tx.hash);
  await tx.wait();
  console.log("✅ Prêt remboursé, collatéral restitué");
}

// ------------------------------------------------------------
// Main CLI handler
// ------------------------------------------------------------
async function main() {
  const [,, command, ...args] = process.argv;

  try {
    if (command === "approve") {
      const [amountStable, privateKey, rpcUrl] = args;
      await approve(amountStable, privateKey, rpcUrl);

    } else if (command === "requestLoan") {
      const [amountStable, collateralEth, privateKey, rpcUrl] = args;
      await requestLoan(amountStable, collateralEth, privateKey, rpcUrl);

    } else if (command === "repayLoan") {
      const [privateKey, rpcUrl] = args;
      await repayLoan(privateKey, rpcUrl);

    } else {
      console.log("❌ Commande inconnue");
      console.log("Usage:");
      console.log("  node cli.js approve <amountStable> <privateKey> <rpcUrl>");
      console.log("  node cli.js requestLoan <amountStable> <collateralEth> <privateKey> <rpcUrl>");
      console.log("  node cli.js repayLoan <privateKey> <rpcUrl>");
    }
  } catch (error) {
    console.error("Erreur:", error.message);
  }
}

main();
