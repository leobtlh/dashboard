window.addEventListener("load", function () {
    initVars()
    setTimeout(() => {
        checkCounters()
        checkCarousel()
    }, 60)
    setHeights()
    initCarousel()
    initMap()
    startSlider()
    loadArticles()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll)
    document.querySelector(".carousel").addEventListener("mouseenter", () => {
        carouselRunning = false
    })
    document.querySelector(".carousel").addEventListener("mouseleave", () => {
        carouselRunning = true
    })
    removeLoader()
})

// Globals
let language
let sliderTimeout
let sliderCurrent = 0
let carouselStarted = false
let carouselemToShow = 3
let carouselIterations = 0
let carouselemWidth = 200
let carouselRunning = true
let carouselSize
let carousel
let carouselWidth
let carouselems
let offsetLeft
let resizeTimeout = null
let scrollTimeout = null
let articlesLoaded = 0
let numberContainers
let numberSets
let isResizing = false
let isScrolling = false
let articles = [
    {
        fr: {
            title: "TuxyMAT et BAT",
            desc: "Depuis le 1er janvier 2023, nous gérons les automates du marché Suisse de BAT.",
            date: "Janvier 2023"
        },
        en: {
            title: "TuxyMAT & BAT",
            desc: "Since January 1, 2023, we have been managing BAT's vending machines for the Swiss market.",
            date: "January 2023"
        },
        src: "assets/img/bg-1.webp",
    },
    {
        fr: {
            title: "TuxyPICK en Norvège",
            desc: "Solution intégrée de préparation des commandes B2C. En service depuis 2006. Rénové et agrandi en 2023.",
            date: "Juin 2023"
        },
        en: {
            title: "TuxyPICK in Norway",
            desc: "Integrated B2C order-picking solution. In operation since 2006. Renovated and expanded in 2023.",
            date: "June 2023"
        },
        src: "assets/img/bg-0.webp",
    },
    {
        fr: {
            title: "TuxyPICK en Suède",
            desc: "Mise en service d'un module sans papier. Assignation des commandes automatiquement aux tables de préparation.",
            date: "Février 2023"
        },
        en: {
            title: "TuxyPICK in Sweden",
            desc: "Paperless module implemented. Orders automatically assigned to picking tables.",
            date: "February 2023"
        },
        src: "assets/img/bg-2.webp",
    },
    {
        fr: {
            title: "TuxyPICK en Suisse",
            desc: "En collaboration avec Knapp pour le convoyage, mise en service d'une installation de Pick&Pack pour les fortes rotations. Le système inclut un double contrôle basé sur le poids de la marchandise, 10 stations de picking, 2 stations de contrôle, des rampes d’expédition, ...",
            date: "Septembre 2021"
        },
        en: {
            title: "TuxyPICK in Switzerland",
            desc: "In collaboration with Knapp for conveying, implementation of a Pick&Pack system for high  turnover. The system includes double control based on the weight of the goods, 10 picking stations, 2 control stations, shipping ramps, ...",
            date: "September 2021"
        },
        src: "assets/img/bg-2.webp",
    },
]
let contact_message = {
    "success" : {
        "fr": "Le message a été envoyé.\n" +
	    "Nous vous contacterons dans les plus brefs délais.",
        "en": "The message has been sent.\n" +
	    "We will contact you as soon as possible."
    },
    "error":{
        "fr": "Un problème impromptu s'est produit, le message n'a pas pu être transmis.\n" +
            "Réessayez plus tard",
        "en": "An unexpected problem occurred, the message could not be transmitted.\n" +
            "Try again later"
    }
}

/**
 * Enlève le modal loader du DOM à la fin de la transition opacity.
 */
function removeLoader() {
    let loader = document.querySelector("#loader")
    loader.style.opacity = 0
    setTimeout(() => {
        loader.remove()
    }, 500)
}

/**
 * Initialise les variables.
 */
function initVars() {
    language = document.querySelector("#lang-en").classList.contains("active") ? "en" : "fr"
    numberContainers = Array.from(document.querySelectorAll(".number-value"))
    numberSets = Array.from(numberContainers, _ => false)
}

/**
 * Appelé à chaque fois que la fenêtre est redimensionnée.
 * Contient un callback appelé 100ms à la fin du redimensionnement.
 */
