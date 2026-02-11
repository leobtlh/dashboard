# Mœba Protocol : Livre Blanc

### Hybrid Parametric Insurance Vault (HPIV)

**Version :** 1.1
**Date :** Janvier 2026
**Siège :** Lausanne, Suisse
**Statut :** Document Technique & Réglementaire

## Avertissement Légal (Disclaimer)

Ce document est fourni à titre informatif uniquement. Il ne constitue pas une offre de vente, une sollicitation d'achat de titres financiers, ou un conseil en investissement. Le protocole Mœba opère sous le cadre de la Loi fédérale sur l'adaptation du droit fédéral aux développements de la technologie des registres électroniques distribués (Loi TRD/DLT) en Suisse. Les investissements dans les Cat Bonds comportent des risques de perte en capital.

## 1. Résumé Exécutif (Abstract)

**Mœba Protocol** est une infrastructure décentralisée d'assurance paramétrique introduisant le standard **HPIV (Hybrid Parametric Insurance Vault)**. Il résout le problème du risque binaire ("Tout ou Rien") inhérent aux Obligations Catastrophe (Cat Bonds) traditionnelles grâce à un mécanisme de "Soft Default".

Contrairement aux solutions existantes réservées aux institutionnels, Mœba permet une segmentation fine du risque. Grâce à une architecture multi-tranches, le protocole sépare les capitaux en deux catégories d'investisseurs distinctes : une tranche **Senior** (prioritaire et protégée) et une tranche **Junior** (à haut rendement), toutes deux sécurisées par un capital "First Loss" apporté par l'assureur.

L'architecture s'appuie sur la norme **ERC-4626** pour la gestion de la liquidité et respecte les exigences de solvabilité du cadre réglementaire suisse (VUSA).

## 2. Le Problème du Marché Actuel

### 2.1 Le Fossé de Protection Climatique

Avec l'intensification des catastrophes naturelles, les assureurs traditionnels manquent de fonds propres pour couvrir l'intégralité des risques de pointe (ouragans, séismes). Ils doivent transférer ce risque aux marchés financiers via la titrisation.

### 2.2 Les Limites Structurelles des Cat Bonds

Le marché actuel souffre de rigidités majeures :
* **Risque Binaire :** Pour l'investisseur, le profil de risque est brutal. Si le seuil de déclenchement est atteint (ex: vent > 250km/h), la totalité du capital est perdue.
* **Absence de granularité :** Il est impossible pour un investisseur de choisir son niveau d'exposition au risque au sein d'une même émission.
* **Inefficience du Capital :** Le modèle traditionnel ne permet pas d'optimiser le rendement en fonction de l'appétit pour le risque.

## 3. La Solution Mœba : Architecture HPIV

Mœba introduit une structure de capital hiérarchisée (Waterfall) qui transforme une perte totale potentielle en une perte partielle absorbée séquentiellement.

### 3.1 La Structure Multi-Tranches

Le capital du Vault est composé de trois couches distinctes, définies dans le Smart Contract `HPIVVault.sol` :

1.  **Sponsor First Loss (Capital Assureur) :**
    C'est la garantie apportée par l'assureur (Sponsor) lors de l'initialisation du Vault. Ce capital est "sacrifié" en priorité absolue en cas de sinistre. Il sert de tampon de sécurité pour tous les investisseurs.

2.  **Tranche Junior (Investisseurs "Yield Seekers") :**
    Cette tranche est destinée aux investisseurs recherchant un rendement élevé. En échange d'un APR boosté, ils acceptent d'absorber les pertes immédiatement après l'épuisement du capital de l'assureur.

3.  **Tranche Senior (Investisseurs "Safety First") :**
    Cette tranche représente la majorité de la liquidité (standard ERC-4626). Elle bénéficie d'une protection maximale : elle n'est impactée que si le capital de l'assureur *et* le capital de la tranche Junior sont intégralement consommés.

### 3.2 Le Mécanisme de "Soft Default" (Waterfall)

En cas de déclenchement validé par l'oracle (`triggerCatastrophe`), le contrat exécute une cascade de paiements stricte :

| Priorité d'Absorption | Source de Liquidité | Conséquence |
| :--- | :--- | :--- |
| **1. First Loss** | Capital Assureur | L'assureur perd sa mise initiale pour protéger le pool. |
| **2. Buffer** | Réserve de Primes | Les rendements non distribués sont utilisés pour combler le sinistre. |
| **3. Absorption** | Tranche Junior | Le capital des investisseurs Junior est utilisé pour payer le reste du sinistre. |
| **4. Dernier Recours** | Tranche Senior | Les investisseurs Senior ne paient que si toutes les couches précédentes sont épuisées. |

### 3.3 Exemple Mathématique

*Scénario : Un Vault de 40M$ subit un sinistre de 8M$.*

* **Structure du Vault :**
    * Capital Assureur (First Loss) : 4M$
    * Capital Investisseurs Junior : 5M$
    * Capital Investisseurs Senior : 31M$

* **Calcul de la répartition des pertes :**
    1.  L'assureur paie les premiers **4M$**. (Reste à payer : 4M$)
    2.  La Tranche Junior paie les **4M$** restants.
    3.  La Tranche Senior ne paie **0$**.

