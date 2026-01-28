// 1. Définition du Trait (l'interface)
trait Valorisable {
    fn valeur_en_usd(&self) -> f64;
}

struct Bitcoin {
    quantite: f64,
}

struct Ethereum {
    quantite: f64,
}

struct Solana {
    quantite: f64,
}

// 2. Implémente le trait pour Bitcoin
impl Valorisable for Bitcoin {
    fn valeur_en_usd(&self) -> f64 {
        // TODO: Retourne la quantité * 40000.0
        self.quantite * 40_000.0
    }
}

// 3. Implémente le trait pour Ethereum
impl Valorisable for Ethereum {
    fn valeur_en_usd(&self) -> f64 {
        // TODO: Retourne la quantité * 2000.0
        self.quantite * 2_000.0
    }
}

impl Valorisable for Solana {
    fn valeur_en_usd(&self) -> f64 {
        self.quantite * 100.0
    }
}

// Fonction générique : Elle accepte n'importe quoi (T) tant que T implémente Valorisable
fn afficher_portefeuille<T: Valorisable>(actif: T) {
    println!("Valeur de l'actif : {}$", actif.valeur_en_usd());
}

fn main() {
    let mon_btc = Bitcoin { quantite: 0.6 };
    let mon_eth = Ethereum { quantite: 12.0 };
    let mon_sol = Solana { quantite: 14.9 };

    println!("--- Audit du portefeuille ---");

    // 4. Appelle la fonction générique pour chaque actif
    afficher_portefeuille(mon_btc);
    afficher_portefeuille(mon_eth);
    afficher_portefeuille(mon_sol);
}