function onResize() {
    isResizing = true
    if (resizeTimeout) {
        clearTimeout(resizeTimeout)
        resizeTimeout = null
    } else {
        document.body.classList.add("stop-transitions")
    }
    resizeTimeout = setTimeout(onResizeEnded, 100)
    setHeights()
    setBlur()
}

/**
 * Callback de la fonction onResize.
 */
function onResizeEnded() {
    document.body.classList.remove("stop-transitions")
    resizeTimeout = null
    isResizing = false
    refreshCarouselemPositions()
    fillWithEmptyArticles()
}

/**
 * Appelé à chaque fois que la fenêtre est scrollée.
 * Contient un callback appelé 500ms à la fin du scrolling.
 */
function onScroll() {
    isScrolling = true
    if (scrollTimeout) {
        clearTimeout(scrollTimeout)
        scrollTimeout = null
    }
    scrollTimeout = setTimeout(onScrollEnded, 500)
    clearInterval(sliderTimeout)
    setBlur()
    checkCounters()
    checkCarousel()
}

/**
 * Callback de la fonction onScroll.
 */
function onScrollEnded() {
    isScrolling = false
    startSlider()
}

/**
 * Appelée pendant l'évenement scroll. Démarre le carousel si celui-ci ne l'est pas et qu'il se trouve
 * dans le viewport.
 */
function checkCarousel() {
    if (carouselStarted) return
    if (isInViewport(carousel)) {
        carouselStarted = true
        startCarousel()
    }
}

/**
 * Modifie la hauteur de la margin-top du main-container.
 */
function setHeights() {
    let height = window.innerHeight
    let mainContainer = document.querySelector(".main-container")
    mainContainer.style.marginTop = `${height}px`
}

/**
 * Modifie la valeur du flou du slider en fonction de la position de scrollY
 */
function setBlur() {
    let offsetTop = window.scrollY
    let fixedContainer = document.querySelectorAll(".fixed-container")
    let maxVal = 10
    Array.from(fixedContainer).forEach(el =>
        el.style.filter = `blur(${Math.min(maxVal, offsetTop * maxVal / el.clientHeight)}px)`)
}

/**
 * Initialise l'élément counter en paramètre pour l'effet de comptage.
 * @param el    Élément du DOM de la forme h1.number-value qui contient un nombre.
 * @param index Son index dans la liste.
 */
function initCounter(el, index) {
    numberSets[index] = true
    let currentValue = 0
    let finalValue = parseInt(el.innerHTML)
    let nbIntervals = 200 + 30 * index
    let interval = setInterval(() => {
        if (currentValue >= finalValue) {
            currentValue = finalValue
            el.animate([
                {
                    transform: "scale(1.0)"
                },
                {
                    transform: "scale(2)"
                },
                {
                    transform: "scale(1.0)"
                }
            ], {duration: 500})
            clearInterval(interval)
        } else {
            currentValue += finalValue / nbIntervals
        }
        el.innerHTML = `${Math.round(currentValue)}+`
    }, 10)
}

/**
 * Vérifie pour chaque counter s'il n'a pas compté et s'il est dans le viewport.
 * L'initialise dans ce cas.
 */
function checkCounters() {
    numberContainers.forEach((el, index) => {
        if (!numberSets[index] && isInViewport(el)) {
            initCounter(el, index)
        }
    })
}

/**
 * Charge les articles et les ajoute au DOM
 * @param _nbArticlesToLoad Le nombre d'articles à charger (3 par défaut)
 */
function loadArticles(_nbArticlesToLoad = 3) {
    let oldBtn = document.querySelector("#add-article")
    if (oldBtn) oldBtn.remove()
    let articlesDiv = document.querySelector(".articles")
    if (articlesLoaded + _nbArticlesToLoad + 1 === articles.length) {
        _nbArticlesToLoad++
    }
    let articlesReady = articles.slice(articlesLoaded, articlesLoaded + _nbArticlesToLoad).map(article => createArticle(article))
    articlesLoaded += _nbArticlesToLoad
    articlesReady.forEach(article => articlesDiv.append(article))
    if (articles.length > articlesLoaded) {
        let addArticleDiv = document.createElement("div")
        addArticleDiv.classList.add("article")
        addArticleDiv.id = "add-article"
        addArticleDiv.addEventListener("click", _ => loadArticles())
        let btn = document.createElement("button")
        btn.classList.add("btn-transparent")
        btn.id = "btn-articles"
        btn.innerHTML = "+"
        addArticleDiv.appendChild(btn)
        articlesDiv.appendChild(addArticleDiv)
    }
    fillWithEmptyArticles()
}

