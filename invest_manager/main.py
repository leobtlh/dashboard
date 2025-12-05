import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text
from rich.columns import Columns
from portfolio_manager import create_position, load_portfolio, get_position, update_position_valuation, update_position_flow, delete_position_logic

app = typer.Typer(help="Gabarti DeFi Manager v2")
console = Console()

# --- COMMANDES D'AJOUT (Simplifiées pour l'exemple) ---
@app.command()
def add_lending(protocol: str, asset: str, collateral: float, debt: float, apr_col: float, apr_debt: float):
    """Créer une position de Lending/Borrowing."""
    new_id = create_position("Lending", protocol, asset, collateral, debt, apr_col, apr_debt)
    console.print(f"[bold green]✅ Position Lending créée (ID: {new_id})[/bold green]")

@app.command()
def add_token(protocol: str, asset: str, value: float, apr: float):
    """Créer une position simple (Token, Vault)."""
    new_id = create_position("Token", protocol, asset, value, 0, apr, 0)
    console.print(f"[bold green]✅ Position Token créée (ID: {new_id})[/bold green]")

# --- COMMANDE DE LISTE ---
@app.command()
def list():
    """Voir toutes les positions en résumé."""
    portfolio = load_portfolio()
    if not portfolio:
        console.print("[yellow]Aucune position. Utilise 'add-lending' pour commencer.[/yellow]")
        return

    table = Table(title="📊 Mon Portefeuille DeFi", expand=True)
    table.add_column("ID", style="dim", justify="center")
    table.add_column("Type", style="magenta")
    table.add_column("Protocole / Asset")
    table.add_column("Net Value", justify="right")
    table.add_column("APR Net", justify="right")

    for p in portfolio:
        st = p['current_state']
        net_val = st['collateral'] - st['debt']
        # Calcul APR net approximatif
        yield_y = (st['collateral'] * st['apr_col']) - (st['debt'] * st['apr_debt'])
        apr_net = (yield_y / net_val) * 100 if net_val > 0 else 0

        table.add_row(
            str(p['id']),
            p['category'],
            f"{p['protocol']} - {p['asset']}",
            f"${net_val:,.2f}",
            f"[green]{apr_net:.2f}%[/green]" if apr_net > 0 else f"[red]{apr_net:.2f}%[/red]"
        )
    console.print(table)

