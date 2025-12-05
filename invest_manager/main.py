# main.py
import typer
import json
import os
from rich.console import Console
from rich.table import Table
from logic import calculate_yields, simulate_loop
from web3_scan import scan_wallet

app = typer.Typer()
console = Console()
DB_FILE = "database.json"

def load_db():
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.command()
def web2():
    """Mode Web2: Gestion manuelle des investissements."""
    console.print("[bold green]Connecté en Mode Web2 (Base de données locale)[/bold green]")
    # Simulation d'un login
    user = typer.prompt("Nom d'utilisateur")
    console.print(f"Bienvenue, {user}. Chargement de tes positions manuelles...")

    positions = load_db()
    display_positions(positions)

@app.command()
def add_position(protocol: str, asset: str, collateral: float, debt: float, apr_col: float, apr_debt: float):
    """Ajouter manuellement une position (Style Excel)."""
    data = load_db()

    # FIX: On s'assure que la dette est bien négative, même si l'utilisateur entre un nombre positif
    real_debt = -abs(debt)

    # Calcul automatique des yields avec la dette corrigée
    metrics = calculate_yields(collateral, real_debt, apr_col, apr_debt)

    new_pos = {
        "Protocol": protocol,
        "Asset": asset,
        "Collateral": collateral,
        "Debt": real_debt, # On enregistre la valeur négative
        "APR": apr_col,
        **metrics
    }

    data.append(new_pos)
    save_db(data)
    console.print(f"[bold blue]Position ajoutée sur {protocol} avec une dette de {real_debt}$ ![/bold blue]")
    display_positions(data)

@app.command()
def web3(address: str):
    """Mode Web3: Scan on-chain automatique."""
    console.print(f"[bold purple]Connexion Web3... Scan de l'adresse {address}[/bold purple]")

    with console.status("[bold green]Scanning Blockchain...[/bold green]"):
        found_positions = scan_wallet(address)

    # Ici on pourrait fusionner avec la DB locale si besoin
    display_positions(found_positions)

def display_positions(positions):
    if not positions:
        console.print("[yellow]Aucune position trouvée.[/yellow]")
        return

    table = Table(title="Gabarti DeFi Strategies - Positions")

    # Colonnes basées sur ton fichier positions.csv
    table.add_column("Protocol", style="cyan")
    table.add_column("Asset", style="magenta")
    table.add_column("Net Value ($)", justify="right")
    table.add_column("APR", justify="right")
    table.add_column("Daily Yield ($)", justify="right", style="green")
    table.add_column("Yearly Yield ($)", justify="right", style="green")

    total_value = 0
    total_daily = 0

    for pos in positions:
        # Gestion des clés différentes entre Web2 et Web3 scan pour l'affichage
        net_val = pos.get("Net Value", pos.get("Value USD", 0))
        d_yield = pos.get("d", 0)
        y_yield = pos.get("y", 0)

        table.add_row(
            pos.get("Protocol", "N/A"),
            pos.get("Asset", "N/A"),
            f"{net_val:.2f}",
            f"{pos.get('APR', 0):.2%}" if isinstance(pos.get('APR'), float) else "-",
            f"{d_yield:.2f}",
            f"{y_yield:.2f}"
        )
        total_value += float(net_val)
        total_daily += float(d_yield)

    console.print(table)
    console.print(f"[bold]Total Net Value:[/bold] ${total_value:.2f}")
    console.print(f"[bold]Revenu Journalier Estimé:[/bold] ${total_daily:.2f}")

if __name__ == "__main__":
    app()