/**
 * Crée un élément DOM article depuis un dictionnaire et le retourne.
 * @param _article Dictionnaire contenant les informations de l'article (cf.: const articles)
 * @returns {HTMLDivElement} Element HTML normalisé pour afficher un article.
 */
function createArticle(_article) {
    let article = document.createElement("div")
    article.classList.add("article")
    let loader = document.createElement("div")
    loader.classList.add("loader")
    article.appendChild(loader)
    let loadingImg = new Image()
    loadingImg.src = "assets/img/loading.gif"
    loader.appendChild(loadingImg)
    let img = new Image()
    img.classList.add("bg")
    img.src = _article.src
    img.onload = function () {
        article.appendChild(img)
        loader.classList.add("loaded")
    }
    let content = document.createElement("div")
    content.classList.add("content")
    let title = document.createElement("h1")
    title.innerHTML = _article[language].title
    let desc = document.createElement("p")
    desc.innerHTML = _article[language].desc
    let date = document.createElement("span")
    date.classList.add("date")
    date.innerHTML = _article[language].date
    content.append(title, desc)
    article.append(content, date)
    return article
}

/**
 * Remplit d'articles vide pour avoir un joli alignement sur la gauche
 */
function fillWithEmptyArticles() {
    Array.from(document.querySelectorAll(".article.hidden")).forEach(el => el.remove())
    let articlesContainerWidth = document.querySelector(".articles").getBoundingClientRect().width
    let articleWidth = document.querySelector(".article").getBoundingClientRect().width
    let nbArticlesPerRow = Math.floor(articlesContainerWidth / articleWidth)
    let nbArticlesDisplayed = document.querySelectorAll(".article").length
    let nbArticlesToAdd = nbArticlesPerRow - nbArticlesDisplayed % nbArticlesPerRow
    if (nbArticlesDisplayed <= nbArticlesPerRow || nbArticlesPerRow == 1 || nbArticlesToAdd === nbArticlesPerRow) return
    let articlesDiv = document.querySelector(".articles")
    for (let i=0; i< nbArticlesToAdd; i++) {
        let articleEmpty = document.createElement("div")
        articleEmpty.classList.add("article", "hidden")
        articlesDiv.appendChild(articleEmpty)
    }
}

/**
 * Initialise la carte en utilise le framework leaflet.
 */
function initMap() {
    let map = L.map("map", {scrollWheelZoom: false}).setView([46.50189, 6.68958], 15)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map)
    let icon = L.icon({
        iconUrl: "https://www.altux.ch/assets/img/altux-logo.png",
        iconSize: [75, 23],
        iconAnchor: [25, 30],
        popupAnchor: [0, 0]
    })
    L.marker([46.50189, 6.68958], {icon}).addTo(map)
    document.querySelector(".leaflet-bottom.leaflet-right").remove()
}

/**
 * Initialise le carousel
 */
function initCarousel() {
    carousel = document.querySelector(".carousel")
    carouselWidth = carousel.getBoundingClientRect().width
    carouselems = document.querySelectorAll(".carouselem")
    refreshCarouselemPositions(true)
}

/**
 * Clone les n premiers éléments du carousel afin de donner un effet de scrolling horizontal infini.
 * N étant le nombre d'éléments affichés du carousel.
 */
function cloneCarousel() {
    carouselSize = carouselems.length
    for (let i = 0; i < carouselemToShow; i++) {
        carousel.append(carouselems[i].cloneNode(true))
    }
}

/**
 * Initialise les éléments du carousel, leur nombre à afficher et leur position.
 */
function refreshCarouselemPositions(_firstCall = false) {
    if (!_firstCall) {
        carousel.innerHTML = ""
        Array.from(carouselems).forEach(el => carousel.append(el))
    }
    setCarouselemToShow()
    cloneCarousel()
    setCarouselemPositions()
}

/**
 * Calcul le nombre d'éléments du carousel à afficher ainsi que la distance entre chacun.
 */
