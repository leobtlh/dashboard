# Mœba Protocol : Livre Blanc

### Hybrid Parametric Insurance Vault (HPIV)

**Version :** 1.0

**Date :** Décembre 2025

**Siège :** Lausanne, Suisse

**Statut :** Draft Technique & Réglementaire

## Avertissement Légal (Disclaimer)

Ce document est fourni à titre informatif uniquement. Il ne constitue pas une offre de vente, une sollicitation d'achat de titres financiers, ou un conseil en investissement. Le protocole Mœba opère sous le cadre de la Loi fédérale sur l'adaptation du droit fédéral aux développements de la technologie des registres électroniques distribués (Loi TRD/DLT) en Suisse. Les investissements dans les Cat Bonds comportent des risques de perte en capital.

## 1. Résumé Exécutif (Abstract)

**Mœba Protocol** est la première infrastructure décentralisée d'assurance paramétrique introduisant le concept de **"Soft Default"** pour les Obligations Catastrophe (Cat Bonds).

Le marché actuel des Cat Bonds (100Md$+) est réservé aux institutionnels et souffre d'un défaut structurel majeur : le risque binaire ("Tout ou Rien"). Si une catastrophe survient, l'investisseur perd 100% de son capital.

Mœba résout ce problème grâce à une architecture de **Vaults Hybrides (HPIV)** sur Ethereum, combinant :

1. **Tranches de Risque :** Une protection du capital investisseur par une tranche "Junior" apportée par l'assureur.

2. **Sur-Collatéralisation :** Un ratio de couverture >100% permettant d'absorber les chocs.

3. **Conformité Suisse :** Une structure juridique de type VUSA (Véhicule à Usage Spécifique d'Assurance) tokenisée sous forme de Droits-Valeurs Inscrits.

## 2. Le Problème du Marché Actuel

### 2.1 Le Fossé de Protection Climatique

Avec l'intensification des catastrophes naturelles (ouragans, séismes), les assureurs traditionnels manquent de capital pour couvrir les risques. Ils doivent se tourner vers les marchés financiers pour transférer ce risque.

### 2.2 L'Inefficience des Cat Bonds Traditionnels

- **Barrière à l'entrée :** Ticket minimum souvent > 10M$.

- **Risque Binaire :** Si le vent dépasse 250km/h, l'obligation tombe à zéro. C'est un profil de risque trop agressif pour la majorité des investisseurs.

- **Manque de Liquidité :** Les fonds sont bloqués (lock-up) pendant 1 à 3 ans sans marché secondaire fluide.

## 3. La Solution Mœba : Architecture HPIV

### 3.1 Le Mécanisme de "Soft Default"

Mœba remplace la perte totale par une perte partielle calculée. En cas de catastrophe, la perte est d'abord absorbée par l'assureur lui-même (Skin in the Game).

### Structure du Capital d'un Vault Mœba :

- **Tranche Junior (10% - First Loss) :** Apportée par l'Assureur (Sponsor). C'est le capital consommé en premier.

- **Tranche Senior (90% - Protected) :** Apportée par les Investisseurs (Liquidité). Elle n'est touchée que si la Tranche Junior est épuisée.

### 3.2 Exemple Mathématique (Scénario Ouragan)

_Données basées sur le Smart Contract `HPIVVault.sol`._

- **Capacité du Vault :** 40M USDC

- **Capital Junior (Assureur) :** 4M USDC (10%)

- **Sinistre à payer (Claim) :** 20M USDC

### Calcul du Payout Investisseur :

1. L'assureur paie les premiers 4M$.

2. Reste à charge pour le pool : 16M$.

3. Perte sur la Tranche Senior (Haircut) : 16M / 36M = **44.44%**.

    **Résultat :** Au lieu de perdre 100% de leur mise comme dans un Cat Bond classique, les investisseurs Mœba récupèrent **55.56%** de leur capital (+ les intérêts acquis), transformant un défaut total en un défaut partiel gérable.

## 4. Modèle Économique & Rendement (Yield)

Le protocole génère un **Double Yield** (Rendement Composé) pour les investisseurs, visant un APR cible de ~15-20%.

### Source 1 : Base Yield (RWA) - ~5%

Conformément à la stratégie de trésorerie, 80% des fonds non utilisés (idle funds) dans le Vault sont alloués à des actifs sans risque (Bons du Trésor US tokenisés ou protocoles de lending Aave/Compound sécurisés).

### Source 2 : Insurance Premium - ~10-15%

L'assureur paie une prime (Premium) pour accéder à la liquidité du Vault. Cette prime est versée upfront dans le Smart Contract et distribuée linéairement aux investisseurs de la Tranche Senior.

## 5. Infrastructure Technique

### 5.1 Smart Contracts (Solidity)

L'architecture repose sur le standard **ERC-4626** (Tokenized Vaults) pour assurer une composabilité maximale avec la DeFi (possibilité d'utiliser les parts de vault comme collatéral ailleurs).

