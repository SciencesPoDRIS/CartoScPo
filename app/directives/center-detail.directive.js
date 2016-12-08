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
    }
  };
});