function setCarouselemToShow() {
    carouselWidth = carousel.getBoundingClientRect().width
    carouselemToShow = Math.floor(carouselWidth / (carouselemWidth + 100))
    if (carouselemToShow > 1) {
        offsetLeft = (carouselWidth - carouselemToShow * carouselemWidth) / (carouselemToShow - 1) + carouselemWidth
    } else {
        offsetLeft = 3 * carouselemWidth
    }
}

/**
 * Set la position de chacun des éléments du carousel.
 */
function setCarouselemPositions() {
    carousel = document.querySelector(".carousel")
    Array.from(carousel.children).forEach((el, index) => {
        el.style.left = `${getCarouselemLeft(index)}px`
    })
}

/**
 * Calcul et retourne la position x de l'élément du carousel à l'index en question.
 * @param _index        Index de l'élément du carousel.
 * @returns {number}    La position x de l'élément du carousel.
 */
function getCarouselemLeft(_index) {
    if (carouselemToShow > 1) {
        return _index * offsetLeft
    }
    return _index * offsetLeft + (carouselWidth - carouselemWidth) / 2
}

/**
 * Ajoute une animation à chaque élément du carousel.
 */
function addCarouselAnimation() {
    if (isResizing || !carouselRunning) return
    let maxIterations = Array.from(carousel.children).length - carouselemToShow - 1
    Array.from(carousel.children).forEach((el, index) => {
        let currentLeft = getCarouselemLeft(index - carouselIterations)
        el.animate(
            [
                {
                    left: `${currentLeft}px`
                },
                {
                    left: `${currentLeft - offsetLeft}px`
                }
            ], {
                duration: 1000,
                easing: "ease-in-out",
                fill: "forwards"
            })
    })
    if (carouselIterations >= maxIterations) carouselIterations = 0
    else carouselIterations++
}

/**
 * Démarre le carousel.
 */
function startCarousel() {
    setInterval(addCarouselAnimation, 4000)
}

/**
 * Démarre le slider.
 */
function startSlider() {
    sliderTimeout = setInterval(transitionSlider, 8400) // 6000 avant changements
}

/**
 * Effectue la transition entre deux slides.
 */
function transitionSlider() {
    if (window.scrollY > 60) return
    let nbSlides = document.querySelectorAll(".fixed-container").length
    let sliderNext
    switch (sliderCurrent) {
        case nbSlides - 1:
            sliderNext = 0
            break
        default:
            sliderNext = sliderCurrent + 1
            break
    }
    document.querySelectorAll(".fixed-container")[sliderCurrent].style.opacity = 0
    document.querySelectorAll(".fixed-container")[sliderNext].style.opacity = 1
    if (sliderCurrent >= nbSlides - 1) sliderCurrent = 0
    else sliderCurrent++
}





/**
 * Vérifie si l'élément se trouve dans le viewport.
 * @param _element L'élément à vérifier
 * @returns {boolean}
 */
function isInViewport(_element) {
    let rect = _element.getBoundingClientRect();
    return !(rect.top > window.innerHeight || rect.bottom < 0);
}

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

/**
 * Fonction pour sélectionner un produit dans le dropdown.
 * @param product Le produit sélectionné
 */
function selectProduct(product) {
    document.getElementById("form-produit").value = product;
    document.getElementById("dropdown-content").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('scrollButtonBox').addEventListener('click', function() {
        document.getElementById('targetSection').scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('scrollButtonMat').addEventListener('click', function() {
        document.getElementById('targetSection').scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('scrollButtonPick').addEventListener('click', function() {
        document.getElementById('targetSection').scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('scrollButtonShop').addEventListener('click', function() {
        document.getElementById('targetSection').scrollIntoView({ behavior: 'smooth' });
    });
});

/**
 * Fonction pour ajuster la taille des product cards.
 */
function adjustCardHeights() {
    const cards = document.querySelectorAll('.inner-card');
    let maxHeight = 0;

    // Recalcul la hauteur max
    cards.forEach(card => {
        card.style.height = 'auto';
    });

    // Trouve la hauteur max
    cards.forEach(card => {
        const cardHeight = card.offsetHeight;
        if (cardHeight > maxHeight) {
            maxHeight = cardHeight;
        }
    });

    // Met toutes les card à la hauteur maximale
    cards.forEach(card => {
        card.style.height = maxHeight + 'px';
    });
}

// Ajuste les hauteurs au chargement et au redimensionnement de la fenêtre
window.addEventListener('load', adjustCardHeights);
window.addEventListener('resize', adjustCardHeights);
