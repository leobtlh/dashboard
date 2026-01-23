# HPIV Protocol — Logique Mathématique & Variables

Ce document décrit précisément la **logique mathématique**, les **variables financières** et les **formules** implémentées dans le Smart Contract `HPIVVault.sol`.
Il formalise le mécanisme de **Soft Default**, la gestion des tranches de risque et la protection du rendement des investisseurs.

---

## 1. Dictionnaire des Variables (Mapping Code ↔ Finance)

Ce tableau établit la correspondance entre les **concepts financiers** et les **variables Solidity** utilisées dans le protocole.

| Concept Financier              | Variable Solidity      | Valeur Exemple (USDC) | Description                                                                |
| ------------------------------ | ---------------------- | --------------------- | -------------------------------------------------------------------------- |
| Capacité Totale du Vault       | `MAX_VAULT_CAPACITY`   | 40,330,000            | Capital total présent dans le vault (capital à risque + réserve de primes) |
| Capital à Risque               | `RiskCapital`          | 40,000,000            | Capital mobilisable pour payer les sinistres (tranches Senior + Junior)    |
| Tranche Junior (Assureur)      | `insurerJuniorCapital` | 4,000,000             | Capital de première perte déposé par l’assureur                            |
| Tranche Senior (Investisseurs) | `SeniorEquity`         | 36,000,000            | Capital des investisseurs exposé au risque                                 |
| Réserve de Prime               | `premiumReserve`       | 330,000               | Réserve sanctuarisée dédiée au rendement, non affectée par les sinistres   |
| Plafond de Couverture          | `MAX_COVERAGE_AMOUNT`  | 40,000,000            | Montant maximum théorique que le protocole peut indemniser                 |

La réserve de prime (`premiumReserve`) est strictement exclue du capital à risque et ne peut jamais être utilisée pour indemniser un sinistre.

---

## 2. Mécanisme Indemnitaire à Double Déclencheur (Dual Trigger)

Le paiement d’un sinistre n’est pas binaire. Il repose sur deux conditions cumulatives :

1. **Déclencheur physique**
   Validation on-chain d’un événement mesurable (ex. ouragan catégorie > 4, vent > 250 km/h), via oracle.

2. **Perte financière réelle**
   Montant effectivement subi par l’assureur, déclaré sous la variable `actualClaimAmount`.

### 2.1 Formule du Payout à l’Assureur

Le paiement effectif est plafonné par la capacité réelle du protocole.

```
Payout = min(RiskCapital, actualClaimAmount)
```

---

## 3. Mécanisme de Soft Default (Waterfall de Pertes)

Une fois le `Payout` déterminé, la perte est répartie par priorité entre les tranches.

### 3.1 Étape A — Absorption Junior (Assureur)

```
JuniorLoss = min(insurerJuniorCapital, Payout)
```

### 3.2 Étape B — Absorption Senior (Investisseurs)

```
SeniorLoss = Payout - JuniorLoss
```

### 3.3 Étape C — Ratio de Perte (Haircut Investisseurs)

```
SeniorLossRatio = SeniorLoss / SeniorEquity
```

---

## 4. Simulation Numérique — Scénario de Dégâts Limités

### 4.1 État Initial du Vault

* RiskCapital = 40,000,000 USDC
* insurerJuniorCapital = 4,000,000 USDC
* SeniorEquity = 36,000,000 USDC
* premiumReserve = 330,000 USDC

### 4.2 Événement Déclencheur

* Déclencheur oracle : validé
* Perte réelle déclarée (actualClaimAmount) : 5,000,000 USDC

### 4.3 Exécution du Calcul

```
Payout = min(40,000,000 ; 5,000,000) = 5,000,000
JuniorLoss = min(4,000,000 ; 5,000,000) = 4,000,000
SeniorLoss = 5,000,000 − 4,000,000 = 1,000,000
SeniorLossRatio = 1,000,000 / 36,000,000 ≈ 2.77 %
```

### 4.4 Bilan Investisseur

* Perte limitée à environ 2.77 % du capital
* Conservation intégrale de la réserve de prime
* Possibilité d’un rendement net positif malgré le sinistre

---

## 5. Calcul du Payout Final Utilisateur

```
FINAL_PAYOUT = GROSS_USER_ASSETS × (1 − SeniorLossRatio)
```

---

## 6. Conclusion Mathématique

| Modèle                  | Gain Potentiel | Perte Maximale |
| ----------------------- | -------------- | -------------- |
| Cat Bonds traditionnels | ~15 %          | 100 %          |
| HPIV (Soft Default)     | ~15 %          | ≈ 44 %         |

Ce modèle transforme un produit à risque binaire en produit à risque asymétrique contrôlé.
