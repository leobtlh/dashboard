/* Fonction pour obtenir la langue actuelle */
function getCurrentLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    if (langParam) {
        return langParam;
    }

    if (navigator.language) {
        const browserLang = navigator.language.substring(0, 2).toLowerCase();
        if (browserLang === 'de' || browserLang === 'fr') {
            return browserLang;
        }
    }

    return 'fr';
}

/* Fonction pour obtenir la traduction */
function getTranslation(key) {
    const lang = getCurrentLanguage();
    return translations[lang] ? translations[lang][key] : translations['fr'][key];
}

/* Traductions */
const translations = {
    'fr': {
        'browser_language': 'Français'
    },
    'de': {
        'browser_language': 'Deutsch'
    }
};

/* Variable globale pour stocker les langues */
let availableLanguages = null;

/* Fonction pour gérer la sélection des langues */
function setupLanguageDropdown(dropdownId, contentId, callback) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const button = dropdown.querySelector('.dropdown-button');
    const content = document.getElementById(contentId);

    if (!button || !content) return;

    // Nettoyer les anciens événements
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener('click', function(event) {
        event.stopPropagation();
        document.querySelectorAll('.dropdown').forEach(d => {
            if (d.id !== dropdownId) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
    });

    content.querySelectorAll('a').forEach(item => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        newItem.addEventListener('click', function(event) {
            event.preventDefault();
            content.querySelectorAll('a').forEach(a => a.classList.remove('selected'));
            this.classList.add('selected');
            newButton.innerHTML = `${this.innerText} <span style="font-size: 1.5em;">⌄</span>`;
            dropdown.classList.remove('open');
            if (typeof callback === 'function') {
                callback(this.getAttribute('data-value'));
            }
        });
    });
}

/* Fonction pour initialiser les dropdowns de langue */
function initializeLanguageDropdowns() {
    if (!availableLanguages) return;

    const currentLang = getCurrentLanguage();
    const targetLangCode = currentLang === 'fr' ? 'FR' : 'DE';

    // Traduction de texte
    const sourceDropdownText = document.getElementById('source-dropdown-content');
    const targetDropdownText = document.getElementById('target-dropdown-content');

    if (sourceDropdownText && targetDropdownText) {
        sourceDropdownText.innerHTML = '';
        targetDropdownText.innerHTML = '';

        const autoOption = document.createElement('a');
        autoOption.href = '#';
        autoOption.setAttribute('data-value', 'auto');
        autoOption.innerText = 'Detected';
        sourceDropdownText.appendChild(autoOption);

        availableLanguages.source_languages.forEach(lang => {
            const sourceOption = document.createElement('a');
            sourceOption.href = '#';
            sourceOption.setAttribute('data-value', lang.code);
            sourceOption.innerText = lang.name;
            sourceDropdownText.appendChild(sourceOption);
        });

        availableLanguages.target_languages.forEach(lang => {
            const targetOption = document.createElement('a');
            targetOption.href = '#';
            targetOption.setAttribute('data-value', lang.code);
            targetOption.innerText = lang.name;
            targetDropdownText.appendChild(targetOption);
        });

        setupLanguageDropdown('source-dropdown', 'source-dropdown-content');
        setupLanguageDropdown('target-dropdown', 'target-dropdown-content');

        const targetLangElement = document.querySelector(`#target-dropdown-content a[data-value="${targetLangCode}"]`);
        if (targetLangElement) {
            targetLangElement.classList.add('selected');
            document.querySelector('#target-dropdown .dropdown-button').innerHTML =
                `${targetLangElement.innerText} <span style="font-size: 1.5em;">⌄</span>`;
        }

        const autoSourceElement = document.querySelector('#source-dropdown-content a[data-value="auto"]');
        if (autoSourceElement) {
            autoSourceElement.classList.add('selected');
            document.querySelector('#source-dropdown .dropdown-button').innerHTML =
                `${autoSourceElement.innerText} <span style="font-size: 1.5em;">⌄</span>`;
        }
    }

    // Traduction de documents
    const sourceDropdownDoc = document.getElementById('source-dropdown-content-doc');
    const targetDropdownDoc = document.getElementById('target-dropdown-content-doc');

    if (sourceDropdownDoc && targetDropdownDoc) {
        sourceDropdownDoc.innerHTML = '';
        targetDropdownDoc.innerHTML = '';

        const autoOptionDoc = document.createElement('a');
        autoOptionDoc.href = '#';
        autoOptionDoc.setAttribute('data-value', 'auto');
        autoOptionDoc.innerText = 'Detected';
        sourceDropdownDoc.appendChild(autoOptionDoc);

        availableLanguages.source_languages.forEach(lang => {
            const sourceOption = document.createElement('a');
            sourceOption.href = '#';
            sourceOption.setAttribute('data-value', lang.code);
            sourceOption.innerText = lang.name;
            sourceDropdownDoc.appendChild(sourceOption);
        });

        availableLanguages.target_languages.forEach(lang => {
            const targetOption = document.createElement('a');
            targetOption.href = '#';
            targetOption.setAttribute('data-value', lang.code);
            targetOption.innerText = lang.name;
            targetDropdownDoc.appendChild(targetOption);
        });

        setupLanguageDropdown('source-dropdown-doc', 'source-dropdown-content-doc');
        setupLanguageDropdown('target-dropdown-doc', 'target-dropdown-content-doc');

        const targetLangDocElement = document.querySelector(`#target-dropdown-content-doc a[data-value="${targetLangCode}"]`);
        if (targetLangDocElement) {
            targetLangDocElement.classList.add('selected');
            document.querySelector('#target-dropdown-doc .dropdown-button').innerHTML =
                `${targetLangDocElement.innerText} <span style="font-size: 1.5em;">⌄</span>`;
        }

        const autoSourceDocElement = document.querySelector('#source-dropdown-content-doc a[data-value="auto"]');
        if (autoSourceDocElement) {
            autoSourceDocElement.classList.add('selected');
            document.querySelector('#source-dropdown-doc .dropdown-button').innerHTML =
                `${autoSourceDocElement.innerText} <span style="font-size: 1.5em;">⌄</span>`;
        }
    }

    // Amélioration de texte
    const improveDropdown = document.getElementById('improve-dropdown-content');
    if (improveDropdown) {
        setupLanguageDropdown('improve-dropdown', 'improve-dropdown-content');

        const improveLangElement = document.querySelector(`#improve-dropdown-content a[data-value="${targetLangCode}"]`);
        if (improveLangElement) {
            improveLangElement.classList.add('selected');
            document.querySelector('#improve-dropdown .dropdown-button').innerHTML =
                `${improveLangElement.innerText} <span style="font-size: 1.5em;">⌄</span>`;
        }
    }
}

