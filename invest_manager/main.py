import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text
from portfolio_manager import create_position, load_portfolio, get_position, update_position_valuation, update_position_flow, delete_position_logic

# Import de tes formules mathématiques
from logic import calc_loop_yield, calc_lp_yield, calc_delta_neutral

app = typer.Typer(help="Gabarti DeFi Manager v3 - Full Strategies")
console = Console()

# --- 1. COMMANDES D'AJOUT (Lending, Token, Loop, LP, Neutral) ---

@app.command()
def add_lending(protocol: str, asset: str, collateral: float, debt: float, apr_col: float, apr_debt: float):
    """Créer une position de Lending classique (ex: Aave)."""
    # Pour un lending, on stocke tel quel
    new_id = create_position("Lending", protocol, asset, collateral, debt, apr_col, apr_debt)
    console.print(f"[bold green]✅ Position Lending créée (ID: {new_id})[/bold green]")

@app.command()
def add_token(protocol: str, asset: str, value: float, apr: float):
    """Créer une position simple (Wallet, Vault, Staking)."""
    new_id = create_position("Token", protocol, asset, value, 0, apr, 0)
    console.print(f"[bold green]✅ Position Token créée (ID: {new_id})[/bold green]")

@app.command()
def add_loop(protocol: str, asset: str, investment: float, leverage: float, apr_supply: float, apr_borrow: float):
    """
    Créer une Loop.
    Entre ton investissement (Equity) et le levier (ex: 3).
    Le script calcule automatiquement l'exposition totale et la dette.
    """
    # Utilisation de TA fonction logic.py pour déduire les montants réels
    metrics = calc_loop_yield(investment, leverage, apr_supply, apr_borrow)

    # metrics retourne "Total Exposure" (Collat) et "Total Debt" (Dette négative)
    real_collateral = metrics["Total Exposure"]
    real_debt = abs(metrics["Total Debt"]) # On stocke en positif dans la DB, le manager gère

    extra_data = {"leverage_initial": leverage, "investment_initial": investment}

    new_id = create_position("Looping", protocol, asset, real_collateral, real_debt, apr_supply, apr_borrow, extra_data)
    console.print(f"[bold green]✅ Loop {leverage}x créée sur {protocol} (ID: {new_id})[/bold green]")
    console.print(f"[dim]Calculé: Exposition {real_collateral:.2f}$ | Dette {real_debt:.2f}$[/dim]")

@app.command()
def add_lp(protocol: str, pair: str, val_a: float, val_b: float, apr: float):
    """Créer une position Liquidity Provider (LP)."""
    # Pour un LP, le collatéral est la somme des deux tokens
    metrics = calc_lp_yield(val_a, val_b, apr)
    total_tvl = metrics["Net Value"]

    extra_data = {"token_a_val": val_a, "token_b_val": val_b}

    new_id = create_position("Liquidity Pool", protocol, pair, total_tvl, 0, apr, 0, extra_data)
    console.print(f"[bold green]✅ LP {pair} créé (ID: {new_id}) - TVL: {total_tvl}$[/bold green]")

@app.command()
def add_neutral(protocol: str, asset: str, long_pos: float, short_pos: float, apr_long: float, apr_short: float):
    """Créer une stratégie Delta Neutral."""
    # Ici, le Long est le collatéral, le Short est traité comme une dette (liability)
    new_id = create_position("Delta Neutral", protocol, asset, long_pos, short_pos, apr_long, apr_short)
    console.print(f"[bold green]✅ Delta Neutral créé (ID: {new_id})[/bold green]")


# --- 2. COMMANDES DE VISUALISATION (List & View) ---

@app.command()
def list():
    """Voir toutes les positions en résumé."""
    portfolio = load_portfolio()
    if not portfolio:
        console.print("[yellow]Aucune position.[/yellow]")
        return

    table = Table(title="📊 Mon Portefeuille DeFi", expand=True)
    table.add_column("ID", style="dim", justify="center")
    table.add_column("Type", style="magenta")
    table.add_column("Protocole / Asset")
    table.add_column("Net Value", justify="right")
    table.add_column("Yield/Day", justify="right", style="green")

    total_net = 0
    total_daily = 0

    for p in portfolio:
        st = p['current_state']
        net_val = st['collateral'] - st['debt']

        # Calcul du Yield Journalier (d) en direct
        daily_yield = ((st['collateral'] * st['apr_col']) - (st['debt'] * st['apr_debt'])) / 365

        table.add_row(
            str(p['id']),
            p['category'],
            f"{p['protocol']} - {p['asset']}",
            f"${net_val:,.2f}",
            f"${daily_yield:.2f}"
        )
        total_net += net_val
        total_daily += daily_yield

    console.print(table)
    console.print(f"[bold]Net Worth:[/bold] ${total_net:,.2f} | [bold]Revenu Mensuel:[/bold] ${total_daily*30:,.2f}")