* **Résultat :**
    * L'Assureur perd 100% de son dépôt de sécurité.
    * Les Investisseurs Junior subissent une perte de 80% (4M$ sur 5M$).
    * Les Investisseurs Senior conservent 100% de leur capital.

## 4. Modèle Économique & Rendement

Le protocole génère du rendement (Yield) grâce aux primes d'assurance payées par le Sponsor pour accéder à la liquidité. Ce rendement est distribué de manière asymétrique pour rémunérer le risque.

### 4.1 Origine du Rendement
L'assureur verse une prime (Premium) au début de la période de couverture. Cette somme est verrouillée dans le contrat (`premiumReserve`) et constitue la source unique de rendement garanti.

Note technique : Le protocole dispose d'une interface `IStrategy` permettant techniquement de placer le capital dormant (float) sur des protocoles tiers (ex: Aave), mais le rendement principal provient de la prime de risque assurantielle.

### 4.2 Distribution Dynamique (Yield Splitting)

Le mécanisme de distribution favorise la tranche Junior pour compenser son exposition au risque (Effet de Levier).

* **APR Senior (Plafonné) :**
    La tranche Senior reçoit un rendement correspondant à 70% du rendement de base moyen du Vault. Ce "sacrifice" de rendement paie pour la sécurité offerte par les tranches inférieures.
    *Formule : APR_Senior = APR_Moyen × 0.7*

* **APR Junior (Levier) :**
    La tranche Junior capte le reliquat des primes. Puisque la tranche Senior ne prend que 70% du rendement, les 30% restants (générés par le capital Senior) sont redirigés vers la tranche Junior. Cela crée un effet de levier mécanique, permettant aux investisseurs Junior de viser des rendements largement supérieurs au marché, proportionnels à la taille de la liquidité Senior qu'ils protègent.

## 5. Infrastructure Technique

### 5.1 Smart Contracts

Le système repose sur une architecture modulaire et sécurisée :

* **`HPIVVault.sol` (Le Cœur) :** Ce contrat gère la tranche Senior sous le standard **ERC-4626**, assurant une composabilité totale avec la DeFi. Il orchestre la machine à états (Pending, Open, Active, Matured, Triggered) et exécute la logique de Waterfall.
* **`HPIVJuniorToken.sol` :** Un token ERC-20 standard représentant les parts de la tranche Junior. Il est piloté exclusivement par le Vault principal.
* **`HPIVFactory.sol` :** L'usine de déploiement qui standardise la création des Vaults et gère le registre des assureurs certifiés (Whitelist/KYB).

### 5.2 Oracles et Sécurité

Le déclenchement est automatisé via des oracles chain-agnostic. Pour garantir l'intégrité financière :
* **Protection Anti-Inflation :** Le contrat implémente le minting de "Dead Shares" à l'initialisation pour prévenir les attaques par donation (inflation attack) communes aux Vaults ERC-4626.
* **Sur-Collatéralisation :** Le Vault vérifie mathématiquement que `TotalAssets >= Capacité` avant d'accepter tout dépôt, garantissant que le risque est toujours financé à 100% (Fully Funded).

## 6. Cadre Juridique & Réglementaire (Suisse)

Mœba est conçu pour opérer en conformité avec la réglementation suisse stricte mais favorable à l'innovation.

### 6.1 Véhicule à Usage Spécifique d'Assurance (VUSA)
Le protocole structure chaque Vault comme un instrument de titrisation conforme à l'article 30e de la Loi sur la Surveillance des Assurances (LSA). Le risque est isolé et intégralement financé, supprimant le risque de crédit pour l'assuré.

### 6.2 Droits-Valeurs Inscrits (Loi DLT)
Les parts de Vault (Senior et Junior) sont qualifiées de droits-valeurs inscrits selon l'article 973d du Code des Obligations. La blockchain fait office de registre officiel de propriété, offrant une sécurité juridique aux investisseurs institutionnels sans nécessiter de dépositaire central traditionnel.

### 6.3 Conformité Investisseur
L'accès aux tranches d'investissement peut être restreint (Whitelisting) pour se conformer aux exigences LBA (Lutte contre le Blanchiment d'Argent) et pour bénéficier des exemptions de prospectus prévues par la LSFin pour les investisseurs qualifiés ou professionnels.

## 7. Roadmap

* **Q3 2026 :** Audit de sécurité des contrats `HPIVVault` et `HPIVFactory`.
* **Q4 2026 :** Lancement du Testnet avec simulation des oracles (USGS/NOAA).
* **Q1 2027 :** Déploiement Mainnet du premier Vault Pilote ("Florida Wind").
* **Q2 2027 :** Ouverture du marché secondaire pour l'échange des parts Junior/Senior.
* **Q4 2027 :** Transition vers une gouvernance DAO pour la gestion des paramètres de risque.

## 8. Conclusion

Mœba Protocol démocratise l'accès à la classe d'actifs des Cat Bonds. En introduisant une tranche Junior accessible et une tranche Senior protégée, le protocole aligne les intérêts de toutes les parties : les assureurs obtiennent de la capacité, les investisseurs audacieux obtiennent du rendement, et les investisseurs prudents obtiennent de la sécurité. C'est l'assurance paramétrique repensée pour l'ère de la DeFi.