/* Chargement initial */
document.addEventListener("DOMContentLoaded", function () {
    // Fermer les dropdowns quand on clique en dehors
    document.addEventListener("click", function () {
        document.querySelectorAll(".dropdown").forEach(dropdown => dropdown.classList.remove("open"));
    });

    // Charger le menu
    loadMenuContent('/menu.html');

    // Récupérer les langues disponibles
    fetch('/available-languages')
        .then(response => response.json())
        .then(languages => {
            availableLanguages = languages;
            initializeLanguageDropdowns();
            initializeTextTranslation();
            initializeDocumentTranslation();
            initializeTextImprovement();
        })
        .catch(err => console.error('Erreur lors du chargement des langues:', err));
});

/* Gestion du menu */
function loadMenuContent(url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const menuContainer = document.getElementById('menu');
            if (menuContainer) {
                menuContainer.innerHTML = data;
                setupActiveMenu();
                setupThemeSwitch();
            }
        })
        .catch(error => console.error('Erreur chargement menu :', error));
}

function setupThemeSwitch() {
    const switchBtn = document.getElementById('themeSwitch');
    if (!switchBtn) return;

    // Appliquer le thème sauvegardé au chargement
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    switchBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Évite de remonter en haut de la page

        // Toggle de la classe
        document.body.classList.toggle('dark-theme');

        // Sauvegarder le thème dans localStorage
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }

        console.log('Thème changé et sauvegardé :', localStorage.getItem('theme'));
    });
}


