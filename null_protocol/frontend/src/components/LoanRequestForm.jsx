import React, { useState } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../utils/contractABI.js';

export default function LoanRequestForm() {
  const [amount, setAmount] = useState('');
  const [collateral, setCollateral] = useState('');
  const [status, setStatus] = useState('');

  async function requestLoan() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const amountWei = ethers.utils.parseEther(amount);
      const collateralWei = ethers.utils.parseEther(collateral);
      const tx = await contract.requestLoan(amountWei, { value: collateralWei });
      setStatus('Transaction en cours...');
      await tx.wait();
      setStatus('✅ Prêt demandé avec succès !');
    } catch (error) {
      setStatus('❌ Erreur : ' + error.message);
    }
  }

  return (
    <div>
      <h3>Demander un prêt à 0% APR</h3>
      <input
        type="text"
        placeholder="Montant emprunté (ETH)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Collatéral (ETH, ≥ 2x montant)"
        value={collateral}
        onChange={e => setCollateral(e.target.value)}
      />
      <button onClick={requestLoan}>Demander</button>
      <p>{status}</p>
    </div>
  );
}
