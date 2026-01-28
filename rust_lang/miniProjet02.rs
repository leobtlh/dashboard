struct Employe {
    nom: String,
    departement: Departement,
    salaire: i32,
}

enum Departement {
    Dev,
    Commercial,
    RH,
}

impl Employe {
    // 1. Constructeur
    fn new(nom: String, dep: Departement, salaire: i32) -> Employe {
        // TODO: Retourne l'instance
        Employe {
            nom, // Raccourci syntaxique si le paramètre a le même nom que le champ !
            departement: dep,
            salaire, // Raccourci
        }
    }
}

fn main() {
    let equipe = vec![
        Employe::new(String::from("Alice"), Departement::Dev, 4000),
        Employe::new(String::from("Bob"), Departement::Commercial, 3500),
        Employe::new(String::from("Charlie"), Departement::Dev, 4500),
    ];

    // 2. Affiche le coût total
    let total = calculer_cout_total(&equipe);
    println!("Coût total mensuel : {} €", total);

    // 3. Trouve le mieux payé
    // La fonction renvoie Option<&Employe>, on doit gérer le cas None
    match trouver_plus_gros_salaire(&equipe) {
        Some(gagnant) => println!("Le mieux payé est : {} ({} €)", gagnant.nom, gagnant.salaire),
        None => println!("L'entreprise est vide !"),
    }
}

// Calcule la somme des salaires
fn calculer_cout_total(equipe: &Vec<Employe>) -> i32 {
    let mut somme = 0;
    // TODO: Parcourir le vecteur et ajouter les salaires à `somme`
    for employe in equipe {
        somme += employe.salaire;
    }

    somme
}

// Trouve l'employé avec le salaire le plus élevé
// Renvoie une référence vers l'employé (&Employe) à l'intérieur d'une Option
fn trouver_plus_gros_salaire(equipe: &Vec<Employe>) -> Option<&Employe> {
    // Si la liste est vide, on renvoie None tout de suite
    if equipe.len() == 0 {
        return None;
    }

    // On suppose que le premier est le meilleur pour commencer
    let mut meilleur_candidat = &equipe[0];

    // TODO: Parcourir le reste de l'équipe.
    // Si on trouve un salaire plus grand que `meilleur_candidat.salaire`,
    // on met à jour `meilleur_candidat`.
    for candidat in equipe {
        if candidat.salaire > meilleur_candidat.salaire {
            meilleur_candidat = &candidat;
        }
    }


    // À la fin, on renvoie Some(...) contenant la référence
    Some(meilleur_candidat)
}
