# Gabarti DeFi Protocol - Guide d'Utilisation

Ce guide décrit comment utiliser les principales commandes du tableau de bord DeFi en ligne de commande.

## 1. Créer une position (Exemple Lending)

```bash
python main.py add-lending Aave ETH 3000 1000 0.04 0.02
```

Note : Pour la dette, mets une valeur positive (ici 1000).  
Le système sait automatiquement que c'est une dette parce que la position est un type "Lending".

## 2. Voir le tableau de bord (List)

```bash
python main.py list
```

L'affichage montre toutes les positions avec leurs IDs (1, 2, ...).

## Logiciel interne (logic.py)

```python
import pandas as pd

def calc_simple_yield(amount, apr):
    y = amount * apr
    return {
        "Net Value": amount,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }

def calc_lending_yield(collateral, debt, apr_col, apr_debt):
    debt_val = -abs(debt)
    net_value = collateral + debt_val
    y = (collateral * apr_col) - (abs(debt) * apr_debt)
    return {
        "Net Value": net_value,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }

def calc_loop_yield(investment, leverage, apr_supply, apr_borrow):
    total_supply = investment * leverage
    total_debt = total_supply - investment
    y = (total_supply * apr_supply) - (total_debt * apr_borrow)
    return {
        "Net Value": investment,
        "Total Exposure": total_supply,
        "Total Debt": -total_debt,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }

def calc_lp_yield(val_token_a, val_token_b, apr):
    total_tvl = val_token_a + val_token_b
    y = total_tvl * apr
    return {
        "Net Value": total_tvl,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }

def calc_delta_neutral(long_pos, short_pos, apr_long, apr_short):
    net_val = long_pos - short_pos
    y = (long_pos * apr_long) - (short_pos * apr_short)
    return {
        "Net Value": net_val,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }
```

## 3. Voir le détail "Expert" (View)

```bash
python main.py view 1
```

Affiche :

- Un panneau supérieur avec les informations générales.
- Deux colonnes distinctes :
  - À gauche : le Collatéral, son APR, et son évolution par rapport au dépôt initial.
  - À droite : la Dette, son APR, et le total cumulé des intérêts payés (en rouge).
- En bas : l'historique complet des actions (création, update, remboursements).

## 4. Faire vivre la position (Edit)

```bash
python main.py edit 1
```

Deux choix :

### Choix 1 : Actualiser Valeurs  
Exemple : ta dette passe de 1000 à 1005.  
Tu entres 1005.  
Le logiciel calcule automatiquement 5 d'intérêts et les ajoute dans la colonne correspondante.

### Choix 2 : Opération de Caisse  
Exemple : ajout de 500 de collatéral.  
Tu entres +500.  
Le logiciel met à jour le collatéral sans toucher aux intérêts accumulés.

## 5. Supprimer une position

```bash
python main.py delete 1
```

Supprime complètement la position.

