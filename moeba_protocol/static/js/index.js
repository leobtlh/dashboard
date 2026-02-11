// Désactiver la restauration automatique du scroll par le navigateur
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Forcer le retour en haut au chargement
window.addEventListener('load', function() {
    window.scrollTo(0, 0);

    // Optionnel : Si tu veux aussi que l'URL affiche proprement ".../#home"
    // history.replaceState(null, null, '#home');
});

// 1. Dictionnaire des traductions
const translations = {
    fr: {
        // Navigation & General
        home: "Accueil",
        concepts: "Architecture",
        mechanics: "Mécanique",
        regulation: "Conformité",
        ecosystem: "Écosystème",
        doc: "Doc",
        whitepaper: "Whitepaper",
        launch_dapp: "Launch dApp",

        // Hero Section
        badge_hpiv: "Hybrid Parametric Insurance Vault (HPIV)",
        main_title: "Infrastructure Décentralisée d'Assurance Paramétrique.",
        sub_title: "La solution au risque binaire des Cat Bonds traditionnels.<br>Une architecture multi-tranches sur ERC-4626 permettant un \"Soft Default\" et une solvabilité Fully Funded.",
        junior_senior: "Levier Junior / Sécurité Senior",
        liquidity: "Liquidité Standardisée",
        compliance: "Conformité Suisse (LSA)",

        // Section Architecture (Concepts)
        multi_slice: "Architecture Multi-Tranches",
        section_desc_concepts: "Le standard HPIV introduit une hiérarchie de capital pour absorber les chocs sans liquider les investisseurs.",

        // Card 1: Capital First Loss
        card1_title: "Capital \"First Loss\"",
        card1_desc: "Segmentation via <strong>Tranche Junior (ERC-20)</strong> et <strong>Tranche Senior (ERC-4626)</strong>. L'assureur (Sponsor) engage son propre capital en priorité.",
        card1_sub1_title: "Segmentation du Risque",
        card1_sub1_desc1: "Le protocole impose à l'assureur de déposer un <strong>Capital First Loss</strong> (Tranche Junior). Ce tampon de sécurité est sacrifié en premier lors d'un sinistre.",
        card1_sub1_desc2: "Les investisseurs (LPs) se positionnent majoritairement sur la <strong>Tranche Senior</strong>. Leur liquidité n'est exposée qu'après épuisement total du capital de l'assureur et de la Tranche Junior.",

        // Card 2: Waterfall
        card2_title: "Mécanisme Waterfall",
        card2_desc: "En cas de catastrophe, la fonction <code>triggerCatastrophe</code> exécute une absorption séquentielle des pertes.",
        card2_sub1_title: "Simulation de \"Soft Default\"",
        card2_sub1_desc1: "Exemple Whitepaper (Vault 40M$, Sinistre 8M$) :",
        card2_list1: "<strong>1. Assureur :</strong> Perd ses 4M$ de First Loss (100% perte).",
        card2_list2: "<strong>2. Buffer :</strong> La Réserve de Prime absorbe le reliquat.",
        card2_list3: "<strong>3. Tranche Junior :</strong> Absorbe les 4M$ restants (80% perte).",
        card2_list4: "<strong>4. Tranche Senior :</strong> Intacte (0% perte).",
        card2_result: "Résultat : Le Senior est protégé par le sacrifice des tranches inférieures.",

        // Card 3: Yield
        card3_title: "Yield Splitting",
        card3_desc: "Distribution asymétrique du rendement.",
        card3_sub1_title: "Levier de Rendement",
        card3_sub1_desc1: "<strong>Senior :</strong> Reçoit 70% de l'APR de base en échange de la sécurité (Safety First).",
        card3_sub1_desc2: "<strong>Junior :</strong> Capte l'effet de levier sur le reliquat des primes (30% du rendement Senior redirigé), boostant mécaniquement son APR (Yield Seekers).",

        // Section Mechanics (Advanced)
        mechanics_title: "Ingénierie Financière",
        mechanics_desc: "Sécurité mathématique on-chain et intégrité des données via Oracles.",

        // Card 7: Oracles & Sécurité
        card7_title: "Oracles & Sécurité",
        card7_desc: "Déclenchement automatisé par oracles chain-agnostic et protection contre les vecteurs d'attaque ERC-4626.",
        card7_sub1_title: "Intégrité Technique",
        card7_sub1_desc: "Le Vault intègre des mécanismes de défense avancés :",
        card7_list1: "<strong>Anti-Inflation Attack :</strong> Minting de \"Dead Shares\" à l'initialisation pour verrouiller le taux de change et empêcher les attaques par donation.",
        card7_list2: "<strong>Oracles Certifiés :</strong> Intégration de flux de données (USGS, NOAA) pour le déclenchement objectif des sinistres.",
        card7_sub2_title: "Sur-Collatéralisation",
        card7_sub2_desc: "Le contrat vérifie mathématiquement <code>TotalAssets >= Capacité</code> avant tout dépôt. Le risque est toujours \"Fully Funded\" pour éliminer le risque de contrepartie.",

        // Card 8: Premium Reserve
        card8_title: "Premium Reserve",
        card8_desc: "La <code>premiumReserve</code> est sanctuarisée et isolée du capital à risque.",
        card8_sub1_title: "Rendement Garanti",
        card8_sub1_desc1: "La prime versée par l'assureur est stockée dans une variable d'état distincte. Elle sert de tampon secondaire dans la Waterfall (après le capital assureur) mais ne constitue jamais le collatéral primaire du risque.",
        card8_sub1_desc2: "À maturité, cette réserve est la source unique du rendement distribué aux investisseurs Senior et Junior.",

        // Section Regulation
        regulation_title: "Cadre Réglementaire Suisse",
        regulation_desc: "Conçu selon les exigences de la LSA révisée et de la Loi DLT/TRD.",

        // Card 4: VUSA
        card4_title: "Véhicule VUSA (Art. 30e LSA)",
        card4_desc: "Structure juridique de \"Véhicule à Usage Spécifique d'Assurance\" (ISPV). Transformateur de risques financé intégralement par le marché des capitaux.",
        card4_sub1_title: "Conformité LSA Révisée",
        card4_sub1_desc1: "Le protocole respecte l'exigence de <strong>\"Fully Funded\"</strong> (Art. 111d AVO) : le VUSA dispose à tout moment d'actifs couvrant l'exposition maximale.",
        card4_sub1_desc2: "Utilisation des exemptions pour <strong>\"Preneurs d'Assurance Professionnels\"</strong> (Art. 30a LSA) pour optimiser les exigences de solvabilité et de fonds d'organisation.",

        // Card 5: DLT Law
        card5_title: "Loi DLT (Art. 973d CO)",
        card5_desc: "Les tokens HPIV sont qualifiés de <strong>Droits-Valeurs Inscrits</strong> (Ledger-based Securities).",
        card5_sub1_title: "Sécurité Juridique",
        card5_sub1_desc: "En vertu de la Loi TRD/DLT, la blockchain agit comme registre officiel de propriété. Le transfert du token équivaut juridiquement au transfert de la créance (Convention d'inscription), offrant une robustesse légale aux investisseurs institutionnels sans dépositaire central.",

        // Card 6: LBA/LSFin
        card6_title: "Conformité LBA & LSFin",
        card6_desc: "Architecture \"Permissioned DeFi\" avec Whitelisting (KYB/KYC) via la Factory.",
        card6_sub1_title: "Cadre Anti-Blanchiment",
        card6_sub1_desc1: "Le VUSA agit comme intermédiaire financier (Art. 2 LBA). Le Smart Contract <code>HPIVFactory</code> gère un registre d'assureurs whitelistés.",
        card6_sub1_desc2: "Le ciblage des <strong>Investisseurs Qualifiés</strong> permet l'exemption de prospectus (LSFin), alignant le protocole avec les standards institutionnels.",

        // Ecosystem & Footer
        ecosystem_title: "Écosystème & Ressources",
        ecosystem_desc: "Documentation technique, audits et analyses réglementaires.",
        col_protocol: "Protocole",
        link_arch: "HPIV Architecture",
        link_sc: "Smart Contracts (Solidity)",
        link_soft: "Soft Default Mechanics",
        link_market: "DLT Secondary Market",
        col_org: "Organisation",
        link_about: "À propos",
        link_partners: "ISPV Partners",
        link_career: "Carrière",
        col_resources: "Ressources",
        link_wp: "Whitepaper Technique",
        link_api: "Documentation API",
        link_repo: "GitHub Repository",
        link_math: "Rapport Mathématique",
        col_contact: "Contact",
        link_seat: "Siège : Lausanne, Suisse",
        link_mail: "Mail : info@moeba.ch",
        col_legal: "Légal & Conformité",
        link_finma: "Veille Réglementaire FINMA",
        link_rights: "Ledger-based Securities Registry",
        link_aml: "AMLA/KYC Policy",
        link_risk: "Risk Warning",
        col_access: "Accès",
        link_backoffice: "Backoffice",
        footer_copy: "© Mœba Protocol 2026 • Infrastructure VUSA Suisse."
    },
    en: {
        // Navigation & General
        home: "Home",
        concepts: "Architecture",
        mechanics: "Mechanics",
        regulation: "Compliance",
        ecosystem: "Ecosystem",
        doc: "Docs",
        whitepaper: "Whitepaper",
        launch_dapp: "Launch dApp",

        // Hero Section
        badge_hpiv: "Hybrid Parametric Insurance Vault (HPIV)",
        main_title: "Decentralized Parametric Insurance Infrastructure.",
        sub_title: "The solution to the binary risk of traditional Cat Bonds.<br>A multi-tranche architecture on ERC-4626 allowing \"Soft Default\" and Fully Funded solvency.",
        junior_senior: "Junior leverage / Senior security",
        liquidity: "Standardized Liquidity",
        compliance: "Swiss Compliance (LSA)",

        // Section Architecture (Concepts)
        multi_slice: "Multi-Slice Architecture",
        section_desc_concepts: "The HPIV standard introduces a capital hierarchy to absorb shocks without liquidating investors.",

        // Card 1: Capital First Loss
        card1_title: "\"First Loss\" Capital",
        card1_desc: "Segmentation via <strong>Junior Tranche (ERC-20)</strong> and <strong>Senior Tranche (ERC-4626)</strong>. The insurer (Sponsor) commits their own capital first.",
        card1_sub1_title: "Risk Segmentation",
        card1_sub1_desc1: "The protocol requires the insurer to deposit a <strong>First Loss Capital</strong> (Junior Tranche). This safety buffer is sacrificed first in the event of a claim.",
        card1_sub1_desc2: "Investors (LPs) mostly position themselves on the <strong>Senior Tranche</strong>. Their liquidity is only exposed after the total exhaustion of the insurer's capital and the Junior Tranche.",

        // Card 2: Waterfall
        card2_title: "Waterfall Mechanism",
        card2_desc: "In the event of a catastrophe, the <code>triggerCatastrophe</code> function executes a sequential absorption of losses.",
        card2_sub1_title: "\"Soft Default\" Simulation",
        card2_sub1_desc1: "Whitepaper Example (Vault $40M, Claim $8M):",
        card2_list1: "<strong>1. Insurer:</strong> Loses their $4M First Loss (100% loss).",
        card2_list2: "<strong>2. Buffer:</strong> The Premium Reserve absorbs the remainder.",
        card2_list3: "<strong>3. Junior Tranche:</strong> Absorbs the remaining $4M (80% loss).",
        card2_list4: "<strong>4. Senior Tranche:</strong> Intact (0% loss).",
        card2_result: "Result: The Senior tranche is protected by the sacrifice of lower tranches.",

        // Card 3: Yield
        card3_title: "Yield Splitting",
        card3_desc: "Asymmetric yield distribution.",
        card3_sub1_title: "Yield Leverage",
        card3_sub1_desc1: "<strong>Senior:</strong> Receives 70% of the base APR in exchange for safety (Safety First).",
        card3_sub1_desc2: "<strong>Junior:</strong> Captures leverage on the remaining premiums (30% of Senior yield redirected), mechanically boosting its APR (Yield Seekers).",

        // Section Mechanics (Advanced)
        mechanics_title: "Financial Engineering",
        mechanics_desc: "On-chain mathematical security and data integrity via Oracles.",

        // Card 7: Oracles & Security
        card7_title: "Oracles & Security",
        card7_desc: "Automated triggering by chain-agnostic oracles and protection against ERC-4626 attack vectors.",
        card7_sub1_title: "Technical Integrity",
        card7_sub1_desc: "The Vault integrates advanced defense mechanisms:",
        card7_list1: "<strong>Anti-Inflation Attack:</strong> Minting of \"Dead Shares\" at initialization to lock the exchange rate and prevent donation attacks.",
        card7_list2: "<strong>Certified Oracles:</strong> Integration of data streams (USGS, NOAA) for objective claim triggering.",
        card7_sub2_title: "Over-Collateralization",
        card7_sub2_desc: "The contract mathematically verifies <code>TotalAssets >= Capacity</code> before any deposit. The risk is always \"Fully Funded\" to eliminate counterparty risk.",

        // Card 8: Premium Reserve
        card8_title: "Premium Reserve",
        card8_desc: "The <code>premiumReserve</code> is ring-fenced and isolated from risk capital.",
        card8_sub1_title: "Guaranteed Yield",
        card8_sub1_desc1: "The premium paid by the insurer is stored in a distinct state variable. It serves as a secondary buffer in the Waterfall (after insurer capital) but never constitutes the primary risk collateral.",
        card8_sub1_desc2: "At maturity, this reserve is the sole source of yield distributed to Senior and Junior investors.",

        // Section Regulation
        regulation_title: "Swiss Regulatory Framework",
        regulation_desc: "Designed according to the revised ISA requirements and the DLT/TRD Law.",

        // Card 4: VUSA
        card4_title: "SPV Vehicle (Art. 30e ISA)",
        card4_desc: "Legal structure of \"Insurance Special Purpose Vehicle\" (ISPV). Risk transformer fully funded by the capital market.",
        card4_sub1_title: "Revised ISA Compliance",
        card4_sub1_desc1: "The protocol respects the <strong>\"Fully Funded\"</strong> requirement (Art. 111d ISO): the ISPV holds assets covering the maximum exposure at all times.",
        card4_sub1_desc2: "Use of exemptions for <strong>\"Professional Policyholders\"</strong> (Art. 30a ISA) to optimize solvency and organizational fund requirements.",

        // Card 5: DLT Law
        card5_title: "DLT Law (Art. 973d CO)",
        card5_desc: "HPIV tokens are qualified as <strong>Ledger-based Securities</strong> (Droits-Valeurs Inscrits).",
        card5_sub1_title: "Legal Certainty",
        card5_sub1_desc: "Under the TRD/DLT Law, the blockchain acts as the official registry of ownership. Token transfer is legally equivalent to the transfer of the claim, offering legal robustness to institutional investors without a central custodian.",

        // Card 6: LBA/LSFin
        card6_title: "AMLA & FinSA Compliance",
        card6_desc: "\"Permissioned DeFi\" architecture with Whitelisting (KYB/KYC) via the Factory.",
        card6_sub1_title: "Anti-Money Laundering Framework",
        card6_sub1_desc1: "The ISPV acts as a financial intermediary (Art. 2 AMLA). The <code>HPIVFactory</code> Smart Contract manages a registry of whitelisted insurers.",
        card6_sub1_desc2: "Targeting <strong>Qualified Investors</strong> allows for prospectus exemption (FinSA), aligning the protocol with institutional standards.",

        // Ecosystem & Footer
        ecosystem_title: "Ecosystem & Resources",
        ecosystem_desc: "Documentation technique, audits, and regulatory analysis.",
        col_protocol: "Protocole",
        link_arch: "HPIV Architecture",
        link_sc: "Smart Contracts (Solidity)",
        link_soft: "Soft Default Mechanics",
        link_market: "DLT Secondary Market",
        col_org: "Organisation",
        link_about: "À propos",
        link_partners: "ISPV Partners",
        link_career: "Carrière",
        col_resources: "Ressources",
        link_wp: "Technical Whitepaper",
        link_api: "API Documentation",
        link_repo: "GitHub Repository",
        link_math: "Rapport Mathématique",
        col_contact: "Contact",
        link_seat: "Siège : Lausanne, Suisse",
        link_mail: "Mail : info@moeba.ch",
        col_legal: "Légal & Conformité",
        link_finma: "Veille Réglementaire FINMA",
        link_rights: "Ledger-based Securities Registry",
        link_aml: "Politique LBA/AML",
        link_risk: "Avertissement Risques",
        col_access: "Accès",
        link_backoffice: "Backoffice",
        footer_copy: "© Mœba Protocol 2026 • Infrastructure VUSA Suisse."
    }
};

