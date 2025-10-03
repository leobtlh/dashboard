-- Moeba-Dolo :

[ Emprunteur ]
|-- demande prêt 0%
        ↓
[ Smart Contract ]
|-- Vérifie collatéral ≥ 2x
|-- Crée prêt à 0% APR
|-- Déclenche emprunt externe
        ↓
[ Aave / Morpho ]
|-- prêt réel généré (recherche du meilleur taux)
        ↓
[ Module Stratégie DeFi ]
|-- Efface les intérêts
|-- Génère surplus
        ↓
[ Distribution des excédents ]
|-- Stratèges (implémentation)
|-- Fournisseurs de liquidité (si dépôt)
        ↑
[ Investisseurs externes ]
|-- Déposent fonds dans une stratégie
|-- Reçoivent surplus (APR variable)


-- Architecture du Projet
-- 1. Emprunteur
--
--     Action : Demande un prêt à 0% APR.
--     Condition : Doit fournir un collatéral ≥ 2x le montant demandé.
--
-- 2. Smart Contract
--
--     Vérifie que le collatéral est suffisant.
--     Crée un prêt à 0% APR.
--     Déclenche un emprunt externe via Aave ou Morpho.
--
-- 3. Aave / Morpho
--
--     Recherche du meilleur taux d’intérêt.
--     Génère le prêt réel (avec intérêt).
--     Les fonds sont transférés au smart contract.
--
-- 4. Module Stratégie DeFi
--
--     Utilise les fonds empruntés, ainsi que les fonds des investisseurs externe,
--     pour générer du rendement.
--     Efface les intérêts du prêt via les gains.
--     Génère un surplus (rendement > intérêts).
--
-- 5. Distribution des Excédents
--
--     Stratèges : Reçoivent une part du surplus pour leur rôle.
--     Fournisseurs de liquidité : Reçoivent une part si dépôt dans la stratégie.
--
-- 6. Investisseurs externes
--
--     Déposent des fonds dans la stratégie.
--     Reçoivent un rendement variable (APR) basé sur le surplus généré.


-- ✅ 1. Sécurisation & Gestion du Collatéral
-- Actuellement, le collatéral est simplement stocké dans le contrat. Il faut :
--
--  Gérer les tokens ERC20 comme collatéral (ex : WETH, DAI).
--  Intégrer un oracle de prix (ex : Chainlink) pour vérifier la valeur réelle du collatéral.
--  Ajouter une fonction de liquidation si la valeur du collatéral chute sous un seuil critique.
--
--
-- ✅ 2. Intégration complète avec Aave/Morpho
-- Tu utilises déjà borrow() d’Aave, mais il manque :
--
--  La fonction repay() (actuellement appelée mais non définie dans l’interface).
--  La gestion des tokens ERC20 (ex : DAI) au lieu d’ETH natif.
--  Une logique pour choisir dynamiquement entre Aave et Morpho selon le meilleur taux.
--
--
-- ✅ 3. Module Stratégie DeFi
-- C’est le cœur du modèle économique :
--
--  Créer un module séparé (contrat ou bibliothèque) pour gérer les stratégies.
--  Implémenter une stratégie simple (ex : dépôt sur Yearn, Compound, etc.).
--  Ajouter une interface pour que les stratèges puissent proposer ou modifier des stratégies.
--
--
-- ✅ 4. Gestion des investisseurs externes
--
--  Permettre aux investisseurs de déposer des fonds dans une stratégie.
--  Suivre leur part dans le pool (via un token ERC20 représentant leur part).
--  Distribuer les surplus générés proportionnellement.
--
--
-- ✅ 5. Distribution des excédents
--
--  Implémenter une logique de partage du surplus :
--
-- % pour les stratèges
-- % pour les investisseurs
-- % pour la trésorerie du protocole (optionnel)
--
--
--  Ajouter une fonction de retrait pour les investisseurs.
--
--
-- ✅ 6. Interface utilisateur (frontend)
--
--  Créer une dApp simple avec :
--
-- Formulaire de demande de prêt
-- Visualisation des prêts actifs
-- Dépôt dans les stratégies
-- Suivi des rendements
--
--
--
--
-- ✅ 7. Sécurité & Tests
--
--  Écrire des tests unitaires (Hardhat, Foundry, etc.).
--  Ajouter des modificateurs de sécurité (ex : onlyOwner, nonReentrant).
--  Préparer pour un audit si tu vises un déploiement réel.


-- cd frontend
-- npm install
-- npm run dev  # ou npm start selon le setup


-- Demander un prêt:
-- node cli.js requestLoan 1 2 0xCLEPRIVEE https://sepolia.infura.io/v3/XXXX
--
-- Rembourser un prêt:
-- node cli.js repayLoan 1 0xCLEPRIVEE https://sepolia.infura.io/v3/XXXX

