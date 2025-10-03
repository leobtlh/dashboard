# Site Web Altux

## Description

Site web de l'entreprise Altux

## Technologies

- HTML5
- Sass
- CSS3
- JavaScript
- Gulp
- NodeJS

- Nodeenv (celui de Python, pas celui de node.js, pour l'environnement
  de développement)

- PHP (pour le formulaire de contact)

## Préparation de l'environnement de développement

Le répertoire de travail pour les instructions ci-dessous est le
répertoire de base du projet (la racine du repository).

### Création de l'environnement Python

```bash
$ python3 -m venv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
```

### Création de l'environnement NodeJS

```bash
$ nodeenv -p -n 18.18.2
$ source venv/bin/activate
$ npm install
```

## Exécution du projet

### Mode développement

```bash
$ npm exec -- gulp --cwd gulp dev
```

Le site tournera sur http://localhost:3000
Attention, le formulaire de contact ne sera pas fonctionnel.

**TODO**
Ajouter des instructions pour faire tourner le site avec PHP actif en
local de manière à ce que le formulaire de contact fonctionne.

## Déploiement

### Création release
```bash
$ npm exec -- gulp --cwd gulp build
```

**TODO**
Ajouter la suite pour ce qui concerne la mise en place du site en
production.

