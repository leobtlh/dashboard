fn main() {
    let utilisateur = "Alice";
    let montant = 100;

    // Tente le swap
    match executer_swap(utilisateur, montant) {
        Ok(msg) => println!("Succès : {}", msg),
        Err(e) => println!("Échec de la transaction : {}", e),
    }
}

// Fonction principale qui orchestre le tout
// Note : Elle retourne un Result, donc elle est compatible avec l'opérateur `?`
fn executer_swap(user: &str, montant: i32) -> Result<&str, String> {
    // 1. Vérifie le solde de l'utilisateur
    // TODO: Appelle verifier_solde(user, montant) avec l'opérateur ?
    // Syntaxe : verifier_solde(...) ?;


    // 2. Vérifie la liquidité de la pool
    // TODO: Appelle verifier_pool(montant) avec l'opérateur ?


    // 3. Si on arrive ici, c'est que les erreurs ont été filtrées.
    // Retourne le succès.
    Ok("Swap effectué avec succès !")
}

// --- Fonctions simulées (ne pas modifier) ---

fn verifier_solde(user: &str, montant: i32) -> Result<(), String> {
    if user == "Alice" && montant > 50 {
        return Err(String::from("Solde utilisateur insuffisant"));
    }
    println!("-> Solde OK");
    Ok(())
}

fn verifier_pool(montant: i32) -> Result<(), String> {
    if montant > 1000 {
        return Err(String::from("Liquidité pool insuffisante"));
    }
    println!("-> Pool OK");
    Ok(())
}