function setupActiveMenu() {
    const menu = document.getElementById('menu');
    if (!menu) return;

    menu.addEventListener('click', function (e) {
        const item = e.target.closest('.form-menu');
        if (!item) return;

        menu.querySelectorAll('.form-menu.active').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });

    const path = window.location.pathname;
    const items = menu.querySelectorAll('.form-menu');
    let activated = false;

    items.forEach(i => {
        const href = i.getAttribute('href');
        if (href === "/" && path === "/") {
            i.classList.add('active');
            activated = true;
        } else if (href !== "/" && path.startsWith(href)) {
            i.classList.add('active');
            activated = true;
        }
    });

    if (!activated) {
        const defaultItem = menu.querySelector('.form-menu[href="/"]');
        if (defaultItem) {
            defaultItem.classList.add('active');
        }
    }
}

/* Initialisation pour la traduction de texte */
function initializeTextTranslation() {
    const translateBtn = document.getElementById('translate-btn');
    const textArea = document.getElementById('text');

    function triggerTranslation(event) {
        event.preventDefault();

        const text = textArea.value;
        const sourceLang = document.querySelector('#source-dropdown-content a.selected')?.getAttribute('data-value') || 'auto';

        const defaultTargetLang = getCurrentLanguage() === 'de' ? 'DE' : 'FR';
        const targetLang = document.querySelector('#target-dropdown-content a.selected')?.getAttribute('data-value') || defaultTargetLang;

        if (text.trim() === '') {
            document.getElementById('result').value = '';
            return;
        }

        fetch('/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').value = data.translated_text;
        })
        .catch(error => {
            console.error('Erreur :', error);
        });
    }

    // Clic sur le bouton
    if (translateBtn) translateBtn.addEventListener('click', triggerTranslation);

    // Touche Enter dans le textarea
    if (textArea) {
        textArea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                triggerTranslation(e); // Enter → traduction
            }
            // Shift+Enter → retour à la ligne normal, donc pas de preventDefault
        });
    }

    const refreshBtn = document.getElementById('refresh-translation');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function (event) {
            event.preventDefault();

            textArea.value = '';
            document.getElementById('result').value = '';

            document.querySelectorAll('#source-dropdown-content a').forEach(item => item.classList.remove('selected'));
            document.querySelectorAll('#target-dropdown-content a').forEach(item => item.classList.remove('selected'));

            const autoSource = document.querySelector('#source-dropdown-content a[data-value="auto"]');
            if (autoSource) {
                autoSource.classList.add('selected');
                document.querySelector('#source-dropdown .dropdown-button').innerHTML =
                    `${'Detected'} <span style="font-size: 1.5em;">⌄</span>`;
            }

            const currentLang = getCurrentLanguage();
            const targetLangCode = currentLang === 'fr' ? 'FR' : 'DE';
            const targetLangElement = document.querySelector(`#target-dropdown-content a[data-value="${targetLangCode}"]`);
            if (targetLangElement) {
                targetLangElement.classList.add('selected');
                document.querySelector('#target-dropdown .dropdown-button').innerHTML =
                    `${targetLangElement.innerText} <span style="font-size: 1.5em;">⌄</span>`;
            }
        });
    }

    const switchTextBtn = document.getElementById('switch_translation');
    if (switchTextBtn) {
        switchTextBtn.addEventListener('click', function (event) {
            event.preventDefault();

            let tmp = textArea.value;
            textArea.value = document.getElementById('result').value;
            document.getElementById('result').value = tmp;

            const sourceElement = document.querySelector('#source-dropdown-content a.selected');
            const targetElement = document.querySelector('#target-dropdown-content a.selected');
            if (!sourceElement || !targetElement) return;

            const sourceLang = sourceElement.getAttribute('data-value');
            const targetLang = targetElement.getAttribute('data-value');
            if (sourceLang === 'auto') return;

            document.querySelectorAll('#source-dropdown-content a, #target-dropdown-content a').forEach(item => item.classList.remove('selected'));

            document.querySelector(`#source-dropdown-content a[data-value="${targetLang}"]`).classList.add('selected');
            document.querySelector(`#target-dropdown-content a[data-value="${sourceLang}"]`).classList.add('selected');

            const sourceButton = document.querySelector('#source-dropdown .dropdown-button');
            const targetButton = document.querySelector('#target-dropdown .dropdown-button');

            sourceButton.innerHTML = `${document.querySelector(`#source-dropdown-content a[data-value="${targetLang}"]`).innerText} <span style="font-size: 1.5em;">⌄</span>`;
            targetButton.innerHTML = `${document.querySelector(`#target-dropdown-content a[data-value="${sourceLang}"]`).innerText} <span style="font-size: 1.5em;">⌄</span>`;
        });
    }
}

