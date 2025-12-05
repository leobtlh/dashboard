# logic.py
import pandas as pd

# logic.py
def calc_simple_yield(amount, apr):
    """Pour: Wallet, Vault, Governance (veToken), Staking simple"""
    y = amount * apr
    return {
        "Net Value": amount,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }

def calc_lending_yield(collateral, debt, apr_col, apr_debt):
    """Pour: Emprunts standards, Aave, Morpho"""
    # La dette arrive en positif, on la convertit en négatif pour le calcul de Net Value
    debt_val = -abs(debt)
    net_value = collateral + debt_val

    # Gain du collateral - Coût de la dette
    y = (collateral * apr_col) - (abs(debt) * apr_debt)

    return {
        "Net Value": net_value,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }

def calc_loop_yield(investment, leverage, apr_supply, apr_borrow):
    """Pour: Looping, Folding (ex: 3x ETH sur Aave)"""
    # Si leverage 3x : J'ai 1000$ (investment).
    # Total Supply = 3000$ (Investment * Leverage)
    # Total Debt = 2000$ (Total Supply - Investment)

    total_supply = investment * leverage
    total_debt = total_supply - investment

    y = (total_supply * apr_supply) - (total_debt * apr_borrow)

    return {
        "Net Value": investment, # Mon equity réelle
        "Total Exposure": total_supply,
        "Total Debt": -total_debt,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }

def calc_lp_yield(val_token_a, val_token_b, apr):
    """Pour: Liquidity Providing (Uniswap, Curve, Aerodrome)"""
    total_tvl = val_token_a + val_token_b
    y = total_tvl * apr
    return {
        "Net Value": total_tvl,
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }

def calc_delta_neutral(long_pos, short_pos, apr_long, apr_short):
    """Pour: Strategies Delta Neutral"""
    # Souvent Long = Short pour ne pas être exposé au prix
    net_val = long_pos - short_pos
    y = (long_pos * apr_long) - (short_pos * apr_short)
    return {
        "Net Value": net_val, # Devrait être proche de 0 ou égal au capital initial buffer
        "y": y, "m": y/12, "w": y/52, "d": y/365
    }