// 2. Fonction Toggle (Bascule)
function toggleLanguage() {
    // On regarde la langue actuelle du site
    const currentLang = document.documentElement.lang || 'en';
    // Si c'est FR on veut EN, sinon on veut FR
    const targetLang = currentLang === 'en' ? 'fr' : 'en';
    setLanguage(targetLang);
}

// Fonction principale pour appliquer la langue
function setLanguage(lang) {
    // Vérifie si la langue existe, sinon fallback sur 'fr'
    if (!translations[lang]) lang = 'en';

    // --- TRADUCTION DES TEXTES ---
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // --- MISE À JOUR DU BOUTON ---
    const btn = document.getElementById('langToggle');
    if (btn) {
        // Si la langue active est 'en', le bouton doit proposer 'FR'
        // Si la langue active est 'fr', le bouton doit proposer 'EN'
        btn.innerText = lang === 'en' ? 'FR' : 'EN';
    }

    // --- SAUVEGARDE ET DOM ---
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
}

// 3. Charger la langue au démarrage
document.addEventListener('DOMContentLoaded', () => {
    // Récupère la langue sauvegardée par l'utilisateur s'il est déjà venu
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    setLanguage(savedLang);
});

// --- GESTION SCROLL FLUIDE & NAVIGATION ---
const sections = document.querySelectorAll(".page");
let currentSection = 0;
let isScrolling = false;

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