/* Initialisation pour la traduction de document */
function initializeDocumentTranslation() {
    const isAdvancedUpload = function() {
        const div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();

    const $form = document.getElementById('document-translation-form');
    if (!$form) return;

    const $input = $form.querySelector('input[type="file"]');
    const $errorMsg = $form.querySelector('.box__error span');
    let droppedFiles = false;

    $input.addEventListener('change', function () {
        const file = $input.files[0];
        if (file) {
            const fileNameDisplay = document.getElementById('print_file');
            fileNameDisplay.style.display = 'inline-block';
            fileNameDisplay.textContent = file.name;
        }
    });

    if (isAdvancedUpload) {
        $form.classList.add('has-advanced-upload');

        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function(event) {
            $form.addEventListener(event, function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragover', 'dragenter'].forEach(function(event) {
            $form.addEventListener(event, function() {
                $form.classList.add('is-dragover');
            });
        });

        ['dragleave', 'dragend', 'drop'].forEach(function(event) {
            $form.addEventListener(event, function() {
                $form.classList.remove('is-dragover');
            });
        });

        $form.addEventListener('drop', function(e) {
            droppedFiles = e.dataTransfer.files;
            $input.files = droppedFiles;

            const file = droppedFiles[0];
            if (file) {
                const fileNameDisplay = document.getElementById('print_file');
                fileNameDisplay.style.display = 'inline-block';
                fileNameDisplay.textContent = file.name;
            }
        });
    }

    const switchDocBtn = document.getElementById('switch_document');
    if (switchDocBtn) {
        switchDocBtn.addEventListener('click', function (event) {
            event.preventDefault();

            const sourceElement = document.querySelector('#source-dropdown-content-doc a.selected');
            const targetElement = document.querySelector('#target-dropdown-content-doc a.selected');

            if (!sourceElement || !targetElement) return;

            const sourceLang = sourceElement.getAttribute('data-value');
            const targetLang = targetElement.getAttribute('data-value');

            if (sourceLang === 'auto') return;

            document.querySelectorAll('#source-dropdown-content-doc a, #target-dropdown-content-doc a').forEach(item => {
                item.classList.remove('selected');
            });

            document.querySelector(`#source-dropdown-content-doc a[data-value="${targetLang}"]`).classList.add('selected');
            document.querySelector(`#target-dropdown-content-doc a[data-value="${sourceLang}"]`).classList.add('selected');

            const sourceButton = document.querySelector('#source-dropdown-doc .dropdown-button');
            const targetButton = document.querySelector('#target-dropdown-doc .dropdown-button');

            sourceButton.innerHTML = `${document.querySelector(`#source-dropdown-content-doc a[data-value="${targetLang}"]`).innerText} <span style="font-size: 1.5em;">⌄</span>`;
            targetButton.innerHTML = `${document.querySelector(`#target-dropdown-content-doc a[data-value="${sourceLang}"]`).innerText} <span style="font-size: 1.5em;">⌄</span>`;
        });
    }

    $form.addEventListener('submit', function(e) {
        e.preventDefault();

        if ($form.classList.contains('is-uploading')) return false;

        document.getElementById('document-result').innerHTML = '';
        document.getElementById('document-result').style.display = 'none';
        const spinner = document.getElementById('loading-spinner');
        spinner.style.display = 'inline-block';
        spinner.textContent = 'Processing...';

        $form.classList.add('is-uploading');
        $form.classList.remove('is-error');

        const formData = new FormData();
        const file = $input.files[0];
        if (!file) {
            $form.classList.remove('is-uploading');
            $form.classList.add('is-error');
            $errorMsg.innerText = 'Aucun fichier sélectionné.';
            spinner.style.display = 'none';
            return false;
        }

        const allowedExtensions = ['pdf', 'docx', 'pptx', 'txt'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            $form.classList.remove('is-uploading');
            $form.classList.add('is-error');
            $errorMsg.innerText = 'Format de fichier non pris en charge.';
            spinner.style.display = 'none';
            $input.value = '';
            return;
        }

        formData.append('file', file);

        const selectedSourceLang = document.querySelector('#source-dropdown-content-doc a.selected');
        const sourceLang = selectedSourceLang ? selectedSourceLang.getAttribute('data-value') : 'auto';

        const browserLang = getCurrentLanguage();
        const selectedTargetLang = document.querySelector('#target-dropdown-content-doc a.selected');
        const targetLang = selectedTargetLang ? selectedTargetLang.getAttribute('data-value') : (browserLang === 'fr' ? 'FR' : 'DE');

        formData.append('source_lang', sourceLang);
        formData.append('target_lang', targetLang);

        fetch('/translate-document', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    if (errorData.error && errorData.error.toLowerCase().includes("unsupported file format")) {
                        $form.classList.remove('is-uploading');
                        $form.classList.add('is-error');
                        $errorMsg.innerText = 'Format de document non pris en charge par le serveur.';
                        spinner.style.display = 'none';
                        throw new Error('Format de document non pris en charge par le serveur.');
                    }
                    if (errorData.error && errorData.error.includes("Source and target language are equal")) {
                        throw new Error("Les langues source et cible ne peuvent pas être les mêmes.");
                    }
                    throw new Error(errorData.error || "Une erreur est survenue lors de la traduction.");
                });
            }
            return response.json();
        })
        .then(data => {
            const fileUrl = data.translated_file_path;

            fetch(fileUrl, { method: 'HEAD' })
                .then(resp => {
                    if (resp.status === 200) {
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = fileUrl.split('/').pop();
                        const filename = fileUrl.split('/').pop();
                        link.innerText = ' ⬇ ' + ' ' + filename;

                        document.getElementById('document-result').innerHTML = '';
                        document.getElementById('document-result').appendChild(link);
                        document.getElementById('document-result').style.display = 'inline-block';
                        spinner.style.display = 'none';

                        $form.classList.remove('is-uploading');
                        $input.value = '';
                        droppedFiles = false;
                    } else {
                        $form.classList.remove('is-uploading');
                        $form.classList.add('is-error');
                        if ($errorMsg) $errorMsg.innerText = 'Une erreur est survenue lors du téléchargement.';
                        spinner.style.display = 'none';
                    }
                })
                .catch(error => {
                    $form.classList.remove('is-uploading');
                    $form.classList.add('is-error');
                    if ($errorMsg) $errorMsg.innerText = 'Une erreur est survenue lors du téléchargement.';
                    spinner.style.display = 'none';
                });
        })
        .catch(error => {
            if (error.message === 'Format de document non pris en charge par le serveur.') return;
            $form.classList.remove('is-uploading');
            $form.classList.add('is-error');
            alert(error.message);
            if ($errorMsg) $errorMsg.innerText = 'Une erreur est survenue lors du téléchargement.';
            spinner.style.display = 'none';
        });
    });
}

