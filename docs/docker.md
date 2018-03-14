# Configuration

 
Pour gérer la configuration, j'utilise la fonctionnalité pour mapper les variables d'environnement (https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables) du paquet `node-config` qui était déjà utilisé par le projet. 

Je rajoute donc ce fichier: `config/custom-environment-variables.toml` qui permet de faire le mapping entre les variables d'environnements et les valeurs par défaut de `config/default.toml`.

Lors d'une utilisation avec Docker et Docker-compose il faut placer des variables d'environnements dans le fichier `docker-config.env`. Ce fichier est importé dans `docker-compose.prod.yml`.

Donc allez voir ce fichier pour la liste des variables utilisables.

La confirguration du frontend est construite (`gulp.js js:app`) à chaque lancement du conteneur front-end.


# Développement

Pour le développement on utilise juste Docker pour les services MongoDB et Redis, le code source des application est exécuté directement sur le poste de travail.

La seule configuration est dans le fichier `docker-compose.dev.yml`.

On peut soit lancer ces services avec la commande:

```
docker-compose -f docker-compose.dev.yml up
```

Soit avec le raccourci:

```
npm run docker
```

# Production

La production tourne dans des conteneurs Docker orchestrés par le fichier `docker-compose.prod.yml`.

## Images Docker

Il y a quatre images:

* **Redis**: image officielle (https://hub.docker.com/_/redis/)
* **MongoDB**: image officielle (https://hub.docker.com/_/mongo/)
* **Back-Office**: Image créée par nos soins pour faire tourner le serveur node.js qui fournit l'API et le Back-Office
* **Front-Office**: Image créée par nos soins pour faire construire l'application Front-Office puis servir le front-office et le back-office via nginx

### Image du back-office

Elle est construite à partir de l'image officielle de Node.JS (https://hub.docker.com/_/node/).

Le Dockerfile est ici: https://github.com/SciencesPoDRIS/CartoScPo/blob/master/Dockerfile

Je commence par installer les dépendances node.js avec `npm`, j'installe aussi la commande `
su-exec` pour pouvoir lancer le serveur node avec l'utilisateur `node` et non `root`.

Ensuite je copie la config, les scripts d'import des données, le code source du back-offfice et de l'API.

Je prépare ensuite l'interface du back-office avec `webpack` et je lance le serveur.

### Image du front-office

Elle est construite à partir de l'image officielle de nginx (https://hub.docker.com/_/nginx/).

Le Dockerfile est ici: https://github.com/SciencesPoDRIS/CartoScPo/blob/master/Dockerfile.frontend


Je copie le code source du frontend et les fichiers nécessaires à sa construction.
J'installe `nodejs` pour installer `bower` et ses paquets, puis `gulp` pour construire les fichiers du front-end. Je supprime ce dont je n'ai plus besoin pour ne pas avoir une image trop grosse.

J'ai préparé un fichier de configuration nginx ici: https://github.com/SciencesPoDRIS/CartoScPo/blob/master/docker-nginx-vhost.conf qui sert le client et fait un reverse proxy du back-office.

Ce fichier est ajouté au conteneur via le Dockerfile, et j'utilise `envsubst` pour remplacer les variables d'environnement.

Juste avant de lancer nginx, je lance la dernière commande gulp qui gène le JS de l'application avec les variables d'environnement.


### Docker Hub

Les images Docker sont construites automatiquement par Docker Hub lors d'un évenement push sur la branche `master` du dépôt GitHub. Ca permet de s'affranchir de la construction et du stockage des images et de pouvoir plus facilement distribuer le projet (qui est open source).

* Client: https://hub.docker.com/r/sciencespo/cartoscpo-fo/
* API: https://hub.docker.com/r/sciencespo/cartoscpo-bo/

## Code

Récupérez le code source de ce dépôt Git:

```bash
git clone https://github.com/SciencesPoDRIS/CartoScPo.git CartoScPo
cd CartoScPo
```

## Configuration

Copiez l'exemple de configuration et éditez le selon vos besoins:

```sh
cp docker-config.env.sample docker-config.env
```

Pour vérifier la configuration:

```sh
docker-compose -f docker-compose.prod.yml config
```

### Preparer les images Docker

Deux options: soit télécharger la dernière version depuis le Docker Hub, ou construire ses propres images.

+ **Recommandé: Télécharger** nos images déjà construites depuis le Docker Hub:

  ```sh
  docker-compose -f docker-compose.prod.yml pull
  ```

+ **Alternative: Construire** vos propres images à partir du code source (utile pour du développent ou si vous éditez le code):

  ```sh
  docker-compose -f docker-compose.prod.yml build
  ```


### Démarrer les conteneurs

On peut alors démarrer l'application avec la commande:

```sh
docker-compose -f docker-compose.prod.yml up
```

La même chose mais en lancant les conteneurs en tâche de fond:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Vérifiez que ça fonctionne sur le port 80 de votre machine.

### Arrêt et journaux

Pour arrêter les conteneurs: 

```sh
docker-compose -f docker-compose.prod.yml stop
```
ou pour détruire les conteneurs **et les données**:

```sh
docker-compose  -f docker-compose.prod.yml down -v
``` 

Pour voir les logs: 

```sh
docker-compose -f docker-compose.prod.yml logs
```

Lorsque vous modifiez la configuration, relancez les conteneurs:

```sh
docker-compose -f docker-compose.prod.yml stop
docker-compose -f docker-compose.prod.yml up -d
```

### Import initial des données

D'abord il faut récupérer le fichier `data.json`.

Puis, le copier dans le conteneur back-office avec la commande: 

```sh
docker cp  ./data.json cartoscpo_bo_1:/tmp
```

Enfin, exécuter le script d'import à l'intérieur du conteneur back-office: 

```
docker-compose -f docker-compose.prod.yml exec bo node bin/populate-mongo-db.js --path /tmp
```
