use std::collections::HashMap;

struct LiquidityPool {
    // 1. Définis le champ `reserves` ici
    reserves: HashMap<String, f64>,
}

impl LiquidityPool {
    fn new() -> Self {
        // Initialise la structure
        Self {
            reserves: HashMap::new(),
        }
    }

    fn ajouter_liquidite(&mut self, token: String, montant: f64) {
        // 2. Utilise .entry().or_insert() pour gérer l'ajout
        // Indice : N'oublie pas de déréférencer (*) le résultat de l'entry pour ajouter le montant
        *self.reserves.entry(token).or_insert(0.0) += montant;
    }
}

fn main() {
    let mut pool = LiquidityPool::new();

    // 3. Ajoute de la liquidité :
    // - 1000.0 USDC
    // - 10.0 ETH
    // - 500.0 USDC encore
    pool.ajouter_liquidite(String::from("USDC"), 1000.0);
    pool.ajouter_liquidite(String::from("ETH"), 10.0);
    pool.ajouter_liquidite(String::from("USDC"), 500.0);

    println!("--- État de la Pool ---");
    // 4. Affiche les réserves (boucle for)
    // Note: Pour itérer sur une HashMap dans une struct, accède au champ : &pool.reserves
    for (asset, amount) in &pool.reserves {
        println!("{}: {}", asset, amount);
    }
}
