# Back-Office

## Objectifs

Le but du back-office est de permettre la collaboration entre contributeurs désirant mettre à jour la liste des centres.

## Arborescence du projet

BO: Back-Office

FO: Front-Office

- `/app`: FO en `angularjs`. Historiquement la première partie créée : elle utilise `npm`, `bower` et `gulp` pour se construire.
Le FO tire ses infos des fichiers `app/data/data.json` et `app/data/metadata.json` et est servi statiquement.
- `/back-office`: BO en `angularjs`. Autonome du FO. Cette fois ci une approche de build plus moderne est privilégiée.
Les librairies sont récupérées via `npm` et bundlées via `webpack`. Contrairement au FO, le BO discute avec le serveur d'API REST.
- `/bin`: contient 2 *scripts* permettant de peupler ou extraire des infos de la base `mongodb`. A terme le script de peuplement sera inutile.
Celui d'extraction pourra etre lancé régulièrement pour générer un nouveau `app/data/data.json` et ainsi rafraichir les données du FO.
- `/conf`: les fichiers `toml` permettent aux sysadmins de renseigner les ports / urls… de l'application une fois déployée. Pour le moment
seul le BO lit ces fichiers de conf.
- `/server`: server d'API REST en `node.js`. C'est avec cette application `express` que le BO échange. Elle meme est en relation avec la base `mongodb`.

## Tâches du projet

Les tâches sont réunies dans le fichier `package.json` à la racine. Elles se lancent via `npm run [nom de la tache]`.
Toutes les taches préfixées par `bo:` concernent le BO.

Ainsi pour démarrer sa journée de travail sur le BO. Il faut:

1 - démarrer une base mongodb écoutant sur le port par défaut (27017)

Si mongo est installé sur la machine du developpeur:

`> mongod`

Sinon, un container docker est disponible (voir `docker-compose.yml` à la racine du projet).
Le daemon `docker` doit être préablablement lancé. Mongo sauvegarde alors ces données dans `db/mongo`, dossier
ignoré par git.

`> npm run docker`

2 - Lors du premier lancement, afin de peupler la base de données, lancer la commande

`> npm run bo:populate`

Il s'agit d'un alias executant `node bin/populate-mongo-db.js`. Ce script peut être executé avec l'argument `clear` permettant d'effacer la collection
`centers` avant de la repeupler. Attention, cette action est *irréversible*.

3 - lancer `> npm run bo:watch`. Cette commande lance `webpack` qui va venir rebâtir le BO (côté client) dès qu'un fichier change. Il faut par contre
rafraichir son navigateur manuellement (pour le moment). En parallèle, l'application node se lance. Grâce à `nodemon`, le serveur redemarre dès que le
contenu de `/server` est modifié.

4 - Ouvrir son navigateur à l'url <http://localhost:42000/>

## Synchonisation des données

Le fichier `back-office/schema.json` centralise en un seul endroit la définition des champs qui composent un centre. Il est responsable de formaliser à la fois
la composition des documents de la collection `centers` de `mongodb` ainsi que l'affichage de saisie dynamique coté `angularjs`.
Partager les régles de validation entre serveur et GUI permet de s'assurer que les deux cotés de la communication restent en phase.
Le but est de le supplanter à `app/data/metadata.json`.
