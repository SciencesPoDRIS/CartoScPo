/* globals showdown */
'use strict';

angular.module('bib.components')
.component('centerDetail', {
  templateUrl: 'views/center-detail.html',
  bindings: {
    // can't use "center", it's already taken by Leaflet
    org: '<',
    expanded: '<'
  },
  controller: function () {
    this.collapsed = true;

    this.$onInit = function () {
      // TODO more predictable destructuring
      Object.keys(this.org).forEach(function (key) {
        this[key] = this.org[key];
      }, this);

      // TODO remove bullet points before
      this.centerId = this.administration.id.replace(/\*/g, '');

      // Convert markdown to html
      var converter = new showdown.Converter();
      // Transform url into link even if no markdown
      converter.setOption('simplifiedAutoLink', true);

      function convert(fields) {
        var acc = '';
        fields = fields.replace(/\n/g, '\n\n');
        if (Array.isArray(fields)) {
          _.forEach(fields, function (d) {
            acc = acc.concat(d) + ' \n';
          });
          return converter.makeHtml(acc);
        } else {
          return converter.makeHtml(fields);
        }
      }

      // Administration
      this.administration_phones = this.org.administration['Téléphone'].split(';').map(function(x){ return x.trim(); });
      this.historic = convert(this.administration['Historique']);
      // Personnel
      this.personnelCNRSUrl = this.org.personnel['Lien vers la page \"personnel\" du site Web du CNRS'];
      this.personnelSiteWebCentre = this.org.personnel['Lien vers la page \"personnel\" sur le site Web du centre'];
      // Ecole
      // Recherche
      this.axes = convert(this.org.recherche['Axes de recherche']);
      this.contrats = convert(this.org.recherche['Contrats de recherche']);
      this.seminaires = convert(this.org.recherche['Séminaires de recherche']);
      this.collaboration = convert(this.org.recherche['Collaborations / réseaux']);
      // Publication
      this.collections = convert(this.publication['Collections auprès d\'éditeurs : description']);
      this.collectionTitle = convert(this.publication['Revues en propre : description']);
      this.oa_policy = convert(this.publication['Préconisations pour le dépôt en open access des publications']);
      this.archive = convert(this.publication['Archivage des données de la recherche : description des projets']);
      this.publication_development = convert(this.publication['Valorisation des publications par le laboratoire']);
      // Ressources
      this.libraries_network = convert(this.ressources['Bibliothèques utilisées']);
      this.eresources = convert(this.ressources['Ressources numériques à disposition des chercheurs']);
      this.library_staff = convert(this.ressources['Personne ressource - documentaliste']);
      this.resources_title = convert(this.ressources['Centre de documentation ou bibliothèque en propre : Intitulé']);
      this.ressources_description = convert(this.org.ressources['Centre de documentation ou bibliothèque en propre : description et fonds spécifiques']);
      this.documentary_politics = convert(this.ressources['Politique documentaire']);
      this.information_skills_training = convert(this.ressources['Offre de formations documentaires']);
      this.library_network = convert(this.ressources['Collaborations documentaires (Couperin, ISORE, participations aux réseaux IST...)']);
      // Commentaires
    }.bind(this);
  }
});
