// src/pages/Home.jsx
import React from 'react';
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">ZeroAPR Protocol</h1>
      <p className="mb-6">
        Empruntez à 0% APR en déposant un collatéral sécurisé. Notre protocole utilise Aave/Morpho pour générer des rendements et effacer les intérêts.
      </p>
      <section>
        <h2 className="text-2xl font-semibold mb-2">Comment ça marche ?</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Déposez un collatéral ≥ 2x le montant emprunté.</li>
          <li>Le smart contract emprunte via Aave/Morpho.</li>
          <li>Les intérêts sont couverts par les stratégies DeFi.</li>
          <li>Vous remboursez le montant emprunté sans intérêts.</li>
          <li>Recevez les excédents générés par les stratégies.</li>
        </ol>
      </section>
      <a href="/dashboard" className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Accéder à la dApp
      </a>
    </div>
  );
}
