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
    }
  };
});
