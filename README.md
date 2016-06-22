# Etude des centres de recherche en Sciences Politiques 

Réalisée par la Bibliothèque de Sciences Po Paris en collaboration avec le Medialab

## Installation

```
npm install

bower install
```

## Lancement de l'app 

```
gulp
```

Par défaut, gulp effectue les tâches de concaténations des css, des librairies javascript utilisées et lance l'application en démarrant un server qui possède le livereload.


## Création des données

Ajouter dans /app/data les csv téléchargés à partir des onglets du spreadsheet du drive.

Lancer le script suivant =>

/app/data
```
node script_data_csv_to_json.js
```

La sortie est un json qui comprend : 

* Un objet avec tous les centres en clés qui contiennent eux-mêmes leurs onglets en clés.
* Un index de toutes les propriétés de tous les centres afin de faciliter la recherche fulltext.
* Un tableau de tous les mots de toutes ces propriétés pour l'auto-complétion dans la recherche fulltext.

## Configuration des données sur le site

Il est possible d'éditer une configuration afin de paramétrer : 

* les onglets à agréger
* la taille des centres sur la carte
* les champs de recherches disponibles dans la recherche fulltext
* les mots à prendre en compte dans l'auto-complétion