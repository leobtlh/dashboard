# Gabarti DeFi Protocol - Guide d'Utilisation

Ce protocole en ligne de commande (CLI) permet de suivre tes positions
DeFi. Il combine la flexibilité d'un fichier Excel (Mode Web2) avec la
puissance de la blockchain (Mode Web3).

## Mode Web2 : Gestion Manuelle (Comme Excel)

Ce mode te permet de saisir tes positions manuellement. Le programme
calcule automatiquement tes rendements journaliers (d), hebdomadaires
(w), mensuels (m) et annuels (y), exactement comme dans ton tableau
"Positions.csv".

### 1. Ajouter une position (add-position)

C'est la commande principale. Voici la structure à taper dans le
terminal :

``` bash
python main.py add-position [PROTOCOLE] [ASSET] [COLLATERAL] [DETTE] [APR_COLLATERAL] [APR_DETTE]
```

Détail des variables à renseigner :

PROTOCOL (Texte) : Le nom du protocole (ex: Aave, Morpho, Euler). Mettre
entre guillemets si le nom contient des espaces.

ASSET (Texte) : L'actif principal ou la stratégie (ex: wstETH, USDC,
eUSD).

COLLATERAL (Nombre) : La valeur totale en USD de tes actifs déposés.

Exemple : Si tu as déposé 10 ETH à 2500\$, écris 25000.

DETTE (Nombre) : La valeur totale en USD de ton emprunt.

Important : Cette valeur doit être negative pour que le calcul de la Net
Value soit correct.

APR_COLLATERAL (Décimal) : Le taux d'intérêt que tu gagnes sur ton
dépôt.

APR_DETTE (Décimal) : Le taux d'intérêt que tu paies sur ta dette.

Exemple concret :

Tu as une position sur Morpho avec 15000 USD de wstETH déposés, tu as
emprunté -8700 USD d'USDC. Tu gagnes 3% sur le wstETH et tu paies 1.5%
sur l'USDC.

``` bash
python main.py add-position Morpho wstETH 15000 8700 0.03 0.015
```

### 2. Voir mes positions (web2)

``` bash
python main.py web2
```

## Mode Web3 : Scan Automatique

Ce mode se connecte directement à la blockchain. Il scanne le contenu de
ton portefeuille.

### Prérequis

Assure-toi d'avoir configuré ton accès RPC dans le fichier .env.

### Commande de connexion (web3)

``` bash
python main.py web3 [ADRESSE_ETHEREUM]
```

Détail de la variable :

ADRESSE_ETHEREUM : L'adresse publique de ton wallet.

Exemple :

``` bash
python main.py web3 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Ce que le scan Web3 fait :

Il interroge la blockchain Ethereum en temps réel. Il récupère ton solde
d'ETH natif. Il récupère tes soldes de tokens ERC20 définis dans le
fichier web3_scan.py. Il affiche un tableau avec les quantités trouvées.
