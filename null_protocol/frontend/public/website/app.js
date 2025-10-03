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
