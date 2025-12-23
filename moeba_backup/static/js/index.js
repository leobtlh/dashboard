// Thème : on applique la classe sur <body> (comme discuté)
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

function smoothScrollTo(targetY, duration = 1500) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let start;

  // Fonction d'easing : départ rapide, arrivée lente
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

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
  if (isScrolling) return;
  isScrolling = true;

  if (e.deltaY > 0 && currentSection < sections.length - 1) {
    currentSection++;
  } else if (e.deltaY < 0 && currentSection > 0) {
    currentSection--;
  }

  const targetY = sections[currentSection].offsetTop;
  smoothScrollTo(targetY, 1000); // ← ajuste la durée (ms)

  setTimeout(() => {
    isScrolling = false;
  }, 800);
});
