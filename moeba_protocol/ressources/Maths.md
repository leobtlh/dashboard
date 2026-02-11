# HPIV Protocol — Logique Mathématique & Variables

Ce document décrit la **logique mathématique**, les **variables d'état** et les **formules** implémentées dans le Smart Contract `HPIVVault.sol` et l'interface `app.html`.

Il formalise le mécanisme de **Soft Default**, la gestion des tranches de risque (Junior/Senior) et la protection du capital.

---

## 1. Dictionnaire des Variables (Mapping Code ↔ Finance)

Ce tableau établit la correspondance stricte entre les concepts financiers et les variables Solidity du contrat `HPIVVault.sol`.

| Concept Financier | Variable Solidity (`HPIVVault.sol`) | Description |
| :--- | :--- | :--- |
| **Capacité Totale** | `MAX_CAPACITY` | Montant maximum d'actifs (Principal + Premium) accepté dans le vault. |
| **Couverture Max** | `MAX_COVERAGE` | Montant maximum théorique que le protocole peut indemniser. |
| **Capital Assureur** | `insurerFirstLossCapital` | Capital de "First Loss" déposé par l'assureur pour absorber les premiers chocs. |
| **Réserve de Prime** | `premiumReserve` | Montant sanctuarisé versé par l'assureur, servant de source de rendement et de tampon. |
| **Capital Senior** | `seniorPrincipal` | Somme des dépôts effectués via la fonction standard `deposit()` (ERC4626). |
| **Capital Junior** | `juniorPrincipal` | Somme des dépôts effectués via `depositJunior()` (Token HPIVJunior). |
| **Perte Senior** | `seniorLossPercent` | Ratio de perte appliqué à la tranche Senior (échelle 1e18). |
| **Perte Junior** | `juniorLossPercent` | Ratio de perte appliqué à la tranche Junior (échelle 1e18). |

---

## 2. Mécanique de Rendement (APR) & Tranches

Le rendement est calculé à partir de la `premiumReserve` disponible et distribué de manière asymétrique entre les tranches, selon la logique définie dans `app.html` (fonction `calculatePayoutDetails`).

### 2.1 APR de Base (Théorique)

Le rendement annualisé global du Vault est dérivé de la réserve de prime par rapport au capital total investi.

$$APR_{base} = \left( \frac{premiumReserve}{seniorPrincipal + juniorPrincipal} \right) \times \left( \frac{365}{Duree_{jours}} \right)$$

### 2.2 APR Tranche Senior (Priorité Sécurité)

La tranche Senior accepte un rendement plafonné en échange d'une priorité de remboursement dans la cascade de paiement (`app.html`).

$$APR_{senior} = APR_{base} \times 0.7$$

*Le Senior reçoit 70% du rendement moyen généré.*

### 2.3 APR Tranche Junior (Levier)

La tranche Junior capture le rendement résiduel, bénéficiant d'un effet de levier si le capital Senior est important.

1.  **Rendement Total** : $Yield_{total} = (seniorPrincipal + juniorPrincipal) \times APR_{base}$
2.  **Coût Senior** : $Cost_{senior} = seniorPrincipal \times APR_{senior}$
3.  **Reste Junior** : $Yield_{junior} = Yield_{total} - Cost_{senior}$

$$APR_{junior} = \frac{Yield_{junior}}{juniorPrincipal}$$

---

## 3. Sur-Collatéralisation

Le protocole assure que le capital disponible (hors prime réservée au rendement) couvre le montant du risque.

**Formule de vérification (Solidity) :**
Lors des dépôts, la contrainte suivante est respectée :
`totalAssets() + assets <= MAX_CAPACITY`

**Ratio de Couverture (`app.html`) :**
Si la sur-collatéralisation est activée, le ratio est calculé ainsi :

$$Ratio = \frac{MAX\_CAPACITY - premiumReserve}{MAX\_COVERAGE}$$

Un ratio > 100% indique que le Vault est sur-collatéralisé.

