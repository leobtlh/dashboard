#!/usr/bin/env python3
import sys
import math

def parse_duration(duration_str):
    """Convertit la durée en jours (ex: 50j -> 50, 20a -> 7300 jours)"""
    if duration_str.endswith('j'):
        return int(duration_str[:-1])
    elif duration_str.endswith('a'):
        years = int(duration_str[:-1])
        return years * 365
    else:
        raise ValueError("Format invalide. Utilisez 'j' pour jours ou 'a' pour années")

def get_frequency_days(frequency):
    """Retourne le nombre de jours entre chaque versement"""
    frequencies = {
        'ponctuel': 0,  # Versement unique au début
        'daily': 1,
        'quotidien': 1,
        'hebdo': 7,
        'hebdomadaire': 7,
        'monthly': 30,
        'mensuel': 30,
        'year': 365,
        'annuel': 365
    }
    freq_lower = frequency.lower()
    if freq_lower not in frequencies:
        raise ValueError(f"Fréquence invalide. Choisissez parmi: ponctuel, daily/quotidien, hebdo/hebdomadaire, monthly/mensuel, year/annuel")
    return frequencies[freq_lower]

def calculate_investment(initial_capital, amount, frequency_days, total_days, annual_rate):
    """Calcule l'investissement avec intérêts composés quotidiens et un capital de départ"""
    daily_rate = annual_rate / 365 / 100
    total_invested = initial_capital
    total_with_interest = initial_capital

    history_invested = []
    history_with_interest = []

    # Points de sauvegarde pour le graphique (max 100 points)
    step = max(1, total_days // 100)

    for day in range(total_days + 1):
        # Sauvegarder l'historique à intervalles réguliers
        if day % step == 0 or day == total_days:
            history_invested.append(total_invested)
            history_with_interest.append(total_with_interest)

        # Versement ponctuel (une seule fois au début)
        if frequency_days == 0 and day == 0:
            total_invested += amount
            total_with_interest += amount
        # Versements réguliers
        elif frequency_days > 0 and day % frequency_days == 0 and day <= total_days:
            total_invested += amount
            total_with_interest += amount

        # Appliquer les intérêts quotidiens
        if day < total_days:
            total_with_interest *= (1 + daily_rate)

    return total_invested, total_with_interest, history_invested, history_with_interest

def plot_ascii(history_invested, history_with_interest, width=80, height=25):
    """Génère un graphique ASCII avec des étoiles et remplissage sous les courbes"""
    max_value = max(max(history_with_interest), max(history_invested))

    # Créer la grille
    grid = [[' ' for _ in range(width)] for _ in range(height)]

    # D'abord tracer la courbe rose (avec rendement) en arrière-plan avec remplissage
    for i, inter in enumerate(history_with_interest):
        x = int((i / len(history_with_interest)) * (width - 1))
        y_inter = height - 1 - int((inter / max_value) * (height - 1))

        # Remplir sous la courbe rose
        for y in range(y_inter, height):
            if 0 <= y < height:
                if y == y_inter:
                    # Première étoile : rose foncé
                    grid[y][x] = '\033[95m*\033[0m'
                else:
                    # Remplissage : rose clair
                    grid[y][x] = '\033[35m*\033[0m'

    # Ensuite tracer la courbe bleue (investie) par-dessus avec remplissage
    for i, inv in enumerate(history_invested):
        x = int((i / len(history_invested)) * (width - 1))
        y_inv = height - 1 - int((inv / max_value) * (height - 1))

        # Remplir sous la courbe bleue
        for y in range(y_inv, height):
            if 0 <= y < height:
                if y == y_inv:
                    # Première étoile : bleu foncé
                    grid[y][x] = '\033[94m*\033[0m'
                else:
                    # Remplissage : bleu clair
                    grid[y][x] = '\033[34m*\033[0m'

    return grid, max_value

def format_currency(amount):
    """Formate un montant en euros"""
    return f"{amount:,.2f} CHF".replace(',', ' ')

def main():
    if len(sys.argv) != 6:
        print("Usage: python simulateur.py <capital_initial> <montant> <fréquence> <durée> <rendement%>")
        print("Exemple: python simulateur.py 1000 500 monthly 30a 7")
        print("Fréquences: ponctuel, daily/quotidien, hebdo/hebdomadaire, monthly/mensuel, year/annuel")
        sys.exit(1)

    try:
        initial_capital = float(sys.argv[1])
        amount = float(sys.argv[2])
        frequency = sys.argv[3]
        duration_str = sys.argv[4]
        annual_rate = float(sys.argv[5])

        frequency_days = get_frequency_days(frequency)
        total_days = parse_duration(duration_str)

        total_invested, total_with_interest, history_invested, history_with_interest = \
            calculate_investment(initial_capital, amount, frequency_days, total_days, annual_rate)

        gain = total_with_interest - total_invested

        # Couleurs ANSI
        CYAN = '\033[96m'
        GREEN = '\033[92m'
        YELLOW = '\033[93m'
        BLUE = '\033[94m'
        MAGENTA = '\033[95m'
        RESET = '\033[0m'
        BOLD = '\033[1m'

        # Affichage du graphique
        print(f"\n{BOLD}- Évolution de votre investissement{RESET}\n")

        grid, max_value = plot_ascii(history_invested, history_with_interest)

        # Afficher le graphique avec l'échelle
        for i, row in enumerate(grid):
            value = max_value * (1 - i / (len(grid) - 1))

            # Gestion unités / milliers / millions / milliards
            if value >= 1_000_000_000:
                label = f"{value/1_000_000_000:4.1f}B│"
            elif value >= 1_000_000:
                label = f"{value/1_000_000:4.1f}M│"
            elif value >= 1000:
                label = f"{value/1000:5.1f}k│"
            else:
                label = f"{value:6.0f}│"

            # Largeur FIXE pour empêcher tout décalage
            label = f"{label:>8}"

            print(f"{BLUE}{label}{RESET}{''.join(row)}")

        # Axe X
        print(f"{BLUE}       └{'─' * len(grid[0])}{RESET}")
        print(f"{BLUE}        0{' ' * (len(grid[0]) - 10)}{'temps'}{RESET}\n")

        # Légende
        print(f"  {BLUE}* Montant investi{RESET}    {MAGENTA}* Avec rendement{RESET}\n")

        # Résultats
        print(f"{BOLD}- Résultats de la simulation{RESET}\n")
        print(f"{CYAN}Capital initial  :   {format_currency(initial_capital)}{RESET}")
        print(f"{BLUE}Montant investi  :   {format_currency(total_invested)}{RESET}")
        print(f"{MAGENTA}Montant final    :   {format_currency(total_with_interest)}{RESET}")
        print(f"{GREEN}Gain (rendement) :   {format_currency(gain)}{RESET}")

        denom = initial_capital if initial_capital != 0 else 1
        rendement_total = (gain / denom) * 100

        print(f"\n{YELLOW}Rendement total  :   +{rendement_total:.1f}%{RESET}\n")

    except ValueError as e:
        print(f"Erreur: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Erreur inattendue: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

