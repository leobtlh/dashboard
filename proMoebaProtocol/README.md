# Mœba Protocol | Hybrid Parametric Insurance Vault (HPIV)

**Mœba Protocol** est une infrastructure décentralisée d'assurance paramétrique sur Ethereum et EVM-chains. Elle introduit le standard **HPIV** (Hybrid Parametric Insurance Vault) pour résoudre le problème du risque binaire ("Tout ou Rien") des Cat Bonds traditionnels.

Grâce à une architecture basée sur **ERC-4626** et une segmentation du capital en tranches (Junior/Senior), le protocole permet un **"Soft Default"** : en cas de catastrophe, les pertes sont absorbées prioritairement par l'assureur, protégeant ainsi le capital des investisseurs.

---

## Fonctionnalités Clés

* **Soft Default Mechanism** : Fini le risque binaire. Une architecture en cascade (Waterfall) absorbe les pertes hiérarchiquement.
* **Multi-Tranche Architecture** :
    * **Senior Tranche (ERC-4626)** : Risque réduit, pour les fournisseurs de liquidité (LPs).
    * **Junior Tranche (ERC-20)** : Risque élevé ("First Loss"), pour les assureurs/sponsors.
* **Sur-Collatéralisation** : Le vault est "Fully Funded" pour garantir la solvabilité technique sans risque de contrepartie.
* **Swiss Compliant Architecture** : Conçu pour s'aligner avec le cadre VUSA (Véhicule à Usage Spécifique d'Assurance) et la Loi DLT suisse.
* **Multi-Chain Agnostic** : Compatible Ethereum, Base, Polygon, Arbitrum.

---

## Architecture Technique

Le protocole repose sur trois Smart Contracts principaux (Solidity `^0.8.20`) et une DApp autonome.

### 1. Smart Contracts

* **`HPIVVault.sol` (Le Cœur)**
    * Implémente le standard **ERC-4626** pour la gestion de la Tranche Senior.
    * Gère la machine à états du cycle de vie : `PENDING` → `OPEN` → `ACTIVE` → `MATURED` / `TRIGGERED`.
    * Contient la logique de **Waterfall** pour la distribution des sinistres (`triggerCatastrophe`).
    * Intègre une protection contre les attaques d'inflation (minting de "Dead Shares" à l'initialisation).

* **`HPIVJuniorToken.sol`**
    * Token ERC-20 standard avec `AccessControl`.
    * Représente la part "Risque" du capital.
    * Entièrement piloté (mint/burn) par le contrat `HPIVVault`.

* **`HPIVFactory.sol`**
    * Usine de déploiement pour standardiser la création de nouveaux Vaults.
    * Gère la **Whitelist des Assureurs** et le registre KYB (Know Your Business) via hachage IPFS.
    * Assure que seuls les acteurs certifiés peuvent déployer des instruments de couverture.

### 2. Le Mécanisme de Waterfall (Soft Default)

La fonction `triggerCatastrophe` dans `HPIVVault.sol` définit l'ordre précis d'absorption des pertes en cas de sinistre validé par l'oracle.

| Priorité | Source de Liquidité | Description |
| :--- | :--- | :--- |
| **1. First Loss** | Capital Assureur | Le capital déposé par le sponsor est consommé en premier. |
| **2. Buffer** | Premium Reserve | Les primes (rendements) non distribuées servent de tampon. |
| **3. Absorption** | Tranche Junior | Les détenteurs de tokens Junior perdent leur capital. |
| **4. Dernier Recours** | Tranche Senior | Les investisseurs Senior ne sont impactés que sur le reliquat. |

> **Résultat Mathématique :** Si un sinistre de 5M$ frappe un Vault de 10M$ (dont 2M$ Junior), l'investisseur Senior ne subit qu'une perte réduite (37.5%) au lieu de 50%, grâce à l'absorption préalable par la Tranche Junior (qui assume la "First Loss" en échange d'un APR supérieur).

---

## Frontend & DApp

L'interface utilisateur (`app.html`) est une Single Page Application (SPA) construite avec React et Tailwind, conçue pour interagir directement avec les contrats sans backend centralisé.

* **Rôles Utilisateurs** :
    * **Investisseur** : Dépôt/Retrait Senior & Junior, visualisation APR dynamique.
    * **Assureur** : Déploiement de Vaults via la Factory, gestion KYB.
    * **Dashboard** : Interface servant à regrouper et visualiser rapidement l'ensemble de ses investissements.
    * **Oracles** : Interface regroupant les dérnières données récupérées via les oracles et leurs répercutions sur les vaults.
* **Analytics** : Graphiques de risques (Recharts) et calculs de rendement en temps réel.

---

## Installation et Démarrage

Le projet est conçu pour être léger. Le frontend est contenu dans un fichier unique pour faciliter l'audit et le déploiement IPFS.

### Prérequis

* Un navigateur moderne.
* Un portefeuille Web3 (Rabby, MetaMask, Zerion, etc).

### Lancer l'Application

**Lien simulation :** *https://moeba-protocol.vercel.app/* \
Possibilité d'utiliser un wallet de simulation automatiquement whitelisté assureur :
* *'Connecter Wallet' + 'Autres Wallets' + 'Simulation Wallet'*

### Contrats

Les contrats se trouvent dans le dossier `/app`.
  * **Sous les noms :** `HIPVVault.sol` et `HPIVFactory.sol`.
  * La Factory sert à instancier de nouveaux Vaults.

---

## Avertissement & Conformité

Ce code est une implémentation de référence (Proof of Concept).
Bien que l'architecture respecte les principes de la **Loi DLT suisse** (Droits-Valeurs Inscrits) et les exigences de capital pour les **VUSA** (Véhicules à Usage Spécifique d'Assurance), il n'a pas fait l'objet d'un audit de sécurité complet. Utilisez à vos propres risques.