# --- COMMANDE DE DETAIL (LE COEUR DE TA DEMANDE) ---
@app.command()
def view(pos_id: int):
    """Voir le détail expert d'une position (Historique, Intérêts rouge, Evolution)."""
    p = get_position(pos_id)
    if not p:
        console.print("[red]ID introuvable.[/red]")
        return

    st = p['current_state']
    stats = p['stats']

    # 1. HEADER INFO
    net_value = st['collateral'] - st['debt']
    header_text = Text()
    header_text.append(f"ID: {p['id']} | {p['protocol']} | {p['asset']}\n", style="bold white")
    header_text.append(f"Créé le: {p['date_creation']}\n", style="dim")
    header_text.append(f"Type: {p['category'].upper()}", style="cyan")

    # 2. COLONNES GAUCHE (COLLATERAL) vs DROITE (DETTE/ASSET)

    # Panneau Gauche : POSITIF
    col_table = Table(show_header=False, box=None, expand=True)
    col_table.add_row("Valeur Actuelle:", f"[green]${st['collateral']:,.2f}[/green]")
    col_table.add_row("APR Supply:", f"{st['apr_col']*100:.2f}%")
    col_table.add_row("Initial:", f"${stats['initial_collateral']:,.2f}")
    evo_col = ((st['collateral'] - stats['initial_collateral']) / stats['initial_collateral']) * 100 if stats['initial_collateral'] else 0
    col_table.add_row("Evolution:", f"[{'green' if evo_col>=0 else 'red'}]{evo_col:+.2f}%[/]")

    # Panneau Droit : NEGATIF (Dette)
    debt_table = Table(show_header=False, box=None, expand=True)
    debt_table.add_row("Dette Actuelle:", f"[red]${st['debt']:,.2f}[/red]")
    debt_table.add_row("APR Emprunt:", f"{st['apr_debt']*100:.2f}%")

    # LA DEMANDE SPECIFIQUE : Intérêts cumulés en ROUGE
    debt_table.add_row("Intérêts Payés (Total):", f"[bold red]-${stats['total_interest_paid']:,.2f}[/bold red]")

    # 3. GRILLE CENTRALE
    grid = Table.grid(expand=True, padding=2)
    grid.add_column(ratio=1)
    grid.add_column(ratio=1)
    grid.add_row(
        Panel(col_table, title="🟩 Collatéral / Actifs", border_style="green"),
        Panel(debt_table, title="🟥 Dette / Emprunts", border_style="red")
    )

    # 4. HISTORIQUE (Evolution)
    hist_table = Table(title="📜 Historique & Evolution", expand=True, box=None)
    hist_table.add_column("Date", style="dim")
    hist_table.add_column("Action", style="bold")
    hist_table.add_column("Détail")

    for h in p['history'][-5:]: # Montre les 5 derniers
        hist_table.add_row(h['date'], h['action'], h['details'])

    # ASSEMBLAGE FINAL
    final_view = Panel(
        Layout(
            Text.assemble(
                header_text, "\n\n",
                f"NET VALUE: ${net_value:,.2f}", style="bold underline white"
            )
        ),
        title=f"Fiche Position #{pos_id}",
        subtitle="Utilise 'edit' pour modifier ou 'delete' pour supprimer"
    )

    console.print(final_view)
    console.print(grid)
    console.print(hist_table)

# --- COMMANDES DE MODIFICATION ---
@app.command()
def edit(pos_id: int):
    """Modifier une position (Augmenter, Réduire, Actualiser Prix)."""
    p = get_position(pos_id)
    if not p:
        console.print("[red]Position introuvable.[/red]")
        return

    console.print(f"[bold cyan]Modification Position #{pos_id} ({p['protocol']})[/bold cyan]")
    console.print("1. [bold green]Actualiser Valeurs[/bold green] (Le prix a changé ou les intérêts ont augmenté)")
    console.print("2. [bold blue]Opération de Caisse[/bold blue] (J'ai déposé ou retiré de l'argent)")

    choice = typer.prompt("Ton choix ?", type=int)

    st = p['current_state']

    if choice == 1:
        # Mark to Market
        console.print(f"Ancienne Dette: {st['debt']:.2f} | Ancien Collat: {st['collateral']:.2f}")
        new_col = typer.prompt("Nouvelle valeur totale du Collatéral ($)", type=float, default=st['collateral'])
        new_debt = typer.prompt("Nouvelle valeur totale de la Dette ($)", type=float, default=st['debt'])

        update_position_valuation(pos_id, new_col, new_debt)
        console.print("[green]✅ Valeurs mises à jour (Intérêts calculés automatiquement) ![/green]")

    elif choice == 2:
        # Cashflow
        console.print("Si tu as DEPOSÉ, mets un chiffre positif. Si RETIRÉ, négatif.")
        delta_col = typer.prompt("Changement Collatéral ($)", type=float, default=0.0)

        console.print("Si tu as EMPRUNTÉ plus, positif. Si REMBOURSÉ, négatif.")
        delta_debt = typer.prompt("Changement Dette ($)", type=float, default=0.0)

        update_position_flow(pos_id, delta_col, delta_debt)
        console.print("[green]✅ Flux enregistré ![/green]")

@app.command()
def delete(pos_id: int):
    """Supprimer définitivement une position."""
    confirm = typer.confirm(f"Es-tu sûr de vouloir supprimer la position #{pos_id} ?")
    if confirm:
        delete_position_logic(pos_id)
        console.print(f"[red]🗑 Position #{pos_id} supprimée.[/red]")

if __name__ == "__main__":
    app()
