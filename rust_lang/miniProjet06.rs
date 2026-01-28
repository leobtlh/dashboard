use std::collections::HashMap;

fn main() {
    // 1. Crée une HashMap mutable.
    // Clé : String, Valeur : i32
    // Indice : HashMap::new()
    let mut portefeuille = HashMap::new();

    // 2. Insère deux tokens ("BTC" -> 50, "ETH" -> 100)
    // Indice : portefeuille.insert(String::from("..."), ...);
    portefeuille.insert(String::from("BTC"), 50);
    portefeuille.insert(String::from("ETH"), 100);

    // 3. Réception de fonds ! Ajoute 10 au solde de "BTC".
    // En C++, tu ferais : portefeuille["BTC"] += 10;
    // En Rust, l'accès direct [] peut paniquer si la clé n'existe pas.
    // On utilise .entry().or_insert().

    // TODO: Complète cette ligne pour ajouter 10 au solde existant
    // Indice : *portefeuille.entry(String::from("BTC")).or_insert(0) += ...
    *portefeuille.entry(String::from("BTC")).or_insert(0.0) += 10;


    // 4. Affiche le contenu
    for (token, solde) in &portefeuille {
        println!("{}: {}", token, solde);
    }
}
