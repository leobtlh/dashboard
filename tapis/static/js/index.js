    function updatePrice() {
        const tailleSelect = document.getElementById('taille');
        const motifSelect = document.getElementById('motif');

        // Récupérer le prix de la taille (data-price)
        let price = 0;
        const selectedOption = tailleSelect.options;

        if (selectedOption.getAttribute('data-price')) {
            price = parseInt(selectedOption.getAttribute('data-price'));
        }

        // Ajouter supplément si motif personnalisé
        if (motifSelect.value === 'custom') {
            price += 50;
        }

        // Animation simple du prix
        const display = document.getElementById('price-value');
        display.innerText = price;
    }

    function toggleFileUpload() {
        const motifSelect = document.getElementById('motif');
        const fileContainer = document.getElementById('file-upload-container');

        if (motifSelect.value === 'custom') {
            fileContainer.style.display = 'block';
        } else {
            fileContainer.style.display = 'none';
        }

        // Mettre à jour le prix car l'option custom change le total
        updatePrice();
    }
