/* globals angular, _, showdown */
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

      // Convert markdown to html
      var converter = new showdown.Converter();
      // Transform url into link even if no markdown
      converter.setOption('simplifiedAutoLink', true);

      function convert(fields) {
        if (!fields) return ''
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
      this.administration_phones = this.org.phone.split(';').map(function(x){ return x.trim(); });
      this.history = convert(this.org.history);
      // Recherche
      this.research_areas = convert(this.org.research_areas);
      this.contracts = convert(this.org.contracts);
      this.workshops = convert(this.org.workshops);
      this.partners = convert(this.org.partners);
      // Publication
      this.collections_titles = convert(this.org.collections.titles);
      this.journal_titles = convert(this.org.journal.titles);
      this.oa_policy = convert(this.org.oa_policy);
      this.data_repository_projects = convert(this.org.data_repository.projects);
      this.valorisation = convert(this.org.valorisation);
      // Ressources
      this.libraries_network = convert(this.ressources['Bibliothèques utilisées']);
      this.eresources = convert(this.org.resources);
      this.library_staff = convert(this.org.library_staff);
      this.resources_title = convert(this.ressources['Centre de documentation ou bibliothèque en propre : Intitulé']);
      this.ressources_description = convert(this.org.ressources['Centre de documentation ou bibliothèque en propre : description et fonds spécifiques']);
      this.documentary_politics = convert(this.ressources['Politique documentaire']);
      this.information_skills_training = convert(this.org.information_skills_training);
      this.library_network = convert(this.ressources['Collaborations documentaires (Couperin, ISORE, participations aux réseaux IST...)']);
      // Commentaires
    }.bind(this);
  }
});
