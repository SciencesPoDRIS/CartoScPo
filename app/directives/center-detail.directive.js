'use strict';

angular.module('bib.directives')
.directive('centerDetail', function () {
  return {
    restrict: 'EA',
    templateUrl: 'views/detail.html',
    scope: {
      // can't use "center", it's already taken by Leaflet
      org: '='
    },
    link: function (scope) {
      // TODO better destructuring
      Object.keys(scope.org).forEach(function (key) {
        scope[key] = scope.org[key];
      });
      // TODO remove bullet points before
      scope.centerId = scope.administration.id.replace(/\*/g, '');

      // convert markdown to html
      var converter = new Showdown.converter();
      scope.ressourcesDescription = converter.makeHtml(scope.org.ressources['Centre de documentation ou bibliothèque en propre : description et fonds spécifiques']);

      var axes = '';
      if (Array.isArray(scope.org.recherche['Axes de recherche'])) {
        _.forEach(scope.org.recherche['Axes de recherche'], function (d) {
          axes = axes.concat(d) + ' \n';
        });
        scope.axes = converter.makeHtml(axes);
      }
      else
        scope.axes = converter.makeHtml(scope.org.recherche['Axes de recherche']);

      var contrats = '';
      if (Array.isArray(scope.org.recherche['Contrats de recherche'])) {
        _.forEach(scope.org.recherche['Contrats de recherche'], function (d) {
          contrats = contrats.concat(d) + ' \n';
        });
        scope.contrats = converter.makeHtml(contrats);
      }
      else
        scope.contrats = converter.makeHtml(scope.org.recherche['Contrats de recherche']);

      var seminaires = '';
      if (Array.isArray(scope.org.recherche['Séminaires de recherche'])) {
        _.forEach(scope.org.recherche['Séminaires de recherche'], function (d) {
          seminaires = seminaires.concat(d) + ' \n';
        });
        scope.seminaires = converter.makeHtml(seminaires);
      }
      else
        scope.seminaires = converter.makeHtml(scope.org.recherche['Séminaires de recherche']);

      var collaboration = '';
      if (Array.isArray(scope.org.recherche['Collaborations / réseaux'])) {
        _.forEach(scope.org.recherche['Collaborations / réseaux'], function (d) {
          collaboration = collaboration.concat(d) + ' \n';
        });
        scope.collaboration = converter.makeHtml(collaboration);
      }
      else
        scope.collaboration = converter.makeHtml(scope.org.recherche['Collaborations / réseaux']);
    }
  };
});
