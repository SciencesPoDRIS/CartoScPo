# Etude des centres de recherche en Sciences Politiques

Réalisée par la Bibliothèque de Sciences Po Paris en collaboration avec le Medialab

## Installation
A la racine du projet :

```
npm install
```
A la racine du projet :

```
bower install
```

Copier le fichier app/conf/conf.default.js vers app/conf/conf.js.

Editer app/conf/conf.js et modifier les paramètres voulus (googleAnalyticsId).

## Lancement de l'app

```
gulp
```

Par défaut, gulp effectue les tâches de concaténations et minification js puis des css, copie les assets et finalement lance l'application en démarrant un serveur qui possède le livereload.

### Concaténation et minification de tous les JS

```
gulp js
```

### Conversion du fichier de style principal du less en CSS

```
gulp less
```

### Concaténation et minificaton de tous les css

```
gulp css
```

### Copie une image ainsi les polices d'écriture dans le dossier "assets"

```
gulp assets
```

### Démarre le serveur avec livereload

```
gulp serve
```

## Création des données

```
npm run parse
```

Long version:

Ajouter dans /app/data tous les CSV générés à partir des onglets du spreadsheet du drive.

Dans le dossier /app/data, lancer le script suivant (requiert l'installation de NodeJS) :

```
node script_data_csv_to_json.js
```

La sortie est `app/data/data.json` qui comprend :

* Un objet avec tous les centres en clés qui contiennent eux-mêmes leurs onglets en clés.
* Un index de toutes les propriétés de tous les centres afin de faciliter la recherche fulltext.
* Un tableau de tous les mots de toutes ces propriétés pour l'auto-complétion dans la recherche fulltext.

## Création des métadonnées

Ajouter dans /app/data le csv listant les props et le nommer `metadata.csv`

Lancer le script suivant dans /app/data :

```
node script_metadata_csv_to_json.js
```

La sortie est `app/data/metadata.json`.

### Parsing des csv issus de la collecte des données
Réalisé avec BabyParse <https://github.com/Rich-Harris/BabyParse>


### Création de l'index de recherche fulltext
Réalisé avec lunr <http://lunrjs.com/>


***
## Détails du fonctionnement du site
### La carte
* Réalisée avec la directive angular-leaflet <https://github.com/tombatossals/angular-leaflet-directive>
* Les markers sont créés dans le service app/services/map.services

### Le tableau des données
Réalisé avec angular ui-grid <http://ui-grid.info/>

### Intéractions carte <-> liste
app/services/map.services

* Tri liste <-> tri carte
* Click sur centre de la liste <-> click sur un centre sur la carte (overture de popup)

### Recherche par mots-clés

### Navigation entre les centres

### Détails d'un centre


### Configuration des données sur le site

Il est possible d'éditer une configuration afin de paramétrer :

* les onglets à agréger
* la taille des centres sur la carte
* les champs de recherches disponibles dans la recherche fulltext
* les mots à prendre en compte dans l'auto-complétion

### Backoffice

[Documentation](https://github.com/SciencesPoDRIS/CartoScPo/blob/dev/docs/back-office.md)
