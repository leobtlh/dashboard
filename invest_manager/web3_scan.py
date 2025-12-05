# web3_scan.py
from web3 import Web3
import json

# RPC URL (A remplacer par ton propre noeud Infura/Alchemy ou public)
RPC_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# ABI Minimaliste pour ERC20 (juste balanceOf et decimals)
ERC20_ABI = '[{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"}]'

# Adresses connues (Tu devras remplir cette liste avec les tokens de ton Excel)
TOKENS = {
    "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "WSTETH": "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"
    # Ajoute ici les adresses de Morpho, Euler, etc.
}

def scan_wallet(address):
    """
    Scanne les balances et retourne une liste de positions formatée.
    """
    if not w3.is_connected():
        return [{"Error": "Impossible de se connecter à la Blockchain"}]

    address = w3.to_checksum_address(address)
    positions = []

    # 1. Scan ETH Natif
    eth_balance = w3.eth.get_balance(address)
    if eth_balance > 0:
        positions.append({
            "Protocol": "Wallet",
            "Asset": "ETH",
            "Type": "Collateral", # Ou simple holding
            "Amount": w3.from_wei(eth_balance, 'ether'),
            "Value USD": float(w3.from_wei(eth_balance, 'ether')) * 2500 # Prix hardcodé pour l'exemple, à connecter à une API de prix
        })

    # 2. Scan Tokens ERC20
    for name, token_addr in TOKENS.items():
        contract = w3.eth.contract(address=token_addr, abi=ERC20_ABI)
        try:
            bal = contract.functions.balanceOf(address).call()
            decimals = contract.functions.decimals().call()
            if bal > 0:
                amount = bal / (10 ** decimals)
                positions.append({
                    "Protocol": "Wallet",
                    "Asset": name,
                    "Type": "Liquidity",
                    "Amount": amount,
                    "Value USD": amount * 1.0 # Prix fictif, il faut un oracle
                })
        except Exception as e:
            print(f"Erreur sur {name}: {e}")

    return positions

# NOTE: Pour Morpho/Aave, il faut appeler les contrats "Lens" ou "UiPoolDataProvider"
# qui renvoient toute la position (dette + collateral) d'un coup.
