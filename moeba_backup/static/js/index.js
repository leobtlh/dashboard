// Thème : on applique la classe sur <body>
(function(){
    const switchBtn = document.getElementById('themeSwitch');
    const saved = localStorage.getItem('theme');
    if(saved === 'dark') document.body.classList.add('dark-theme');


    if(!switchBtn) return;
    switchBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
})();

const sections = document.querySelectorAll(".page");
let currentSection = 0;
let isScrolling = false;

// --- GESTION SCROLL ---
function smoothScrollTo(targetY, duration = 1500) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let start;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function step(timestamp) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const percent = Math.min(time / duration, 1);
    const eased = easeOutCubic(percent);

    window.scrollTo(0, startY + diff * eased);

    if (time < duration) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}


window.addEventListener("wheel", (e) => {
  // Si une carte est ouverte, on désactive le scroll automatique des sections
  if (document.body.classList.contains('modal-open')) return;

  if (isScrolling) return;
  isScrolling = true;

  if (e.deltaY > 0 && currentSection < sections.length - 1) {
    currentSection++;
  } else if (e.deltaY < 0 && currentSection > 0) {
    currentSection--;
  }

  const targetY = sections[currentSection].offsetTop;
  smoothScrollTo(targetY, 1000);

  setTimeout(() => {
    isScrolling = false;
  }, 800);
});


// --- GESTION DES CARTES EXPANDABLE ---
const cards = document.querySelectorAll('.card');
const overlay = document.getElementById('modalOverlay');

function closeAllCards() {
    cards.forEach(card => card.classList.remove('expanded'));
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open'); // Réactive le scroll page
}

cards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Empêcher la propagation si on clique sur un lien ou un bouton à l'intérieur
        if(e.target.closest('a') || e.target.closest('button')) {
            // Si c'est le bouton fermer, on gère la fermeture ici
            if (e.target.closest('.close-btn')) {
                e.stopPropagation();
                closeAllCards();
            }
            return;
        }

        // Si la carte est déjà ouverte, on ne fait rien (ou on pourrait fermer)
        if (card.classList.contains('expanded')) return;

        // Fermer les autres d'abord
        closeAllCards();

        // Ouvrir celle-ci
        card.classList.add('expanded');
        overlay.classList.add('active');
        document.body.classList.add('modal-open'); // Désactive le scroll page (utile pour wheel)
    });
});

// Fermeture via Overlay
overlay.addEventListener('click', closeAllCards);

// Fermeture via Echap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllCards();
});
