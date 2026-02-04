use std::collections::HashMap;

struct LiquidityPool {
    reserves: HashMap<String, f64>,
}

impl LiquidityPool {
    fn new() -> Self {
        Self { reserves: HashMap::new() }
    }

    fn ajouter_liquidite(&mut self, token: String, montant: f64) {
        *self.reserves.entry(token).or_insert(0.0) += montant;
    }

    // Petit helper pour les tests (pour lire sans modifier)
    fn get_solde(&self, token: &str) -> f64 {
        *self.reserves.get(token).unwrap_or(&0.0)
    }
}

fn main() {
    // Le main reste vide ou simple pour cet exercice,
    // l'action se passe dans le module de test ci-dessous !
    println!("Lance les tests pour vérifier la sécurité du contrat.");
}

#[cfg(test)]
mod tests {
    // Importe tout ce qui est défini dans le module parent
    use super::*;

    #[test]
    fn test_ajout_initial() {
        let mut pool = LiquidityPool::new();

        // 1. Ajoute 100.0 "USDC"
        pool.ajouter_liquidite(String::from("USDC"), 100.0);

        // 2. Vérifie que le solde est bien 100.0
        // Indice : assert_eq!(valeur_actuelle, valeur_attendue);
        // Utilise pool.get_solde("USDC")
        let valeur_actuelle = pool.get_solde("USDC");
        let valeur_attendue = 100.0;

        assert_eq!(valeur_actuelle, valeur_attendue);

    }

    #[test]
    fn test_cumul() {
        let mut pool = LiquidityPool::new();

        // 3. Ajoute 50.0 "ETH", puis encore 50.0 "ETH"
        pool.ajouter_liquidite(String::from("ETH"), 50.0);
        pool.ajouter_liquidite(String::from("ETH"), 50.0);


        // 4. Vérifie que le solde final est 100.0
        let valeur_actuelle = pool.get_solde("ETH");
        let valeur_attendue = 100.0;

        assert_eq!(valeur_actuelle, valeur_attendue);
    }
}