// GESTION WHEEL (MOLETTE)
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

// --- GESTION TOUCH (MOBILE) ---
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('touchend', (e) => {
    if (document.body.classList.contains('modal-open')) return;
    if (isScrolling) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;
    const threshold = 50; // Sensibilité du swipe

    if (Math.abs(diffY) > threshold) {
        if (diffY > 0 && currentSection < sections.length - 1) {
            // Swipe vers le haut -> Section suivante
            currentSection++;
            isScrolling = true;
            smoothScrollTo(sections[currentSection].offsetTop, 1000);
            setTimeout(() => { isScrolling = false; }, 800);
        } else if (diffY < 0 && currentSection > 0) {
            // Swipe vers le bas -> Section précédente
            currentSection--;
            isScrolling = true;
            smoothScrollTo(sections[currentSection].offsetTop, 1000);
            setTimeout(() => { isScrolling = false; }, 800);
        }
    }
}, { passive: false });


// --- GESTION DES CLICS MENU (NAVIGATION FLUIDE) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        // Si href est juste "#", on ne fait rien ou on remonte
        if(targetId === '#') return;

        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            // 1. Mettre à jour currentSection pour la synchronisation molette
            sections.forEach((section, index) => {
                if(section === targetSection) {
                    currentSection = index;
                }
            });

            // 2. Lancer le scroll fluide
            isScrolling = true;
            smoothScrollTo(targetSection.offsetTop, 1000);

            // 3. Relâcher le verrou un peu après la fin
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    });
});