@app.command()
def view(pos_id: int):
    """Voir le détail expert d'une position."""
    p = get_position(pos_id)
    if not p:
        console.print("[red]ID introuvable.[/red]")
        return

    st = p['current_state']
    stats = p['stats']
    cat = p['category']

    # --- Header ---
    net_value = st['collateral'] - st['debt']
    header_text = Text()
    header_text.append(f"ID: {p['id']} | {p['protocol']} | {p['asset']}\n", style="bold white")
    header_text.append(f"Type: {cat.upper()}", style="cyan")

    # Affichage spécial pour les LOOPS
    if cat == "Looping" and "leverage_initial" in p:
        header_text.append(f" | Levier Initial: {p['leverage_initial']}x", style="yellow")

    # --- Colonne VERTE (Actifs) ---
    col_title = "🟩 Collatéral / Actifs"
    if cat == "Liquidity Pool": col_title = "🟩 TVL (Token A + B)"
    if cat == "Looping": col_title = "🟩 Total Exposure (Levier)"

    col_table = Table(show_header=False, box=None, expand=True)
    col_table.add_row("Valeur Actuelle:", f"[green]${st['collateral']:,.2f}[/green]")
    col_table.add_row("APR Actif:", f"{st['apr_col']*100:.2f}%")

    # Evolution
    evo_col = ((st['collateral'] - stats['initial_collateral']) / stats['initial_collateral']) * 100 if stats['initial_collateral'] else 0
    col_table.add_row("Evolution:", f"[{'green' if evo_col>=0 else 'red'}]{evo_col:+.2f}%[/]")

    # --- Colonne ROUGE (Passifs) ---
    debt_table = Table(show_header=False, box=None, expand=True)

    if st['debt'] > 0:
        debt_title = "🟥 Dette / Emprunts"
        if cat == "Delta Neutral": debt_title = "🟥 Short Position"

        debt_table.add_row("Dette Actuelle:", f"[red]${st['debt']:,.2f}[/red]")
        debt_table.add_row("APR Dette:", f"{st['apr_debt']*100:.2f}%")
        debt_table.add_row("Intérêts Payés:", f"[bold red]-${stats['total_interest_paid']:,.2f}[/bold red]")
    else:
        debt_title = "⚪ Pas de Dette"
        debt_table.add_row("Aucune dette active.")

    # --- Assemblage ---
    grid = Table.grid(expand=True, padding=2)
    grid.add_column(ratio=1)
    grid.add_column(ratio=1)
    grid.add_row(
        Panel(col_table, title=col_title, border_style="green"),
        Panel(debt_table, title=debt_title, border_style="red" if st['debt'] > 0 else "white")
    )

    # --- Historique ---
    hist_table = Table(title="📜 Historique", expand=True, box=None)
    hist_table.add_column("Date", style="dim")
    hist_table.add_column("Action", style="bold")
    hist_table.add_column("Détail")
    for h in p['history'][-5:]:
        hist_table.add_row(h['date'], h['action'], h['details'])

    final_view = Panel(
        Layout(Text.assemble(header_text, "\n\n", f"NET VALUE: ${net_value:,.2f}", style="bold underline white")),
        title=f"Fiche {cat} #{pos_id}", subtitle="Utilise 'edit' ou 'delete'"
    )

    console.print(final_view)
    console.print(grid)
    console.print(hist_table)

# --- 3. COMMANDES DE GESTION (Edit & Delete) ---

@app.command()
def edit(pos_id: int):
    """Modifier une position."""
    p = get_position(pos_id)
    if not p: return

    console.print(f"[bold cyan]Modification Position #{pos_id}[/bold cyan]")
    console.print("1. [bold green]Actualiser Valeurs[/bold green] (Mark to Market)")
    console.print("2. [bold blue]Opération de Caisse[/bold blue] (Deposit/Withdraw)")

    choice = typer.prompt("Ton choix ?", type=int)
    st = p['current_state']

    if choice == 1:
        console.print(f"Actuel -> Col: {st['collateral']} | Dette: {st['debt']}")
        new_col = typer.prompt("Nouveau Collatéral Total", type=float, default=st['collateral'])
        new_debt = typer.prompt("Nouvelle Dette Totale", type=float, default=st['debt'])
        update_position_valuation(pos_id, new_col, new_debt)
        console.print("[green]Mise à jour effectuée ![/green]")

    elif choice == 2:
        d_col = typer.prompt("Changement Collatéral (+/-)", type=float, default=0.0)
        d_debt = typer.prompt("Changement Dette (+/-)", type=float, default=0.0)
        update_position_flow(pos_id, d_col, d_debt)
        console.print("[green]Flux enregistré ![/green]")

@app.command()
def delete(pos_id: int):
    """Supprimer une position."""
    if typer.confirm(f"Supprimer #{pos_id} ?"):
        delete_position_logic(pos_id)
        console.print("[red]Supprimé.[/red]")

if __name__ == "__main__":
    app()
