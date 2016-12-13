'use strict';

angular.module('bib.components')
.component('centerDetail', {
  templateUrl: 'views/center-detail.html',
  bindings: {
    // can't use "center", it's already taken by Leaflet
    org: '<'
  },
  controller: function () {
    this.$onInit = function () {
      // TODO more predictable destructuring
      Object.keys(this.org).forEach(function (key) {
        this[key] = this.org[key];
      }, this);
      // TODO remove bullet points before
      this.centerId = this.administration.id.replace(/\*/g, '');

      // convert markdown to html
      var converter = new Showdown.converter();
      this.ressourcesDescription = converter.makeHtml(this.org.ressources['Centre de documentation ou bibliothèque en propre : description et fonds spécifiques']);

      var axes = '';
      if (Array.isArray(this.org.recherche['Axes de recherche'])) {
        _.forEach(this.org.recherche['Axes de recherche'], function (d) {
          axes = axes.concat(d) + ' \n';
        });
        this.axes = converter.makeHtml(axes);
      }
      else
        this.axes = converter.makeHtml(this.org.recherche['Axes de recherche']);

      var contrats = '';
      if (Array.isArray(this.org.recherche['Contrats de recherche'])) {
        _.forEach(this.org.recherche['Contrats de recherche'], function (d) {
          contrats = contrats.concat(d) + ' \n';
        });
        this.contrats = converter.makeHtml(contrats);
      }
      else
        this.contrats = converter.makeHtml(this.org.recherche['Contrats de recherche']);

      var seminaires = '';
      if (Array.isArray(this.org.recherche['Séminaires de recherche'])) {
        _.forEach(this.org.recherche['Séminaires de recherche'], function (d) {
          seminaires = seminaires.concat(d) + ' \n';
        });
        this.seminaires = converter.makeHtml(seminaires);
      }
      else
        this.seminaires = converter.makeHtml(this.org.recherche['Séminaires de recherche']);

      var collaboration = '';
      if (Array.isArray(this.org.recherche['Collaborations / réseaux'])) {
        _.forEach(this.org.recherche['Collaborations / réseaux'], function (d) {
          collaboration = collaboration.concat(d) + ' \n';
        });
        this.collaboration = converter.makeHtml(collaboration);
      }
      else
        this.collaboration = converter.makeHtml(this.org.recherche['Collaborations / réseaux']);
    }.bind(this);
  }
});
