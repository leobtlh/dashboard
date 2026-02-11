/*
    Types scalaires : 1 valeur
    Types composées : regroupement de plusieurs valeurs

    Bases numériques : décimale (10)        -> 0 à 9
                     : binaire (2)          -> 0 à 1 [0b1101_0010_1000]
                     : octale (8)           -> 0 à 7 [0o755]
                     : hexadécimale (16)    -> 0 à F [0xAF23B7]

    Notation scientifique (exposant) : 1.25 * 10⁶ => 1.25e6

    A - > 65

    'M' (char) -> M
    b'M'       -> 77u8
*/

struct Tache {
    description: String,
    statut: Statut,
}

enum Statut {
    AFaire,
    Fait,
}

impl Tache {
    // 1. Constructeur : Crée une Tache avec le statut `AFaire` par défaut
    fn new(desc: String) -> Tache {
        // TODO: Retourne une instance de Tache
        // Rappel : Tache { ... }
        Tache {
            description: desc,
            statut: Statut::AFaire,
        }
    }

    // 2. Méthode pour passer le statut à `Fait`
    // Attention : on doit modifier la structure (self), quel type d'emprunt faut-il ?
    fn terminer(/* TODO: paramètre self ? */ &mut self) {
        // TODO: Modifie self.statut
        self.statut = Statut::Fait;
    }
}

fn main() {
    // Création de la liste
    let mut liste: Vec<Tache> = vec![];

    // 3. Ajoute deux tâches : "Apprendre Rust" et "Dormir"
    // Indice : liste.push(...);
    liste.push(Tache::new(String::from("Apprendre Rust")));
    liste.push(Tache::new(String::from("Dormir")));


    // 4. Marque la première tâche (index 0) comme terminée
    // Indice : tu peux accéder directement via liste[0].terminer() si Rust est gentil,
    // ou de façon plus sécurisée (optionnel pour l'instant).
    liste[0].terminer();

    println!("--- Ma Todo List ---");
    afficher_tout(&liste);
}

// 5. Fonction pour afficher la liste
// Elle prend une RÉFÉRENCE vers le vecteur pour ne pas le détruire
fn afficher_tout(liste: &Vec<Tache>) {
    for tache in liste {
        // TODO: Utilise match pour définir le symbole : "[X]" si Fait, "[ ]" si AFaire
        let symbole = match tache.statut {
            Statut::AFaire => "[ ]",
            Statut::Fait => "[X]",
        };

        println!("{} {}", symbole, tache.description);
    }
}
