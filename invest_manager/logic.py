# logic.py
import pandas as pd

def calculate_yields(collateral_value, debt_value, apr_collateral, apr_debt):
    """
    Réplique la logique de ton Excel pour calculer les rendements (y, m, w, d).
    Net Value = Collateral - Debt
    """
    net_value = collateral_value + debt_value # Debt is usually negative in your sheet

    # Calcul du rendement annuel net estimé (en $)
    # Yield = (Collateral * APR_Collat) + (Debt * APR_Debt)
    # Note: Dans ton excel, la dette est négative, donc si le taux d'emprunt coûte,
    # assure-toi que APR_Debt est traité correctement (coût vs revenu).

    yearly_yield = (collateral_value * apr_collateral) + (debt_value * apr_debt)

    return {
        "Net Value": net_value,
        "APR Net": yearly_yield / net_value if net_value != 0 else 0,
        "y": yearly_yield,
        "m": yearly_yield / 12,
        "w": yearly_yield / 52,
        "d": yearly_yield / 365
    }

def simulate_loop(asset_initial, leverage, borrow_rate, supply_rate):
    """
    Réplique la logique de 'Loops.csv'.
    """
    # Exemple simplifié de boucle
    total_supplied = asset_initial * leverage
    total_borrowed = total_supplied - asset_initial

    supply_income = total_supplied * supply_rate
    borrow_cost = total_borrowed * borrow_rate

    net_profit_annual = supply_income - borrow_cost
    roi = net_profit_annual / asset_initial

    return {
        "Initial": asset_initial,
        "Leverage": leverage,
        "Profits": net_profit_annual,
        "ROI": roi,
        "APR": roi # Dans ce cas simple
    }
