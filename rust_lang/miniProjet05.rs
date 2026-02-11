trait Valorisable {
    fn valeur_en_usd(&self) -> f64;
}

struct Bitcoin  { quantite: f64 }
struct Ethereum { quantite: f64 }
struct Solana   { quantite: f64 }

impl Valorisable for Bitcoin {
    fn valeur_en_usd(&self) -> f64 { self.quantite * 40_000.0 }
}

impl Valorisable for Ethereum {
    fn valeur_en_usd(&self) -> f64 { self.quantite * 2_000.0 }
}

impl Valorisable for Solana {
    fn valeur_en_usd(&self) -> f64 { self.quantite * 100.0 }
}

fn main() {
    // 1. Déclare le vecteur capable de stocker des objets hétérogènes (Box<dyn ...>)
    let mut portefeuille: Vec<Box<dyn Valorisable>> = Vec::new();

    // 2. & 3. Ajoute des cryptos dans le vecteur (utilise Box::new(...))
    portefeuille.push(Box::new( Bitcoin { quantite: 4.0 } ));
    portefeuille.push(Box::new( Ethereum { quantite: 4.0 } ));
    portefeuille.push(Box::new( Solana { quantite: 4.0 } ));


    // 4. Appelle la fonction de calcul
    let total = calculer_valeur_totale(&portefeuille);
    println!("Valeur totale du portefeuille : {}$", total);
}

// Fonction qui prend un vecteur de "Trait Objects"
fn calculer_valeur_totale(assets: &Vec<Box<dyn Valorisable>>) -> f64 {
    let mut total = 0.0;

    // TODO: Parcourir le vecteur et sommer la valeur de chaque actif
    // Note : Rust gère le déréférencement de la Box automatiquement ici.
    for devise in assets {
        total += devise.valeur_en_usd();
    }


    total
}