---

## 4. Moteur de Sinistre (Waterfall Engine)

Lors de l'exécution de `triggerCatastrophe(claimAmount)` dans `HPIVVault.sol`, la perte est absorbée séquentiellement par les réserves disponibles.

Soit $RemainingClaim$ le montant du sinistre à couvrir.

### Étape A — Capital Assureur (First Loss)

L'assureur perd ses fonds en priorité absolue.

$$RemainingClaim \leftarrow RemainingClaim - \min(insurerFirstLossCapital, RemainingClaim)$$
$$insurerFirstLossCapital \leftarrow \max(0, insurerFirstLossCapital - Claim)$$

### Étape B — Réserve de Prime (Premium Buffer)

Si le capital assureur ne suffit pas, la réserve de rendement est utilisée.

$$RemainingClaim \leftarrow RemainingClaim - \min(premiumReserve, RemainingClaim)$$
$$premiumReserve \leftarrow \max(0, premiumReserve - Claim)$$

### Étape C — Tranche Junior

Si le sinistre persiste, le principal des investisseurs Junior est impacté.

1.  **Calcul de la perte :** $Loss_{junior} = \min(juniorPrincipal, RemainingClaim)$
2.  **Mise à jour du Principal :** $juniorPrincipal \leftarrow juniorPrincipal - Loss_{junior}$
3.  **Ratio de Perte (On-Chain) :**
    $$juniorLossPercent = \frac{Loss_{junior} \times 1e18}{juniorPrincipal_{initial}}$$

### Étape D — Tranche Senior

La tranche Senior n'est impactée que si le Junior est totalement liquidé.

1.  **Calcul de la perte :** $Loss_{senior} = \min(seniorPrincipal, RemainingClaim)$
2.  **Mise à jour du Principal :** $seniorPrincipal \leftarrow seniorPrincipal - Loss_{senior}$
3.  **Ratio de Perte (On-Chain) :**
    $$seniorLossPercent = \frac{Loss_{senior} \times 1e18}{seniorPrincipal_{initial}}$$

---

## 5. Simulation Numérique — Soft Default

**État Initial du Vault :**
* `insurerFirstLossCapital` = 4,000,000
* `premiumReserve` = 330,000
* `juniorPrincipal` = 5,000,000
* `seniorPrincipal` = 31,000,000
* **Sinistre validé (`claimAmount`)** = 4,500,000

**Exécution de la Waterfall (`triggerCatastrophe`) :**

1.  **Assureur :** Absorbe 4,000,000.
    * `insurerFirstLossCapital` devient 0.
    * Reste à payer : 500,000.
2.  **Prime :** Absorbe 330,000.
    * `premiumReserve` devient 0.
    * Reste à payer : 170,000.
3.  **Junior :** Absorbe 170,000.
    * `juniorPrincipal` devient 4,830,000.
    * `juniorLossPercent` calculé sur la base de la perte.
4.  **Senior :** Intact.
    * `seniorPrincipal` reste 31,000,000.

---

## 6. Calcul du Payout Final (Retrait)

Le montant récupérable par l'utilisateur dépend de sa tranche.

### Retrait Senior
Le retrait Senior suit la logique ERC4626 standard, mais la valeur de la part (share) est impactée par la baisse des actifs totaux (`totalAssets()`).

$$Payout_{senior} = shares \times \frac{totalAssets()}{totalSupply()}$$

### Retrait Junior (`withdrawJunior`)
Le calcul est spécifique via la fonction `_calculateJuniorEquity` dans `HPIVVault.sol`. Le Junior récupère son principal restant plus sa part proportionnelle de la prime restante.

$$Equity_{junior} = juniorPrincipal + \left( \frac{premiumReserve \times juniorPrincipal}{seniorPrincipal + juniorPrincipal} \right)$$

$$Payout_{junior} = \frac{shares \times Equity_{junior}}{totalSupply_{junior}}$$
