const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer'); // Nécessaire pour gérer les fichiers uploadés
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configuration de Multer pour stocker les fichiers temporaires dans un dossier 'uploads'
const upload = multer({ dest: 'uploads/' });

// 1. Servir les fichiers statiques (CSS, JS, Images)
// On dit à Express : "Si l'URL commence par /static, regarde dans le dossier 'static'"
app.use('/static', express.static(path.join(__dirname, 'static')));

// 2. Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. Route pour traiter la commande (POST)
// upload.single('fichier_motif') dit à Node de traiter le fichier envoyé via le champ 'fichier_motif'
app.post('/submit-order', upload.single('fichier_motif'), async (req, res) => {
    try {
        // Récupération des champs textes (correspondant aux name="" de ton HTML)
        const { prenom, nom, email, telephone, adresse, ville, cp, taille, motif, precisions } = req.body;

        // Récupération du fichier s'il y en a un
        const fichierJoint = req.file;

        console.log(`📦 Commande reçue de ${prenom} ${nom}`);

        // --- CONFIGURATION EMAIL (À remplir avec tes vraies infos pour que ça marche) ---
       let transporter = nodemailer.createTransport({
            host: 'mail.infomaniak.com',
            port: 465, // Port sécurisé SSL
            secure: true, // Utilise SSL
            auth: {
                user: 'ton-email@tondomaine.ch', // Ton adresse email complète
                pass: 'TON_MOT_DE_PASSE'         // Ton mot de passe
            }
        });

        // Préparation des pièces jointes
        let attachments = [];
        if (fichierJoint) {
            attachments.push({
                filename: fichierJoint.originalname, // Nom d'origine du fichier
                path: fichierJoint.path // Chemin temporaire sur le serveur
            });
        }

        // Construction du contenu de l'email
        const mailOptions = {
            from: '"Moeba Rugs" <noreply@moeba.com>',
            to: 'leo.botelho14@gmail.com', // Là où tu veux recevoir la commande
            subject: `Nouvelle commande Tapis - ${prenom} ${nom}`,
            text: `
----------------------------------------
NOUVELLE COMMANDE MOEBA
----------------------------------------

CLIENT :
Nom : ${prenom} ${nom}
Email : ${email}
Tél : ${telephone}
Adresse : ${adresse}, ${cp} ${ville}

COMMANDE :
Taille : ${taille}
Motif : ${motif}
Précisions : ${precisions || 'Aucune'}

----------------------------------------
`,
            attachments: attachments
        };

        // Envoi
        await transporter.sendMail(mailOptions);

        // Nettoyage : Suppression du fichier temporaire après envoi pour ne pas encombrer le serveur
        if (fichierJoint) {
            fs.unlink(fichierJoint.path, (err) => {
                if (err) console.error("Erreur suppression fichier temp:", err);
            });
        }

        // Réponse au client (Tu peux rediriger vers une page de succès ou envoyer un message)
        res.send(`
            <h1>Merci ${prenom} !</h1>
            <p>Votre commande a bien été reçue.</p>
            <a href="/">Retour au site</a>
        `);

    } catch (error) {
        console.error("Erreur lors de l'envoi :", error);
        res.status(500).send("Une erreur est survenue lors du traitement de la commande.");
    }
});

// Création du dossier uploads s'il n'existe pas (pour éviter les erreurs)
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
