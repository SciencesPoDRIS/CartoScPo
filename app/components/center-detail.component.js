/* globals Showdown */
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

      // convert markdown to html
      var converter = new Showdown.converter({simplifiedAutoLink: true});
      
      function convert(fields) {
        var acc = '';
        if (Array.isArray(fields)) {
          _.forEach(fields, function (d) {
            acc = acc.concat(d) + ' \n';
          });
          return converter.makeHtml(acc);
        } else {
          return converter.makeHtml(fields);
        }
      }

      this.ressourcesDescription = convert(this.org.ressources['Centre de documentation ou bibliothèque en propre : description et fonds spécifiques']);
      this.axes = convert(this.org.recherche['Axes de recherche']);
      this.contrats = convert(this.org.recherche['Contrats de recherche']);
      this.seminaires = convert(this.org.recherche['Séminaires de recherche']);
      this.collaboration = convert(this.org.recherche['Collaborations / réseaux']);
      this.historic = convert(this.administration['Historique']);
      this.collections = convert(this.publication['Collections auprès d\'éditeurs : description']);
      this.collectionTitle = convert(this.publication['Revues en propre : description']);
      this.oa_policy = convert(this.publication['Préconisations pour le dépôt en open access des publications']);
      this.publication_development = convert(this.publication['Valorisation des publications par le laboratoire'].replace(/\n/g, '\n\n'));
      this.libraries_network = convert(this.ressources['Bibliothèques utilisées']);
      this.eresources = convert(this.ressources['Ressources numériques à disposition des chercheurs']);
      this.library_staff = convert(this.ressources['Personne ressource - documentaliste']);
      this.information_skills_training = convert(this.ressources['Offre de formations documentaires']);
      this.library_network = convert(this.ressources['Collaborations documentaires (Couperin, ISORE, participations aux réseaux IST...)']);
    }.bind(this);
  }
});
