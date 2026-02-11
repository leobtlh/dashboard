// Débrouille-toi pour définir la structure Compte
struct Compte {
    solde: i32,
}

impl Compte {
    // Constructeur helper (je te le donne pour gagner du temps)
    fn new(solde_initial: i32) -> Compte {
        Compte { solde: solde_initial }
    }

    // À toi d'écrire la signature et le corps de la méthode `retirer`.
    // Rappel : elle doit retourner Result<i32, String>
    fn retirer(&mut self, montant: i32) -> Result<i32, String> {
        if montant > self.solde {
            return Err(String::from("Fonds insuffisants"));
        }

        self.solde -= montant;

        Ok(self.solde)
    }

}

fn main() {
    let mut mon_compte = Compte::new(100);

    // 1. Tente de retirer 50 (ça devrait marcher)
    // Affiche le nouveau solde ou l'erreur.
    match mon_compte.retirer(50) {
        Ok(new_sold) => println!("Nouveau solde : {}", new_sold),
        Err(err_msg) => println!("{}", err_msg),
    }

    // 2. Tente de retirer 200 (ça devrait échouer)
    // Affiche le nouveau solde ou l'erreur.
    match mon_compte.retirer(200) {
        Ok(new_sold) => println!("Nouveau solde : {}", new_sold),
        Err(err_msg) => println!("{}", err_msg),
    }
}
