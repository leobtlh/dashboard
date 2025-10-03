document.addEventListener("DOMContentLoaded", function () {
    // Fonction pour charger le contenu du menu
    function loadMenuContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById('menu').innerHTML = data;
                setupDropdowns(); // Initialiser les menus déroulants après le chargement du contenu
            })
            .catch(error => console.error('Erreur chargement menu :', error));
    }

    // Fonction pour configurer les menus déroulants
    function setupDropdowns() {
        // Gestion des menus déroulants principaux
        const dropdowns = document.querySelectorAll(".dropdown");
        dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector(".form-menu");
            const content = dropdown.querySelector(".dropdown-content");

            button.addEventListener("click", (event) => {
                event.stopPropagation(); // Empêche la propagation de l'événement
                const isVisible = content.style.display === "block";
                document.querySelectorAll(".dropdown-content").forEach(dc => {
                    if (dc !== content) dc.style.display = "none";
                });
                content.style.display = isVisible ? "none" : "block";
            });
        });

        // Gestion des sous-menus déroulants
        const subDropdownToggles = document.querySelectorAll(".sub-dropdown-toggle");
        subDropdownToggles.forEach(toggle => {
            toggle.addEventListener("click", function (event) {
                event.stopPropagation(); // Empêche la propagation de l'événement
                const subDropdownContent = this.nextElementSibling;
                const isVisible = subDropdownContent.style.display === "block";
                document.querySelectorAll(".sub-dropdown-content").forEach(sdc => {
                    if (sdc !== subDropdownContent) sdc.style.display = "none";
                });
                subDropdownContent.style.display = isVisible ? "none" : "block";
            });
        });
    }

    // Fermer si clic ailleurs
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".dropdown") && !event.target.closest(".sub-dropdown-toggle")) {
            document.querySelectorAll(".dropdown-content").forEach(dc => dc.style.display = "none");
            document.querySelectorAll(".sub-dropdown-content").forEach(sdc => sdc.style.display = "none");
        }
    });

    // Charger le contenu du menu en fonction de la page ou d'autres conditions
    const currentPage = window.location.pathname; // Exemple : utiliser l'URL de la page actuelle pour déterminer quel menu charger
    if (currentPage.includes('cours1')) {
        loadMenuContent('/cours1/menu.html');
    } else if (currentPage.includes('cours2')) {
        loadMenuContent('/cours2/menu.html');
    } else if (currentPage.includes('cours3')) {
        loadMenuContent('/cours3/menu.html');
    }
    // Ajoutez d'autres conditions selon vos besoins
});
