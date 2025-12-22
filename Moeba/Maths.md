# HPIV Protocol : Logique Mathématique & Variables

Ce document détaille les formules exactes utilisées dans le Smart Contract `HPIVVault.sol` pour le calcul du mécanisme de "Soft Default".

## 1. Dictionnaire des Variables (Mapping Code)

Voici la correspondance entre les concepts financiers et les variables techniques du contrat.

| **Concept Financier**              | **Variable Solidity (Code)** | **Valeur Exemple (USDC)** | **Description**                                                                                       |
|------------------------------------|------------------------------|---------------------------|-------------------------------------------------------------------------------------------------------|
| **Capacité Totale**                | `MAX_VAULT_CAPACITY`         | `40,000,000`              | Le montant total d'argent dans le coffre (Assureur + Investisseurs).                                  |
| **Tranche Junior (Assureur)**      | `insurerJuniorCapital` | `4,000,000`               | Le capital déposé par l'assureur. C'est le premier à être consommé en cas de sinistre ("First Loss"). |
| **Tranche Senior (Investisseurs)** | Calculé dynamiquement         | `36,000,000`              | Le capital des utilisateurs. Calculé dynamiquement : `TotalAssets()` - `insurerJuniorCapital`.                 |
| **Montant du Sinistre**            | `MAX_COVERAGE_AMOUNT`        | `20,000,000`              | Le montant que le protocole doit payer pour couvrir la catastrophe.                                   |
| **Ratio de Perte (Haircut)**       | `seniorLossRatio`          | `0.4444...`               | Le pourcentage de perte appliqué aux parts des investisseurs (Format `1e18`).                         |

## 2. Algorithme de Calcul du "Soft Default"

Lorsqu'une catastrophe est validée par l'Oracle (`triggerCatastrophe`), le contrat exécute la logique de "Waterfall" (Cascade) suivante.

### Étape A : Calcul de la perte nette pour les investisseurs

L'assureur agit comme un "bouclier". On soustrait sa part du montant total du sinistre.

`InvestorLossAmount` = max(0, `actualClaimAmount` - `insurerJuniorCapital`)

### Étape B : Calcul du Ratio de Perte (Haircut)

On détermine quel pourcentage du capital des investisseurs a été consommé.

`seniorLossRatio` = `InvestorLossAmount` / `SeniorEquity`

Note technique : Dans Solidity, ce calcul est effectué avec une précision de 18 décimales (`* 1e18`) pour éviter les virgules flottantes.

## 3. Simulation Numérique (Scénario Ouragan)

Basé sur les chiffres du README.

### État Initial

- `MAX_VAULT_CAPACITY` = 40M$

- `insurerJuniorCapital` = 4M$ (10%)

- `SeniorEquity` = 36M$ (90%)

### L'Événement

- L'Oracle détecte un vent > 250km/h.

- `actualClaimAmount` est fixé à **20M$**.

### Exécution du Calcul

1. Absorption par l'Assureur : Les premiers 4M$ du sinistre sont payés par `insurerJuniorCapital`.

2. Reste à charge (Investisseurs) :

    *20,000,000 - 4,000,000 = 16,000,000 USDC*

3. Détermination du Ratio (`seniorLossRatio`) :

    *16,000,000 / 36,000,000 ≃ 0.444444...*

Soit **44.44%**.

## 4. Impact pour un Utilisateur (User Payout)

Voici la formule utilisée dans la fonction `previewRedeem` ou `withdraw` pour savoir combien un utilisateur récupère.

Soit `GROSS_USER_ASSETS` le montant total de l'utilisateur (Principal + Intérêts Yield) avant le sinistre.

`FINAL_PAYOUT` = `GROSS_USER_ASSETS` * (1 - `seniorLossRatio`)

### Exemple Utilisateur

Un utilisateur a **10,000 USDC** dans le vault.

Le Yield a généré 50 USDC d'intérêts → `GROSS_USER_ASSETS` = 10,050 USDC.

La catastrophe survient (`seniorLossRatio` = 0.4444).

`FINAL_PAYOUT` _= 10,050 * (1 - 0.4444)_

`FINAL_PAYOUT` _= 10,050 * 0.5556 = **5,583.78** USDC_

**Conclusion :** L'utilisateur a sauvé ~55% de son capital au lieu de tout perdre.
