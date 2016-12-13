'use strict';

angular.module('bib.components')
.component('centerDetail', {
  templateUrl: 'views/center-detail.html',
  bindings: {
    // can't use "center", it's already taken by Leaflet
    org: '<'
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
      var converter = new Showdown.converter();
      this.ressourcesDescription = converter.makeHtml(this.org.ressources['Centre de documentation ou bibliothèque en propre : description et fonds spécifiques']);

      function convert (fields) {
        var acc = '';
        if (Array.isArray(fields)) {
          _.forEach(fields, function (d) {
            acc = acc.concat(d) + ' \n';
          });
          return converter.makeHtml(acc);
        }
        return converter.makeHtml(fields);
      }

      this.axes = convert(this.org.recherche['Axes de recherche']);
      this.contrats = convert(this.org.recherche['Contrats de recherche']);
      this.seminaires = convert(this.org.recherche['Séminaires de recherche']);
      this.collaboration = convert(this.org.recherche['Collaborations / réseaux']);
    }.bind(this);
  }
});
