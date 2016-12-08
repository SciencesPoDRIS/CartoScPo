'use strict';

angular.module('bib.directives')
.directive('logo', function () {
  return {
    restrict: 'EA',
    template: '<img ng-if="logoSrc" alt="logo" class="center-logo" ng-src="{{logoSrc}}">',
    scope: {
      // can't use "center", it's already taken by Leaflet
      org: '='
    },
    link: function (scope) {
      var admin = scope.org.administration;
      // TODO the following organisations do not have a logo yet
      if (['EA 7033', 'EA 4586'].indexOf(admin['Code Unité']) !== -1) return;
      // example Centre Max Weber
      var src = admin['Acronyme (nom court)'] || admin['Intitulé'];
      if (src) scope.logoSrc = 'img/logos_centres_de_recherche_jpeg/' + src + '.jpg';
    }
  };
});
