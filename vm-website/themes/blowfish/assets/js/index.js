/**
 * Fonction pour préparer l'envoi du formulaire de contact.
 */
function prepare_mail() {
    let lang = document.getElementsByTagName('html')[0].getAttribute('lang');
    if (document.getElementById("check").value === "") {
        let mail_data = {
            societe: document.getElementById("form-societe").value,
            telephone: document.getElementById("form-telephone").value,
            email: document.getElementById("form-email").value,
            produit: document.getElementById("form-produit").value,
            message: document.getElementById("form-message").value
        };
        fetch("./assets/php/contact_form.php", {
            method: "POST",
            body: JSON.stringify(mail_data)
        }).then((response) => response.json()).then((reponseData) => {
            if (reponseData.success) {
                alert("Message envoyé avec succès !");
            } else {
                alert("Une erreur est survenue. Veuillez réessayer plus tard.");
            }
        }).catch(function (error) {
            alert("Une erreur est survenue. Veuillez réessayer plus tard.");
        });
    }
}