- `HPIVFactory.sol` : Usine déployant des instances de vaults isolées. Chaque risque (ex: "Florida Wind 2026") est un contrat distinct pour éviter la contagion.

- `HPIVVault.sol` : Contrat principal gérant les dépôts, le verrouillage de la Tranche Junior, et la logique de redistribution post-sinistre.

### 5.2 Oracles & Déclencheurs Paramétriques

Le déclenchement des paiements ne dépend pas d'un humain, mais de données vérifiables on-chain.

- **Sources :** NOAA (Météo), USGS (Séismes), JMA (Japon).

- **Consensus :** Agrégation de 3 sources pour éviter la manipulation.

- **Trigger :** Si `Valeur > Seuil` (ex: Vent > 250km/h), la fonction `triggerCatastrophe()` active le mode retrait pour l'assureur et le calcul du haircut pour les investisseurs.

## 6. Cadre Juridique & Réglementaire (Suisse)

Mœba est ancré en Suisse pour bénéficier du cadre **DLT (Distributed Ledger Technology)** le plus avancé au monde.

### 6.1 Véhicule à Usage Spécifique d'Assurance (VUSA)

Le protocole opère non pas comme une compagnie d'assurance (soumise à des exigences de fonds propres massives), mais comme un véhicule de titrisation (Insurance-Linked Securities).

- **Conformité :** Art. 30e de la Loi sur la Surveillance des Assurances (LSA).

- **Avantage :** Le risque est "Fully Funded" (entièrement collatéralisé). Il n'y a pas de risque de crédit sur l'entité Mœba.

### 6.2 Droits-Valeurs Inscrits (Ledger-based Securities)

Les tokens émis par les Vaults sont qualifiés juridiquement selon l'**Art. 973d du Code des Obligations**. La blockchain fait foi de registre de propriété. Le transfert du token vaut transfert légal de la créance, offrant une sécurité juridique totale aux investisseurs institutionnels.

## 7. Roadmap

- **Q3 2025 :** Finalisation des Smart Contracts & Audit de Sécurité.

- **Q4 2025 :** Lancement du Testnet (Goerli/Sepolia) avec Oracles simulés.

- **Q1 2026 :** Mainnet Launch - Premier Vault Pilote ("Florida Wind").

- **Q2 2026 :** Intégration du marché secondaire pour le trading des parts de Vault.

- **Q4 2026 :** Transition vers une gouvernance DAO pour la validation des nouveaux Assureurs (Whitelisting).

## 8. Conclusion

Mœba Protocol ne se contente pas de mettre des assurances sur la blockchain. Il redéfinit le partage du risque. En alignant les intérêts des assureurs (via la Tranche Junior) et en protégeant le capital des investisseurs (via le Soft Default), Mœba rend la classe d'actifs des Cat Bonds enfin accessible, liquide et transparente.

### Risque Climatique. Sécurisé par la Blockchain.
