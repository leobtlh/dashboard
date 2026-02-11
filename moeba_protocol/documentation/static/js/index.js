document.addEventListener('DOMContentLoaded', () => {
    // 1. Sélection des éléments du DOM
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.doc-section');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // 2. Fonction principale pour changer de page
    function navigateTo(targetId) {
        // Masquer toutes les sections
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Désactiver le style "actif" de tous les liens du menu
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Afficher la section cible
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            // Scroll en haut de page automatiquement
            document.querySelector('.main-content').scrollTop = 0;
        } else {
            console.warn(`Section avec l'ID "${targetId}" introuvable.`);
        }

        // Activer le style sur le lien correspondant dans le menu
        const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Sur mobile, fermer le menu après avoir cliqué sur un lien
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    // 3. Écouteurs d'événements sur les liens du menu
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche le navigateur de recharger la page ou de sauter à l'ancre classique
            const targetId = link.getAttribute('data-target');
            navigateTo(targetId);
        });
    });

    // 4. Gestion du menu mobile (Ouvrir/Fermer)
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});
