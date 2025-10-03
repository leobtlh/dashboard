/**
 * Fonction pour préparer l'envoi du formulaire de contact.
 */
function prepare_mail(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Vérifier si le champ "check" est vide (anti-spam)
    if (document.getElementById("check").value !== "") {
        alert("Veuillez laisser le champ 'Humain' vide.");
        return;
    }

    // Récupérer les données du formulaire
    let mail_data = {
        societe: document.getElementById("form-societe").value,
        telephone: document.getElementById("form-telephone").value,
        email: document.getElementById("form-email").value,
        message: document.getElementById("form-message").value
    };

    // Envoyer l'e-mail via EmailJS (ID du compte Emailjs dans footer.html)
    emailjs.send("service_1chftd5", "template_dnb78ms", mail_data) // Remplacez par vos IDs
        .then(function (response) {
            console.log("SUCCESS!", response.status, response.text);
            alert("Message envoyé avec succès !");
            document.getElementById("contact-form").reset(); // Réinitialiser le formulaire
        }, function (error) {
            console.log("FAILED...", error);
            alert("Une erreur est survenue. Veuillez réessayer plus tard.");
        });
}

