import json
import os
import datetime
from uuid import uuid4

DB_FILE = "portfolio_db.json"

def load_portfolio():
    if not os.path.exists(DB_FILE): return []
    with open(DB_FILE, 'r') as f: return json.load(f)

def save_portfolio(data):
    with open(DB_FILE, 'w') as f: json.dump(data, f, indent=4)

def create_position(category, protocol, asset, collateral, debt, apr_col, apr_debt, extra={}):
    """Crée une nouvelle position avec un historique vide."""
    portfolio = load_portfolio()

    # ID simple (1, 2, 3...) pour faciliter la CLI
    new_id = len(portfolio) + 1

    position = {
        "id": new_id,
        "date_creation": datetime.date.today().isoformat(),
        "category": category,
        "protocol": protocol,
        "asset": asset,
        "current_state": {
            "collateral": float(collateral),
            "debt": float(debt), # Stocké en POSITIF ici pour simplifier, traité comme dette par la catégorie
            "apr_col": float(apr_col),
            "apr_debt": float(apr_debt)
        },
        "stats": {
            "total_interest_paid": 0.0,
            "initial_collateral": float(collateral),
            "initial_debt": float(debt)
        },
        "history": [
            {
                "date": datetime.date.today().isoformat(),
                "action": "CREATION",
                "details": f"Ouverture position. Collat: {collateral}$, Dette: {debt}$"
            }
        ],
        **extra
    }

    portfolio.append(position)
    save_portfolio(portfolio)
    return new_id

def get_position(pos_id):
    portfolio = load_portfolio()
    for p in portfolio:
        if p['id'] == int(pos_id):
            return p
    return None

def update_position_valuation(pos_id, new_collateral_val, new_debt_val):
    """
    Mise à jour 'Mark to Market'.
    Si la dette augmente sans qu'on ait emprunté, c'est des intérêts.
    Si le collatéral change sans dépôt, c'est le prix.
    """
    portfolio = load_portfolio()
    for p in portfolio:
        if p['id'] == int(pos_id):
            old_debt = p['current_state']['debt']
            old_col = p['current_state']['collateral']

            # Calcul des intérêts (Différence de dette)
            # Note: Si new_debt > old_debt, la différence est l'intérêt accumulé
            debt_diff = new_debt_val - old_debt
            if debt_diff > 0:
                p['stats']['total_interest_paid'] += debt_diff

            p['current_state']['collateral'] = new_collateral_val
            p['current_state']['debt'] = new_debt_val

            # Log
            p['history'].append({
                "date": datetime.date.today().isoformat(),
                "action": "UPDATE VALEUR",
                "details": f"Update Prix/Intérêts. Dette +{debt_diff:.2f}$"
            })
            save_portfolio(portfolio)
            return p
    return None

def update_position_flow(pos_id, col_change, debt_change):
    """
    Mise à jour 'Cashflow'.
    J'ai ajouté du collatéral (Deposit) ou Remboursé de la dette (Repay).
    """
    portfolio = load_portfolio()
    for p in portfolio:
        if p['id'] == int(pos_id):
            p['current_state']['collateral'] += col_change
            p['current_state']['debt'] += debt_change # debt_change est positif si j'emprunte plus

            action_type = "MODIFICATION"
            if col_change > 0: action_type = "DEPOSIT"
            elif col_change < 0: action_type = "WITHDRAW"
            elif debt_change < 0: action_type = "REPAY"
            elif debt_change > 0: action_type = "BORROW"

            p['history'].append({
                "date": datetime.date.today().isoformat(),
                "action": action_type,
                "details": f"Col: {col_change:+.2f}$, Debt: {debt_change:+.2f}$"
            })
            save_portfolio(portfolio)
            return p
    return None

def delete_position_logic(pos_id):
    portfolio = load_portfolio()
    new_portfolio = [p for p in portfolio if p['id'] != int(pos_id)]
    save_portfolio(new_portfolio)