// --- GESTION DES CARTES EXPANDABLE ---
const cards = document.querySelectorAll('.card');
const overlay = document.getElementById('modalOverlay');

function closeAllCards() {
    cards.forEach(card => {
        card.classList.remove('expanded');
        // AJOUT: Reset explicite du transform pour éviter les conflits
        card.style.transform = '';
    });
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
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

        // Si la carte est déjà ouverte, on ne fait rien
        if (card.classList.contains('expanded')) return;

        // Fermer les autres d'abord
        closeAllCards();

        // Ouvrir celle-ci
        card.classList.add('expanded');
        overlay.classList.add('active');
        document.body.classList.add('modal-open'); // Désactive le scroll page
    });
});

// Fermeture via Overlay
if(overlay) overlay.addEventListener('click', closeAllCards);

// Fermeture via Echap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllCards();
});

// --- GESTION DU THÈME (MOON/SUN) ---
(function(){
    const switchBtn = document.getElementById('themeSwitch');

    // Définition des icônes SVG
    const sunIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/> <path d="m19.07 4.93-1.41 1.41"/>
        </svg>`;

    const moonIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>`;

    // Fonction pour mettre à jour l'icône selon le thème
    function updateIcon(isDark) {
        // Si Dark Mode actif, on affiche le Soleil (pour pouvoir repasser en clair)
        // Sinon on affiche la Lune
        if(switchBtn) switchBtn.innerHTML = isDark ? sunIcon : moonIcon;
    }

    // Initialisation au chargement
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Logique CSS :
    // .dark-theme PRÉSENT = Dark Mode
    // .dark-theme ABSENT = Light Mode (via body:not(.dark-theme))

    const isDarkInitial = saved === 'dark' || (!saved && prefersDark);

    if (isDarkInitial) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Mise à jour de l'icône initiale
    updateIcon(isDarkInitial);

    if(switchBtn) {
        switchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Bascule la classe
            document.body.classList.toggle('dark-theme');

            // Vérifie le nouvel état
            const isDarkNow = document.body.classList.contains('dark-theme');

            // Sauvegarde
            localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');

            // Mise à jour de l'icône
            updateIcon(isDarkNow);
        });
    }
})();

// --- GESTION DU PRELOADER ORGANIQUE (SÉQUENCE FINIE) ---
const loader = document.getElementById('moebaLoader');
const cell = document.querySelector('.organic-cell');

if (loader && cell) {
    // 1. Promesse : la page est complètement chargée
    const pageLoadPromise = new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });

    // 2. Promesse : l'animation CSS est terminée (3s)
    const animationPromise = new Promise(resolve => {
        // On écoute la fin de l'animation CSS 'moebaIntro'
        cell.addEventListener('animationend', resolve, { once: true });

        // Fallback de sécurité : si jamais l'event ne fire pas (ex: tab inactif) on force après 4s
        setTimeout(resolve, 3500);
    });

    // 3. Quand les DEUX conditions sont remplies (Page Loaded + Animation Finished), on cache
    Promise.all([pageLoadPromise, animationPromise]).then(() => {
        loader.classList.add('hidden');
        // Nettoyage optionnel du DOM après le fade-out CSS
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    });
}