/* Initialisation pour l'amélioration de texte */
function initializeTextImprovement() {
    const improveBtn = document.getElementById('improve-btn');
    const textArea = document.getElementById('improve-text');

    function triggerImprovement(event) {
        event.preventDefault();

        const text = textArea.value;
        if (!text.trim()) {
            document.getElementById('improve-result').value = '';
            return;
        }

        const currentLang = getCurrentLanguage();
        const targetLangCode = currentLang === 'fr' ? 'FR' : 'DE';
        const selectedLang = document.querySelector('#improve-dropdown-content a.selected');
        const targetLang = selectedLang ? selectedLang.getAttribute('data-value') : targetLangCode;

        const selectedStyle = document.querySelector('#style-dropdown-content a.selected');
        const style = selectedStyle ? selectedStyle.getAttribute('data-value') : 'default';

        fetch('/improve-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, target_lang: targetLang, style: style })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Erreur :', data.error);
            } else {
                document.getElementById('improve-result').value = data.improved_text;
            }
        })
        .catch(error => {
            console.error('Erreur :', error);
        });
    }

    // Clic sur le bouton
    if (improveBtn) improveBtn.addEventListener('click', triggerImprovement);

    // Touche Enter dans le textarea
    if (textArea) {
        textArea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                triggerImprovement(e); // Enter → amélioration
            }
            // Shift+Enter → retour à la ligne normal
        });
    }

    const refreshImproveBtn = document.getElementById('refresh-improve');
    if (refreshImproveBtn) {
        refreshImproveBtn.addEventListener('click', function (event) {
            event.preventDefault();

            textArea.value = '';
            document.getElementById('improve-result').value = '';
        });
    }
}
